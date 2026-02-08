import { API_CONFIG, RATE_LIMITS, POPULAR_CRYPTO } from '../../constants/api';
import { PriceData, CryptoQuote } from '../../types';
import { sanitizeSymbol, sanitizeSearchQuery } from '../../utils/validation';

// ============================================================
// Multi-API Provider System
// Fallback chain: CoinGecko → CoinCap → Binance → Simulated Data
// ============================================================

const COINGECKO_URL = API_CONFIG.COINGECKO.BASE_URL;
const COINCAP_URL = API_CONFIG.COINCAP.BASE_URL;
const BINANCE_URL = API_CONFIG.BINANCE.BASE_URL;

// --- Rate Limit Tracker ---
interface RateLimitState {
  requestCount: number;
  windowStart: number;
  isBlocked: boolean;
  blockedUntil: number;
}

const rateLimits: Record<string, RateLimitState> = {
  coingecko: { requestCount: 0, windowStart: Date.now(), isBlocked: false, blockedUntil: 0 },
  coincap: { requestCount: 0, windowStart: Date.now(), isBlocked: false, blockedUntil: 0 },
  binance: { requestCount: 0, windowStart: Date.now(), isBlocked: false, blockedUntil: 0 },
};

const RATE_LIMIT_MAP: Record<string, number> = {
  coingecko: RATE_LIMITS.COINGECKO.requestsPerMinute,
  coincap: RATE_LIMITS.COINCAP.requestsPerMinute,
  binance: RATE_LIMITS.BINANCE.requestsPerMinute,
};

const canMakeRequest = (provider: string): boolean => {
  const state = rateLimits[provider];
  if (!state) return false;

  const now = Date.now();

  // Check if blocked due to 429
  if (state.isBlocked && now < state.blockedUntil) {
    return false;
  }
  if (state.isBlocked && now >= state.blockedUntil) {
    state.isBlocked = false;
  }

  // Reset window if minute has passed
  if (now - state.windowStart > 60000) {
    state.requestCount = 0;
    state.windowStart = now;
  }

  return state.requestCount < RATE_LIMIT_MAP[provider];
};

const trackRequest = (provider: string) => {
  const state = rateLimits[provider];
  if (state) {
    state.requestCount++;
  }
};

const markRateLimited = (provider: string) => {
  const state = rateLimits[provider];
  if (state) {
    state.isBlocked = true;
    state.blockedUntil = Date.now() + 60000; // Block for 1 minute
  }
};

// --- Response Cache with TTL and LRU eviction ---
const responseCache: Map<string, { data: any; timestamp: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX_SIZE = 150;

const getCached = <T>(key: string): T | null => {
  const entry = responseCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    // Move to end for LRU behavior (most recently used)
    responseCache.delete(key);
    responseCache.set(key, entry);
    return entry.data as T;
  }
  responseCache.delete(key);
  return null;
};

const setCache = (key: string, data: any) => {
  // Delete first to reset insertion order for LRU
  responseCache.delete(key);
  responseCache.set(key, { data, timestamp: Date.now() });

  // Evict oldest entries (front of Map) until under limit
  while (responseCache.size > CACHE_MAX_SIZE) {
    const oldest = responseCache.keys().next().value;
    if (oldest) responseCache.delete(oldest);
    else break;
  }
};

// Periodic cleanup of expired entries (every 5 min)
let lastCleanup = Date.now();
const cleanupExpiredCache = () => {
  const now = Date.now();
  if (now - lastCleanup < CACHE_TTL) return;
  lastCleanup = now;

  for (const [key, entry] of responseCache) {
    if (now - entry.timestamp >= CACHE_TTL) {
      responseCache.delete(key);
    }
  }
};

