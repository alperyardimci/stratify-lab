-- Investment Simulator Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create asset_type enum
CREATE TYPE asset_type AS ENUM ('stock', 'crypto', 'forex', 'commodity');

-- Strategies table (created first to avoid dependency issues)
CREATE TABLE strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    blocks JSONB NOT NULL DEFAULT '[]',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolios table
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments table
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    asset_type asset_type NOT NULL,
    asset_symbol TEXT NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    entry_date DATE NOT NULL,
    strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simulation Results table
CREATE TABLE simulation_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
    initial_value DECIMAL(18, 2) NOT NULL,
    final_value DECIMAL(18, 2) NOT NULL,
    profit_loss DECIMAL(18, 2) NOT NULL,
    profit_percentage DECIMAL(10, 4) NOT NULL,
    transactions JSONB NOT NULL DEFAULT '[]',
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_investments_portfolio_id ON investments(portfolio_id);
CREATE INDEX idx_investments_strategy_id ON investments(strategy_id);
CREATE INDEX idx_strategies_user_id ON strategies(user_id);
CREATE INDEX idx_strategies_is_public ON strategies(is_public);
CREATE INDEX idx_simulation_results_investment_id ON simulation_results(investment_id);
CREATE INDEX idx_simulation_results_calculated_at ON simulation_results(calculated_at);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_results ENABLE ROW LEVEL SECURITY;

-- Portfolios policies
CREATE POLICY "Users can view their own portfolios"
    ON portfolios FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolios"
    ON portfolios FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
    ON portfolios FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
    ON portfolios FOR DELETE
    USING (auth.uid() = user_id);

-- Investments policies
CREATE POLICY "Users can view investments in their portfolios"
    ON investments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM portfolios
            WHERE portfolios.id = investments.portfolio_id
            AND portfolios.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create investments in their portfolios"
    ON investments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM portfolios
            WHERE portfolios.id = investments.portfolio_id
            AND portfolios.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update investments in their portfolios"
    ON investments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM portfolios
            WHERE portfolios.id = investments.portfolio_id
            AND portfolios.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete investments in their portfolios"
    ON investments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM portfolios
            WHERE portfolios.id = investments.portfolio_id
            AND portfolios.user_id = auth.uid()
        )
    );

-- Strategies policies
CREATE POLICY "Users can view their own strategies"
    ON strategies FOR SELECT
    USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create their own strategies"
    ON strategies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategies"
    ON strategies FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategies"
    ON strategies FOR DELETE
    USING (auth.uid() = user_id);

-- Simulation results policies
CREATE POLICY "Users can view simulation results for their investments"
    ON simulation_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM investments
            JOIN portfolios ON portfolios.id = investments.portfolio_id
            WHERE investments.id = simulation_results.investment_id
            AND portfolios.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create simulation results for their investments"
    ON simulation_results FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM investments
            JOIN portfolios ON portfolios.id = investments.portfolio_id
            WHERE investments.id = simulation_results.investment_id
            AND portfolios.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete simulation results for their investments"
    ON simulation_results FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM investments
            JOIN portfolios ON portfolios.id = investments.portfolio_id
            WHERE investments.id = simulation_results.investment_id
            AND portfolios.user_id = auth.uid()
        )
    );

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_portfolios_updated_at
    BEFORE UPDATE ON portfolios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at
    BEFORE UPDATE ON investments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategies_updated_at
    BEFORE UPDATE ON strategies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
