// Technical Indicators for Trading Simulation

// Simple Moving Average (O(n) sliding window)
export const calculateSMA = (prices: number[], period: number): number[] => {
  const sma: number[] = [];
  let runningSum = 0;

  for (let i = 0; i < prices.length; i++) {
    runningSum += prices[i];
    if (i < period - 1) {
      sma.push(NaN);
    } else {
      if (i >= period) {
        runningSum -= prices[i - period];
      }
      sma.push(runningSum / period);
    }
  }

  return sma;
};

// Exponential Moving Average
export const calculateEMA = (prices: number[], period: number): number[] => {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

  // First EMA is SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
    ema.push(NaN);
  }
  ema[period - 1] = sum / period;

  // Calculate EMA for remaining prices
  for (let i = period; i < prices.length; i++) {
    const currentEma = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
    ema.push(currentEma);
  }

  return ema;
};

// Relative Strength Index
export const calculateRSI = (prices: number[], period: number = 14): number[] => {
  const rsi: number[] = [];
  const changes: number[] = [];

  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  // First period - 1 values are NaN
  for (let i = 0; i < period; i++) {
    rsi.push(NaN);
  }

  // Calculate initial average gain and loss
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }

  avgGain /= period;
  avgLoss /= period;

  // First RSI value
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi.push(100 - (100 / (1 + rs)));

  // Calculate remaining RSI values using smoothed averages
  for (let i = period; i < changes.length; i++) {
    const currentChange = changes[i];
    const currentGain = currentChange > 0 ? currentChange : 0;
    const currentLoss = currentChange < 0 ? Math.abs(currentChange) : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }

  return rsi;
};

// Bollinger Bands
export const calculateBollingerBands = (
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number[]; middle: number[]; lower: number[] } => {
  const middle = calculateSMA(prices, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      const avg = middle[i];
      const squaredDiffs = slice.map(p => Math.pow(p - avg, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
      const std = Math.sqrt(variance);

      upper.push(avg + stdDev * std);
      lower.push(avg - stdDev * std);
    }
  }

  return { upper, middle, lower };
};

// MACD (Moving Average Convergence Divergence)
export const calculateMACD = (
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } => {
  const fastEma = calculateEMA(prices, fastPeriod);
  const slowEma = calculateEMA(prices, slowPeriod);

  const macd: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (isNaN(fastEma[i]) || isNaN(slowEma[i])) {
      macd.push(NaN);
    } else {
      macd.push(fastEma[i] - slowEma[i]);
    }
  }

  // Calculate signal line (EMA of MACD)
  const validMacd = macd.filter(m => !isNaN(m));
  const signalLine = calculateEMA(validMacd, signalPeriod);

  const signal: number[] = [];
  const histogram: number[] = [];
  let signalIndex = 0;

  for (let i = 0; i < macd.length; i++) {
    if (isNaN(macd[i])) {
      signal.push(NaN);
      histogram.push(NaN);
    } else if (signalIndex < signalLine.length) {
      signal.push(signalLine[signalIndex]);
      histogram.push(macd[i] - signalLine[signalIndex]);
      signalIndex++;
    } else {
      signal.push(NaN);
      histogram.push(NaN);
    }
  }

  return { macd, signal, histogram };
};

// Average True Range (ATR)
export const calculateATR = (
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14
): number[] => {
  const trueRanges: number[] = [];

  for (let i = 0; i < highs.length; i++) {
    if (i === 0) {
      trueRanges.push(highs[i] - lows[i]);
    } else {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      trueRanges.push(tr);
    }
  }

  return calculateSMA(trueRanges, period);
};

// Average Volume
export const calculateAverageVolume = (volumes: number[], period: number = 20): number[] => {
  return calculateSMA(volumes, period);
};

// Price change percentage
export const calculatePriceChange = (prices: number[]): number[] => {
  const changes: number[] = [0];

  for (let i = 1; i < prices.length; i++) {
    const change = ((prices[i] - prices[i - 1]) / prices[i - 1]) * 100;
    changes.push(change);
  }

  return changes;
};
