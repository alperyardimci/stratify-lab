import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateBollingerBands,
  calculateMACD,
  calculatePriceChange,
} from '../services/simulation/indicators';

describe('calculateSMA', () => {
  it('returns NaN for values before the period window', () => {
    const result = calculateSMA([1, 2, 3, 4, 5], 3);
    expect(result[0]).toBeNaN();
    expect(result[1]).toBeNaN();
    expect(result[2]).not.toBeNaN();
  });

  it('calculates correct simple moving average', () => {
    const result = calculateSMA([10, 20, 30, 40, 50], 3);
    expect(result[2]).toBeCloseTo(20, 5); // (10+20+30)/3
    expect(result[3]).toBeCloseTo(30, 5); // (20+30+40)/3
    expect(result[4]).toBeCloseTo(40, 5); // (30+40+50)/3
  });

  it('handles period = 1', () => {
    const prices = [5, 10, 15];
    const result = calculateSMA(prices, 1);
    expect(result).toEqual([5, 10, 15]);
  });

  it('handles period equal to array length', () => {
    const result = calculateSMA([2, 4, 6], 3);
    expect(result[0]).toBeNaN();
    expect(result[1]).toBeNaN();
    expect(result[2]).toBeCloseTo(4, 5); // (2+4+6)/3
  });

  it('returns same length as input', () => {
    const prices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = calculateSMA(prices, 5);
    expect(result.length).toBe(prices.length);
  });

  it('produces accurate results for known sequence', () => {
    // Ascending sequence: SMA should be the average of the window
    const prices = [100, 102, 104, 106, 108, 110];
    const result = calculateSMA(prices, 3);
    expect(result[2]).toBeCloseTo(102, 5);
    expect(result[3]).toBeCloseTo(104, 5);
    expect(result[4]).toBeCloseTo(106, 5);
    expect(result[5]).toBeCloseTo(108, 5);
  });
});

describe('calculateEMA', () => {
  it('returns NaN for values before the period', () => {
    const result = calculateEMA([1, 2, 3, 4, 5], 3);
    expect(result[0]).toBeNaN();
    expect(result[1]).toBeNaN();
    expect(result[2]).not.toBeNaN();
  });

  it('first EMA value equals SMA', () => {
    const result = calculateEMA([10, 20, 30, 40, 50], 3);
    // First EMA at index 2 = SMA of first 3 = (10+20+30)/3 = 20
    expect(result[2]).toBeCloseTo(20, 5);
  });

  it('EMA reacts faster than SMA to price changes', () => {
    const prices = [10, 10, 10, 10, 10, 20, 20, 20]; // sudden jump
    const sma = calculateSMA(prices, 3);
    const ema = calculateEMA(prices, 3);
    // After the jump, EMA should be higher than SMA (reacts faster)
    expect(ema[6]).toBeGreaterThan(sma[6]);
  });

  it('returns same length as input', () => {
    const prices = [1, 2, 3, 4, 5];
    expect(calculateEMA(prices, 3).length).toBe(5);
  });
});

describe('calculateRSI', () => {
  it('returns NaN for values before the period', () => {
    const prices = Array.from({ length: 20 }, (_, i) => 100 + i);
    const result = calculateRSI(prices, 14);
    for (let i = 0; i < 14; i++) {
      expect(result[i]).toBeNaN();
    }
    expect(result[14]).not.toBeNaN();
  });

  it('RSI is high for consistently rising prices', () => {
    const prices = Array.from({ length: 30 }, (_, i) => 100 + i * 2);
    const result = calculateRSI(prices, 14);
    const lastRSI = result[result.length - 1];
    expect(lastRSI).toBeGreaterThan(70);
  });

  it('RSI is low for consistently falling prices', () => {
    const prices = Array.from({ length: 30 }, (_, i) => 200 - i * 2);
    const result = calculateRSI(prices, 14);
    const lastRSI = result[result.length - 1];
    expect(lastRSI).toBeLessThan(30);
  });

  it('RSI is between 0 and 100', () => {
    const prices = [100, 105, 98, 102, 110, 95, 108, 103, 115, 99, 106, 111, 97, 104, 109, 101];
    const result = calculateRSI(prices, 14);
    result.forEach(val => {
      if (!isNaN(val)) {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(100);
      }
    });
  });

  it('returns same length as input', () => {
    const prices = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i) * 10);
    expect(calculateRSI(prices, 14).length).toBe(30);
  });
});

describe('calculateBollingerBands', () => {
  it('middle band equals SMA', () => {
    const prices = Array.from({ length: 30 }, (_, i) => 100 + i);
    const bb = calculateBollingerBands(prices, 20, 2);
    const sma = calculateSMA(prices, 20);
    for (let i = 19; i < prices.length; i++) {
      expect(bb.middle[i]).toBeCloseTo(sma[i], 5);
    }
  });

  it('upper > middle > lower for valid indices', () => {
    const prices = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i) * 10);
    const bb = calculateBollingerBands(prices, 20, 2);
    for (let i = 19; i < prices.length; i++) {
      expect(bb.upper[i]).toBeGreaterThan(bb.middle[i]);
      expect(bb.middle[i]).toBeGreaterThan(bb.lower[i]);
    }
  });

  it('returns NaN for values before the period', () => {
    const prices = Array.from({ length: 25 }, (_, i) => 100 + i);
    const bb = calculateBollingerBands(prices, 20, 2);
    expect(bb.upper[0]).toBeNaN();
    expect(bb.lower[0]).toBeNaN();
    expect(bb.upper[19]).not.toBeNaN();
  });
});

describe('calculateMACD', () => {
  it('returns macd, signal, and histogram arrays', () => {
    const prices = Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i * 0.3) * 20);
    const result = calculateMACD(prices);
    expect(result.macd.length).toBe(prices.length);
    expect(result.signal.length).toBe(prices.length);
    expect(result.histogram.length).toBe(prices.length);
  });

  it('MACD line has NaN for early values', () => {
    const prices = Array.from({ length: 50 }, (_, i) => 100 + i);
    const result = calculateMACD(prices, 12, 26, 9);
    // First 25 values should be NaN (slow EMA period - 1)
    for (let i = 0; i < 25; i++) {
      expect(result.macd[i]).toBeNaN();
    }
  });
});

describe('calculatePriceChange', () => {
  it('first value is always 0', () => {
    const result = calculatePriceChange([100, 110, 105]);
    expect(result[0]).toBe(0);
  });

  it('calculates correct percentage changes', () => {
    const result = calculatePriceChange([100, 110, 105]);
    expect(result[1]).toBeCloseTo(10, 5);   // (110-100)/100 * 100 = 10%
    expect(result[2]).toBeCloseTo(-4.5454, 2); // (105-110)/110 * 100
  });

  it('returns same length as input', () => {
    const prices = [1, 2, 3, 4, 5];
    expect(calculatePriceChange(prices).length).toBe(5);
  });
});
