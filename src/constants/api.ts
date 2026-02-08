// API Configuration
// SECURITY: API keys are loaded from environment variables
// Create a .env.local file with your actual keys (see .env for template)

// Helper to get env variable with fallback warning
const getEnvVar = (key: string, fallback: string = ''): string => {
  const value = process.env[key];
  if (!value && __DEV__) {
    console.warn(`⚠️ Environment variable ${key} is not set. Using fallback.`);
  }
  return value || fallback;
};

export const API_CONFIG = {
  // Alpha Vantage - US Stocks
  ALPHA_VANTAGE: {
    BASE_URL: 'https://www.alphavantage.co/query',
    API_KEY: getEnvVar('EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY'),
  },

  // CoinGecko - Crypto (primary)
  COINGECKO: {
    BASE_URL: 'https://api.coingecko.com/api/v3',
  },

  // CoinCap - Crypto (fallback #1)
  COINCAP: {
    BASE_URL: 'https://api.coincap.io/v2',
  },

  // Binance - Crypto (fallback #2)
  BINANCE: {
    BASE_URL: 'https://api.binance.com/api/v3',
  },

  // ExchangeRate API - Forex
  EXCHANGE_RATE: {
    BASE_URL: 'https://api.exchangerate-api.com/v4',
    // Free tier available without API key
  },

};

// Rate limiting configuration
export const RATE_LIMITS = {
  ALPHA_VANTAGE: {
    requestsPerMinute: 5,
    requestsPerDay: 500,
  },
  COINGECKO: {
    requestsPerMinute: 30, // Conservative limit for free tier
  },
  COINCAP: {
    requestsPerMinute: 200,
  },
  BINANCE: {
    requestsPerMinute: 1200,
  },
  EXCHANGE_RATE: {
    requestsPerMonth: 1500,
  },
};

// Popular assets for quick selection
export const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
];

// Crypto categories
export type CryptoCategory = 'top10' | 'altcoin' | 'layer2' | 'defi' | 'gaming' | 'ai' | 'meme' | 'infrastructure';

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  category: CryptoCategory;
}

export const CRYPTO_CATEGORIES: Record<CryptoCategory, { label: string; icon: string }> = {
  top10: { label: 'Top 10', icon: '🏆' },
  altcoin: { label: 'Altcoinler', icon: '💎' },
  layer2: { label: 'Layer 2 & Scaling', icon: '⚡' },
  defi: { label: 'DeFi', icon: '🏦' },
  gaming: { label: 'Gaming & Metaverse', icon: '🎮' },
  ai: { label: 'AI & Altyapi', icon: '🤖' },
  meme: { label: 'Meme Coinler', icon: '🐕' },
  infrastructure: { label: 'Altyapi', icon: '🔧' },
};

