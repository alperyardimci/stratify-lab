// Security validation utilities
export * from './validation';

// Date formatting utilities
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Number formatting utilities
export const formatCurrency = (
  value: number,
  currency: string = 'USD',
  maximumFractionDigits: number = 2
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(value);
};

export const formatPercent = (value: number, includeSign: boolean = true): string => {
  const formatted = value.toFixed(2);
  if (includeSign && value >= 0) {
    return `+${formatted}%`;
  }
  return `${formatted}%`;
};

export const formatNumber = (value: number, maximumFractionDigits: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
  }).format(value);
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Delay utility
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Generate unique ID (crypto-secure)
export const generateId = (): string => {
  // Use crypto for better randomness
  const array = new Uint32Array(2);
  crypto.getRandomValues(array);
  return Date.now().toString(36) + array[0].toString(36) + array[1].toString(36);
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

// Calculate profit/loss
export const calculateProfitLoss = (
  initialValue: number,
  finalValue: number
): { amount: number; percentage: number } => {
  const amount = finalValue - initialValue;
  const percentage = initialValue > 0 ? (amount / initialValue) * 100 : 0;
  return { amount, percentage };
};
