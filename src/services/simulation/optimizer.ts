import { StrategyBlock, Investment, SimulationResult, AssetType, PriceData } from '../../types';
import { presetStrategies, PresetStrategy } from '../../constants/presetStrategies';
import { SimulationEngine } from './engine';

export interface OptimizationResult {
  strategyIds: string[];
  strategyNames: string[];
  result: SimulationResult;
  profitPercentage: number;
  isProfitable: boolean;
  // Multi-asset fields
  assetResults?: { symbol: string; name: string; profitPercentage: number }[];
  avgProfitPercentage?: number;
  winRate?: number; // % of assets that were profitable
}

export interface OptimizationProgress {
  current: number;
  total: number;
  currentStrategy: string;
  bestSoFar: OptimizationResult | null;
  profitableCount: number;
  phase: 'analyzing' | 'single' | 'pairs' | 'triples' | 'complete';
  marketCondition?: string;
}

export interface MarketAnalysis {
  trend: 'bullish' | 'bearish' | 'sideways';
  trendStrength: number; // 0-100
  volatility: 'low' | 'medium' | 'high';
  momentum: 'strong_up' | 'weak_up' | 'neutral' | 'weak_down' | 'strong_down';
  rsiLevel: 'oversold' | 'neutral' | 'overbought';
  volumeTrend: 'increasing' | 'stable' | 'decreasing';
  recommendedCategories: string[];
  summary: string;
}

export interface ChartAnalysis {
  trend: 'bullish' | 'bearish' | 'sideways';
  trendStrength: number; // 0-100
  volatility: 'low' | 'medium' | 'high';
  support: number;
  resistance: number;
  recommendation: string;
  signals: string[];
  summary: string;
}

type ProgressCallback = (progress: OptimizationProgress) => void;

export class StrategyOptimizer {
  private engine: SimulationEngine;
  private priceDataLoaded: boolean = false;

  constructor() {
    this.engine = new SimulationEngine();
  }

  async loadData(
    symbol: string,
    assetType: AssetType,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    await this.engine.loadHistoricalData(symbol, assetType, startDate, endDate);
    this.priceDataLoaded = true;
  }

  // Analyze market conditions from price data
  analyzeMarket(priceData: PriceData[]): MarketAnalysis {
    if (priceData.length < 14) {
      return {
        trend: 'sideways',
        trendStrength: 0,
        volatility: 'medium',
        momentum: 'neutral',
        rsiLevel: 'neutral',
        volumeTrend: 'stable',
        recommendedCategories: ['dca', 'protection'],
        summary: 'Insufficient data - DCA recommended',
      };
    }

    const closes = priceData.map(d => d.close);
    const volumes = priceData.map(d => d.volume);
    const n = closes.length;

    // 1. Calculate trend
    const firstPrice = closes[0];
    const lastPrice = closes[n - 1];
    const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;

    // Short-term trend (last 20% of data)
    const shortTermStart = Math.floor(n * 0.8);
    const shortTermChange = ((closes[n - 1] - closes[shortTermStart]) / closes[shortTermStart]) * 100;

    let trend: 'bullish' | 'bearish' | 'sideways';
    let trendStrength: number;

    if (priceChange > 15 && shortTermChange > 0) {
      trend = 'bullish';
      trendStrength = Math.min(100, priceChange * 2);
    } else if (priceChange < -15 && shortTermChange < 0) {
      trend = 'bearish';
      trendStrength = Math.min(100, Math.abs(priceChange) * 2);
    } else if (priceChange > 5) {
      trend = 'bullish';
      trendStrength = Math.min(60, priceChange * 3);
    } else if (priceChange < -5) {
      trend = 'bearish';
      trendStrength = Math.min(60, Math.abs(priceChange) * 3);
    } else {
      trend = 'sideways';
      trendStrength = 30;
    }

    // 2. Calculate volatility
    const returns: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push((closes[i] - closes[i - 1]) / closes[i - 1] * 100);
    }
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    let volatility: 'low' | 'medium' | 'high';
    if (stdDev < 2) volatility = 'low';
    else if (stdDev < 5) volatility = 'medium';
    else volatility = 'high';

