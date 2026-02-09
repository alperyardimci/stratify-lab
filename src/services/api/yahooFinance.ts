import { API_CONFIG, RATE_LIMITS } from '../../constants/api';
import { PriceData, StockQuote } from '../../types';

const YAHOO_URL = API_CONFIG.YAHOO_FINANCE.BASE_URL;

// --- Rate Limit Tracker ---
interface RateLimitState {
  requestCount: number;
  windowStart: number;
  isBlocked: boolean;
  blockedUntil: number;
}

const rateLimitState: RateLimitState = {
  requestCount: 0,
  windowStart: Date.now(),
  isBlocked: false,
  blockedUntil: 0,
};

const canMakeRequest = (): boolean => {
  const now = Date.now();

  if (rateLimitState.isBlocked && now < rateLimitState.blockedUntil) {
    return false;
  }
  if (rateLimitState.isBlocked && now >= rateLimitState.blockedUntil) {
    rateLimitState.isBlocked = false;
  }

  if (now - rateLimitState.windowStart > 60000) {
    rateLimitState.requestCount = 0;
    rateLimitState.windowStart = now;
  }

  return rateLimitState.requestCount < RATE_LIMITS.YAHOO_FINANCE.requestsPerMinute;
};

const trackRequest = () => {
  rateLimitState.requestCount++;
};

const markRateLimited = () => {
  rateLimitState.isBlocked = true;
  rateLimitState.blockedUntil = Date.now() + 60000;
};

// --- Response Cache ---
const responseCache: Map<string, { data: any; timestamp: number }> = new Map();
const QUOTE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const HISTORY_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const CACHE_MAX_SIZE = 100;

const getCached = <T>(key: string, ttl: number): T | null => {
  const entry = responseCache.get(key);
  if (entry && Date.now() - entry.timestamp < ttl) {
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

// --- Fetch helper ---
const fetchWithTimeout = async (url: string, timeout = 15000): Promise<Response> => {
  if (!canMakeRequest()) {
    throw new Error('Yahoo Finance rate limited');
  }

  trackRequest();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (response.status === 429) {
      markRateLimited();
      throw new Error('Rate limited by Yahoo Finance');
    }
    if (!response.ok) {
      throw new Error(`Yahoo Finance HTTP ${response.status}`);
    }
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

// --- Core Functions ---

/**
 * Get historical price data from Yahoo Finance
 * @param symbol - Stock symbol (e.g., AAPL, THYAO)
 * @param startDate - Start date
 * @param endDate - End date
 * @param isBist - If true, appends .IS suffix for Istanbul Stock Exchange
 */
export const getYahooHistory = async (
  symbol: string,
  startDate: Date,
  endDate: Date,
  isBist: boolean = false
): Promise<PriceData[]> => {
  const yahooSymbol = isBist ? `${symbol}.IS` : symbol;
  const cacheKey = `yahoo_history_${yahooSymbol}_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`;

  const cached = getCached<PriceData[]>(cacheKey, HISTORY_CACHE_TTL);
  if (cached) return cached;

  const period1 = Math.floor(startDate.getTime() / 1000);
  const period2 = Math.floor(endDate.getTime() / 1000);

  const url = `${YAHOO_URL}/${encodeURIComponent(yahooSymbol)}?period1=${period1}&period2=${period2}&interval=1d`;

  const response = await fetchWithTimeout(url);
  const data = await response.json();

  const result = data?.chart?.result?.[0];
  if (!result || !result.timestamp || result.timestamp.length === 0) {
    throw new Error(`No data from Yahoo Finance for ${yahooSymbol}`);
  }

  const timestamps = result.timestamp;
  const quote = result.indicators?.quote?.[0];
  if (!quote) {
    throw new Error(`No quote data from Yahoo Finance for ${yahooSymbol}`);
  }

  const priceData: PriceData[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const open = quote.open?.[i];
    const high = quote.high?.[i];
    const low = quote.low?.[i];
    const close = quote.close?.[i];
    const volume = quote.volume?.[i];

    // Skip days with null data (market closed, holidays)
    if (close == null || open == null) continue;

    priceData.push({
      date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
      open: isFinite(open) ? open : close,
      high: isFinite(high) ? high : close,
      low: isFinite(low) ? low : close,
      close: isFinite(close) ? close : 0,
      volume: isFinite(volume) ? volume : 0,
    });
  }

  if (priceData.length === 0) {
    throw new Error(`No valid price data from Yahoo Finance for ${yahooSymbol}`);
  }

  setCache(cacheKey, priceData);
  return priceData;
};

/**
 * Get stock quote from Yahoo Finance
 */
export const getYahooQuote = async (
  symbol: string,
  isBist: boolean = false
): Promise<StockQuote> => {
  const yahooSymbol = isBist ? `${symbol}.IS` : symbol;
  const cacheKey = `yahoo_quote_${yahooSymbol}`;

  const cached = getCached<StockQuote>(cacheKey, QUOTE_CACHE_TTL);
  if (cached) return cached;

  // Use chart endpoint with range=1d to get quote data
  const url = `${YAHOO_URL}/${encodeURIComponent(yahooSymbol)}?range=1d&interval=1d`;

  const response = await fetchWithTimeout(url);
  const data = await response.json();

  const result = data?.chart?.result?.[0];
  if (!result) {
    throw new Error(`No quote data from Yahoo Finance for ${yahooSymbol}`);
  }

  const meta = result.meta;
  const price = meta?.regularMarketPrice || 0;
  const previousClose = meta?.chartPreviousClose || meta?.previousClose || price;
  const change = price - previousClose;
  const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

  const quote: StockQuote = {
    symbol: symbol,
    name: symbol,
    price,
    change: isFinite(change) ? change : 0,
    changePercent: isFinite(changePercent) ? changePercent : 0,
    currency: meta?.currency || (isBist ? 'TRY' : 'USD'),
  };

  setCache(cacheKey, quote);
  return quote;
};

// --- Public wrappers ---

export const getBistHistoryRange = (symbol: string, startDate: Date, endDate: Date): Promise<PriceData[]> => {
  return getYahooHistory(symbol, startDate, endDate, true);
};

export const getUSStockHistoryYahoo = (symbol: string, startDate: Date, endDate: Date): Promise<PriceData[]> => {
  return getYahooHistory(symbol, startDate, endDate, false);
};

export const getBistQuote = (symbol: string): Promise<StockQuote> => {
  return getYahooQuote(symbol, true);
};

export const getUSStockQuoteYahoo = (symbol: string): Promise<StockQuote> => {
  return getYahooQuote(symbol, false);
};