// --- Fetch helper ---
const fetchSafe = async (url: string, provider: string, timeout = 10000): Promise<Response> => {
  if (!canMakeRequest(provider)) {
    throw new Error(`Rate limited: ${provider}`);
  }

  trackRequest(provider);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (response.status === 429) {
      markRateLimited(provider);
      throw new Error(`Rate limited by ${provider}`);
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from ${provider}`);
    }
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

// --- CoinGecko ID → Binance Symbol mapping ---
const coinGeckoToBinanceSymbol = (id: string): string | null => {
  const map: Record<string, string> = {
    'bitcoin': 'BTCUSDT',
    'ethereum': 'ETHUSDT',
    'binancecoin': 'BNBUSDT',
    'ripple': 'XRPUSDT',
    'solana': 'SOLUSDT',
    'cardano': 'ADAUSDT',
    'dogecoin': 'DOGEUSDT',
    'tron': 'TRXUSDT',
    'avalanche-2': 'AVAXUSDT',
    'chainlink': 'LINKUSDT',
    'polkadot': 'DOTUSDT',
    'polygon': 'POLUSDT',
    'litecoin': 'LTCUSDT',
    'near': 'NEARUSDT',
    'uniswap': 'UNIUSDT',
    'stellar': 'XLMUSDT',
    'cosmos': 'ATOMUSDT',
    'algorand': 'ALGOUSDT',
    'filecoin': 'FILUSDT',
    'fantom': 'FTMUSDT',
    'hedera-hashgraph': 'HBARUSDT',
    'injective-protocol': 'INJUSDT',
    'aptos': 'APTUSDT',
    'sui': 'SUIUSDT',
    'sei-network': 'SEIUSDT',
    'arbitrum': 'ARBUSDT',
    'optimism': 'OPUSDT',
    'aave': 'AAVEUSDT',
    'maker': 'MKRUSDT',
    'the-graph': 'GRTUSDT',
    'render-token': 'RNDRUSDT',
    'fetch-ai': 'FETUSDT',
    'singularitynet': 'AGIXUSDT',
    'immutable-x': 'IMXUSDT',
    'axie-infinity': 'AXSUSDT',
    'gala': 'GALAUSDT',
    'the-sandbox': 'SANDUSDT',
    'decentraland': 'MANAUSDT',
    'enjincoin': 'ENJUSDT',
    'shiba-inu': 'SHIBUSDT',
    'pepe': 'PEPEUSDT',
    'floki': 'FLOKIUSDT',
    'bonk': 'BONKUSDT',
    'curve-dao-token': 'CRVUSDT',
    'pancakeswap-token': 'CAKEUSDT',
    'sushi': 'SUSHIUSDT',
    '1inch': '1INCHUSDT',
    'theta-token': 'THETAUSDT',
    'vechain': 'VETUSDT',
    'quant-network': 'QNTUSDT',
    'ethereum-classic': 'ETCUSDT',
    'monero': 'XMRUSDT',
    'skale': 'SKLUSDT',
    'raydium': 'RAYUSDT',
    'akash-network': 'AKTUSDT',
    'ocean-protocol': 'OCEANUSDT',
    'dogwifcoin': 'WIFUSDT',
  };
  return map[id] || null;
};

// ============================================================
// Provider-specific implementations
// ============================================================

// --- CoinGecko Providers ---

const getCryptoQuoteCoinGecko = async (id: string): Promise<CryptoQuote> => {
  const response = await fetchSafe(
    `${COINGECKO_URL}/coins/${encodeURIComponent(id)}?localization=false&tickers=false&community_data=false&developer_data=false`,
    'coingecko'
  );
  const data = await response.json();
  return {
    id: data.id,
    symbol: data.symbol.toUpperCase(),
    name: data.name,
    price: data.market_data.current_price.usd,
    change24h: data.market_data.price_change_24h,
    changePercent24h: data.market_data.price_change_percentage_24h,
    marketCap: data.market_data.market_cap.usd,
  };
};

const getCryptoQuotesCoinGecko = async (ids: string[]): Promise<CryptoQuote[]> => {
  const response = await fetchSafe(
    `${COINGECKO_URL}/coins/markets?vs_currency=usd&ids=${ids.join(',')}&order=market_cap_desc`,
    'coingecko'
  );
  const data = await response.json();
  return data.map((coin: any) => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price: coin.current_price,
    change24h: coin.price_change_24h,
    changePercent24h: coin.price_change_percentage_24h,
    marketCap: coin.market_cap,
  }));
};

const getCryptoHistoryDetailedCoinGecko = async (
  id: string,
  startDate: Date,
  endDate: Date
): Promise<PriceData[]> => {
  const from = Math.floor(startDate.getTime() / 1000);
  const to = Math.floor(endDate.getTime() / 1000);

  const response = await fetchSafe(
    `${COINGECKO_URL}/coins/${id}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`,
    'coingecko'
  );
  const data = await response.json();
  const prices = data.prices || [];
  const volumes = data.total_volumes || [];

  if (prices.length === 0) {
    throw new Error('No price data returned from CoinGecko');
  }

  return groupPricesToDaily(prices, volumes);
};

// --- CoinCap Providers ---

const getCryptoQuoteCoinCap = async (id: string): Promise<CryptoQuote> => {
  const response = await fetchSafe(
    `${COINCAP_URL}/assets/${encodeURIComponent(id)}`,
    'coincap'
  );
  const { data } = await response.json();
  return {
    id: data.id,
    symbol: data.symbol.toUpperCase(),
    name: data.name,
    price: parseFloat(data.priceUsd),
    change24h: 0, // CoinCap doesn't provide absolute change
    changePercent24h: parseFloat(data.changePercent24h) || 0,
    marketCap: parseFloat(data.marketCapUsd) || 0,
  };
};

const getCryptoQuotesCoinCap = async (ids: string[]): Promise<CryptoQuote[]> => {
  const response = await fetchSafe(
    `${COINCAP_URL}/assets?ids=${ids.join(',')}`,
    'coincap'
  );
  const { data } = await response.json();
  return data.map((coin: any) => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price: parseFloat(coin.priceUsd),
    change24h: 0,
    changePercent24h: parseFloat(coin.changePercent24h) || 0,
    marketCap: parseFloat(coin.marketCapUsd) || 0,
  }));
};

const getCryptoHistoryDetailedCoinCap = async (
  id: string,
  startDate: Date,
  endDate: Date
): Promise<PriceData[]> => {
  const start = startDate.getTime();
  const end = endDate.getTime();

  const response = await fetchSafe(
    `${COINCAP_URL}/assets/${id}/history?interval=d1&start=${start}&end=${end}`,
    'coincap'
  );
  const { data } = await response.json();

  if (!data || data.length === 0) {
    throw new Error('No price data returned from CoinCap');
  }

  return data.map((item: any) => {
    const price = parseFloat(item.priceUsd);
    const date = new Date(item.time).toISOString().split('T')[0];
    return {
      date,
      open: price,
      high: price * 1.01,  // CoinCap only provides daily average
      low: price * 0.99,
      close: price,
      volume: 0,
    };
  });
};

// --- Binance Providers ---

const getCryptoQuoteBinance = async (id: string): Promise<CryptoQuote> => {
  const symbol = coinGeckoToBinanceSymbol(id);
  if (!symbol) throw new Error(`No Binance mapping for ${id}`);

  const response = await fetchSafe(
    `${BINANCE_URL}/ticker/24hr?symbol=${symbol}`,
    'binance'
  );
  const data = await response.json();

  const asset = POPULAR_CRYPTO.find((c) => c.id === id);

  return {
    id,
    symbol: data.symbol.replace('USDT', ''),
    name: asset?.name || data.symbol.replace('USDT', ''),
    price: parseFloat(data.lastPrice),
    change24h: parseFloat(data.priceChange),
    changePercent24h: parseFloat(data.priceChangePercent),
    marketCap: 0, // Binance doesn't provide market cap
  };
};

const getCryptoQuotesBinance = async (ids: string[]): Promise<CryptoQuote[]> => {
  const results: CryptoQuote[] = [];
  // Binance needs individual requests per symbol, batch with ticker endpoint
  const symbols = ids
    .map(id => coinGeckoToBinanceSymbol(id))
    .filter(Boolean);

  if (symbols.length === 0) throw new Error('No Binance symbols found');

  const response = await fetchSafe(
    `${BINANCE_URL}/ticker/24hr?symbols=${JSON.stringify(symbols)}`,
    'binance'
  );
  const data = await response.json();

  for (const ticker of data) {
    const baseSymbol = ticker.symbol.replace('USDT', '');
    const asset = POPULAR_CRYPTO.find((c) =>
      c.symbol === baseSymbol || coinGeckoToBinanceSymbol(c.id) === ticker.symbol
    );
    results.push({
      id: asset?.id || baseSymbol.toLowerCase(),
      symbol: baseSymbol,
      name: asset?.name || baseSymbol,
      price: parseFloat(ticker.lastPrice),
      change24h: parseFloat(ticker.priceChange),
      changePercent24h: parseFloat(ticker.priceChangePercent),
      marketCap: 0,
    });
  }

  return results;
};

const getCryptoHistoryDetailedBinance = async (
  id: string,
  startDate: Date,
  endDate: Date
): Promise<PriceData[]> => {
  const symbol = coinGeckoToBinanceSymbol(id);
  if (!symbol) throw new Error(`No Binance mapping for ${id}`);

  const start = startDate.getTime();
  const end = endDate.getTime();

  // Binance klines max 1000 per request, paginate if needed
  const allData: PriceData[] = [];
  let currentStart = start;

  while (currentStart < end) {
    const response = await fetchSafe(
      `${BINANCE_URL}/klines?symbol=${symbol}&interval=1d&startTime=${currentStart}&endTime=${end}&limit=1000`,
      'binance'
    );
    const data = await response.json();

    if (!data || data.length === 0) break;

    // Binance klines: [openTime, open, high, low, close, volume, closeTime, ...]
    for (const kline of data) {
      allData.push({
        date: new Date(kline[0]).toISOString().split('T')[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
      });
    }

    // Move to next batch
    const lastTime = data[data.length - 1][6]; // closeTime
    currentStart = lastTime + 1;

    if (data.length < 1000) break;
  }

  if (allData.length === 0) {
    throw new Error('No price data returned from Binance');
  }

  return allData;
};

// ============================================================
// Shared helpers
// ============================================================

const groupPricesToDaily = (prices: number[][], volumes: number[][]): PriceData[] => {
  const dailyData: Map<string, PriceData> = new Map();

  prices.forEach((item: number[], index: number) => {
    const date = new Date(item[0]).toISOString().split('T')[0];
    const price = item[1];
    const volume = volumes[index] ? volumes[index][1] : 0;

    if (!dailyData.has(date)) {
      dailyData.set(date, {
        date,
        open: price,
        high: price,
        low: price,
        close: price,
        volume,
      });
    } else {
      const existing = dailyData.get(date)!;
      existing.high = Math.max(existing.high, price);
      existing.low = Math.min(existing.low, price);
      existing.close = price;
      existing.volume = Math.max(existing.volume, volume);
    }
  });

  return Array.from(dailyData.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

// ============================================================
// Multi-provider fallback wrapper
// ============================================================

type ProviderFn<T> = () => Promise<T>;

const withFallback = async <T>(
  providers: { name: string; fn: ProviderFn<T> }[],
  fallbackLabel: string
): Promise<T> => {
  cleanupExpiredCache();
  let lastError: Error | null = null;

  for (const { name, fn } of providers) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error as Error;
      if (__DEV__) console.warn(`${name} failed for ${fallbackLabel}:`, (error as Error).message);
    }
  }

  throw lastError || new Error(`All providers failed for ${fallbackLabel}`);
};

// ============================================================
// Public API (same interface, multi-provider backend)
// ============================================================

// Get real-time crypto price
export const getCryptoQuote = async (id: string): Promise<CryptoQuote> => {
  const cleanId = sanitizeSymbol(id);
  if (!cleanId) {
    throw new Error('Invalid crypto ID');
  }

  const cacheKey = `quote_${cleanId}`;
  const cached = getCached<CryptoQuote>(cacheKey);
  if (cached) return cached;

  const result = await withFallback<CryptoQuote>([
    { name: 'CoinGecko', fn: () => getCryptoQuoteCoinGecko(cleanId) },
    { name: 'CoinCap', fn: () => getCryptoQuoteCoinCap(cleanId) },
    { name: 'Binance', fn: () => getCryptoQuoteBinance(cleanId) },
  ], `quote:${cleanId}`);

  setCache(cacheKey, result);
  return result;
};

// Get multiple crypto quotes at once
export const getCryptoQuotes = async (ids: string[]): Promise<CryptoQuote[]> => {
  // Validate and sanitize each ID, limit batch size
  const cleanIds = ids
    .map(id => sanitizeSymbol(id))
    .filter(Boolean)
    .slice(0, 50);

  if (cleanIds.length === 0) {
    throw new Error('No valid crypto IDs provided');
  }

  const cacheKey = `quotes_${[...cleanIds].sort().join(',')}`;
  const cached = getCached<CryptoQuote[]>(cacheKey);
  if (cached) return cached;

  const result = await withFallback<CryptoQuote[]>([
    { name: 'CoinGecko', fn: () => getCryptoQuotesCoinGecko(cleanIds) },
    { name: 'CoinCap', fn: () => getCryptoQuotesCoinCap(cleanIds) },
    { name: 'Binance', fn: () => getCryptoQuotesBinance(cleanIds) },
  ], `quotes:${cleanIds.length} coins`);

  setCache(cacheKey, result);
  return result;
};

// Get historical crypto prices (simple OHLC)
export const getCryptoHistory = async (
  id: string,
  days: number = 365
): Promise<PriceData[]> => {
  const cacheKey = `history_${id}_${days}`;
  const cached = getCached<PriceData[]>(cacheKey);
  if (cached) return cached;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    // Try CoinGecko OHLC first (best quality)
    const response = await fetchSafe(
      `${COINGECKO_URL}/coins/${id}/ohlc?vs_currency=usd&days=${days}`,
      'coingecko'
    );
    const data = await response.json();
    const result = data.map((item: number[]) => ({
      date: new Date(item[0]).toISOString().split('T')[0],
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: 0,
    }));
    setCache(cacheKey, result);
    return result;
  } catch {
    // Fallback to detailed history
    const result = await getCryptoHistoryDetailed(id, startDate, endDate);
    setCache(cacheKey, result);
    return result;
  }
};

// Get detailed historical data with volume
export const getCryptoHistoryDetailed = async (
  id: string,
  startDate: Date,
  endDate: Date
): Promise<PriceData[]> => {
  const cacheKey = `history_detailed_${id}_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`;
  const cached = getCached<PriceData[]>(cacheKey);
  if (cached) return cached;

  try {
    const result = await withFallback<PriceData[]>([
      { name: 'CoinGecko', fn: () => getCryptoHistoryDetailedCoinGecko(id, startDate, endDate) },
      { name: 'CoinCap', fn: () => getCryptoHistoryDetailedCoinCap(id, startDate, endDate) },
      { name: 'Binance', fn: () => getCryptoHistoryDetailedBinance(id, startDate, endDate) },
    ], `history:${id}`);

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    if (__DEV__) console.warn('All API providers failed, generating simulated data:', (error as Error).message);
    return generateSimulatedPriceData(id, startDate, endDate);
  }
};

// Search for cryptocurrencies
export const searchCrypto = async (query: string): Promise<{ id: string; symbol: string; name: string }[]> => {
  const cleanQuery = sanitizeSearchQuery(query);
  if (!cleanQuery) {
    return [];
  }

  const cacheKey = `search_${cleanQuery}`;
  const cached = getCached<{ id: string; symbol: string; name: string }[]>(cacheKey);
  if (cached) return cached;

  try {
    // CoinGecko search
    const response = await fetchSafe(
      `${COINGECKO_URL}/search?query=${encodeURIComponent(cleanQuery)}`,
      'coingecko'
    );
    const data = await response.json();
    const result = (data.coins || []).slice(0, 20).map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
    }));
    setCache(cacheKey, result);
    return result;
  } catch {
    // Fallback: CoinCap search
    try {
      const response = await fetchSafe(
        `${COINCAP_URL}/assets?search=${encodeURIComponent(cleanQuery)}&limit=20`,
        'coincap'
      );
      const { data } = await response.json();
      const result = (data || []).map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
      }));
      setCache(cacheKey, result);
      return result;
    } catch {
      // Return empty if all APIs fail
      return [];
    }
  }
};

// Get top cryptocurrencies
export const getTopCryptos = async (limit: number = 20): Promise<CryptoQuote[]> => {
  const cacheKey = `top_${limit}`;
  const cached = getCached<CryptoQuote[]>(cacheKey);
  if (cached) return cached;

  try {
    // CoinGecko
    const response = await fetchSafe(
      `${COINGECKO_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1`,
      'coingecko'
    );
    const data = await response.json();
    const result = data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_24h,
      changePercent24h: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
    }));
    setCache(cacheKey, result);
    return result;
  } catch {
    // Fallback: CoinCap
    try {
      const response = await fetchSafe(
        `${COINCAP_URL}/assets?limit=${limit}`,
        'coincap'
      );
      const { data } = await response.json();
      const result = (data || []).map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: parseFloat(coin.priceUsd),
        change24h: 0,
        changePercent24h: parseFloat(coin.changePercent24h) || 0,
        marketCap: parseFloat(coin.marketCapUsd) || 0,
      }));
      setCache(cacheKey, result);
      return result;
    } catch {
      throw new Error('Failed to fetch top cryptos from all providers');
    }
  }
};

// ============================================================
// Simulated Data (last resort fallback)
// ============================================================

const simulatedDataCache: Map<string, PriceData[]> = new Map();

const seededRandom = (seed: number): (() => number) => {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
};

const stringToSeed = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const generateSimulatedPriceData = (id: string, startDate: Date, endDate: Date): PriceData[] => {
  const cacheKey = `${id}_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`;

  if (simulatedDataCache.has(cacheKey)) {
    if (__DEV__) console.log('Using cached simulated data for', id);
    return simulatedDataCache.get(cacheKey)!;
  }

  if (__DEV__) console.log('Generating new simulated data for', id);

  const data: PriceData[] = [];
  const currentDate = new Date(startDate);
  const seed = stringToSeed(cacheKey);
  const random = seededRandom(seed);

  const basePrices: Record<string, number> = {
    'bitcoin': 45000,
    'ethereum': 2500,
    'solana': 100,
    'binancecoin': 300,
    'ripple': 0.5,
    'cardano': 0.4,
    'dogecoin': 0.08,
    'polkadot': 7,
    'avalanche-2': 35,
    'chainlink': 15,
    'raydium': 2,
    'aethir': 0.05,
    'skale': 0.04,
  };

  let price = basePrices[id] || 10;
  const volatility = price > 1000 ? 0.02 : price > 10 ? 0.03 : 0.04;

  while (currentDate <= endDate) {
    const change = (random() - 0.498) * volatility;
    price = price * (1 + change);
    price = Math.max(price * 0.1, Math.min(price, price * 10));

    const high = price * (1 + random() * 0.02);
    const low = price * (1 - random() * 0.02);
    const open = low + random() * (high - low);
    const close = low + random() * (high - low);

    data.push({
      date: currentDate.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume: random() * 1000000000,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  simulatedDataCache.set(cacheKey, data);
  return data;
};
