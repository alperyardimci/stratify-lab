import { PriceData, StrategyBlock, Transaction, SimulationResult, Investment, AssetType, PortfolioEvent, UnifiedPortfolioResult, AssetSummary, PortfolioEventType } from '../../types';
import { calculateSMA, calculateEMA, calculateRSI, calculateAverageVolume, calculatePriceChange } from './indicators';
import { getStockHistoryRange } from '../api/stocks';
import { getCryptoHistoryDetailed } from '../api/crypto';
import { getForexHistory } from '../api/forex';
import { getBistHistoryRange } from '../api/yahooFinance';

interface SimulationState {
  cash: number;
  position: number;
  entryPrice: number;
  highestPrice: number;
  transactions: Transaction[];
}

// Multi-asset portfolio state
interface MultiAssetState {
  cash: number;
  positions: { [symbol: string]: number };
  entryPrices: { [symbol: string]: number };
  highestPrices: { [symbol: string]: number };
  events: PortfolioEvent[];
}

interface AssetPriceData {
  symbol: string;
  name: string;
  priceData: PriceData[];
  indicators: IndicatorData;
}

interface IndicatorData {
  sma20: number[];
  sma50: number[];
  ema20: number[];
  rsi14: number[];
  avgVolume: number[];
  priceChange: number[];
  customMa: Map<string, number[]>;
}

interface BlockContext {
  strategyName: string;
  strategyIcon: string;
  strategyColor: string;
  triggerType: 'trigger' | 'condition' | 'modifier';
  triggerDetails: string;
  indicatorValue: string;
}

export interface EngineLabels {
  // Strategy names
  priceChange: string;
  timing: string;
  priceAbove: string;
  priceBelow: string;
  rsiStrategy: string;
  movingAverage: string;
  volumeStrategy: string;
  profitLoss: string;
  stopLoss: string;
  takeProfit: string;
  trailingStop: string;
  // Indicator labels
  profit: string;
  loss: string;
  peak: string;
  // Event messages
  insufficientBalance: string;
  insufficientCash: string;
  cannotSell: string;
  lossLimitExceeded: string;
}

const DEFAULT_LABELS: EngineLabels = {
  priceChange: 'Price Change',
  timing: 'Timing',
  priceAbove: 'Price Above',
  priceBelow: 'Price Below',
  rsiStrategy: 'RSI Strategy',
  movingAverage: 'Moving Average',
  volumeStrategy: 'Volume Strategy',
  profitLoss: 'Profit/Loss',
  stopLoss: 'Stop Loss',
  takeProfit: 'Take Profit',
  trailingStop: 'Trailing Stop',
  profit: 'Profit',
  loss: 'Loss',
  peak: 'Peak',
  insufficientBalance: 'Insufficient balance: ${cash} available, ${required} needed',
  insufficientCash: 'Insufficient balance: ${cash} in cash',
  cannotSell: 'Cannot sell: no {symbol} position',
  lossLimitExceeded: 'Loss limit {percent}% exceeded, position closed',
};

const buildStrategyNames = (labels: EngineLabels): Record<string, { name: string; icon: string; color: string }> => ({
  'WHEN_CHANGE_PERCENT': { name: labels.priceChange, icon: '📊', color: '#F59E0B' },
  'WHEN_DATE': { name: labels.timing, icon: '📅', color: '#3B82F6' },
  'WHEN_PRICE_ABOVE': { name: labels.priceAbove, icon: '📈', color: '#10B981' },
  'WHEN_PRICE_BELOW': { name: labels.priceBelow, icon: '📉', color: '#EF4444' },
  'IF_RSI': { name: labels.rsiStrategy, icon: '📉', color: '#8B5CF6' },
  'IF_MOVING_AVG': { name: labels.movingAverage, icon: '📈', color: '#10B981' },
  'IF_VOLUME': { name: labels.volumeStrategy, icon: '📶', color: '#14B8A6' },
  'IF_PROFIT': { name: labels.profitLoss, icon: '💰', color: '#22C55E' },
  'STOP_LOSS': { name: labels.stopLoss, icon: '🛡️', color: '#EF4444' },
  'TAKE_PROFIT': { name: labels.takeProfit, icon: '🎉', color: '#22C55E' },
  'TRAILING_STOP': { name: labels.trailingStop, icon: '📍', color: '#F97316' },
});

export class SimulationEngine {
  private priceData: PriceData[] = [];
  private indicators: IndicatorData | null = null;
  private currentContext: BlockContext | null = null;
  private labels: EngineLabels;
  private strategyNames: Record<string, { name: string; icon: string; color: string }>;

  constructor(labels?: Partial<EngineLabels>) {
    this.labels = { ...DEFAULT_LABELS, ...labels };
    this.strategyNames = buildStrategyNames(this.labels);
  }

  async loadHistoricalData(
    symbol: string,
    assetType: AssetType,
    startDate: Date,
    endDate: Date
  ): Promise<PriceData[]> {
    switch (assetType) {
      case 'stock':
        this.priceData = await getStockHistoryRange(symbol, startDate, endDate);
        break;
      case 'crypto':
        this.priceData = await getCryptoHistoryDetailed(symbol, startDate, endDate);
        break;
      case 'bist':
        this.priceData = await getBistHistoryRange(symbol, startDate, endDate);
        break;
      case 'forex':
      case 'commodity':
        this.priceData = await getForexHistory(symbol, startDate, endDate);
        break;
      default:
        throw new Error(`Unsupported asset type: ${assetType}`);
    }

    this.calculateIndicators();
    return this.priceData;
  }

  setPriceData(data: PriceData[]): void {
    this.priceData = data;
    this.calculateIndicators();
  }

