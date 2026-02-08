import { API_CONFIG } from '../../constants/api';
import { PriceData, ForexQuote } from '../../types';

const { BASE_URL } = API_CONFIG.EXCHANGE_RATE;

// Fetch with timeout
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

// Cache for exchange rates (updated hourly)
let ratesCache: { rates: Record<string, number>; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Get all exchange rates (base USD)
export const getExchangeRates = async (): Promise<Record<string, number>> => {
  // Check cache
  if (ratesCache && Date.now() - ratesCache.timestamp < CACHE_DURATION) {
    return ratesCache.rates;
  }

  const response = await fetchWithTimeout(`${BASE_URL}/latest/USD`);

  if (!response.ok) {
    // Return stale cache if available when API fails
    if (ratesCache) {
      return ratesCache.rates;
    }
    throw new Error(`Exchange rate API error (HTTP ${response.status})`);
  }

  const data = await response.json();

  if (!data.rates || typeof data.rates !== 'object') {
    throw new Error('Invalid exchange rate data');
  }

  ratesCache = {
    rates: data.rates,
    timestamp: Date.now(),
  };

  return data.rates;
};

// Fetch commodity price from CoinGecko (gold/silver via commodity endpoint)
const fetchCommodityPrice = async (commodity: 'gold' | 'silver'): Promise<number | null> => {
  try {
    // CoinGecko supports gold (xau) and silver (xag) via simple/price with vs_currencies
    const id = commodity === 'gold' ? 'tether-gold' : 'silver-token';
    const response = await fetchWithTimeout(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
      8000
    );
    if (response.ok) {
      const data = await response.json();
      if (data[id]?.usd) return data[id].usd;
    }
  } catch {
    // Fall through to fallback
  }
  return null;
};

// Fallback commodity prices (updated periodically)
const FALLBACK_GOLD_PRICE = 2650;
const FALLBACK_SILVER_PRICE = 31;

// Get forex pair quote
export const getForexQuote = async (pair: string): Promise<ForexQuote> => {
  const [base, quote] = pair.split('/');
  const rates = await getExchangeRates();

  // Handle gold and silver with API fetch + fallback
  if (base === 'XAU') {
    const goldPrice = (await fetchCommodityPrice('gold')) || FALLBACK_GOLD_PRICE;
    const rate = quote === 'USD' ? goldPrice : goldPrice * rates[quote];
    return {
      pair,
      rate,
      change: 0,
      changePercent: 0,
    };
  }

  if (base === 'XAG') {
    const silverPrice = (await fetchCommodityPrice('silver')) || FALLBACK_SILVER_PRICE;
    const rate = quote === 'USD' ? silverPrice : silverPrice * rates[quote];
    return {
      pair,
      rate,
      change: 0,
      changePercent: 0,
    };
  }

  // Calculate cross rate
  let rate: number;
  if (base === 'USD') {
    rate = rates[quote] || 0;
  } else if (quote === 'USD') {
    rate = 1 / (rates[base] || 1);
  } else {
    // Cross rate
    const baseToUsd = 1 / (rates[base] || 1);
    rate = baseToUsd * (rates[quote] || 1);
  }

  return {
    pair,
    rate,
    change: 0, // ExchangeRate-API doesn't provide change data
    changePercent: 0,
  };
};

// Cache for simulated forex data
const forexDataCache: Map<string, PriceData[]> = new Map();

// Seeded random number generator for consistent results
const seededRandom = (seed: number): (() => number) => {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
};

// Generate a numeric seed from string
const stringToSeed = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// Generate simulated historical forex data
// Note: Free forex APIs typically don't provide historical data
// In production, use a paid API like Alpha Vantage FX or OANDA
export const getForexHistory = async (
  pair: string,
  startDate: Date,
  endDate: Date
): Promise<PriceData[]> => {
  // Create cache key
  const cacheKey = `${pair}_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`;

  // Return cached data if available
  if (forexDataCache.has(cacheKey)) {
    if (__DEV__) console.log('Using cached forex data for', pair);
    return forexDataCache.get(cacheKey)!;
  }

  const currentQuote = await getForexQuote(pair);
  const currentRate = currentQuote.rate;

  // Create seeded random generator
  const seed = stringToSeed(cacheKey);
  const random = seededRandom(seed);

  // Generate simulated historical data based on current rate
  // This is for demo purposes - use real historical API in production
  const priceData: PriceData[] = [];
  const currentDate = new Date(startDate);
  let prevClose = currentRate * 0.95; // Start 5% lower

  while (currentDate <= endDate) {
    // Skip weekends for forex
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Seeded random daily change between -2% and +2%
      const dailyChange = (random() - 0.5) * 0.04;
      const open = prevClose;
      const close = open * (1 + dailyChange);
      const high = Math.max(open, close) * (1 + random() * 0.01);
      const low = Math.min(open, close) * (1 - random() * 0.01);

      priceData.push({
        date: currentDate.toISOString().split('T')[0],
        open,
        high,
        low,
        close,
        volume: Math.floor(random() * 1000000),
      });

      prevClose = close;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Adjust the final price to match current rate
  if (priceData.length > 0) {
    const scaleFactor = currentRate / priceData[priceData.length - 1].close;
    priceData.forEach(item => {
      item.open *= scaleFactor;
      item.high *= scaleFactor;
      item.low *= scaleFactor;
      item.close *= scaleFactor;
    });
  }

  // Cache the data
  forexDataCache.set(cacheKey, priceData);

  return priceData;
};

// Get available currency pairs
export const getAvailablePairs = async (): Promise<string[]> => {
  const rates = await getExchangeRates();
  const currencies = Object.keys(rates);

  // Return common pairs
  const baseCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF'];
  const pairs: string[] = [];

  baseCurrencies.forEach(base => {
    currencies.forEach(quote => {
      if (base !== quote) {
        pairs.push(`${base}/${quote}`);
      }
    });
  });

  return pairs.slice(0, 50); // Limit to 50 pairs
};

// Convert amount between currencies
export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> => {
  const rates = await getExchangeRates();

  if (fromCurrency === 'USD') {
    return amount * (rates[toCurrency] || 0);
  }

  if (toCurrency === 'USD') {
    return amount / (rates[fromCurrency] || 1);
  }

  // Cross conversion through USD
  const inUsd = amount / (rates[fromCurrency] || 1);
  return inUsd * (rates[toCurrency] || 0);
};