    // 3. Calculate RSI (14-period)
    let gains = 0, losses = 0;
    for (let i = Math.max(1, n - 14); i < n; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }
    const avgGain = gains / 14;
    const avgLoss = losses / 14;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    let rsiLevel: 'oversold' | 'neutral' | 'overbought';
    if (rsi < 30) rsiLevel = 'oversold';
    else if (rsi > 70) rsiLevel = 'overbought';
    else rsiLevel = 'neutral';

    // 4. Calculate momentum
    let momentum: 'strong_up' | 'weak_up' | 'neutral' | 'weak_down' | 'strong_down';
    if (shortTermChange > 10) momentum = 'strong_up';
    else if (shortTermChange > 3) momentum = 'weak_up';
    else if (shortTermChange < -10) momentum = 'strong_down';
    else if (shortTermChange < -3) momentum = 'weak_down';
    else momentum = 'neutral';

    // 5. Volume trend
    const recentVolAvg = volumes.slice(-7).reduce((a, b) => a + b, 0) / 7;
    const olderVolAvg = volumes.slice(-30, -7).reduce((a, b) => a + b, 0) / Math.min(23, volumes.length - 7);

    let volumeTrend: 'increasing' | 'stable' | 'decreasing';
    if (recentVolAvg > olderVolAvg * 1.3) volumeTrend = 'increasing';
    else if (recentVolAvg < olderVolAvg * 0.7) volumeTrend = 'decreasing';
    else volumeTrend = 'stable';

    // 6. Recommend strategy categories based on analysis
    const recommendedCategories: string[] = [];
    const summaryParts: string[] = [];

    // Always include protection
    recommendedCategories.push('protection');

    if (trend === 'bullish') {
      summaryParts.push('Bullish trend');
      recommendedCategories.push('trend', 'momentum');
      if (momentum === 'strong_up') {
        recommendedCategories.push('scalper');
        summaryParts.push('strong momentum');
      }
      if (rsiLevel === 'overbought') {
        summaryParts.push('RSI overbought');
      }
    } else if (trend === 'bearish') {
      summaryParts.push('Bearish trend');
      recommendedCategories.push('value', 'reversal');
      if (rsiLevel === 'oversold') {
        recommendedCategories.push('momentum'); // RSI bounce
        summaryParts.push('RSI oversold');
      }
      if (momentum === 'strong_down') {
        summaryParts.push('strong downtrend');
      }
    } else {
      summaryParts.push('Sideways market');
      recommendedCategories.push('dca', 'volatility', 'reversal');
      if (volatility === 'low') {
        summaryParts.push('low volatility');
        recommendedCategories.push('trend'); // For breakout
      }
    }

    if (volatility === 'high') {
      summaryParts.push('high volatility');
      recommendedCategories.push('scalper', 'volatility');
    }

    if (volumeTrend === 'increasing') {
      summaryParts.push('increasing volume');
      if (!recommendedCategories.includes('momentum')) {
        recommendedCategories.push('momentum');
      }
    }

    // Ensure unique categories
    const uniqueCategories = [...new Set(recommendedCategories)];