  private calculateIndicators(strategyBlocks?: StrategyBlock[]): void {
    const closes = this.priceData.map(d => d.close);
    const volumes = this.priceData.map(d => d.volume);

    const customMa = new Map<string, number[]>();

    // Pre-calculate custom MA periods from strategy blocks
    if (strategyBlocks) {
      const collectMaPeriods = (blocks: StrategyBlock[]) => {
        for (const block of blocks) {
          if (block.name === 'IF_MOVING_AVG') {
            const period = block.params.period || 20;
            const type = block.params.type || 'sma';
            const key = `${type}_${period}`;
            if (!customMa.has(key)) {
              customMa.set(key, type === 'ema'
                ? calculateEMA(closes, period)
                : calculateSMA(closes, period));
            }
          }
          if (block.children) collectMaPeriods(block.children);
        }
      };
      collectMaPeriods(strategyBlocks);
    }

    this.indicators = {
      sma20: calculateSMA(closes, 20),
      sma50: calculateSMA(closes, 50),
      ema20: calculateEMA(closes, 20),
      rsi14: calculateRSI(closes, 14),
      avgVolume: calculateAverageVolume(volumes, 20),
      priceChange: calculatePriceChange(closes),
      customMa,
    };
  }

  async runSimulation(
    investment: Investment,
    strategy: StrategyBlock[]
  ): Promise<SimulationResult> {
    if (this.priceData.length === 0) {
      throw new Error('No price data loaded. Call loadHistoricalData first.');
    }

    // Re-calculate indicators with custom MA periods from strategy
    this.calculateIndicators(strategy);

    const state: SimulationState = {
      cash: investment.amount,
      position: 0,
      entryPrice: 0,
      highestPrice: 0,
      transactions: [],
    };

    for (let i = 0; i < this.priceData.length; i++) {
      const currentPrice = this.priceData[i].close;
      const currentDate = this.priceData[i].date;

      if (state.position > 0 && currentPrice > state.highestPrice) {
        state.highestPrice = currentPrice;
      }

      this.evaluateBlocks(strategy, state, i, currentDate);
    }

    const finalPrice = this.priceData[this.priceData.length - 1].close;
    const positionValue = state.position * finalPrice;
    const finalValue = state.cash + positionValue;
    const profitLoss = finalValue - investment.amount;
    const profitPercentage = (profitLoss / investment.amount) * 100;

    return {
      id: '',
      investment_id: investment.id,
      initial_value: investment.amount,
      final_value: finalValue,
      profit_loss: profitLoss,
      profit_percentage: profitPercentage,
      transactions: state.transactions,
      calculated_at: new Date().toISOString(),
      price_history: this.priceData,
    };
  }

  private static readonly MAX_RECURSION_DEPTH = 10;

  private evaluateBlocks(
    blocks: StrategyBlock[],
    state: SimulationState,
    dayIndex: number,
    date: string,
    depth: number = 0
  ): void {
    if (depth > SimulationEngine.MAX_RECURSION_DEPTH) return;

    for (const block of blocks) {
      const result = this.evaluateBlock(block, state, dayIndex);
      if (result.triggered) {
        this.currentContext = result.context;

        if (block.children && block.children.length > 0) {
          this.evaluateBlocks(block.children, state, dayIndex, date, depth + 1);
        }
      }
    }
  }

  private evaluateBlock(
    block: StrategyBlock,
    state: SimulationState,
    dayIndex: number
  ): { triggered: boolean; context: BlockContext | null } {
    const price = this.priceData[dayIndex].close;
    const date = this.priceData[dayIndex].date;

    const strategyInfo = this.strategyNames[block.name] || { name: block.name, icon: '📊', color: '#6366F1' };

    switch (block.type) {
      case 'trigger':
        return this.evaluateTrigger(block, price, dayIndex, date, strategyInfo);
      case 'condition':
        return this.evaluateCondition(block, state, dayIndex, strategyInfo);
      case 'action':
        this.executeAction(block, state, price, date);
        return { triggered: true, context: null };
      case 'modifier':
        this.applyModifier(block, state, price, date, strategyInfo);
        return { triggered: true, context: null };
      default:
        return { triggered: false, context: null };
    }
  }

  private evaluateTrigger(
    block: StrategyBlock,
    price: number,
    dayIndex: number,
    date: string,
    strategyInfo: { name: string; icon: string; color: string }
  ): { triggered: boolean; context: BlockContext | null } {
    let triggered = false;
    let triggerDetails = '';
    let indicatorValue = '';

    switch (block.name) {
      case 'WHEN_PRICE_ABOVE':
        triggered = price > block.params.threshold;
        triggerDetails = `Price rose above $${block.params.threshold}`;
        indicatorValue = `$${price.toFixed(2)}`;
        break;

      case 'WHEN_PRICE_BELOW':
        triggered = price < block.params.threshold;
        triggerDetails = `Price dropped below $${block.params.threshold}`;
        indicatorValue = `$${price.toFixed(2)}`;
        break;

      case 'WHEN_CHANGE_PERCENT': {
        const change = this.indicators?.priceChange[dayIndex] || 0;
        const percent = block.params.percent;
        const direction = block.params.direction;

        if (direction === 'up') {
          triggered = change >= percent;
          triggerDetails = `Price moved up ${percent}%`;
        } else if (direction === 'down') {
          triggered = change <= -percent;
          triggerDetails = `Price dropped ${percent}% (dip opportunity)`;
        } else {
          triggered = Math.abs(change) >= percent;
          triggerDetails = `Price moved ${percent}%`;
        }
        indicatorValue = `%${change.toFixed(2)}`;
        break;
      }

      case 'WHEN_DATE':
        triggered = date === block.params.date;
        triggerDetails = `Timing: ${block.params.interval || 'periodic'} buy`;
        indicatorValue = date;
        break;
    }

    if (triggered) {
      return {
        triggered: true,
        context: {
          strategyName: strategyInfo.name,
          strategyIcon: strategyInfo.icon,
          strategyColor: strategyInfo.color,
          triggerType: 'trigger',
          triggerDetails,
          indicatorValue,
        },
      };
    }
    return { triggered: false, context: null };
  }

