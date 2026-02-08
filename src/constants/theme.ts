import { Theme } from '../types';

export const theme: Theme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    border: '#334155',
    // Block colors
    trigger: '#3B82F6',    // Blue
    condition: '#EAB308',  // Yellow
    action: '#22C55E',     // Green
    modifier: '#8B5CF6',   // Purple
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
};

export default theme;
