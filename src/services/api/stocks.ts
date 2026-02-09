import { API_CONFIG } from '../../constants/api';
import { PriceData, StockQuote } from '../../types';
import { sanitizeSymbol, sanitizeSearchQuery } from '../../utils/validation';
import { getUSStockHistoryYahoo, getUSStockQuoteYahoo } from './yahooFinance';

const { BASE_URL, API_KEY } = API_CONFIG.ALPHA_VANTAGE;

// --- Response Cache ---
const responseCache: Map<string, { data: any; timestamp: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX_SIZE = 100;

const getCached = <T>(key: string): T | null => {
  const entry = responseCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    responseCache.delete(key);
    responseCache.set(key, entry);
    return entry.data as T;
  }
  responseCache.delete(key);
  return null;
};

const setCache = (key: string, data: any) => {
  responseCache.delete(key);
  responseCache.set(key, { data, timestamp: Date.now() });

  while (responseCache.size > CACHE_MAX_SIZE) {
    const oldest = responseCache.keys().next().value;
    if (oldest) responseCache.delete(oldest);
    else break;
  }
};

// Fetch with timeout to prevent hanging requests
const fetchWithTimeout = async (url: string, timeout = 10000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

// --- Alpha Vantage (fallback) ---

const getStockQuoteAlphaVantage = async (symbol: string): Promise<StockQuote> => {
  const response = await fetchWithTimeout(
    `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`Stock API error (HTTP ${response.status})`);
  }

  const data = await response.json();

  if (data['Error Message']) {
    throw new Error('Invalid symbol or API error');
  }

  if (data['Note']) {
    throw new Error('API rate limit exceeded. Please try again later.');
  }

  const quote = data['Global Quote'];
  if (!quote || Object.keys(quote).length === 0) {
    throw new Error('No data available for this symbol');
  }

  const price = parseFloat(quote['05. price']);
  const change = parseFloat(quote['09. change']);
  const changePercent = parseFloat((quote['10. change percent'] || '0').replace('%', ''));

  if (!isFinite(price) || price <= 0) {
    throw new Error('Invalid price data received');
  }

  return {
    symbol: quote['01. symbol'],
    name: symbol,
    price,
    change: isFinite(change) ? change : 0,
    changePercent: isFinite(changePercent) ? changePercent : 0,
    currency: 'USD',
  };
};

const getStockHistoryAlphaVantage = async (
  symbol: string,
  outputSize: 'compact' | 'full' = 'compact'
): Promise<PriceData[]> => {
  const response = await fetchWithTimeout(
    `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}&outputsize=${outputSize}&apikey=${API_KEY}`,
    15000
  );

  if (!response.ok) {
    throw new Error(`Stock API error (HTTP ${response.status})`);
  }

  const data = await response.json();

  if (data['Error Message']) {
    throw new Error('Invalid symbol or API error');
  }

  if (data['Note']) {
    throw new Error('API rate limit exceeded. Please try again later.');
  }

  const timeSeries = data['Time Series (Daily)'];
  if (!timeSeries) {
    throw new Error('No historical data available');
  }

  const priceData: PriceData[] = Object.entries(timeSeries).map(([date, values]: [string, any]) => {
    const open = parseFloat(values['1. open']);
    const high = parseFloat(values['2. high']);
    const low = parseFloat(values['3. low']);
    const close = parseFloat(values['4. close']);
    const volume = parseInt(values['5. volume']);

    return {
      date,
      open: isFinite(open) ? open : 0,
      high: isFinite(high) ? high : 0,
      low: isFinite(low) ? low : 0,
      close: isFinite(close) ? close : 0,
      volume: isFinite(volume) ? volume : 0,
    };
  });

  return priceData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const getStockHistoryRangeAlphaVantage = async (
  symbol: string,
  startDate: Date,
  endDate: Date
): Promise<PriceData[]> => {
  const allData = await getStockHistoryAlphaVantage(symbol, 'full');

  return allData.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
};

// --- Public API: Yahoo Finance primary, Alpha Vantage fallback ---

// Get real-time stock quote
export const getStockQuote = async (symbol: string): Promise<StockQuote> => {
  const cleanSymbol = sanitizeSymbol(symbol);
  if (!cleanSymbol) {
    throw new Error('Invalid symbol');
  }

  const cacheKey = `stock_quote_${cleanSymbol}`;
  const cached = getCached<StockQuote>(cacheKey);
  if (cached) return cached;

  try {
    // Try Yahoo Finance first (primary)
    const result = await getUSStockQuoteYahoo(cleanSymbol);
    setCache(cacheKey, result);
    return result;
  } catch (yahooError) {
    if (__DEV__) console.warn('Yahoo Finance quote failed, trying Alpha Vantage:', (yahooError as Error).message);
    // Fallback to Alpha Vantage
    const result = await getStockQuoteAlphaVantage(cleanSymbol);
    setCache(cacheKey, result);
    return result;
  }
};

// Get historical daily prices
export const getStockHistory = async (
  symbol: string,
  outputSize: 'compact' | 'full' = 'compact'
): Promise<PriceData[]> => {
  const cleanSymbol = sanitizeSymbol(symbol);
  if (!cleanSymbol) {
    throw new Error('Invalid symbol');
  }

  const cacheKey = `stock_history_${cleanSymbol}_${outputSize}`;
  const cached = getCached<PriceData[]>(cacheKey);
  if (cached) return cached;

  try {
    // Yahoo Finance - get last 2 years for full, 100 days for compact
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (outputSize === 'full' ? 730 : 100));
    const result = await getUSStockHistoryYahoo(cleanSymbol, startDate, endDate);
    setCache(cacheKey, result);
    return result;
  } catch (yahooError) {
    if (__DEV__) console.warn('Yahoo Finance history failed, trying Alpha Vantage:', (yahooError as Error).message);
    const result = await getStockHistoryAlphaVantage(cleanSymbol, outputSize);
    setCache(cacheKey, result);
    return result;
  }
};

// Search for stocks
export const searchStocks = async (keywords: string): Promise<{ symbol: string; name: string }[]> => {
  const cleanKeywords = sanitizeSearchQuery(keywords);
  if (!cleanKeywords) {
    return [];
  }

  const response = await fetchWithTimeout(
    `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(cleanKeywords)}&apikey=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`Stock API error (HTTP ${response.status})`);
  }

  const data = await response.json();

  if (data['Note']) {
    throw new Error('API rate limit exceeded');
  }

  const matches = data['bestMatches'] || [];
  return matches.slice(0, 20).map((match: any) => ({
    symbol: String(match['1. symbol'] || ''),
    name: String(match['2. name'] || ''),
  }));
};

// Get historical data for a specific date range
export const getStockHistoryRange = async (
  symbol: string,
  startDate: Date,
  endDate: Date
): Promise<PriceData[]> => {
  const cleanSymbol = sanitizeSymbol(symbol);
  if (!cleanSymbol) {
    throw new Error('Invalid symbol');
  }

  const cacheKey = `stock_range_${cleanSymbol}_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`;
  const cached = getCached<PriceData[]>(cacheKey);
  if (cached) return cached;

  try {
    // Try Yahoo Finance first (primary)
    const result = await getUSStockHistoryYahoo(cleanSymbol, startDate, endDate);
    setCache(cacheKey, result);
    return result;
  } catch (yahooError) {
    if (__DEV__) console.warn('Yahoo Finance range failed, trying Alpha Vantage:', (yahooError as Error).message);
    // Fallback to Alpha Vantage
    const result = await getStockHistoryRangeAlphaVantage(cleanSymbol, startDate, endDate);
    setCache(cacheKey, result);
    return result;
  }
};