  private evaluateCondition(
    block: StrategyBlock,
    state: SimulationState,
    dayIndex: number,
    strategyInfo: { name: string; icon: string; color: string }
  ): { triggered: boolean; context: BlockContext | null } {
    const price = this.priceData[dayIndex].close;
    let triggered = false;
    let triggerDetails = '';
    let indicatorValue = '';

    switch (block.name) {
      case 'IF_RSI': {
        const rsi = this.indicators?.rsi14[dayIndex];
        if (rsi === undefined || isNaN(rsi)) break;

        const operator = block.params.operator;
        const value = block.params.value;

        triggered = operator === 'above' ? rsi > value : rsi < value;

        if (triggered) {
          if (operator === 'below') {
            triggerDetails = `RSI dropped below ${value} - Oversold zone (buy opportunity)`;
          } else {
            triggerDetails = `RSI rose above ${value} - Overbought zone (sell opportunity)`;
          }
          indicatorValue = `RSI: ${rsi.toFixed(1)}`;
        }
        break;
      }

      case 'IF_MOVING_AVG': {
        const period = block.params.period || 20;
        const type = block.params.type || 'sma';
        const crossDirection = block.params.crossDirection;

        const maKey = `${type}_${period}`;
        const ma = this.indicators?.customMa.get(maKey);
        if (!ma) break;

        const currentMa = ma[dayIndex];
        const prevMa = dayIndex > 0 ? ma[dayIndex - 1] : currentMa;
        const prevPrice = dayIndex > 0 ? this.priceData[dayIndex - 1].close : price;

        if (!isNaN(currentMa) && !isNaN(prevMa)) {
          if (crossDirection === 'above') {
            triggered = prevPrice <= prevMa && price > currentMa;
            if (triggered) {
              triggerDetails = `Price crossed above ${type.toUpperCase()}${period} - Uptrend start`;
              indicatorValue = `MA: $${currentMa.toFixed(2)}`;
            }
          } else {
            triggered = prevPrice >= prevMa && price < currentMa;
            if (triggered) {
              triggerDetails = `Price crossed below ${type.toUpperCase()}${period} - Downtrend start`;
              indicatorValue = `MA: $${currentMa.toFixed(2)}`;
            }
          }
        }
        break;
      }

      case 'IF_VOLUME': {
        const volume = this.priceData[dayIndex].volume;
        const avgVolume = this.indicators?.avgVolume[dayIndex];
        if (avgVolume === undefined || isNaN(avgVolume)) break;

        const multiplier = block.params.multiplier || 1.5;
        triggered = volume > avgVolume * multiplier;

        if (triggered) {
          const ratio = (volume / avgVolume).toFixed(1);
          triggerDetails = `Volume ${ratio}x above average - Strong interest`;
          indicatorValue = `Vol: ${(volume / 1000000).toFixed(1)}M`;
        }
        break;
      }

      case 'IF_PROFIT': {
        if (state.position === 0) break;

        const currentValue = state.position * price;
        const entryValue = state.position * state.entryPrice;
        const profitPercent = ((currentValue - entryValue) / entryValue) * 100;

        const type = block.params.type;
        const percent = block.params.percent;

        if (type === 'profit') {
          triggered = profitPercent >= percent;
          if (triggered) {
            triggerDetails = `Profit target ${percent}% reached`;
            indicatorValue = `${this.labels.profit}: %${profitPercent.toFixed(1)}`;
          }
        } else {
          triggered = profitPercent <= -percent;
          if (triggered) {
            triggerDetails = `Loss limit ${percent}% reached`;
            indicatorValue = `${this.labels.loss}: %${profitPercent.toFixed(1)}`;
          }
        }
        break;
      }
    }

    if (triggered) {
      return {
        triggered: true,
        context: {
          strategyName: strategyInfo.name,
          strategyIcon: strategyInfo.icon,
          strategyColor: strategyInfo.color,
          triggerType: 'condition',
          triggerDetails,
          indicatorValue,
        },
      };
    }
    return { triggered: false, context: null };
  }

  private executeAction(
    block: StrategyBlock,
    state: SimulationState,
    price: number,
    date: string
  ): void {
    const ctx = this.currentContext;

    switch (block.name) {
      case 'BUY': {
        const amount = block.params.amount;
        if (state.cash >= amount) {
          const units = amount / price;
          state.position += units;
          state.cash -= amount;
          state.entryPrice = price;
          state.highestPrice = price;

          state.transactions.push({
            date,
            type: 'buy',
            price,
            amount: units,
            value: amount,
            reason: ctx?.triggerDetails || 'Manual buy',
            strategyName: ctx?.strategyName,
            strategyIcon: ctx?.strategyIcon,
            strategyColor: ctx?.strategyColor,
            triggerType: ctx?.triggerType,
            triggerDetails: ctx?.triggerDetails,
            indicatorValue: ctx?.indicatorValue,
          });
        }
        break;
      }

      case 'SELL': {
        const amount = block.params.amount;
        const unitsToSell = Math.min(state.position, amount / price);
        if (unitsToSell > 0) {
          const value = unitsToSell * price;
          state.position -= unitsToSell;
          state.cash += value;

          state.transactions.push({
            date,
            type: 'sell',
            price,
            amount: unitsToSell,
            value,
            reason: ctx?.triggerDetails || 'Manual sell',
            strategyName: ctx?.strategyName,
            strategyIcon: ctx?.strategyIcon,
            strategyColor: ctx?.strategyColor,
            triggerType: ctx?.triggerType,
            triggerDetails: ctx?.triggerDetails,
            indicatorValue: ctx?.indicatorValue,
          });

          if (state.position === 0) {
            state.entryPrice = 0;
            state.highestPrice = 0;
          }
        }
        break;
      }

      case 'BUY_PERCENT': {
        const percent = block.params.percent / 100;
        const amount = state.cash * percent;
        if (amount > 0) {
          const units = amount / price;
          state.position += units;
          state.cash -= amount;
          state.entryPrice = price;
          state.highestPrice = price;

          state.transactions.push({
            date,
            type: 'buy',
            price,
            amount: units,
            value: amount,
            reason: ctx?.triggerDetails || `Buy with ${block.params.percent}% of portfolio`,
            strategyName: ctx?.strategyName,
            strategyIcon: ctx?.strategyIcon,
            strategyColor: ctx?.strategyColor,
            triggerType: ctx?.triggerType,
            triggerDetails: ctx?.triggerDetails,
            indicatorValue: ctx?.indicatorValue,
          });
        }
        break;
      }

      case 'SELL_PERCENT': {
        const percent = block.params.percent / 100;
        const unitsToSell = state.position * percent;
        if (unitsToSell > 0) {
          const value = unitsToSell * price;
          state.position -= unitsToSell;
          state.cash += value;

          state.transactions.push({
            date,
            type: 'sell',
            price,
            amount: unitsToSell,
            value,
            reason: ctx?.triggerDetails || `Sell ${block.params.percent}% of position`,
            strategyName: ctx?.strategyName,
            strategyIcon: ctx?.strategyIcon,
            strategyColor: ctx?.strategyColor,
            triggerType: ctx?.triggerType,
            triggerDetails: ctx?.triggerDetails,
            indicatorValue: ctx?.indicatorValue,
          });

          if (state.position === 0) {
            state.entryPrice = 0;
            state.highestPrice = 0;
          }
        }
        break;
      }
    }
  }

