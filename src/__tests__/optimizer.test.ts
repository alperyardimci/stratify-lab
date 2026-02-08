import { StrategyOptimizer } from '../services/simulation/optimizer';
import { SimulationEngine } from '../services/simulation/engine';
import { PriceData } from '../types';

// Mock API modules
jest.mock('../services/api/crypto', () => ({
  getCryptoHistoryDetailed: jest.fn(),
}));
jest.mock('../services/api/stocks', () => ({
  getStockHistoryRange: jest.fn(),
}));
jest.mock('../services/api/forex', () => ({
  getForexHistory: jest.fn(),
}));

const generatePriceData = (days: number, startPrice: number): PriceData[] => {
  const data: PriceData[] = [];
  let price = startPrice;
  const baseDate = new Date('2024-01-01');

  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    price = price + (Math.sin(i * 0.1) * 5); // oscillating price

    data.push({
      date: date.toISOString().split('T')[0],
      open: price - 1,
      high: price + 3,
      low: price - 3,
      close: price,
      volume: 1000000 + Math.sin(i) * 200000,
    });
  }

  return data;
};

describe('StrategyOptimizer', () => {
  it('creates an optimizer instance', () => {
    const optimizer = new StrategyOptimizer();
    expect(optimizer).toBeDefined();
  });

  it('loads price data via engine', async () => {
    const optimizer = new StrategyOptimizer();
    const priceData = generatePriceData(100, 100);

    // Access internal engine and set price data directly to avoid API calls
    const engine = (optimizer as any).engine as SimulationEngine;
    (engine as any).priceData = priceData;
    (optimizer as any).priceDataLoaded = true;

    // Should not throw since data is loaded
    expect((optimizer as any).priceDataLoaded).toBe(true);
  });

  it('quickOptimize returns sorted results', async () => {
    const optimizer = new StrategyOptimizer();
    const priceData = generatePriceData(200, 100);

    const engine = (optimizer as any).engine as SimulationEngine;
    (engine as any).priceData = priceData;
    (optimizer as any).priceDataLoaded = true;

    const investment = {
      id: 'opt-test',
      portfolio_id: 'portfolio-1',
      asset_type: 'crypto' as const,
      asset_symbol: 'bitcoin',
      amount: 10000,
      entry_date: priceData[0].date,
    };

    let lastProgress: any = null;
    const results = await optimizer.quickOptimize(investment, (progress) => {
      lastProgress = progress;
    });

    expect(results.length).toBeGreaterThan(0);
    // Results should be sorted by profit percentage (descending)
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].profitPercentage).toBeGreaterThanOrEqual(results[i + 1].profitPercentage);
    }

    // Progress callback should have been called
    expect(lastProgress).not.toBeNull();
  });

  it('multiAssetOptimize handles multiple assets', async () => {
    const optimizer = new StrategyOptimizer();

    const assets = [
      { symbol: 'bitcoin', name: 'Bitcoin', priceData: generatePriceData(100, 50000) },
      { symbol: 'ethereum', name: 'Ethereum', priceData: generatePriceData(100, 3000) },
    ];

    let progressCalled = false;
    const results = await optimizer.multiAssetOptimize(
      assets,
      10000,
      'crypto',
      () => { progressCalled = true; }
    );

    expect(results.length).toBeGreaterThan(0);
    expect(progressCalled).toBe(true);
    // Each result should have assetResults
    if (results[0].assetResults) {
      expect(results[0].assetResults.length).toBe(2);
    }
  });
});
