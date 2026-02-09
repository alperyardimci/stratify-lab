export const en = {
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    done: 'Done',
    clear: 'Clear',
    apply: 'Apply',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    settings: 'Settings',
    language: 'Language',
  },

  // Chart
  chart: {
    noData: 'No data available',
    buy: 'Buy',
    sell: 'Sell',
    priceChart: 'Price Chart',
  },

  // Simulator Screen
  simulator: {
    title: 'Simulation',
    subtitle: 'Test strategy performance on historical data',

    // Active Strategies
    strategiesActive: '{count} Strategies Active',
    noStrategySelected: 'No strategy selected. Use "Find Best Strategy" for automatic recommendations.',

    // Asset Selection
    assetSelection: 'Asset Selection',
    assetType: 'Asset Type',
    stock: 'Stock',
    crypto: 'Crypto',
    forex: 'Forex/Gold',
    selectAsset: 'Select asset...',
    selectCrypto: 'Select crypto...',
    cryptoMultiSelect: 'Crypto (you can select multiple)',
    cryptosSelected: '{count} cryptos selected',
    bist: 'BIST',
    selectBist: 'Select BIST stock...',
    bistMultiSelect: 'BIST Stocks (you can select multiple)',
    bistsSelected: '{count} BIST stocks selected',

    // Investment Details
    investmentDetails: 'Investment Details',
    investmentAmount: 'Investment Amount ($)',
    timeRange: 'Time Range',

    // Time Periods
    periods: {
      '1w': '1 Week',
      '1m': '1 Month',
      '3m': '3 Months',
      '6m': '6 Months',
      '1y': '1 Year',
      '2y': '2 Years',
    },

    // Buttons
    findBestStrategy: 'Find Best Strategy',
    analyzing: 'Analyzing...',
    startSimulation: 'Start Simulation',
    simulating: 'Simulating...',

    // Results
    portfolioSummary: 'Portfolio Summary',
    initial: 'Initial',
    portfolioValue: 'Portfolio Value',
    profitLoss: 'Profit/Loss',
    currentPositions: 'Current Positions',
    cash: 'Cash',
    assetBasedSummary: 'Asset-Based Summary',
    transactionHistory: 'Transaction History (Chronological)',
    events: 'events',
    buys: 'buys',
    sells: 'sells',
    skipped: 'skipped',
    showMore: '+{count} more events',
    collapse: 'Collapse',

    // Event Types
    eventTypes: {
      buy: 'BUY',
      sell: 'SELL',
      skip_buy: 'NO BUY',
      skip_sell: 'NO SELL',
    },

    // Transaction Details
    price: 'Price',
    amount: 'Amount',
    total: 'Total',
    afterTransaction: 'After transaction',

    // Alerts
    selectAssetAlert: 'Please select at least one asset',
    validAmountAlert: 'Please enter a valid amount',
    simulationFailed: 'Simulation failed',
    strategyApplied: 'Recommended strategy activated. You can now run the simulation.',
  },

  // Optimization
  optimization: {
    title: 'Strategy Optimization',
    testing: 'Testing Strategies...',
    analyzing: 'Analyzing Market...',
    phase1: 'Testing Entry Strategies',
    phase2: 'Testing Combinations',
    phase3: 'Adding Protection',
    complete: 'Complete!',
    assetsUnifiedBudget: '{count} assets, single budget (${amount})',
    profitableFound: '{count} profitable strategies found',
    bestSoFar: 'Best so far:',
    bestStrategies: 'Best Strategies',
    combinationsTested: '{count} combinations tested',
    progressTested: '{current}/{total} strategies tested',
    transactions: 'transactions',
    tapToApply: 'Tap to apply',
    best: 'BEST',
    successRate: 'Success Rate:',
    loadingData: 'Loading {name} data...',
    buyAndHold: 'Buy & Hold',
  },

  // Crypto Picker
  cryptoPicker: {
    title: 'Select Crypto',
    selected: '{count} selected',
    clearAll: 'Clear',
  },

  // BIST Picker
  bistPicker: {
    title: 'Select BIST Stock',
    selected: '{count} selected',
    clearAll: 'Clear',
  },

  // Strategies Tab
  strategies: {
    title: 'Strategies',
    subtitle: 'Select and combine trading strategies',
    allCategories: 'All',

    // Categories
    categories: {
      scalper: 'Scalper',
      momentum: 'Momentum',
      trend: 'Trend',
      value: 'Dip Buy',
      reversal: 'Reversal',
      volatility: 'Volatility',
      dca: 'DCA',
      protection: 'Protection',
    },

    // Risk Levels
    riskLevels: {
      low: 'Low Risk',
      medium: 'Medium Risk',
      high: 'High Risk',
    },

    enabled: 'Active',
    disabled: 'Inactive',
  },

  // Settings
  settings: {
    title: 'Settings',
    language: 'Language',
    languageDescription: 'Select your preferred language',
    theme: 'Theme',
    about: 'About',
    version: 'Version',
    disclaimer: 'Disclaimer',
    disclaimerTitle: '⚠️ Important Notice',
    disclaimerText: 'This application is for educational and simulation purposes only. The results shown do not guarantee future performance. This is NOT investment advice. Always do your own research and consult with a qualified financial advisor before making any investment decisions. Past performance does not indicate future results. You may lose some or all of your invested capital.',
    disclaimerAccept: 'I Understand',
  },

  // Engine Labels
  engine: {
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
  },

  // Strategy Names
  strategyNames: {
    // DCA
    dca_weekly: 'Weekly DCA',
    dca_biweekly: 'Biweekly DCA',
    dca_monthly: 'Monthly DCA',
    // Trend
    trend_ma_cross_20: 'MA20 Crossover',
    trend_ma_cross_50: 'MA50 Crossover',
    trend_ema_cross: 'EMA Crossover',
    trend_breakout_3: 'Breakout 3%',
    trend_breakout_5: 'Breakout 5%',
    // Momentum
    rsi_oversold_30: 'RSI < 30',
    rsi_oversold_25: 'RSI < 25 Aggressive',
    rsi_overbought_70: 'RSI > 70',
    rsi_overbought_80: 'RSI > 80 Aggressive',
    volume_spike_1_5x: 'Volume 1.5x',
    volume_spike_2x: 'Volume 2x',
    volume_spike_3x: 'Volume 3x Extreme',
    // Value / Dip
    buy_dip_3: 'Buy Dip 3%',
    buy_dip_5: 'Buy Dip 5%',
    buy_dip_7: 'Buy Dip 7%',
    buy_dip_10: 'Big Dip 10%',
    buy_dip_15: 'Crash Buy 15%',
    // Volatility
    volatility_squeeze: 'Volatility Squeeze',
    mean_reversion: 'Mean Reversion',
    // Reversal
    reversal_rsi_bounce: 'RSI Bounce',
    reversal_profit_take: 'Profit Taking',
    // Scalper
    scalper_quick_profit: 'Quick Profit 5%',
    scalper_ultra_quick: 'Ultra Quick 3%',
    aggressive_all_in: 'All-In Momentum',
    quick_flip: 'Quick Flip',
    momentum_burst: 'Momentum Burst',
    rsi_sniper: 'RSI Sniper',
    breakout_rider: 'Breakout Rider',
    panic_buy: 'Panic Buy',
    swing_trader: 'Swing Trader',
    double_down: 'Double Down',
    pump_catcher: 'Pump Catcher',
    day_trader_combo: 'Day Trader',
    // Protection
    stop_loss_5: 'Stop Loss 5%',
    stop_loss_7: 'Stop Loss 7%',
    stop_loss_10: 'Stop Loss 10%',
    stop_loss_15: 'Stop Loss 15%',
    take_profit_10: 'Take Profit 10%',
    take_profit_15: 'Take Profit 15%',
    take_profit_20: 'Take Profit 20%',
    take_profit_30: 'Take Profit 30%',
    trailing_stop_3: 'Trailing Stop 3%',
    trailing_stop_5: 'Trailing Stop 5%',
    trailing_stop_7: 'Trailing Stop 7%',
  },

  // Strategy Descriptions
  strategyDescriptions: {
    // DCA
    dca_weekly: 'Auto buy every Monday with 10% of cash. Creates smooth cost average without being affected by price fluctuations. Ideal for long-term investors.',
    dca_biweekly: 'Buy every 2 weeks with 15% of cash. Similar cost averaging to weekly DCA with fewer transaction fees. Suitable for medium-term accumulation.',
    dca_monthly: 'Buy on the 1st of each month with 20% of cash. Think of it as payday investing - practical for investors with regular income. Lowest transaction costs.',
    // Trend
    trend_ma_cross_20: 'Buy 50% when price crosses above 20-day average, sell all when it crosses below. Catches short-term trends. May generate many signals in sideways markets.',
    trend_ma_cross_50: 'Buy 40% when price crosses above 50-day average, sell when below. For longer-term trends. Fewer false signals but may have delay.',
    trend_ema_cross: 'Uses 12-day exponential moving average (EMA). EMA gives more weight to recent prices, so reacts faster than SMA. For volatile markets.',
    trend_breakout_3: 'Buy 25% when price moves up 3% in a single day. Catches momentum start. Use with stop loss, otherwise pump & dump risk.',
    trend_breakout_5: 'Buy 30% when price jumps 5% in a single day. Strong momentum signal. Rarely triggers but usually marks big move start.',
    // Momentum
    rsi_oversold_30: 'Buy 25% when 14-day RSI drops below 30. RSI oversold zone - price usually recovers. Early entry risk in downtrend, use with stop loss.',
    rsi_oversold_25: 'Aggressive 40% buy when RSI below 25. Extreme oversold - rarely triggers but usually strong recovery. High risk/reward ratio.',
    rsi_overbought_70: 'Sell 50% when RSI rises above 70. Overbought zone - price usually drops. Early exit risk in strong uptrend.',
    rsi_overbought_80: 'Sell 75% at extreme overbought RSI above 80. Very rare but usually precedes sharp correction. Ideal for profit taking.',
    volume_spike_1_5x: 'Buy 15% when volume reaches 1.5x 20-day average. Increasing interest indicator - usually precedes price movement. Conservative volume strategy.',
    volume_spike_2x: 'Buy 25% when volume doubles average. Institutional interest or major news signal. Could be pump start - use with trailing stop.',
    volume_spike_3x: 'Buy 35% when volume reaches 3x average. Rare event - major news or manipulation. High risk but big gain potential. Set stop immediately.',
    // Value / Dip
    buy_dip_3: 'Buy 15% when price drops 3% in a day. Uses small corrections as value opportunities. Triggers often, spreads cost averaging. Effective in volatile markets.',
    buy_dip_5: 'Buy 20% when price drops 5%. Catches medium-sized corrections. Most balanced dip buying option. Can combine with stop loss.',
    buy_dip_7: 'Buy 30% when price drops 7%. Uses bigger corrections as opportunity. Triggers less often but better entry price. Requires patience.',
    buy_dip_10: 'Aggressive 40% buy when price drops 10%. Significant position on sharp corrections. Rarely triggers. Good results in bull markets, careful in bear.',
    buy_dip_15: 'Max 60% buy when price crashes 15%. Active during flash crash or panic selling. Very rare but huge opportunity. Risk management essential.',
    // Volatility
    volatility_squeeze: 'Buy 20% when price moves 4% in a day. Quiet market breakout strategy - low volatility periods usually end with big moves. Direction irrelevant.',
    mean_reversion: 'Buy 35% when price drops 8%. Extreme selloffs usually revert to mean. Statistical arbitrage logic. May lose on trend change - stop loss required.',
    // Reversal
    reversal_rsi_bounce: 'Buy 20% when RSI below 35. Trend reversal signal - expects recovery from oversold. More conservative RSI strategy, doesn\'t wait for 30.',
    reversal_profit_take: 'Sell 30% of position when up 15%. Profit locking strategy - doesn\'t sell all, continues gaining if uptrend continues. Ideal for risk management.',
    // Scalper
    scalper_quick_profit: 'Auto sell at 5% profit, 2% stop loss. Classic scalping - small but quick gains. 2.5:1 risk/reward ratio. Many trades, low unit profit.',
    scalper_ultra_quick: 'Sell at 3% profit, 1% stop. Most aggressive scalping - very short hold time. High transaction cost risk. Effective on high volume liquid assets.',
    aggressive_all_in: 'Invest all cash when price rises 5%, protected by 3% trailing stop. Max position on momentum surf. Big gain if trend continues, trailing protects.',
    quick_flip: 'Buy 80% when price drops 5%, 8% profit target, 3% stop loss. Dip buy and quick sell strategy. Recovery expected - careful in bear markets.',
    momentum_burst: 'Enter 70% when volume spikes 2.5x, 12% profit target, 4% trailing stop. Volume spike = big move expected. Pump hunter but controlled risk.',
    rsi_sniper: 'Buy 60% when RSI drops below 20. Extreme oversold - rare but high probability recovery. 10% profit target, 4% stop. Precise entry.',
    breakout_rider: 'Enter 75% when price rises 7%, follow with 5% trailing stop. Catch strong breakout and stay as trend continues. Trailing protects profit.',
    panic_buy: 'Enter with all cash when price crashes 15%. 20% profit target, 10% stop. Flash crash opportunism - buy when everyone sells. Very rare but huge potential.',
    swing_trader: 'Buy 80% when price crosses above 9-day EMA, sell all when below. Short-term swing trade - quick entry/exit. Uses EMA\'s fast reaction.',
    double_down: 'Buy 50% more every 10% drop. Martingale-like - increase position on dip. Big gain on recovery, but dangerous in continued decline. Limited budget.',
    pump_catcher: 'Enter 90% when volume spikes 4x. Big pump catching strategy. 15% profit target, 5% trailing. Could be manipulation - quick exit required.',
    day_trader_combo: 'Buy 60% when RSI below 35 AND volume 1.5x. Dual confirmation - both momentum and volume signal. 8% profit, 3% stop. Low false signal risk.',
    // Protection
    stop_loss_5: 'Sell all at 5% loss. Tight risk control - exit with small loss. May trigger often on volatile assets. For scalpers and short-term trades.',
    stop_loss_7: 'Sell all at 7% loss. Medium frequency stop - allows some tolerance for daily fluctuations. General purpose protection strategy.',
    stop_loss_10: 'Sell all at 10% loss. Standard stop loss level - suitable for most investment strategies. Tolerates normal market fluctuations.',
    stop_loss_15: 'Sell all at 15% loss. Wide tolerance - allows big fluctuations. For long-term investments or volatile assets. Higher loss risk.',
    take_profit_10: 'Sell all at 10% profit. Reasonable profit target - quick profit realization. Accumulate small but consistent gains. May miss big rallies.',
    take_profit_15: 'Sell all at 15% profit. Medium-term profit target - requires a bit more patience. Offers balanced risk/reward ratio.',
    take_profit_20: 'Sell all at 20% profit. Ambitious profit target - expects strong uptrend. Triggers less often but bigger profit. Requires patience.',
    take_profit_30: 'Sell all at 30% profit. Big target - requires long-term holding. Ideal in bull markets, may not trigger in sideways. Combine with trailing stop.',
    trailing_stop_3: 'Sell if price drops 3% from peak. Dynamic protection - stop rises as profit rises. Tight trailing, early exit risk in volatile markets.',
    trailing_stop_5: 'Sell if price drops 5% from peak. Most popular trailing stop level - protects profit, tolerates small fluctuations. Compatible with most strategies.',
    trailing_stop_7: 'Sell if price drops 7% from peak. Wide trailing - helps stay in big trends. Tolerates corrections but gives back more profit.',
  },
};

export type TranslationKeys = typeof en;