  private applyModifier(
    block: StrategyBlock,
    state: SimulationState,
    price: number,
    date: string,
    strategyInfo: { name: string; icon: string; color: string }
  ): void {
    if (state.position === 0) return;

    const currentValue = state.position * price;
    const entryValue = state.position * state.entryPrice;
    const profitPercent = entryValue > 0 ? ((currentValue - entryValue) / entryValue) * 100 : 0;

    switch (block.name) {
      case 'STOP_LOSS': {
        const stopPercent = -block.params.percent;
        if (profitPercent <= stopPercent) {
          const value = state.position * price;
          state.transactions.push({
            date,
            type: 'sell',
            price,
            amount: state.position,
            value,
            reason: `Stop Loss triggered - Loss reached ${Math.abs(profitPercent).toFixed(1)}%`,
            strategyName: this.labels.stopLoss,
            strategyIcon: '🛡️',
            strategyColor: '#EF4444',
            triggerType: 'modifier',
            triggerDetails: this.labels.lossLimitExceeded.replace('{percent}', String(block.params.percent)),
            indicatorValue: `${this.labels.loss}: %${profitPercent.toFixed(1)}`,
          });
          state.cash += value;
          state.position = 0;
          state.entryPrice = 0;
          state.highestPrice = 0;
        }
        break;
      }

      case 'TAKE_PROFIT': {
        const profitTarget = block.params.percent;
        if (profitPercent >= profitTarget) {
          const value = state.position * price;
          state.transactions.push({
            date,
            type: 'sell',
            price,
            amount: state.position,
            value,
            reason: `Take Profit triggered - Profit reached ${profitPercent.toFixed(1)}%`,
            strategyName: this.labels.takeProfit,
            strategyIcon: '🎉',
            strategyColor: '#22C55E',
            triggerType: 'modifier',
            triggerDetails: `Profit target ${block.params.percent}% reached, profit realized`,
            indicatorValue: `${this.labels.profit}: %${profitPercent.toFixed(1)}`,
          });
          state.cash += value;
          state.position = 0;
          state.entryPrice = 0;
          state.highestPrice = 0;
        }
        break;
      }

      case 'TRAILING_STOP': {
        const trailPercent = block.params.percent / 100;
        const stopPrice = state.highestPrice * (1 - trailPercent);

        if (price <= stopPrice) {
          const value = state.position * price;
          const dropFromHigh = ((state.highestPrice - price) / state.highestPrice * 100).toFixed(1);
          state.transactions.push({
            date,
            type: 'sell',
            price,
            amount: state.position,
            value,
            reason: `Trailing Stop triggered - ${dropFromHigh}% drop from peak`,
            strategyName: this.labels.trailingStop,
            strategyIcon: '📍',
            strategyColor: '#F97316',
            triggerType: 'modifier',
            triggerDetails: `Price dropped ${block.params.percent}% from peak ($${state.highestPrice.toFixed(2)} -> $${price.toFixed(2)})`,
            indicatorValue: `${this.labels.peak}: $${state.highestPrice.toFixed(2)}`,
          });
          state.cash += value;
          state.position = 0;
          state.entryPrice = 0;
          state.highestPrice = 0;
        }
        break;
      }
    }
  }

  async runBuyAndHold(investment: Investment): Promise<SimulationResult> {
    if (this.priceData.length === 0) {
      throw new Error('No price data loaded');
    }

    const entryPrice = this.priceData[0].close;
    const exitPrice = this.priceData[this.priceData.length - 1].close;
    const units = investment.amount / entryPrice;
    const finalValue = units * exitPrice;
    const profitLoss = finalValue - investment.amount;
    const profitPercentage = (profitLoss / investment.amount) * 100;

    return {
      id: '',
      investment_id: investment.id,
      initial_value: investment.amount,
      final_value: finalValue,
      profit_loss: profitLoss,
      profit_percentage: profitPercentage,
      transactions: [
        {
          date: this.priceData[0].date,
          type: 'buy',
          price: entryPrice,
          amount: units,
          value: investment.amount,
          reason: 'Initial purchase - Buy & Hold strategy',
          strategyName: 'Buy & Hold',
          strategyIcon: '📈',
          strategyColor: '#3B82F6',
          triggerType: 'trigger',
          triggerDetails: 'Full investment purchased at once',
          indicatorValue: `$${entryPrice.toFixed(2)}`,
        },
      ],
      calculated_at: new Date().toISOString(),
      price_history: this.priceData,
    };
  }

  getPriceData(): PriceData[] {
    return this.priceData;
  }

  getIndicators(): IndicatorData | null {
    return this.indicators;
  }

