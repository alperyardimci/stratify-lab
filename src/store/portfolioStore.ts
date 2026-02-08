import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Portfolio, Investment, SimulationResult, PortfolioSummary } from '../types';

const generateId = (): string => {
  const array = new Uint32Array(2);
  crypto.getRandomValues(array);
  return Date.now().toString(36) + array[0].toString(36) + array[1].toString(36);
};

interface PortfolioState {
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  investments: Investment[];
  simulationResults: SimulationResult[];
  allSimulationResults: SimulationResult[];
  isLoading: boolean;
  error: string | null;

  // Portfolio actions
  fetchPortfolios: (userId: string) => Promise<void>;
  addPortfolio: (userId: string, name: string) => Promise<Portfolio>;
  removePortfolio: (portfolioId: string) => Promise<void>;
  setCurrentPortfolio: (portfolio: Portfolio | null) => void;

  // Investment actions
  fetchInvestments: (portfolioId: string) => Promise<void>;
  addInvestment: (investment: Omit<Investment, 'id'>) => Promise<Investment>;
  removeInvestment: (investmentId: string) => Promise<void>;

  // Simulation results actions
  fetchSimulationResults: (investmentId: string) => Promise<void>;
  addSimulationResult: (result: Omit<SimulationResult, 'id' | 'calculated_at'>) => Promise<SimulationResult>;
  fetchAllSimulationResults: (userId: string) => Promise<void>;

  // Summary
  getPortfolioSummary: () => PortfolioSummary;

  // Utility
  clearError: () => void;
  reset: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      portfolios: [],
      currentPortfolio: null,
      investments: [],
      simulationResults: [],
      allSimulationResults: [],
      isLoading: false,
      error: null,

      fetchPortfolios: async (_userId: string) => {
        // Data already in local state via persist
        set({ isLoading: false });
      },

      addPortfolio: async (_userId: string, name: string) => {
        const trimmedName = (name || '').trim().slice(0, 100);
        if (!trimmedName) {
          throw new Error('Portfolio name is required');
        }

        const portfolio: Portfolio = {
          id: generateId(),
          user_id: 'local',
          name: trimmedName,
          created_at: new Date().toISOString(),
        };
        set(state => ({
          portfolios: [portfolio, ...state.portfolios],
        }));
        return portfolio;
      },

      removePortfolio: async (portfolioId: string) => {
        set(state => ({
          portfolios: state.portfolios.filter(p => p.id !== portfolioId),
          currentPortfolio: state.currentPortfolio?.id === portfolioId ? null : state.currentPortfolio,
        }));
      },

      setCurrentPortfolio: (portfolio: Portfolio | null) => {
        set({ currentPortfolio: portfolio });
      },

      fetchInvestments: async (_portfolioId: string) => {
        set({ isLoading: false });
      },

      addInvestment: async (investment: Omit<Investment, 'id'>) => {
        if (!investment.amount || !isFinite(investment.amount) || investment.amount <= 0) {
          throw new Error('Invalid investment amount');
        }

        const newInvestment: Investment = {
          ...investment,
          id: generateId(),
        };
        set(state => ({
          investments: [newInvestment, ...state.investments],
        }));
        return newInvestment;
      },

      removeInvestment: async (investmentId: string) => {
        set(state => ({
          investments: state.investments.filter(i => i.id !== investmentId),
        }));
      },

      fetchSimulationResults: async (_investmentId: string) => {
        set({ isLoading: false });
      },

      addSimulationResult: async (result: Omit<SimulationResult, 'id' | 'calculated_at'>) => {
        // Validate financial values are finite numbers
        if (!isFinite(result.final_value) || !isFinite(result.initial_value)) {
          throw new Error('Invalid simulation result values');
        }

        const newResult: SimulationResult = {
          ...result,
          id: generateId(),
          calculated_at: new Date().toISOString(),
        };
        set(state => ({
          simulationResults: [newResult, ...state.simulationResults],
          allSimulationResults: [newResult, ...state.allSimulationResults],
        }));
        return newResult;
      },

      fetchAllSimulationResults: async (_userId: string) => {
        set({ isLoading: false });
      },

      getPortfolioSummary: () => {
        const { investments, simulationResults } = get();

        let totalInvested = 0;
        let totalValue = 0;

        const investmentsWithResults = investments.map(inv => {
          const latestResult = simulationResults.find(r => r.investment_id === inv.id);
          totalInvested += inv.amount;
          const currentValue = latestResult?.final_value || inv.amount;
          totalValue += currentValue;

          return {
            ...inv,
            currentValue,
            profitLoss: currentValue - inv.amount,
            profitLossPercent: ((currentValue - inv.amount) / inv.amount) * 100,
            lastSimulation: latestResult,
          };
        });

        return {
          totalValue,
          totalInvested,
          totalProfitLoss: totalValue - totalInvested,
          totalProfitLossPercent: totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0,
          investments: investmentsWithResults,
        };
      },

      clearError: () => set({ error: null }),

      reset: () => set({
        portfolios: [],
        currentPortfolio: null,
        investments: [],
        simulationResults: [],
        allSimulationResults: [],
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'portfolio-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        portfolios: state.portfolios,
        investments: state.investments,
        simulationResults: state.simulationResults,
        allSimulationResults: state.allSimulationResults,
      }),
    }
  )
);

export default usePortfolioStore;