export const POPULAR_CRYPTO: CryptoAsset[] = [
  // Top 10
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', category: 'top10' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', category: 'top10' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', category: 'top10' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', category: 'top10' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', category: 'top10' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', category: 'top10' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', category: 'top10' },
  { id: 'tron', symbol: 'TRX', name: 'TRON', category: 'top10' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', category: 'top10' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', category: 'top10' },

  // Altcoins
  { id: 'algorand', symbol: 'ALGO', name: 'Algorand', category: 'altcoin' },
  { id: 'aptos', symbol: 'APT', name: 'Aptos', category: 'altcoin' },
  { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos', category: 'altcoin' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', category: 'altcoin' },
  { id: 'ethereum-classic', symbol: 'ETC', name: 'Ethereum Classic', category: 'altcoin' },
  { id: 'filecoin', symbol: 'FIL', name: 'Filecoin', category: 'altcoin' },
  { id: 'fantom', symbol: 'FTM', name: 'Fantom', category: 'altcoin' },
  { id: 'hedera-hashgraph', symbol: 'HBAR', name: 'Hedera', category: 'altcoin' },
  { id: 'injective-protocol', symbol: 'INJ', name: 'Injective', category: 'altcoin' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', category: 'altcoin' },
  { id: 'near', symbol: 'NEAR', name: 'NEAR Protocol', category: 'altcoin' },
  { id: 'polygon', symbol: 'POL', name: 'Polygon', category: 'altcoin' },
  { id: 'quant-network', symbol: 'QNT', name: 'Quant', category: 'altcoin' },
  { id: 'sei-network', symbol: 'SEI', name: 'Sei', category: 'altcoin' },
  { id: 'sui', symbol: 'SUI', name: 'Sui', category: 'altcoin' },
  { id: 'theta-token', symbol: 'THETA', name: 'Theta Network', category: 'altcoin' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', category: 'altcoin' },
  { id: 'vechain', symbol: 'VET', name: 'VeChain', category: 'altcoin' },
  { id: 'stellar', symbol: 'XLM', name: 'Stellar', category: 'altcoin' },
  { id: 'monero', symbol: 'XMR', name: 'Monero', category: 'altcoin' },

  // Layer 2 & Scaling
  { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum', category: 'layer2' },
  { id: 'immutable-x', symbol: 'IMX', name: 'Immutable', category: 'layer2' },
  { id: 'optimism', symbol: 'OP', name: 'Optimism', category: 'layer2' },
  { id: 'skale', symbol: 'SKL', name: 'SKALE', category: 'layer2' },

  // DeFi
  { id: '1inch', symbol: '1INCH', name: '1inch', category: 'defi' },
  { id: 'aave', symbol: 'AAVE', name: 'Aave', category: 'defi' },
  { id: 'pancakeswap-token', symbol: 'CAKE', name: 'PancakeSwap', category: 'defi' },
  { id: 'curve-dao-token', symbol: 'CRV', name: 'Curve DAO', category: 'defi' },
  { id: 'the-graph', symbol: 'GRT', name: 'The Graph', category: 'defi' },
  { id: 'maker', symbol: 'MKR', name: 'Maker', category: 'defi' },
  { id: 'raydium', symbol: 'RAY', name: 'Raydium', category: 'defi' },
  { id: 'sushi', symbol: 'SUSHI', name: 'SushiSwap', category: 'defi' },

  // Gaming & Metaverse
  { id: 'axie-infinity', symbol: 'AXS', name: 'Axie Infinity', category: 'gaming' },
  { id: 'enjincoin', symbol: 'ENJ', name: 'Enjin Coin', category: 'gaming' },
  { id: 'gala', symbol: 'GALA', name: 'Gala', category: 'gaming' },
  { id: 'illuvium', symbol: 'ILV', name: 'Illuvium', category: 'gaming' },
  { id: 'decentraland', symbol: 'MANA', name: 'Decentraland', category: 'gaming' },
  { id: 'the-sandbox', symbol: 'SAND', name: 'The Sandbox', category: 'gaming' },

  // AI & Infrastructure
  { id: 'singularitynet', symbol: 'AGIX', name: 'SingularityNET', category: 'ai' },
  { id: 'akash-network', symbol: 'AKT', name: 'Akash Network', category: 'ai' },
  { id: 'aethir', symbol: 'ATH', name: 'Aethir', category: 'ai' },
  { id: 'fetch-ai', symbol: 'FET', name: 'Fetch.ai', category: 'ai' },
  { id: 'ocean-protocol', symbol: 'OCEAN', name: 'Ocean Protocol', category: 'ai' },
  { id: 'render-token', symbol: 'RNDR', name: 'Render', category: 'ai' },

  // Meme Coins
  { id: 'bonk', symbol: 'BONK', name: 'Bonk', category: 'meme' },
  { id: 'floki', symbol: 'FLOKI', name: 'FLOKI', category: 'meme' },
  { id: 'pepe', symbol: 'PEPE', name: 'Pepe', category: 'meme' },
  { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu', category: 'meme' },
  { id: 'dogwifcoin', symbol: 'WIF', name: 'dogwifhat', category: 'meme' },
];

// Helper function to get crypto by category (sorted alphabetically)
export const getCryptoByCategory = (category: CryptoCategory): CryptoAsset[] => {
  return POPULAR_CRYPTO
    .filter(c => c.category === category)
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
};

// Get all categories with their coins
export const getGroupedCrypto = (): { category: CryptoCategory; label: string; icon: string; coins: CryptoAsset[] }[] => {
  const categoryOrder: CryptoCategory[] = ['top10', 'altcoin', 'layer2', 'defi', 'gaming', 'ai', 'meme'];
  return categoryOrder.map(cat => ({
    category: cat,
    label: CRYPTO_CATEGORIES[cat].label,
    icon: CRYPTO_CATEGORIES[cat].icon,
    coins: getCryptoByCategory(cat),
  }));
};

export const POPULAR_FOREX = [
  { pair: 'USD/TRY', name: 'US Dollar / Turkish Lira' },
  { pair: 'EUR/TRY', name: 'Euro / Turkish Lira' },
  { pair: 'EUR/USD', name: 'Euro / US Dollar' },
  { pair: 'GBP/USD', name: 'British Pound / US Dollar' },
  { pair: 'USD/JPY', name: 'US Dollar / Japanese Yen' },
  { pair: 'XAU/USD', name: 'Gold / US Dollar' },
  { pair: 'XAG/USD', name: 'Silver / US Dollar' },
];
