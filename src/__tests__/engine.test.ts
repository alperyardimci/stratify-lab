import { SimulationEngine } from '../services/simulation/engine';
import { PriceData, StrategyBlock } from '../types';

// Mock the API modules so engine doesn't make real HTTP calls
jest.mock('../services/api/crypto', () => ({
  getCryptoHistoryDetailed: jest.fn(),
}));
jest.mock('../services/api/stocks', () => ({
  getStockHistoryRange: jest.fn(),
}));
jest.mock('../services/api/forex', () => ({
  getForexHistory: jest.fn(),
}));

const generatePriceData = (days: number, startPrice: number, trend: number = 0): PriceData[] => {
  const data: PriceData[] = [];
  let price = startPrice;
  const baseDate = new Date('2024-01-01');

  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const volatility = (Math.random() - 0.5) * 5;
    price = price + trend + volatility;
    if (price < 1) price = 1;

    data.push({
      date: date.toISOString().split('T')[0],
      open: price - 1,
      high: price + 2,
      low: price - 2,
      close: price,
      volume: 1000000 + Math.random() * 500000,
    });
  }

  return data;
};

const makeInvestment = (amount: number, entryDate: string) => ({
  id: 'test-inv',
  portfolio_id: 'portfolio-1',
  asset_type: 'crypto' as const,
  asset_symbol: 'bitcoin',
  amount,
  entry_date: entryDate,
});

describe('SimulationEngine', () => {
  describe('constructor', () => {
    it('creates engine with default labels', () => {
      const engine = new SimulationEngine();
      expect(engine).toBeDefined();
    });

    it('creates engine with custom labels', () => {
      const engine = new SimulationEngine({ profit: 'Kar', loss: 'Zarar' });
      expect(engine).toBeDefined();
    });
  });

  describe('runBuyAndHold', () => {
    it('purchases on day 1 and holds until end', async () => {
      const engine = new SimulationEngine();
      const priceData = generatePriceData(100, 100, 0.5);
      engine.setPriceData(priceData);

      const result = await engine.runBuyAndHold(makeInvestment(10000, priceData[0].date));

      expect(result).toBeDefined();
      expect(result.initial_value).toBe(10000);
      expect(result.final_value).toBeGreaterThan(0);
      expect(result.transactions.length).toBe(1);
      expect(result.transactions[0].type).toBe('buy');
    });

    it('returns correct profit percentage for known price change', async () => {
      const engine = new SimulationEngine();
      const priceData: PriceData[] = Array.from({ length: 50 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        open: 100 + i * 2,
        high: 102 + i * 2,
        low: 98 + i * 2,
        close: 100 + i * 2,
        volume: 1000000,
      }));
      engine.setPriceData(priceData);

      const result = await engine.runBuyAndHold(makeInvestment(10000, priceData[0].date));

      // Price: 100 → 198, profit = 98%
      const expectedReturn = ((198 - 100) / 100) * 100;
      expect(result.profit_percentage).toBeCloseTo(expectedReturn, 0);
    });
  });

  describe('runSimulation (with strategy)', () => {
    it('returns zero profit when no blocks trigger trades', async () => {
      const engine = new SimulationEngine();
      const priceData = generatePriceData(50, 100, 0);
      engine.setPriceData(priceData);

      const result = await engine.runSimulation(
        makeInvestment(10000, priceData[0].date),
        []
      );

      expect(result.initial_value).toBe(10000);
      expect(result.final_value).toBe(10000);
      expect(result.profit_percentage).toBe(0);
      expect(result.transactions.length).toBe(0);
    });
  });

  describe('runUnifiedPortfolioSimulation', () => {
    it('runs a unified simulation across multiple assets', async () => {
      const engine = new SimulationEngine();
      const assets = [
        { symbol: 'bitcoin', name: 'Bitcoin', priceData: generatePriceData(100, 50000, 100) },
        { symbol: 'ethereum', name: 'Ethereum', priceData: generatePriceData(100, 3000, 10) },
      ];

      const result = await engine.runUnifiedPortfolioSimulation(assets, [], 10000);

      expect(result).toBeDefined();
      expect(result.initialCash).toBe(10000);
      expect(result.finalPortfolioValue).toBeGreaterThan(0);
      expect(result.assetSummaries.length).toBe(2);
      expect(result.events).toBeDefined();
    });

    it('handles single asset portfolio', async () => {
      const engine = new SimulationEngine();
      const assets = [
        { symbol: 'bitcoin', name: 'Bitcoin', priceData: generatePriceData(50, 40000, 50) },
      ];

      const result = await engine.runUnifiedPortfolioSimulation(assets, [], 5000);

      expect(result.assetSummaries.length).toBe(1);
      expect(result.initialCash).toBe(5000);
    });
  });

  describe('calculateIndicators', () => {
    it('calculates indicators from price data', () => {
      const engine = new SimulationEngine();
      const priceData = generatePriceData(50, 100, 1);
      engine.setPriceData(priceData);

      const indicators = (engine as any).indicators;

      expect(indicators.sma20.length).toBe(50);
      expect(indicators.sma50.length).toBe(50);
      expect(indicators.ema20.length).toBe(50);
      expect(indicators.rsi14.length).toBe(50);
      expect(indicators.priceChange.length).toBe(50);
      expect(indicators.customMa).toBeInstanceOf(Map);
    });

    it('pre-calculates custom MA periods from strategy blocks', () => {
      const engine = new SimulationEngine();
      const priceData = generatePriceData(50, 100, 1);
      engine.setPriceData(priceData);

      const blocks: StrategyBlock[] = [{
        id: 'test',
        type: 'condition',
        name: 'IF_MOVING_AVG',
        params: { type: 'sma', period: 10, position: 'above' },
      }];

      (engine as any).calculateIndicators(blocks);
      const indicators = (engine as any).indicators;

      expect(indicators.customMa.has('sma_10')).toBe(true);
      expect(indicators.customMa.get('sma_10')!.length).toBe(50);
    });
  });
});