  // Fast Buy & Hold for unified portfolio
  runUnifiedBuyAndHold(
    assets: { symbol: string; name: string; priceData: PriceData[] }[],
    initialCash: number
  ): UnifiedPortfolioResult {
    const perAssetCash = initialCash / assets.length;
    const events: PortfolioEvent[] = [];
    const assetSummaries: AssetSummary[] = [];
    let totalFinalValue = 0;

    for (const asset of assets) {
      if (asset.priceData.length === 0) continue;

      const entryPrice = asset.priceData[0].close;
      const exitPrice = asset.priceData[asset.priceData.length - 1].close;
      const units = perAssetCash / entryPrice;
      const finalValue = units * exitPrice;
      const profitLoss = finalValue - perAssetCash;

      events.push({
        date: asset.priceData[0].date,
        symbol: asset.symbol,
        symbolName: asset.name,
        eventType: 'buy',
        price: entryPrice,
        amount: units,
        value: perAssetCash,
        reason: 'Buy & Hold initial purchase',
        strategyName: 'Buy & Hold',
        strategyIcon: '📈',
        strategyColor: '#3B82F6',
        cashAfter: initialCash - perAssetCash,
        positionsAfter: { [asset.symbol]: units },
        portfolioValueAfter: initialCash,
      });

      assetSummaries.push({
        symbol: asset.symbol,
        name: asset.name,
        totalBought: perAssetCash,
        totalSold: 0,
        currentPosition: units,
        currentValue: finalValue,
        realizedProfitLoss: profitLoss,
        unrealizedProfitLoss: profitLoss,
        buyCount: 1,
        sellCount: 0,
        skipCount: 0,
      });

      totalFinalValue += finalValue;
    }

    return {
      initialCash,
      finalCash: 0,
      finalPositions: Object.fromEntries(assetSummaries.map(a => [a.symbol, { amount: a.currentPosition, value: a.currentValue }])),
      finalPortfolioValue: totalFinalValue,
      profitLoss: totalFinalValue - initialCash,
      profitPercentage: ((totalFinalValue - initialCash) / initialCash) * 100,
      events,
      assetSummaries,
    };
  }

  // Unified Portfolio Simulation - all assets share one cash pool
  async runUnifiedPortfolioSimulation(
    assets: { symbol: string; name: string; priceData: PriceData[] }[],
    strategy: StrategyBlock[],
    initialCash: number
  ): Promise<UnifiedPortfolioResult> {
    // If no strategy, use fast buy & hold
    if (strategy.length === 0) {
      return this.runUnifiedBuyAndHold(assets, initialCash);
    }

    // Build price lookup maps for O(1) access
    const priceMaps: Map<string, Map<string, { price: number; index: number; data: PriceData }>> = new Map();
    const allDates = new Set<string>();

    for (const asset of assets) {
      const priceMap = new Map<string, { price: number; index: number; data: PriceData }>();
      asset.priceData.forEach((p, index) => {
        priceMap.set(p.date, { price: p.close, index, data: p });
        allDates.add(p.date);
      });
      priceMaps.set(asset.symbol, priceMap);
    }

    const sortedDates = Array.from(allDates).sort();

    // Pre-calculate indicators for each asset
    const assetData: Map<string, AssetPriceData> = new Map();
    for (const asset of assets) {
      const closes = asset.priceData.map(d => d.close);
      const volumes = asset.priceData.map(d => d.volume);
      // Pre-calculate custom MA periods from strategy blocks
      const customMa = new Map<string, number[]>();
      const collectMaPeriods = (blocks: StrategyBlock[]) => {
        for (const block of blocks) {
          if (block.name === 'IF_MOVING_AVG') {
            const period = block.params.period || 20;
            const type = block.params.type || 'sma';
            const key = `${type}_${period}`;
            if (!customMa.has(key)) {
              customMa.set(key, type === 'ema'
                ? calculateEMA(closes, period)
                : calculateSMA(closes, period));
            }
          }
          if (block.children) collectMaPeriods(block.children);
        }
      };
      collectMaPeriods(strategy);

      assetData.set(asset.symbol, {
        symbol: asset.symbol,
        name: asset.name,
        priceData: asset.priceData,
        indicators: {
          sma20: calculateSMA(closes, 20),
          sma50: calculateSMA(closes, 50),
          ema20: calculateEMA(closes, 20),
          rsi14: calculateRSI(closes, 14),
          avgVolume: calculateAverageVolume(volumes, 20),
          priceChange: calculatePriceChange(closes),
          customMa,
        },
      });
    }

    // Initialize state
    const state: MultiAssetState = {
      cash: initialCash,
      positions: {},
      entryPrices: {},
      highestPrices: {},
      events: [],
    };

    // Initialize positions for all assets
    assets.forEach(a => {
      state.positions[a.symbol] = 0;
      state.entryPrices[a.symbol] = 0;
      state.highestPrices[a.symbol] = 0;
    });

    // Process each day chronologically
    for (const date of sortedDates) {
      // Get current prices for all assets on this date using O(1) lookup
      const currentPrices: { [symbol: string]: number } = {};
      for (const asset of assets) {
        const priceInfo = priceMaps.get(asset.symbol)?.get(date);
        if (priceInfo) {
          currentPrices[asset.symbol] = priceInfo.price;
          // Update highest price tracking
          if (state.positions[asset.symbol] > 0 && priceInfo.price > state.highestPrices[asset.symbol]) {
            state.highestPrices[asset.symbol] = priceInfo.price;
          }
        }
      }

      // Evaluate strategy for each asset
      for (const asset of assets) {
        const assetInfo = assetData.get(asset.symbol);
        if (!assetInfo) continue;

        const priceInfo = priceMaps.get(asset.symbol)?.get(date);
        if (!priceInfo) continue;

        const dayIndex = priceInfo.index;
        const price = priceInfo.price;

        // Evaluate strategy blocks for this asset
        this.evaluateUnifiedBlocks(
          strategy,
          state,
          asset.symbol,
          assetInfo.name,
          price,
          date,
          dayIndex,
          assetInfo.indicators,
          assetInfo.priceData,
          currentPrices
        );
      }
    }

    // Calculate final portfolio value
    let finalPortfolioValue = state.cash;
    const finalPositions: { [symbol: string]: { amount: number; value: number } } = {};

    for (const asset of assets) {
      const position = state.positions[asset.symbol] || 0;
      const lastPrice = asset.priceData[asset.priceData.length - 1]?.close || 0;
      const value = position * lastPrice;
      finalPositions[asset.symbol] = { amount: position, value };
      finalPortfolioValue += value;
    }

    // Build asset summaries
    const assetSummaries: AssetSummary[] = assets.map(asset => {
      const assetEvents = state.events.filter(e => e.symbol === asset.symbol);
      const buys = assetEvents.filter(e => e.eventType === 'buy');
      const sells = assetEvents.filter(e => e.eventType === 'sell');
      const skips = assetEvents.filter(e => e.eventType === 'skip_buy' || e.eventType === 'skip_sell');

      const totalBought = buys.reduce((sum, e) => sum + (e.value || 0), 0);
      const totalSold = sells.reduce((sum, e) => sum + (e.value || 0), 0);
      const currentPosition = state.positions[asset.symbol] || 0;
      const lastPrice = asset.priceData[asset.priceData.length - 1]?.close || 0;
      const currentValue = currentPosition * lastPrice;

      return {
        symbol: asset.symbol,
        name: asset.name,
        totalBought,
        totalSold,
        currentPosition,
        currentValue,
        realizedProfitLoss: totalSold - totalBought + currentValue,
        unrealizedProfitLoss: currentValue - (currentPosition * (state.entryPrices[asset.symbol] || 0)),
        buyCount: buys.length,
        sellCount: sells.length,
        skipCount: skips.length,
      };
    });

    const profitLoss = finalPortfolioValue - initialCash;
    const profitPercentage = (profitLoss / initialCash) * 100;

    return {
      initialCash,
      finalCash: state.cash,
      finalPositions,
      finalPortfolioValue,
      profitLoss,
      profitPercentage,
      events: state.events,
      assetSummaries,
    };
  }