    return {
      trend,
      trendStrength,
      volatility,
      momentum,
      rsiLevel,
      volumeTrend,
      recommendedCategories: uniqueCategories,
      summary: summaryParts.join(', ') || 'Normal market conditions',
    };
  }

  // Get strategies suitable for market conditions
  private getStrategiesForMarket(analysis: MarketAnalysis): PresetStrategy[] {
    const suitable = presetStrategies.filter(s =>
      analysis.recommendedCategories.includes(s.category)
    );

    // Always include some base strategies
    const baseStrategies = presetStrategies.filter(s =>
      s.id === 'dca_weekly' || s.id === 'buy_dip_5' || s.id === 'stop_loss_10'
    );

    // Combine and deduplicate
    const combined = [...suitable];
    baseStrategies.forEach(s => {
      if (!combined.find(c => c.id === s.id)) {
        combined.push(s);
      }
    });

    return combined;
  }

  // Analyze chart and provide insights
  analyzeChart(priceData: PriceData[], result: SimulationResult): ChartAnalysis {
    if (priceData.length < 2) {
      return {
        trend: 'sideways',
        trendStrength: 0,
        volatility: 'low',
        support: 0,
        resistance: 0,
        recommendation: 'Insufficient data',
        signals: [],
        summary: 'Not enough data for analysis.',
      };
    }

    const closes = priceData.map(d => d.close);
    const firstPrice = closes[0];
    const lastPrice = closes[closes.length - 1];
    const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;

    // Calculate trend
    let trend: 'bullish' | 'bearish' | 'sideways';
    let trendStrength: number;

    if (priceChange > 10) {
      trend = 'bullish';
      trendStrength = Math.min(100, priceChange * 2);
    } else if (priceChange < -10) {
      trend = 'bearish';
      trendStrength = Math.min(100, Math.abs(priceChange) * 2);
    } else {
      trend = 'sideways';
      trendStrength = 50 - Math.abs(priceChange) * 2;
    }

    // Calculate volatility
    const returns = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push((closes[i] - closes[i - 1]) / closes[i - 1] * 100);
    }
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    let volatility: 'low' | 'medium' | 'high';
    if (stdDev < 2) {
      volatility = 'low';
    } else if (stdDev < 5) {
      volatility = 'medium';
    } else {
      volatility = 'high';
    }

    // Calculate support and resistance
    const sortedPrices = [...closes].sort((a, b) => a - b);
    const support = sortedPrices[Math.floor(sortedPrices.length * 0.1)];
    const resistance = sortedPrices[Math.floor(sortedPrices.length * 0.9)];

    // Generate signals
    const signals: string[] = [];

    if (result.profit_percentage > 0) {
      signals.push(`Strategy gained ${result.profit_percentage.toFixed(1)}%`);
    } else {
      signals.push(`Strategy lost ${Math.abs(result.profit_percentage).toFixed(1)}%`);
    }

    if (trend === 'bullish') {
      signals.push(`Uptrend: Price increased ${priceChange.toFixed(1)}%`);
    } else if (trend === 'bearish') {
      signals.push(`Downtrend: Price decreased ${Math.abs(priceChange).toFixed(1)}%`);
    } else {
      signals.push('Sideways market: No clear trend');
    }

    if (volatility === 'high') {
      signals.push('High volatility: Large price swings');
    } else if (volatility === 'low') {
      signals.push('Low volatility: Stable price movement');
    }

    const buyCount = result.transactions.filter(t => t.type === 'buy').length;
    const sellCount = result.transactions.filter(t => t.type === 'sell').length;
    signals.push(`Total ${buyCount} buys, ${sellCount} sells`);

    // Generate recommendation
    let recommendation: string;
    if (result.profit_percentage > 20) {
      recommendation = 'Excellent performance! This strategy performed very well.';
    } else if (result.profit_percentage > 10) {
      recommendation = 'Good performance. Strategy was profitable.';
    } else if (result.profit_percentage > 0) {
      recommendation = 'Positive return. Strategy achieved marginal profit.';
    } else if (result.profit_percentage > -10) {
      recommendation = 'Minor loss. Strategy parameters may need adjustment.';
    } else {
      recommendation = 'Significant loss. This strategy is not suitable for these conditions.';
    }

    // Generate summary
    const trendText = trend === 'bullish' ? 'upward' : trend === 'bearish' ? 'downward' : 'sideways';
    const volatilityText = volatility === 'high' ? 'high' : volatility === 'low' ? 'low' : 'medium';

    const summary = `During this period, the market showed ${trendText} trend with ${volatilityText} volatility. ` +
      `Price moved from $${firstPrice.toFixed(2)} to $${lastPrice.toFixed(2)} (${priceChange.toFixed(1)}%). ` +
      `Strategy made ${result.transactions.length} transactions with ${result.profit_percentage.toFixed(2)}% ${result.profit_percentage >= 0 ? 'profit' : 'loss'}. ` +
      `Support: $${support.toFixed(2)}, Resistance: $${resistance.toFixed(2)}.`;

    return {
      trend,
      trendStrength,
      volatility,
      support,
      resistance,
      recommendation,
      signals,
      summary,
    };
  }

  // Check if two strategies are compatible
  private areCompatible(s1: PresetStrategy, s2: PresetStrategy): boolean {
    // Don't combine two DCA strategies
    if (s1.category === 'dca' && s2.category === 'dca') return false;

    // Don't combine same type protection strategies
    if (s1.category === 'protection' && s2.category === 'protection') {
      // Allow stop loss + take profit
      if (
        (s1.id.includes('stop_loss') && s2.id.includes('take_profit')) ||
        (s1.id.includes('take_profit') && s2.id.includes('stop_loss'))
      ) {
        return true;
      }
      // Allow trailing stop with take profit
      if (
        (s1.id.includes('trailing') && s2.id.includes('take_profit')) ||
        (s1.id.includes('take_profit') && s2.id.includes('trailing'))
      ) {
        return true;
      }
      return false;
    }

    return true;
  }

  // Get blocks from strategy combination
  private getBlocks(strategies: PresetStrategy[]): StrategyBlock[] {
    return strategies.flatMap(s => s.blocks);
  }

  // Helper function for batching - yields to UI thread
  private async yieldToUI(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  // Calculate total for smart optimization based on filtered strategies
  private calculateSmartTotal(entryCount: number, protectionCount: number): number {
    let total = 1; // Buy & Hold
    total += entryCount; // Phase 1: Singles

    // Phase 2: Entry + Entry pairs
    total += (entryCount * (entryCount - 1)) / 2;

    // Phase 2b: Entry + Protection
    total += entryCount * protectionCount;

    // Phase 3: Top 5 entries + stop + take profit combinations
    const stopCount = Math.min(3, protectionCount);
    const takeCount = Math.min(3, protectionCount);
    total += 5 * stopCount * takeCount;

    return total;
  }

  // SMART optimization - analyze market first, then test relevant strategies only
  async smartOptimize(
    investment: Omit<Investment, 'id' | 'portfolio_id'>,
    onProgress?: ProgressCallback,
    targetProfit: number = 0
  ): Promise<OptimizationResult[]> {
    if (!this.priceDataLoaded) {
      throw new Error('Price data not loaded. Call loadData first.');
    }

    const results: OptimizationResult[] = [];
    let bestResult: OptimizationResult | null = null;
    let profitableCount = 0;
    let testCount = 0;
    let batchCount = 0;
    const BATCH_SIZE = 5;

    // Phase 0: Analyze market conditions first
    const priceData = this.engine.getPriceData();
    const marketAnalysis = this.analyzeMarket(priceData);

    if (onProgress) {
      onProgress({
        current: 0,
        total: 100,
        currentStrategy: `Market analysis: ${marketAnalysis.summary}`,
        bestSoFar: null,
        profitableCount: 0,
        phase: 'analyzing',
        marketCondition: marketAnalysis.summary,
      });
    }
    await this.yieldToUI();

    // Get strategies suitable for this market
    const suitableStrategies = this.getStrategiesForMarket(marketAnalysis);
    const entryStrategies = suitableStrategies.filter(s => s.category !== 'protection');
    const protectionStrategies = suitableStrategies.filter(s => s.category === 'protection');

    // If no protection strategies selected, add defaults
    if (protectionStrategies.length === 0) {
      const defaultProtection = presetStrategies.filter(s =>
        s.id === 'stop_loss_10' || s.id === 'take_profit_15' || s.id === 'trailing_stop_5'
      );
      protectionStrategies.push(...defaultProtection);
    }

    const stopLosses = protectionStrategies.filter(s =>
      s.id.includes('stop_loss') || s.id.includes('trailing')
    );
    const takeProfits = protectionStrategies.filter(s => s.id.includes('take_profit'));

    // Calculate estimated total based on filtered strategies
    let totalEstimate = this.calculateSmartTotal(entryStrategies.length, protectionStrategies.length);

    const testStrategy = async (
      ids: string[],
      names: string[],
      blocks: StrategyBlock[],
      phase: 'single' | 'pairs' | 'triples'
    ) => {
      testCount++;
      batchCount++;

      if (testCount > totalEstimate) {
        totalEstimate = testCount + 20;
      }

      if (batchCount >= BATCH_SIZE) {
        batchCount = 0;
        await this.yieldToUI();
      }

      if (onProgress) {
        onProgress({
          current: testCount,
          total: totalEstimate,
          currentStrategy: names.join(' + '),
          bestSoFar: bestResult,
          profitableCount,
          phase,
          marketCondition: marketAnalysis.summary,
        });
      }

      try {
        const mockInvestment: Investment = {
          ...investment,
          id: `opt-${phase}-${testCount}`,
          portfolio_id: '',
        };

        const result = await this.engine.runSimulation(mockInvestment, blocks);
        const optResult: OptimizationResult = {
          strategyIds: ids,
          strategyNames: names,
          result,
          profitPercentage: result.profit_percentage,
          isProfitable: result.profit_percentage > targetProfit,
        };

        results.push(optResult);
        if (optResult.isProfitable) profitableCount++;
        if (optResult.profitPercentage > (bestResult?.profitPercentage ?? -Infinity)) {
          bestResult = optResult;
        }
        return optResult;
      } catch (error) {
        if (__DEV__) console.error(`Error testing ${names.join(' + ')}:`, error);
        return null;
      }
    };

    // Phase 0b: Test Buy & Hold
    const buyHoldInvestment: Investment = {
      ...investment,
      id: 'opt-buyhold',
      portfolio_id: '',
    };
    const buyHoldResult = await this.engine.runBuyAndHold(buyHoldInvestment);
    const buyHoldOpt: OptimizationResult = {
      strategyIds: [],
      strategyNames: ['Buy & Hold'],
      result: buyHoldResult,
      profitPercentage: buyHoldResult.profit_percentage,
      isProfitable: buyHoldResult.profit_percentage > targetProfit,
    };
    results.push(buyHoldOpt);
    if (buyHoldOpt.isProfitable) profitableCount++;
    bestResult = buyHoldOpt;
    testCount++;

    // Phase 1: Test only suitable single strategies
    for (const strategy of entryStrategies) {
      await testStrategy([strategy.id], [strategy.name], strategy.blocks, 'single');
    }

    // Phase 2: Entry + Entry combinations (only compatible pairs)
    for (let i = 0; i < entryStrategies.length; i++) {
      for (let j = i + 1; j < entryStrategies.length; j++) {
        const s1 = entryStrategies[i];
        const s2 = entryStrategies[j];
        if (this.areCompatible(s1, s2)) {
          await testStrategy(
            [s1.id, s2.id],
            [s1.name, s2.name],
            [...s1.blocks, ...s2.blocks],
            'pairs'
          );
        }
      }
    }

    // Phase 2b: Entry + Protection combinations
    for (const entry of entryStrategies) {
      for (const protection of protectionStrategies) {
        await testStrategy(
          [entry.id, protection.id],
          [entry.name, protection.name],
          [...entry.blocks, ...protection.blocks],
          'pairs'
        );
      }
    }

    // Get top performers so far for deeper combinations
    const getTopPerformers = (count: number) => {
      return [...results]
        .filter(r => r.strategyIds.length > 0)
        .sort((a, b) => b.profitPercentage - a.profitPercentage)
        .slice(0, count);
    };

    // Phase 3: Top performers + Stop Loss + Take Profit (limited combinations)
    const topEntries = getTopPerformers(5).filter(r => r.strategyIds.length <= 2);
    const limitedStops = stopLosses.slice(0, 3);
    const limitedTakes = takeProfits.slice(0, 3);

    for (const top of topEntries) {
      const entryIds = top.strategyIds;
      const entryNames = top.strategyNames;
      const entryBlocks = entryIds.flatMap(id => presetStrategies.find(s => s.id === id)?.blocks || []);

      for (const sl of limitedStops) {
        for (const tp of limitedTakes) {
          await testStrategy(
            [...entryIds, sl.id, tp.id],
            [...entryNames, sl.name, tp.name],
            [...entryBlocks, ...sl.blocks, ...tp.blocks],
            'triples'
          );
        }
      }
    }

    // Final progress
    if (onProgress) {
      onProgress({
        current: testCount,
        total: testCount,
        currentStrategy: 'Complete!',
        bestSoFar: bestResult,
        profitableCount,
        phase: 'complete',
        marketCondition: marketAnalysis.summary,
      });
    }

    // Sort by profit and return top 20
    results.sort((a, b) => b.profitPercentage - a.profitPercentage);
    return results.slice(0, 20);
  }

  // Quick optimization (original method)
  async quickOptimize(
    investment: Omit<Investment, 'id' | 'portfolio_id'>,
    onProgress?: ProgressCallback
  ): Promise<OptimizationResult[]> {
    return this.smartOptimize(investment, onProgress, 0);
  }

  // Multi-asset optimization with UNIFIED PORTFOLIO - single budget shared across all assets
  async multiAssetOptimize(
    assets: { symbol: string; name: string; priceData: PriceData[] }[],
    investmentAmount: number,
    assetType: AssetType,
    onProgress?: ProgressCallback
  ): Promise<OptimizationResult[]> {
    if (assets.length === 0) {
      throw new Error('No assets provided');
    }

    const results: OptimizationResult[] = [];
    let bestResult: OptimizationResult | null = null;
    let profitableCount = 0;
    let testCount = 0;
    let batchCount = 0;
    const BATCH_SIZE = 3; // Smaller batch for multi-asset (heavier computations)

    // Single engine for unified portfolio simulation
    const unifiedEngine = new SimulationEngine();

    // Analyze market using first asset's data (representative)
    const marketAnalysis = this.analyzeMarket(assets[0].priceData);

    if (onProgress) {
      onProgress({
        current: 0,
        total: 100,
        currentStrategy: `Market analysis: ${marketAnalysis.summary}`,
        bestSoFar: null,
        profitableCount: 0,
        phase: 'analyzing',
        marketCondition: marketAnalysis.summary,
      });
    }
    await this.yieldToUI();

    // Get strategies suitable for this market
    const suitableStrategies = this.getStrategiesForMarket(marketAnalysis);
    const entryStrategies = suitableStrategies.filter(s => s.category !== 'protection');
    const protectionStrategies = suitableStrategies.filter(s => s.category === 'protection');

    // If no protection strategies selected, add defaults
    if (protectionStrategies.length === 0) {
      const defaultProtection = presetStrategies.filter(s =>
        s.id === 'stop_loss_10' || s.id === 'take_profit_15' || s.id === 'trailing_stop_5'
      );
      protectionStrategies.push(...defaultProtection);
    }

    const stopLosses = protectionStrategies.filter(s => s.id.includes('stop_loss') || s.id.includes('trailing'));
    const takeProfits = protectionStrategies.filter(s => s.id.includes('take_profit'));

    // Calculate estimated total based on filtered strategies
    let totalEstimate = 1 + entryStrategies.length + (entryStrategies.length * protectionStrategies.length) + (5 * 3 * 3);

    // Helper to test a strategy with UNIFIED portfolio (single budget)
    const testUnifiedPortfolio = async (
      ids: string[],
      names: string[],
      blocks: StrategyBlock[],
      phase: 'analyzing' | 'single' | 'pairs' | 'triples' | 'complete'
    ): Promise<OptimizationResult | null> => {
      testCount++;
      batchCount++;

      // Dynamically adjust total if we exceed it
      if (testCount > totalEstimate) {
        totalEstimate = testCount + 50; // Add buffer
      }

      // Yield to UI every BATCH_SIZE tests
      if (batchCount >= BATCH_SIZE) {
        batchCount = 0;
        await this.yieldToUI();
      }

      if (onProgress) {
        onProgress({
          current: testCount,
          total: totalEstimate,
          currentStrategy: `${names.join(' + ')} (${assets.length} assets)`,
          bestSoFar: bestResult,
          profitableCount,
          phase,
          marketCondition: marketAnalysis.summary,
        });
      }

      try {
        // Run unified portfolio simulation with single budget
        const unifiedResult = await unifiedEngine.runUnifiedPortfolioSimulation(
          assets,
          blocks,
          investmentAmount
        );

        // Calculate per-asset results from unified simulation
        const assetResults = unifiedResult.assetSummaries.map(summary => ({
          symbol: summary.symbol,
          name: summary.name,
          profitPercentage: summary.currentValue > 0
            ? ((summary.realizedProfitLoss / (investmentAmount / assets.length)) * 100)
            : 0,
        }));

        const profitableAssets = assetResults.filter(a => a.profitPercentage > 0).length;
        const winRate = (profitableAssets / assets.length) * 100;

        // Convert events to transactions for display
        const transactions = unifiedResult.events
          .filter(e => e.eventType === 'buy' || e.eventType === 'sell')
          .map(e => ({
            date: e.date,
            type: e.eventType as 'buy' | 'sell',
            price: e.price,
            amount: e.amount || 0,
            value: e.value || 0,
            reason: e.reason,
            strategyName: e.strategyName,
            strategyIcon: e.strategyIcon,
            strategyColor: e.strategyColor,
          }));

        const optResult: OptimizationResult = {
          strategyIds: ids,
          strategyNames: names,
          result: {
            id: `opt-unified-${testCount}`,
            investment_id: '',
            initial_value: investmentAmount,
            final_value: unifiedResult.finalPortfolioValue,
            profit_loss: unifiedResult.profitLoss,
            profit_percentage: unifiedResult.profitPercentage,
            transactions,
            calculated_at: new Date().toISOString(),
          },
          profitPercentage: unifiedResult.profitPercentage,
          isProfitable: unifiedResult.profitLoss > 0,
          assetResults,
          avgProfitPercentage: unifiedResult.profitPercentage,
          winRate,
        };

        results.push(optResult);
        if (optResult.isProfitable) profitableCount++;
        if (optResult.profitPercentage > (bestResult?.profitPercentage ?? -Infinity)) {
          bestResult = optResult;
        }

        return optResult;
      } catch (error) {
        if (__DEV__) console.error(`Error testing ${names.join(' + ')}:`, error);
        return null;
      }
    };

    // Phase 0: Buy & Hold
    await testUnifiedPortfolio([], ['Buy & Hold'], [], 'single');

    // Phase 1: Single strategies (market-filtered)
    for (const strategy of entryStrategies) {
      await testUnifiedPortfolio([strategy.id], [strategy.name], strategy.blocks, 'single');
    }

    // Phase 2: Entry + Protection pairs
    for (const entry of entryStrategies) {
      for (const protection of protectionStrategies) {
        await testUnifiedPortfolio(
          [entry.id, protection.id],
          [entry.name, protection.name],
          [...entry.blocks, ...protection.blocks],
          'pairs'
        );
      }
    }

    // Get top performers for deeper testing
    const getTop = (count: number) => {
      return [...results]
        .sort((a, b) => b.profitPercentage - a.profitPercentage)
        .slice(0, count);
    };

    // Phase 3: Top performers + Stop Loss + Take Profit
    const topSingles = getTop(5).filter(r => r.strategyIds.length <= 2);
    const topStops = stopLosses.slice(0, 3);
    const topTakes = takeProfits.slice(0, 3);

    for (const top of topSingles) {
      const entryIds = top.strategyIds;
      const entryNames = top.strategyNames;
      const entryBlocks = entryIds.flatMap(id => presetStrategies.find(s => s.id === id)?.blocks || []);

      for (const sl of topStops) {
        for (const tp of topTakes) {
          await testUnifiedPortfolio(
            [...entryIds, sl.id, tp.id],
            [...entryNames, sl.name, tp.name],
            [...entryBlocks, ...sl.blocks, ...tp.blocks],
            'triples'
          );
        }
      }
    }

    // Final progress
    if (onProgress) {
      onProgress({
        current: testCount,
        total: testCount,
        currentStrategy: 'Complete!',
        bestSoFar: bestResult,
        profitableCount,
        phase: 'complete',
        marketCondition: marketAnalysis.summary,
      });
    }

    // Sort by total profit and return top 20
    results.sort((a, b) => b.profitPercentage - a.profitPercentage);
    return results.slice(0, 20);
  }
}

export default StrategyOptimizer;
