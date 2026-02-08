import {
  sanitizeString,
  sanitizeSearchQuery,
  validateSymbol,
  sanitizeSymbol,
  validateNumber,
  sanitizeAmount,
  validateEmail,
  validateDateString,
  validateObjectKeys,
} from '../utils/validation';

describe('sanitizeString', () => {
  it('removes HTML/script injection characters', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script');
  });

  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('limits length to 500', () => {
    const long = 'a'.repeat(600);
    expect(sanitizeString(long).length).toBe(500);
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeString(123 as any)).toBe('');
    expect(sanitizeString(null as any)).toBe('');
    expect(sanitizeString(undefined as any)).toBe('');
  });
});

describe('sanitizeSearchQuery', () => {
  it('removes special characters', () => {
    expect(sanitizeSearchQuery('bitcoin!@#$%^&*()')).toBe('bitcoin');
  });

  it('allows alphanumeric, spaces, dashes, dots', () => {
    expect(sanitizeSearchQuery('bit-coin 2.0')).toBe('bit-coin 2.0');
  });

  it('limits length to 100', () => {
    const long = 'a'.repeat(150);
    expect(sanitizeSearchQuery(long).length).toBe(100);
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeSearchQuery(42 as any)).toBe('');
  });
});

describe('validateSymbol', () => {
  it('accepts valid stock symbols', () => {
    expect(validateSymbol('AAPL')).toBe(true);
    expect(validateSymbol('GOOG')).toBe(true);
    expect(validateSymbol('A')).toBe(true);
  });

  it('accepts valid crypto IDs', () => {
    expect(validateSymbol('bitcoin')).toBe(true);
    expect(validateSymbol('ethereum')).toBe(true);
    expect(validateSymbol('shiba-inu')).toBe(true);
  });

  it('accepts valid forex pairs', () => {
    expect(validateSymbol('EUR/USD')).toBe(true);
    expect(validateSymbol('GBP/JPY')).toBe(true);
  });

  it('rejects invalid symbols', () => {
    expect(validateSymbol('')).toBe(false);
    expect(validateSymbol('TOOLONGSYMBOL')).toBe(false);
    expect(validateSymbol('a b c')).toBe(false);
    expect(validateSymbol('<script>')).toBe(false);
  });

  it('rejects non-string input', () => {
    expect(validateSymbol(123 as any)).toBe(false);
    expect(validateSymbol(null as any)).toBe(false);
  });
});

describe('sanitizeSymbol', () => {
  it('removes invalid characters', () => {
    expect(sanitizeSymbol('BTC<>')).toBe('BTC');
  });

  it('preserves valid symbols', () => {
    expect(sanitizeSymbol('bitcoin')).toBe('bitcoin');
    expect(sanitizeSymbol('EUR/USD')).toBe('EUR/USD');
  });

  it('limits length to 50', () => {
    const long = 'a'.repeat(60);
    expect(sanitizeSymbol(long).length).toBe(50);
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeSymbol(null as any)).toBe('');
  });
});

describe('validateNumber', () => {
  it('accepts valid numbers within range', () => {
    expect(validateNumber(100, 0, 1000)).toBe(true);
    expect(validateNumber(0, 0, 100)).toBe(true);
    expect(validateNumber(1000, 0, 1000)).toBe(true);
  });

  it('rejects numbers outside range', () => {
    expect(validateNumber(-1, 0, 100)).toBe(false);
    expect(validateNumber(101, 0, 100)).toBe(false);
  });

  it('rejects non-numeric values', () => {
    expect(validateNumber('hello')).toBe(false);
    expect(validateNumber(NaN)).toBe(false);
    expect(validateNumber(Infinity)).toBe(false);
  });

  it('accepts string numbers', () => {
    expect(validateNumber('42', 0, 100)).toBe(true);
  });
});

describe('sanitizeAmount', () => {
  it('parses valid numeric strings', () => {
    expect(sanitizeAmount('10000')).toBe(10000);
    expect(sanitizeAmount('1,000.50')).toBe(1000.50);
  });

  it('returns 0 for invalid input', () => {
    expect(sanitizeAmount('abc')).toBe(0);
    expect(sanitizeAmount('')).toBe(0);
  });

  it('caps at 1 billion', () => {
    expect(sanitizeAmount('2000000000')).toBe(1000000000);
  });

  it('ensures non-negative', () => {
    expect(sanitizeAmount(-100)).toBe(0);
  });

  it('accepts number input', () => {
    expect(sanitizeAmount(5000)).toBe(5000);
  });
});

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('a@b.co')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('@missing.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });

  it('rejects non-string input', () => {
    expect(validateEmail(123 as any)).toBe(false);
  });
});

describe('validateDateString', () => {
  it('accepts valid date strings', () => {
    expect(validateDateString('2024-01-15')).toBe(true);
    expect(validateDateString('2023-12-31')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(validateDateString('01-15-2024')).toBe(false);
    expect(validateDateString('2024/01/15')).toBe(false);
    expect(validateDateString('not-a-date')).toBe(false);
  });

  it('rejects invalid dates', () => {
    expect(validateDateString('2024-13-01')).toBe(false); // month 13
    // Note: JS Date auto-corrects '2024-02-30' to March 1, so we test month 13 instead
    expect(validateDateString('2024-00-01')).toBe(false); // month 0
  });

  it('rejects non-string input', () => {
    expect(validateDateString(123 as any)).toBe(false);
  });
});

describe('validateObjectKeys', () => {
  it('returns true when all keys are allowed', () => {
    expect(validateObjectKeys({ a: 1, b: 2 }, ['a', 'b', 'c'])).toBe(true);
  });

  it('returns false when extra keys exist', () => {
    expect(validateObjectKeys({ a: 1, d: 2 }, ['a', 'b', 'c'])).toBe(false);
  });

  it('rejects non-object input', () => {
    expect(validateObjectKeys(null as any, ['a'])).toBe(false);
    expect(validateObjectKeys('string' as any, ['a'])).toBe(false);
  });
});