  private evaluateUnifiedBlocks(
    blocks: StrategyBlock[],
    state: MultiAssetState,
    symbol: string,
    symbolName: string,
    price: number,
    date: string,
    dayIndex: number,
    indicators: IndicatorData,
    priceData: PriceData[],
    allCurrentPrices: { [symbol: string]: number },
    depth: number = 0
  ): void {
    if (depth > SimulationEngine.MAX_RECURSION_DEPTH) return;

    for (const block of blocks) {
      const result = this.evaluateUnifiedBlock(
        block,
        state,
        symbol,
        symbolName,
        price,
        date,
        dayIndex,
        indicators,
        priceData,
        allCurrentPrices
      );

      if (result.triggered) {
        this.currentContext = result.context;

        if (block.children && block.children.length > 0) {
          this.evaluateUnifiedBlocks(
            block.children,
            state,
            symbol,
            symbolName,
            price,
            date,
            dayIndex,
            indicators,
            priceData,
            allCurrentPrices,
            depth + 1
          );
        }
      }
    }
  }

  private evaluateUnifiedBlock(
    block: StrategyBlock,
    state: MultiAssetState,
    symbol: string,
    symbolName: string,
    price: number,
    date: string,
    dayIndex: number,
    indicators: IndicatorData,
    priceData: PriceData[],
    allCurrentPrices: { [symbol: string]: number }
  ): { triggered: boolean; context: BlockContext | null } {
    const strategyInfo = this.strategyNames[block.name] || { name: block.name, icon: '📊', color: '#6366F1' };

    switch (block.type) {
      case 'trigger':
        return this.evaluateUnifiedTrigger(block, price, dayIndex, date, indicators, strategyInfo);
      case 'condition':
        return this.evaluateUnifiedCondition(block, state, symbol, price, dayIndex, indicators, priceData, strategyInfo);
      case 'action':
        this.executeUnifiedAction(block, state, symbol, symbolName, price, date, allCurrentPrices);
        return { triggered: true, context: null };
      case 'modifier':
        this.applyUnifiedModifier(block, state, symbol, symbolName, price, date, allCurrentPrices, strategyInfo);
        return { triggered: true, context: null };
      default:
        return { triggered: false, context: null };
    }
  }

  private evaluateUnifiedTrigger(
    block: StrategyBlock,
    price: number,
    dayIndex: number,
    date: string,
    indicators: IndicatorData,
    strategyInfo: { name: string; icon: string; color: string }
  ): { triggered: boolean; context: BlockContext | null } {
    let triggered = false;
    let triggerDetails = '';
    let indicatorValue = '';

    switch (block.name) {
      case 'WHEN_PRICE_ABOVE':
        triggered = price > block.params.threshold;
        triggerDetails = `Price rose above $${block.params.threshold}`;
        indicatorValue = `$${price.toFixed(2)}`;
        break;

      case 'WHEN_PRICE_BELOW':
        triggered = price < block.params.threshold;
        triggerDetails = `Price dropped below $${block.params.threshold}`;
        indicatorValue = `$${price.toFixed(2)}`;
        break;

      case 'WHEN_CHANGE_PERCENT': {
        const change = indicators.priceChange[dayIndex] || 0;
        const percent = block.params.percent;
        const direction = block.params.direction;

        if (direction === 'up') {
          triggered = change >= percent;
          triggerDetails = `Price moved up ${percent}%`;
        } else if (direction === 'down') {
          triggered = change <= -percent;
          triggerDetails = `Price dropped ${percent}% (dip opportunity)`;
        } else {
          triggered = Math.abs(change) >= percent;
          triggerDetails = `Price moved ${percent}%`;
        }
        indicatorValue = `%${change.toFixed(2)}`;
        break;
      }

      case 'WHEN_DATE':
        triggered = date === block.params.date;
        triggerDetails = `Timing: ${block.params.interval || 'periodic'} buy`;
        indicatorValue = date;
        break;
    }

    if (triggered) {
      return {
        triggered: true,
        context: {
          strategyName: strategyInfo.name,
          strategyIcon: strategyInfo.icon,
          strategyColor: strategyInfo.color,
          triggerType: 'trigger',
          triggerDetails,
          indicatorValue,
        },
      };
    }
    return { triggered: false, context: null };
  }

