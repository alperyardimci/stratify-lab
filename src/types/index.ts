// Asset Types
export type AssetType = 'stock' | 'crypto' | 'forex' | 'commodity' | 'bist';

// Price Data
export interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Portfolio
export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

// Investment
export interface Investment {
  id: string;
  portfolio_id: string;
  asset_type: AssetType;
  asset_symbol: string;
  amount: number;
  entry_date: string;
  strategy_id?: string;
}

// Strategy Block Types
export type BlockType = 'trigger' | 'condition' | 'action' | 'modifier';

export interface StrategyBlock {
  id: string;
  type: BlockType;
  name: string;
  params: Record<string, any>;
  children?: StrategyBlock[];
  next?: string;
}

// Strategy
export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  blocks: StrategyBlock[];
  is_public: boolean;
  created_at: string;
}

// Transaction
export interface Transaction {
  date: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  value: number;
  reason: string;
  // Enhanced details
  strategyName?: string;
  strategyIcon?: string;
  strategyColor?: string;
  triggerType?: 'trigger' | 'condition' | 'modifier';
  triggerDetails?: string;
  indicatorValue?: string;
}

// Simulation Result
export interface SimulationResult {
  id: string;
  investment_id: string;
  initial_value: number;
  final_value: number;
  profit_loss: number;
  profit_percentage: number;
  transactions: Transaction[];
  calculated_at: string;
  price_history?: PriceData[];
}

// Portfolio Event - for unified portfolio simulation
export type PortfolioEventType = 'buy' | 'sell' | 'skip_buy' | 'skip_sell';

export interface PortfolioEvent {
  date: string;
  symbol: string;
  symbolName: string;
  eventType: PortfolioEventType;
  price: number;
  amount?: number;
  value?: number;
  reason: string;
  strategyName?: string;
  strategyIcon?: string;
  strategyColor?: string;
  triggerDetails?: string;
  indicatorValue?: string;
  // Snapshot of portfolio state after this event
  cashAfter: number;
  positionsAfter: { [symbol: string]: number };
  portfolioValueAfter: number;
}

// Unified Portfolio Result
export interface UnifiedPortfolioResult {
  initialCash: number;
  finalCash: number;
  finalPositions: { [symbol: string]: { amount: number; value: number } };
  finalPortfolioValue: number;
  profitLoss: number;
  profitPercentage: number;
  events: PortfolioEvent[];
  assetSummaries: AssetSummary[];
}

export interface AssetSummary {
  symbol: string;
  name: string;
  totalBought: number;
  totalSold: number;
  currentPosition: number;
  currentValue: number;
  realizedProfitLoss: number;
  unrealizedProfitLoss: number;
  buyCount: number;
  sellCount: number;
  skipCount: number;
}

// User
export interface User {
  id: string;
  email: string;
  created_at: string;
}

// Block Definitions
export interface BlockDefinition {
  type: BlockType;
  name: string;
  label: string;
  description: string;
  color: string;
  params: BlockParam[];
  acceptsChildren: boolean;
}

export interface BlockParam {
  name: string;
  label: string;
  type: 'number' | 'string' | 'select' | 'date';
  options?: { value: string; label: string }[];
  defaultValue?: any;
  required?: boolean;
}

// API Response Types
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

export interface CryptoQuote {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
}

export interface ForexQuote {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
}

// Navigation Types
export type RootStackParamList = {
  MainTabs: undefined;
  SimulationDetail: { resultId: string };
  StrategyDetail: { strategyId: string };
};

export type MainTabParamList = {
  Simulator: undefined;
  Strategy: undefined;
  Settings: undefined;
};

// Portfolio Summary
export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  investments: InvestmentWithResult[];
}

export interface InvestmentWithResult extends Investment {
  currentValue?: number;
  profitLoss?: number;
  profitLossPercent?: number;
  lastSimulation?: SimulationResult;
}

// Theme
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    error: string;
    warning: string;
    border: string;
    // Block colors
    trigger: string;
    condition: string;
    action: string;
    modifier: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
}