  private evaluateUnifiedCondition(
    block: StrategyBlock,
    state: MultiAssetState,
    symbol: string,
    price: number,
    dayIndex: number,
    indicators: IndicatorData,
    priceData: PriceData[],
    strategyInfo: { name: string; icon: string; color: string }
  ): { triggered: boolean; context: BlockContext | null } {
    let triggered = false;
    let triggerDetails = '';
    let indicatorValue = '';

    switch (block.name) {
      case 'IF_RSI': {
        const rsi = indicators.rsi14[dayIndex];
        if (rsi === undefined || isNaN(rsi)) break;

        const operator = block.params.operator;
        const value = block.params.value;

        triggered = operator === 'above' ? rsi > value : rsi < value;

        if (triggered) {
          if (operator === 'below') {
            triggerDetails = `RSI dropped below ${value} - Oversold zone (buy opportunity)`;
          } else {
            triggerDetails = `RSI rose above ${value} - Overbought zone (sell opportunity)`;
          }
          indicatorValue = `RSI: ${rsi.toFixed(1)}`;
        }
        break;
      }

      case 'IF_MOVING_AVG': {
        const period = block.params.period || 20;
        const type = block.params.type || 'sma';
        const crossDirection = block.params.crossDirection;

        const maKey = `${type}_${period}`;
        const ma = indicators.customMa.get(maKey);
        if (!ma) break;

        const currentMa = ma[dayIndex];
        const prevMa = dayIndex > 0 ? ma[dayIndex - 1] : currentMa;
        const prevPrice = dayIndex > 0 ? priceData[dayIndex - 1].close : price;

        if (!isNaN(currentMa) && !isNaN(prevMa)) {
          if (crossDirection === 'above') {
            triggered = prevPrice <= prevMa && price > currentMa;
            if (triggered) {
              triggerDetails = `Price crossed above ${type.toUpperCase()}${period} - Uptrend start`;
              indicatorValue = `MA: $${currentMa.toFixed(2)}`;
            }
          } else {
            triggered = prevPrice >= prevMa && price < currentMa;
            if (triggered) {
              triggerDetails = `Price crossed below ${type.toUpperCase()}${period} - Downtrend start`;
              indicatorValue = `MA: $${currentMa.toFixed(2)}`;
            }
          }
        }
        break;
      }

      case 'IF_VOLUME': {
        const volume = priceData[dayIndex].volume;
        const avgVolume = indicators.avgVolume[dayIndex];
        if (avgVolume === undefined || isNaN(avgVolume)) break;

        const multiplier = block.params.multiplier || 1.5;
        triggered = volume > avgVolume * multiplier;

        if (triggered) {
          const ratio = (volume / avgVolume).toFixed(1);
          triggerDetails = `Volume ${ratio}x above average - Strong interest`;
          indicatorValue = `Vol: ${(volume / 1000000).toFixed(1)}M`;
        }
        break;
      }

      case 'IF_PROFIT': {
        const position = state.positions[symbol] || 0;
        if (position === 0) break;

        const entryPrice = state.entryPrices[symbol] || price;
        const currentValue = position * price;
        const entryValue = position * entryPrice;
        const profitPercent = ((currentValue - entryValue) / entryValue) * 100;

        const type = block.params.type;
        const percent = block.params.percent;

        if (type === 'profit') {
          triggered = profitPercent >= percent;
          if (triggered) {
            triggerDetails = `Profit target ${percent}% reached`;
            indicatorValue = `${this.labels.profit}: %${profitPercent.toFixed(1)}`;
          }
        } else {
          triggered = profitPercent <= -percent;
          if (triggered) {
            triggerDetails = `Loss limit ${percent}% reached`;
            indicatorValue = `${this.labels.loss}: %${profitPercent.toFixed(1)}`;
          }
        }
        break;
      }
    }

    if (triggered) {
      return {
        triggered: true,
        context: {
          strategyName: strategyInfo.name,
          strategyIcon: strategyInfo.icon,
          strategyColor: strategyInfo.color,
          triggerType: 'condition',
          triggerDetails,
          indicatorValue,
        },
      };
    }
    return { triggered: false, context: null };
  }

  private executeUnifiedAction(
    block: StrategyBlock,
    state: MultiAssetState,
    symbol: string,
    symbolName: string,
    price: number,
    date: string,
    allCurrentPrices: { [symbol: string]: number }
  ): void {
    const ctx = this.currentContext;

    const calculatePortfolioValue = (): number => {
      let value = state.cash;
      for (const [sym, pos] of Object.entries(state.positions)) {
        value += pos * (allCurrentPrices[sym] || 0);
      }
      return value;
    };

    const createEvent = (
      eventType: PortfolioEventType,
      amount?: number,
      value?: number,
      reason?: string
    ): PortfolioEvent => ({
      date,
      symbol,
      symbolName,
      eventType,
      price,
      amount,
      value,
      reason: reason || ctx?.triggerDetails || '',
      strategyName: ctx?.strategyName,
      strategyIcon: ctx?.strategyIcon,
      strategyColor: ctx?.strategyColor,
      triggerDetails: ctx?.triggerDetails,
      indicatorValue: ctx?.indicatorValue,
      cashAfter: state.cash,
      positionsAfter: { ...state.positions },
      portfolioValueAfter: calculatePortfolioValue(),
    });

    switch (block.name) {
      case 'BUY': {
        const buyAmount = block.params.amount;
        if (state.cash >= buyAmount) {
          const units = buyAmount / price;
          state.positions[symbol] = (state.positions[symbol] || 0) + units;
          state.cash -= buyAmount;
          state.entryPrices[symbol] = price;
          state.highestPrices[symbol] = price;

          state.events.push(createEvent('buy', units, buyAmount));
        } else {
          // Skip - no budget
          state.events.push(createEvent(
            'skip_buy',
            undefined,
            buyAmount,
            this.labels.insufficientBalance.replace('${cash}', state.cash.toFixed(2)).replace('${required}', String(buyAmount))
          ));
        }
        break;
      }

      case 'SELL': {
        const sellAmount = block.params.amount;
        const position = state.positions[symbol] || 0;
        const unitsToSell = Math.min(position, sellAmount / price);

        if (unitsToSell > 0) {
          const value = unitsToSell * price;
          state.positions[symbol] -= unitsToSell;
          state.cash += value;

          state.events.push(createEvent('sell', unitsToSell, value));

          if (state.positions[symbol] === 0) {
            state.entryPrices[symbol] = 0;
            state.highestPrices[symbol] = 0;
          }
        } else {
          // Skip - no position
          state.events.push(createEvent(
            'skip_sell',
            undefined,
            undefined,
            this.labels.cannotSell.replace('{symbol}', symbolName)
          ));
        }
        break;
      }

      case 'BUY_PERCENT': {
        const percent = block.params.percent / 100;
        const buyAmount = state.cash * percent;

        if (buyAmount > 0 && state.cash >= buyAmount) {
          const units = buyAmount / price;
          state.positions[symbol] = (state.positions[symbol] || 0) + units;
          state.cash -= buyAmount;
          state.entryPrices[symbol] = price;
          state.highestPrices[symbol] = price;

          state.events.push(createEvent('buy', units, buyAmount, ctx?.triggerDetails || `Buy with ${block.params.percent}% of cash`));
        } else {
          // Skip - no budget
          state.events.push(createEvent(
            'skip_buy',
            undefined,
            buyAmount,
            this.labels.insufficientCash.replace('${cash}', state.cash.toFixed(2))
          ));
        }
        break;
      }

      case 'SELL_PERCENT': {
        const percent = block.params.percent / 100;
        const position = state.positions[symbol] || 0;
        const unitsToSell = position * percent;

        if (unitsToSell > 0) {
          const value = unitsToSell * price;
          state.positions[symbol] -= unitsToSell;
          state.cash += value;

          state.events.push(createEvent('sell', unitsToSell, value, ctx?.triggerDetails || `Sell ${block.params.percent}% of position`));

          if (state.positions[symbol] === 0) {
            state.entryPrices[symbol] = 0;
            state.highestPrices[symbol] = 0;
          }
        } else {
          // Skip - no position
          state.events.push(createEvent(
            'skip_sell',
            undefined,
            undefined,
            this.labels.cannotSell.replace('{symbol}', symbolName)
          ));
        }
        break;
      }
    }
  }

  private applyUnifiedModifier(
    block: StrategyBlock,
    state: MultiAssetState,
    symbol: string,
    symbolName: string,
    price: number,
    date: string,
    allCurrentPrices: { [symbol: string]: number },
    strategyInfo: { name: string; icon: string; color: string }
  ): void {
    const position = state.positions[symbol] || 0;
    if (position === 0) return;

    const entryPrice = state.entryPrices[symbol] || price;
    const currentValue = position * price;
    const entryValue = position * entryPrice;
    const profitPercent = entryValue > 0 ? ((currentValue - entryValue) / entryValue) * 100 : 0;

    const calculatePortfolioValue = (): number => {
      let value = state.cash;
      for (const [sym, pos] of Object.entries(state.positions)) {
        value += pos * (allCurrentPrices[sym] || 0);
      }
      return value;
    };

    switch (block.name) {
      case 'STOP_LOSS': {
        const stopPercent = -block.params.percent;
        if (profitPercent <= stopPercent) {
          const value = position * price;
          state.cash += value;
          state.positions[symbol] = 0;
          state.entryPrices[symbol] = 0;
          state.highestPrices[symbol] = 0;

          state.events.push({
            date,
            symbol,
            symbolName,
            eventType: 'sell',
            price,
            amount: position,
            value,
            reason: `Stop Loss triggered - Loss reached ${Math.abs(profitPercent).toFixed(1)}%`,
            strategyName: this.labels.stopLoss,
            strategyIcon: '🛡️',
            strategyColor: '#EF4444',
            triggerDetails: this.labels.lossLimitExceeded.replace('{percent}', String(block.params.percent)),
            indicatorValue: `${this.labels.loss}: %${profitPercent.toFixed(1)}`,
            cashAfter: state.cash,
            positionsAfter: { ...state.positions },
            portfolioValueAfter: calculatePortfolioValue(),
          });
        }
        break;
      }

      case 'TAKE_PROFIT': {
        const profitTarget = block.params.percent;
        if (profitPercent >= profitTarget) {
          const value = position * price;
          state.cash += value;
          state.positions[symbol] = 0;
          state.entryPrices[symbol] = 0;
          state.highestPrices[symbol] = 0;

          state.events.push({
            date,
            symbol,
            symbolName,
            eventType: 'sell',
            price,
            amount: position,
            value,
            reason: `Take Profit triggered - Profit reached ${profitPercent.toFixed(1)}%`,
            strategyName: this.labels.takeProfit,
            strategyIcon: '🎉',
            strategyColor: '#22C55E',
            triggerDetails: `Profit target ${block.params.percent}% reached, profit realized`,
            indicatorValue: `${this.labels.profit}: %${profitPercent.toFixed(1)}`,
            cashAfter: state.cash,
            positionsAfter: { ...state.positions },
            portfolioValueAfter: calculatePortfolioValue(),
          });
        }
        break;
      }

      case 'TRAILING_STOP': {
        const highestPrice = state.highestPrices[symbol] || price;
        const trailPercent = block.params.percent / 100;
        const stopPrice = highestPrice * (1 - trailPercent);

        if (price <= stopPrice) {
          const value = position * price;
          const dropFromHigh = ((highestPrice - price) / highestPrice * 100).toFixed(1);

          state.cash += value;
          state.positions[symbol] = 0;
          state.entryPrices[symbol] = 0;
          state.highestPrices[symbol] = 0;

          state.events.push({
            date,
            symbol,
            symbolName,
            eventType: 'sell',
            price,
            amount: position,
            value,
            reason: `Trailing Stop triggered - ${dropFromHigh}% drop from peak`,
            strategyName: this.labels.trailingStop,
            strategyIcon: '📍',
            strategyColor: '#F97316',
            triggerDetails: `Price dropped ${block.params.percent}% from peak ($${highestPrice.toFixed(2)} -> $${price.toFixed(2)})`,
            indicatorValue: `${this.labels.peak}: $${highestPrice.toFixed(2)}`,
            cashAfter: state.cash,
            positionsAfter: { ...state.positions },
            portfolioValueAfter: calculatePortfolioValue(),
          });
        }
        break;
      }
    }
  }
}

export default SimulationEngine;
