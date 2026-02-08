import { StrategyBlock } from '../types';
import { theme } from './theme';

export interface PresetStrategy {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  riskLevel: 'low' | 'medium' | 'high';
  category: 'trend' | 'momentum' | 'value' | 'dca' | 'protection' | 'volatility' | 'reversal' | 'scalper';
  blocks: StrategyBlock[];
  enabled: boolean;
}

export const presetStrategies: PresetStrategy[] = [
  // ============ DCA Stratejileri ============
  {
    id: 'dca_weekly',
    name: 'Haftalik DCA',
    description: 'Her pazartesi kasanin %10\'u ile otomatik alim. Fiyat dalgalanmalarindan etkilenmeden duzgun maliyet ortalamasi olusturur. Uzun vadeli yatirimcilar icin ideal.',
    icon: '📅',
    color: '#3B82F6',
    riskLevel: 'low',
    category: 'dca',
    enabled: false,
    blocks: [
      {
        id: 'dca_weekly_1',
        type: 'trigger',
        name: 'WHEN_DATE',
        params: { interval: 'weekly', dayOfWeek: 'monday' },
        children: [
          { id: 'dca_weekly_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 10 } },
        ],
      },
    ],
  },
  {
    id: 'dca_biweekly',
    name: 'Iki Haftalik DCA',
    description: 'Her 2 haftada bir kasanin %15\'i ile alim. Haftalik DCA\'dan daha az islem ucreti oderken benzer maliyet ortalamasi saglar. Orta vadeli birikim icin uygun.',
    icon: '📆',
    color: '#6366F1',
    riskLevel: 'low',
    category: 'dca',
    enabled: false,
    blocks: [
      {
        id: 'dca_biweekly_1',
        type: 'trigger',
        name: 'WHEN_DATE',
        params: { interval: 'biweekly' },
        children: [
          { id: 'dca_biweekly_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 15 } },
        ],
      },
    ],
  },
  {
    id: 'dca_monthly',
    name: 'Aylik DCA',
    description: 'Her ayin 1\'inde kasanin %20\'si ile alim. Maas gunu yatirimi gibi dusunun - duzenli geliri olan yatirimcilar icin pratik. En dusuk islem maliyeti.',
    icon: '🗓️',
    color: '#8B5CF6',
    riskLevel: 'low',
    category: 'dca',
    enabled: false,
    blocks: [
      {
        id: 'dca_monthly_1',
        type: 'trigger',
        name: 'WHEN_DATE',
        params: { interval: 'monthly', dayOfMonth: 1 },
        children: [
          { id: 'dca_monthly_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 20 } },
        ],
      },
    ],
  },

  // ============ Trend Stratejileri ============
  {
    id: 'trend_ma_cross_20',
    name: 'MA20 Kesisimi',
    description: 'Fiyat 20 gunluk ortalamayı yukari kesince kasanin %50\'si ile al, asagi kesince tum pozisyonu sat. Kisa vadeli trendleri yakalar. Yan piyasada cok sinyal uretebilir.',
    icon: '📈',
    color: '#10B981',
    riskLevel: 'medium',
    category: 'trend',
    enabled: false,
    blocks: [
      {
        id: 'ma20_1',
        type: 'condition',
        name: 'IF_MOVING_AVG',
        params: { period: 20, type: 'sma', crossDirection: 'above' },
        children: [
          { id: 'ma20_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 50 } },
        ],
      },
      {
        id: 'ma20_3',
        type: 'condition',
        name: 'IF_MOVING_AVG',
        params: { period: 20, type: 'sma', crossDirection: 'below' },
        children: [
          { id: 'ma20_4', type: 'action', name: 'SELL_PERCENT', params: { percent: 100 } },
        ],
      },
    ],
  },
  {
    id: 'trend_ma_cross_50',
    name: 'MA50 Kesisimi',
    description: 'Fiyat 50 gunluk ortalamayı yukari kesince %40 al, asagi kesince sat. Daha uzun vadeli trendler icin. Daha az yanlis sinyal ama gecikme olabilir.',
    icon: '📊',
    color: '#059669',
    riskLevel: 'medium',
    category: 'trend',
    enabled: false,
    blocks: [
      {
        id: 'ma50_1',
        type: 'condition',
        name: 'IF_MOVING_AVG',
        params: { period: 50, type: 'sma', crossDirection: 'above' },
        children: [
          { id: 'ma50_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 40 } },
        ],
      },
      {
        id: 'ma50_3',
        type: 'condition',
        name: 'IF_MOVING_AVG',
        params: { period: 50, type: 'sma', crossDirection: 'below' },
        children: [
          { id: 'ma50_4', type: 'action', name: 'SELL_PERCENT', params: { percent: 100 } },
        ],
      },
    ],
  },
  {
    id: 'trend_ema_cross',
    name: 'EMA Kesisimi',
    description: '12 gunluk ustel hareketli ortalama (EMA) kullanir. EMA son fiyatlara daha fazla agirlik verir, bu yuzden SMA\'dan daha hizli tepki verir. Volatil piyasalar icin.',
    icon: '⚡',
    color: '#14B8A6',
    riskLevel: 'medium',
    category: 'trend',
    enabled: false,
    blocks: [
      {
        id: 'ema_1',
        type: 'condition',
        name: 'IF_MOVING_AVG',
        params: { period: 12, type: 'ema', crossDirection: 'above' },
        children: [
          { id: 'ema_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 60 } },
        ],
      },
      {
        id: 'ema_3',
        type: 'condition',
        name: 'IF_MOVING_AVG',
        params: { period: 12, type: 'ema', crossDirection: 'below' },
        children: [
          { id: 'ema_4', type: 'action', name: 'SELL_PERCENT', params: { percent: 100 } },
        ],
      },
    ],
  },
  {
    id: 'trend_breakout_3',
    name: 'Kirilim %3',
    description: 'Fiyat tek gunde %3 yukari hareket edince kasanin %25\'i ile al. Momentum baslangicini yakalar. Stop loss ile birlikte kullanin, aksi halde pump & dump riski.',
    icon: '🚀',
    color: '#F59E0B',
    riskLevel: 'high',
    category: 'trend',
    enabled: false,
    blocks: [
      {
        id: 'breakout3_1',
        type: 'trigger',
        name: 'WHEN_CHANGE_PERCENT',
        params: { percent: 3, direction: 'up' },
        children: [
          { id: 'breakout3_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 25 } },
        ],
      },
    ],
  },
  {
    id: 'trend_breakout_5',
    name: 'Kirilim %5',
    description: 'Fiyat tek gunde %5 yukari firladiginda kasanin %30\'u ile al. Guclu momentum sinyali. Cok nadir tetiklenir ama tetiklendiginde genellikle buyuk hareket baslar.',
    icon: '🔥',
    color: '#EF4444',
    riskLevel: 'high',
    category: 'trend',
    enabled: false,
    blocks: [
      {
        id: 'breakout5_1',
        type: 'trigger',
        name: 'WHEN_CHANGE_PERCENT',
        params: { percent: 5, direction: 'up' },
        children: [
          { id: 'breakout5_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 30 } },
        ],
      },
    ],
  },

  // ============ Momentum Stratejileri ============
  {
    id: 'rsi_oversold_30',
    name: 'RSI < 30',
    description: '14 gunluk RSI 30\'un altina dustugunde kasanin %25\'i ile al. RSI asiri satim bolgesi - fiyat genellikle toparlanir. Dusus trendinde erken giris riski var, stop loss ile kullanin.',
    icon: '📉',
    color: '#8B5CF6',
    riskLevel: 'medium',
    category: 'momentum',
    enabled: false,
    blocks: [
      {
        id: 'rsi30_1',
        type: 'condition',
        name: 'IF_RSI',
        params: { period: 14, operator: 'below', value: 30 },
        children: [
          { id: 'rsi30_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 25 } },
        ],
      },
    ],
  },
  {
    id: 'rsi_oversold_25',
    name: 'RSI < 25 Agresif',
    description: 'RSI 25\'in altinda ekstrem asiri satim. Kasanin %40\'i ile agresif alim. Cok nadir tetiklenir ama tetiklendiginde genellikle guclu toparlanma olur. Yuksek risk/odul orani.',
    icon: '💎',
    color: '#7C3AED',
    riskLevel: 'high',
    category: 'momentum',
    enabled: false,
    blocks: [
      {
        id: 'rsi25_1',
        type: 'condition',
        name: 'IF_RSI',
        params: { period: 14, operator: 'below', value: 25 },
        children: [
          { id: 'rsi25_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 40 } },
        ],
      },
    ],
  },
  {
    id: 'rsi_overbought_70',
    name: 'RSI > 70',
    description: 'RSI 70\'in ustune ciktiginda pozisyonun %50\'sini sat. Asiri alim bolgesi - fiyat genellikle duser. Guclu yukselis trendinde erken cikis riski var.',
    icon: '📈',
    color: '#EC4899',
    riskLevel: 'medium',
    category: 'momentum',
    enabled: false,
    blocks: [
      {
        id: 'rsi70_1',
        type: 'condition',
        name: 'IF_RSI',
        params: { period: 14, operator: 'above', value: 70 },
        children: [
          { id: 'rsi70_2', type: 'action', name: 'SELL_PERCENT', params: { percent: 50 } },
        ],
      },
    ],
  },
  {
    id: 'rsi_overbought_80',
    name: 'RSI > 80 Agresif',
    description: 'RSI 80\'in ustunde ekstrem asiri alim. Pozisyonun %75\'ini sat. Cok nadir olur ama genellikle sert duzeltme oncesi gosterge. Kar realizasyonu icin ideal.',
    icon: '🎯',
    color: '#DB2777',
    riskLevel: 'high',
    category: 'momentum',
    enabled: false,
    blocks: [
      {
        id: 'rsi80_1',
        type: 'condition',
        name: 'IF_RSI',
        params: { period: 14, operator: 'above', value: 80 },
        children: [
          { id: 'rsi80_2', type: 'action', name: 'SELL_PERCENT', params: { percent: 75 } },
        ],
      },
    ],
  },
  {
    id: 'volume_spike_1_5x',
    name: 'Hacim 1.5x',
    description: 'Islem hacmi 20 gunluk ortalamanin 1.5 katina ulasinca kasanin %15\'i ile al. Artan ilgi gostergesi - genellikle fiyat hareketi oncusu. Konservatif hacim stratejisi.',
    icon: '📶',
    color: '#14B8A6',
    riskLevel: 'medium',
    category: 'momentum',
    enabled: false,
    blocks: [
      {
        id: 'vol15_1',
        type: 'condition',
        name: 'IF_VOLUME',
        params: { multiplier: 1.5, period: 20 },
        children: [
          { id: 'vol15_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 15 } },
        ],
      },
    ],
  },
  {
    id: 'volume_spike_2x',
    name: 'Hacim 2x',
    description: 'Hacim ortalamanin 2 katina firladiginda kasanin %25\'i ile al. Kurumsal ilgi veya onemli haber sinyali. Pump baslangici olabilir - trailing stop ile kullanin.',
    icon: '🔊',
    color: '#0D9488',
    riskLevel: 'high',
    category: 'momentum',
    enabled: false,
    blocks: [
      {
        id: 'vol2_1',
        type: 'condition',
        name: 'IF_VOLUME',
        params: { multiplier: 2, period: 20 },
        children: [
          { id: 'vol2_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 25 } },
        ],
      },
    ],
  },
  {
    id: 'volume_spike_3x',
    name: 'Hacim 3x Ekstrem',
    description: 'Hacim ortalamanin 3 katina ulastiginda kasanin %35\'i ile al. Nadir olay - buyuk haber veya manipulasyon. Yuksek risk ama buyuk kazanc potansiyeli. Hemen stop koyun.',
    icon: '💥',
    color: '#0F766E',
    riskLevel: 'high',
    category: 'momentum',
    enabled: false,
    blocks: [
      {
        id: 'vol3_1',
        type: 'condition',
        name: 'IF_VOLUME',
        params: { multiplier: 3, period: 20 },
        children: [
          { id: 'vol3_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 35 } },
        ],
      },
    ],
  },

  // ============ Value / Dip Stratejileri ============
  {
    id: 'buy_dip_3',
    name: 'Dip Alimi %3',
    description: 'Fiyat tek gunde %3 dustugunde kasanin %15\'i ile al. Kucuk duzeltmeleri deger firsati olarak kullanir. Sik tetiklenir, maliyeti ortalamaya yayar. Volatil piyasalarda etkili.',
    icon: '💰',
    color: '#22C55E',
    riskLevel: 'low',
    category: 'value',
    enabled: false,
    blocks: [
      {
        id: 'dip3_1',
        type: 'trigger',
        name: 'WHEN_CHANGE_PERCENT',
        params: { percent: 3, direction: 'down' },
        children: [
          { id: 'dip3_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 15 } },
        ],
      },
    ],
  },
  {
    id: 'buy_dip_5',
    name: 'Dip Alimi %5',
    description: 'Fiyat %5 dustugunde kasanin %20\'si ile al. Orta olcekli duzeltmeleri yakalar. Dip alimi stratejilerinin en dengeli secenegi. Stop loss ile kombine edilebilir.',
    icon: '💵',
    color: '#16A34A',
    riskLevel: 'medium',
    category: 'value',
    enabled: false,
    blocks: [
      {
        id: 'dip5_1',
        type: 'trigger',
        name: 'WHEN_CHANGE_PERCENT',
        params: { percent: 5, direction: 'down' },
        children: [
          { id: 'dip5_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 20 } },
        ],
      },
    ],
  },
  {
    id: 'buy_dip_7',
    name: 'Dip Alimi %7',
    description: 'Fiyat %7 dustugunde kasanin %30\'u ile al. Buyuk duzeltmeleri firsat olarak kullanir. Daha az tetiklenir ama daha iyi fiyattan giris saglar. Sabir gerektirir.',
    icon: '💸',
    color: '#15803D',
    riskLevel: 'medium',
    category: 'value',
    enabled: false,
    blocks: [
      {
        id: 'dip7_1',
        type: 'trigger',
        name: 'WHEN_CHANGE_PERCENT',
        params: { percent: 7, direction: 'down' },
        children: [
          { id: 'dip7_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 30 } },
        ],
      },
    ],
  },
  {
    id: 'buy_dip_10',
    name: 'Buyuk Dip %10',
    description: 'Fiyat %10 dustugunde kasanin %40\'i ile agresif al. Sert duzeltmelerde onemli pozisyon. Nadiren tetiklenir. Yukselen piyasalarda iyi sonuc verir, dusen piyasada dikkat.',
    icon: '🎯',
    color: '#166534',
    riskLevel: 'high',
    category: 'value',
    enabled: false,
    blocks: [
      {
        id: 'dip10_1',
        type: 'trigger',
        name: 'WHEN_CHANGE_PERCENT',
        params: { percent: 10, direction: 'down' },
        children: [
          { id: 'dip10_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 40 } },
        ],
      },
    ],
  },
  {
    id: 'buy_dip_15',
    name: 'Crash Alimi %15',
    description: 'Fiyat %15 crash yaptiginda kasanin %60\'i ile maksimum al. Flash crash veya panik satis aninda aktif olur. Cok nadir ama buyuk firsat. Risk yonetimi sart.',
    icon: '🦈',
    color: '#14532D',
    riskLevel: 'high',
    category: 'value',
    enabled: false,
    blocks: [
      {
        id: 'dip15_1',
        type: 'trigger',
        name: 'WHEN_CHANGE_PERCENT',
        params: { percent: 15, direction: 'down' },
        children: [
          { id: 'dip15_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 60 } },
        ],
      },
    ],
  },

  // ============ Volatilite Stratejileri ============
  {
    id: 'volatility_squeeze',
    name: 'Volatilite Sikismasi',
    description: 'Fiyat tek gunde %4 hareket ettiginde kasanin %20\'si ile al. Sakin piyasa sonrasi patlama stratejisi - dusuk volatilite donemleri genellikle buyuk hareketlerle biter. Yon fark etmez.',
    icon: '🎪',
    color: '#F97316',
    riskLevel: 'high',
    category: 'volatility',
    enabled: false,
    blocks: [
      {
        id: 'volsq_1',
        type: 'trigger',
        name: 'WHEN_CHANGE_PERCENT',
        params: { percent: 4, direction: 'both' },
        children: [
          { id: 'volsq_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 20 } },
        ],
      },
    ],
  },
  {
    id: 'mean_reversion',
    name: 'Ortalamaya Donus',
    description: 'Fiyat %8 dustugunde kasanin %35\'i ile al. Asiri satislar genellikle ortalamaya doner. Istatistiksel arbitraj mantigi. Trend degisiminde zarar edebilir - stop loss zorunlu.',
    icon: '🔄',
    color: '#EA580C',
    riskLevel: 'high',
    category: 'volatility',
    enabled: false,
    blocks: [
      {
        id: 'mr_1',
        type: 'trigger',
        name: 'WHEN_CHANGE_PERCENT',
        params: { percent: 8, direction: 'down' },
        children: [
          { id: 'mr_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 35 } },
        ],
      },
    ],
  },

  // ============ Reversal Stratejileri ============
  {
    id: 'reversal_rsi_bounce',
    name: 'RSI Bounce',
    description: 'RSI 35\'in altindayken kasanin %20\'si ile al. Trend donusu sinyali - asiri satimdan toparlanma beklentisi. Daha konservatif RSI stratejisi, 30 seviyesini beklemez.',
    icon: '🔃',
    color: '#A855F7',
    riskLevel: 'medium',
    category: 'reversal',
    enabled: false,
    blocks: [
      {
        id: 'rsib_1',
        type: 'condition',
        name: 'IF_RSI',
        params: { period: 14, operator: 'below', value: 35 },
        children: [
          { id: 'rsib_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 20 } },
        ],
      },
    ],
  },
  {
    id: 'reversal_profit_take',
    name: 'Kar Realizasyonu',
    description: 'Pozisyon %15 kara ulastiginda pozisyonun %30\'unu sat. Kari kitleme stratejisi - tum pozisyonu satmaz, yukselis devam ederse kazanmaya devam eder. Risk yonetimi icin ideal.',
    icon: '🎁',
    color: '#9333EA',
    riskLevel: 'low',
    category: 'reversal',
    enabled: false,
    blocks: [
      {
        id: 'rpt_1',
        type: 'condition',
        name: 'IF_PROFIT',
        params: { type: 'profit', percent: 15 },
        children: [
          { id: 'rpt_2', type: 'action', name: 'SELL_PERCENT', params: { percent: 30 } },
        ],
      },
    ],
  },

  // ============ Scalper / Kisa Vadeli Agresif Stratejiler ============
  {
    id: 'scalper_quick_profit',
    name: 'Hizli Kar %5',
    description: 'Pozisyon %5 kara ulasinca otomatik sat, %2 zararda stop. Klasik scalping - kucuk ama hizli karlar. Risk/odul orani 2.5:1. Cok sayida islem, dusuk birim kar.',
    icon: '⚡',
    color: '#FBBF24',
    riskLevel: 'high',
    category: 'scalper',
    enabled: false,
    blocks: [
      { id: 'sqp_1', type: 'modifier', name: 'TAKE_PROFIT', params: { percent: 5 } },
      { id: 'sqp_2', type: 'modifier', name: 'STOP_LOSS', params: { percent: 2 } },
    ],
  },
  {
    id: 'scalper_ultra_quick',
    name: 'Ultra Hizli %3',
    description: 'Pozisyon %3 karda sat, %1 stopla. En agresif scalping - cok kisa tutuş suresi. Yuksek islem maliyeti riski. Yuksek hacimli likit varliklarda etkili.',
    icon: '🏎️',
    color: '#F59E0B',
    riskLevel: 'high',
    category: 'scalper',
    enabled: false,
    blocks: [
      { id: 'suq_1', type: 'modifier', name: 'TAKE_PROFIT', params: { percent: 3 } },
      { id: 'suq_2', type: 'modifier', name: 'STOP_LOSS', params: { percent: 1 } },
    ],
  },
  {
    id: 'aggressive_all_in',
    name: 'All-In Momentum',
    description: 'Fiyat %5 yukselince tum kasayi yatir, %3 trailing stop ile koruma. Momentum surfunde maksimum pozisyon. Trend devam ederse buyuk kar, yoksa trailing stop korur.',
    icon: '🎰',
    color: '#DC2626',
    riskLevel: 'high',
    category: 'scalper',
    enabled: false,
    blocks: [
      {
        id: 'aai_1',
        type: 'trigger',
        name: 'WHEN_CHANGE_PERCENT',
        params: { percent: 5, direction: 'up' },
        children: [
          { id: 'aai_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 100 } },
        ],
      },
      { id: 'aai_3', type: 'modifier', name: 'TRAILING_STOP', params: { percent: 3 } },
    ],
  },
  {
    id: 'quick_flip',
    name: 'Hizli Flip',
    description: 'Fiyat %5 dustugunde kasanin %80\'i ile al, %8 kar hedefi, %3 stop loss. Dip alip hizli sat stratejisi. Toparlanma beklentisi - ayı piyasasinda dikkatli kullan.',
    icon: '🔄',
    color: '#10B981',
    riskLevel: 'high',
    category: 'scalper',
    enabled: false,
    blocks: [
      {
        id: 'qf_1',
        type: 'trigger',
        name: 'WHEN_CHANGE_PERCENT',
        params: { percent: 5, direction: 'down' },
        children: [
          { id: 'qf_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 80 } },
        ],
      },
      { id: 'qf_3', type: 'modifier', name: 'TAKE_PROFIT', params: { percent: 8 } },
      { id: 'qf_4', type: 'modifier', name: 'STOP_LOSS', params: { percent: 3 } },
    ],
  },
  {
    id: 'momentum_burst',
    name: 'Momentum Patlama',
    description: 'Hacim 2.5 katina cikinca kasanin %70\'i ile gir, %12 kar hedefi, %4 trailing stop. Hacim patlamasi = buyuk hareket beklentisi. Pump avcisi ama kontrollu risk.',
    icon: '💥',
    color: '#7C3AED',
    riskLevel: 'high',
    category: 'scalper',
    enabled: false,
    blocks: [
      {
        id: 'mb_1',
        type: 'condition',
        name: 'IF_VOLUME',
        params: { multiplier: 2.5, period: 20 },
        children: [
          { id: 'mb_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 70 } },
        ],
      },
      { id: 'mb_3', type: 'modifier', name: 'TAKE_PROFIT', params: { percent: 12 } },
      { id: 'mb_4', type: 'modifier', name: 'TRAILING_STOP', params: { percent: 4 } },
    ],
  },
  {
    id: 'rsi_sniper',
    name: 'RSI Sniper',
    description: 'RSI 20\'nin altina dustugunde kasanin %60\'i ile al. Ekstrem asiri satim - nadir ama yuksek olasilikli toparlanma. %10 kar hedefi, %4 stop. Hassas giris.',
    icon: '🎯',
    color: '#8B5CF6',
    riskLevel: 'high',
    category: 'scalper',
    enabled: false,
    blocks: [
      {
        id: 'rs_1',
        type: 'condition',
        name: 'IF_RSI',
        params: { period: 14, operator: 'below', value: 20 },
        children: [
          { id: 'rs_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 60 } },
        ],
      },
      { id: 'rs_3', type: 'modifier', name: 'TAKE_PROFIT', params: { percent: 10 } },
      { id: 'rs_4', type: 'modifier', name: 'STOP_LOSS', params: { percent: 4 } },
    ],
  },
  {
    id: 'breakout_rider',
    name: 'Kirilim Surucusu',
    description: 'Fiyat %7 yukselince kasanin %75\'i ile gir, %5 trailing stop ile takip et. Guclu kirilimi yakala ve trend devam ettikce kal. Trailing stop karı korur.',
    icon: '🚀',
    color: '#EF4444',
    riskLevel: 'high',
    category: 'scalper',
    enabled: false,
    blocks: [
      {
        id: 'br_1',
        type: 'trigger',
        name: 'WHEN_CHANGE_PERCENT',
        params: { percent: 7, direction: 'up' },
        children: [
          { id: 'br_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 75 } },
        ],
      },
      { id: 'br_3', type: 'modifier', name: 'TRAILING_STOP', params: { percent: 5 } },
    ],
  },
  {
    id: 'panic_buy',
    name: 'Panik Alimi',
    description: 'Fiyat %15 crash yaptiginda tum kasayla gir. %20 kar hedefi, %10 stop. Flash crash firsatciligi - herkes satarken al. Cok nadir ama devasa potansiyel.',
    icon: '🦈',
    color: '#059669',
    riskLevel: 'high',
    category: 'scalper',
    enabled: false,
    blocks: [
      {
        id: 'pb_1',
        type: 'trigger',
        name: 'WHEN_CHANGE_PERCENT',
        params: { percent: 15, direction: 'down' },
        children: [
          { id: 'pb_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 100 } },
        ],
      },
      { id: 'pb_3', type: 'modifier', name: 'TAKE_PROFIT', params: { percent: 20 } },
      { id: 'pb_4', type: 'modifier', name: 'STOP_LOSS', params: { percent: 10 } },
    ],
  },
  {
    id: 'swing_trader',
    name: 'Swing Trader',
    description: 'Fiyat 9 gunluk EMA\'yi yukari kesince kasanin %80\'i ile al, asagi kesince tamamini sat. Kisa vadeli swing trade - hizli giris cikis. EMA\'nin hizli tepkisini kullanir.',
    icon: '🎢',
    color: '#06B6D4',
    riskLevel: 'high',
    category: 'scalper',
    enabled: false,
    blocks: [
      {
        id: 'st_1',
        type: 'condition',
        name: 'IF_MOVING_AVG',
        params: { period: 9, type: 'ema', crossDirection: 'above' },
        children: [
          { id: 'st_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 80 } },
        ],
      },
      {
        id: 'st_3',
        type: 'condition',
        name: 'IF_MOVING_AVG',
        params: { period: 9, type: 'ema', crossDirection: 'below' },
        children: [
          { id: 'st_4', type: 'action', name: 'SELL_PERCENT', params: { percent: 100 } },
        ],
      },
    ],
  },
  {
    id: 'double_down',
    name: 'Double Down',
    description: 'Fiyat %10 her dustugunde kasanin %50\'si ile al. Martingale benzeri - dususte pozisyon artir. Toparlanmada buyuk kar, ama devam eden dususte tehlikeli. Sinirli butce ile.',
    icon: '✌️',
    color: '#84CC16',
    riskLevel: 'high',
    category: 'scalper',
    enabled: false,
    blocks: [
      {
        id: 'dd_1',
        type: 'trigger',
        name: 'WHEN_CHANGE_PERCENT',
        params: { percent: 10, direction: 'down' },
        children: [
          { id: 'dd_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 50 } },
        ],
      },
    ],
  },
  {
    id: 'pump_catcher',
    name: 'Pump Avcisi',
    description: 'Hacim 4 katina firladiginda kasanin %90\'i ile gir. Buyuk pump yakalama stratejisi. %15 kar hedefi, %5 trailing. Manipulasyon olabilir - hizli cikis zorunlu.',
    icon: '🎣',
    color: '#EC4899',
    riskLevel: 'high',
    category: 'scalper',
    enabled: false,
    blocks: [
      {
        id: 'pc_1',
        type: 'condition',
        name: 'IF_VOLUME',
        params: { multiplier: 4, period: 20 },
        children: [
          { id: 'pc_2', type: 'action', name: 'BUY_PERCENT', params: { percent: 90 } },
        ],
      },
      { id: 'pc_3', type: 'modifier', name: 'TAKE_PROFIT', params: { percent: 15 } },
      { id: 'pc_4', type: 'modifier', name: 'TRAILING_STOP', params: { percent: 5 } },
    ],
  },
  {
    id: 'day_trader_combo',
    name: 'Gunluk Trader',
    description: 'RSI 35\'in altinda VE hacim 1.5 katinda kasanin %60\'i ile al. Cift onay sistemi - hem momentum hem hacim sinyali. %8 kar, %3 stop. Yanlis sinyal riski dusuk.',
    icon: '📆',
    color: '#6366F1',
    riskLevel: 'high',
    category: 'scalper',
    enabled: false,
    blocks: [
      {
        id: 'dtc_1',
        type: 'condition',
        name: 'IF_RSI',
        params: { period: 14, operator: 'below', value: 35 },
        children: [
          {
            id: 'dtc_2',
            type: 'condition',
            name: 'IF_VOLUME',
            params: { multiplier: 1.5, period: 20 },
            children: [
              { id: 'dtc_3', type: 'action', name: 'BUY_PERCENT', params: { percent: 60 } },
            ],
          },
        ],
      },
      { id: 'dtc_4', type: 'modifier', name: 'TAKE_PROFIT', params: { percent: 8 } },
      { id: 'dtc_5', type: 'modifier', name: 'STOP_LOSS', params: { percent: 3 } },
    ],
  },

  // ============ Koruma Stratejileri ============
  {
    id: 'stop_loss_5',
    name: 'Stop Loss %5',
    description: 'Pozisyon %5 zarara dustugunde tamamini sat. Siki risk kontrolu - kucuk zararla cik. Volatil varliklarda sik tetiklenebilir. Scalper ve kisa vadeli islemler icin.',
    icon: '🛡️',
    color: '#EF4444',
    riskLevel: 'low',
    category: 'protection',
    enabled: false,
    blocks: [
      { id: 'sl5_1', type: 'modifier', name: 'STOP_LOSS', params: { percent: 5 } },
    ],
  },
  {
    id: 'stop_loss_7',
    name: 'Stop Loss %7',
    description: 'Pozisyon %7 zararda tamamini sat. Orta siklikta stop - gunluk dalgalanmalara biraz tolerans tanir. Genel amacli koruma stratejisi.',
    icon: '🔒',
    color: '#DC2626',
    riskLevel: 'low',
    category: 'protection',
    enabled: false,
    blocks: [
      { id: 'sl7_1', type: 'modifier', name: 'STOP_LOSS', params: { percent: 7 } },
    ],
  },
  {
    id: 'stop_loss_10',
    name: 'Stop Loss %10',
    description: 'Pozisyon %10 zararda tamamini sat. Standart stop loss seviyesi - cogu yatirim stratejisi icin uygun. Normal piyasa dalgalanmalarini tolere eder.',
    icon: '🚫',
    color: '#B91C1C',
    riskLevel: 'low',
    category: 'protection',
    enabled: false,
    blocks: [
      { id: 'sl10_1', type: 'modifier', name: 'STOP_LOSS', params: { percent: 10 } },
    ],
  },
  {
    id: 'stop_loss_15',
    name: 'Stop Loss %15',
    description: 'Pozisyon %15 zararda tamamini sat. Genis tolerans - buyuk dalgalanmalara izin verir. Uzun vadeli yatirimlar veya volatil varliklar icin. Daha buyuk zarar riski.',
    icon: '⛔',
    color: '#991B1B',
    riskLevel: 'medium',
    category: 'protection',
    enabled: false,
    blocks: [
      { id: 'sl15_1', type: 'modifier', name: 'STOP_LOSS', params: { percent: 15 } },
    ],
  },
  {
    id: 'take_profit_10',
    name: 'Kar Al %10',
    description: 'Pozisyon %10 kara ulasinca tamamini sat. Makul kar hedefi - hizli kar realizasyonu. Kucuk ama tutarli karlar biriktirmek icin. Buyuk rallileri kacirabilir.',
    icon: '🎉',
    color: '#22C55E',
    riskLevel: 'low',
    category: 'protection',
    enabled: false,
    blocks: [
      { id: 'tp10_1', type: 'modifier', name: 'TAKE_PROFIT', params: { percent: 10 } },
    ],
  },
  {
    id: 'take_profit_15',
    name: 'Kar Al %15',
    description: 'Pozisyon %15 karda tamamini sat. Orta vadeli kar hedefi - biraz daha sabir gerektirir. Dengeli risk/odul orani sunar.',
    icon: '💎',
    color: '#16A34A',
    riskLevel: 'low',
    category: 'protection',
    enabled: false,
    blocks: [
      { id: 'tp15_1', type: 'modifier', name: 'TAKE_PROFIT', params: { percent: 15 } },
    ],
  },
  {
    id: 'take_profit_20',
    name: 'Kar Al %20',
    description: 'Pozisyon %20 karda tamamini sat. Iddiali kar hedefi - guclu yukselis beklentisi. Daha az siklıkta tetiklenir ama daha buyuk kar. Sabir gerektirir.',
    icon: '🏆',
    color: '#15803D',
    riskLevel: 'low',
    category: 'protection',
    enabled: false,
    blocks: [
      { id: 'tp20_1', type: 'modifier', name: 'TAKE_PROFIT', params: { percent: 20 } },
    ],
  },
  {
    id: 'take_profit_30',
    name: 'Kar Al %30',
    description: 'Pozisyon %30 karda tamamini sat. Buyuk hedef - uzun vadeli tutus gerektirir. Boga piyasasinda ideal, yan piyasada tetiklenmeyebilir. Trailing stop ile kombine edin.',
    icon: '👑',
    color: '#166534',
    riskLevel: 'medium',
    category: 'protection',
    enabled: false,
    blocks: [
      { id: 'tp30_1', type: 'modifier', name: 'TAKE_PROFIT', params: { percent: 30 } },
    ],
  },
  {
    id: 'trailing_stop_3',
    name: 'Trailing Stop %3',
    description: 'Fiyat zirve yaptiktan sonra %3 duserse sat. Dinamik koruma - kar yukselirken stop da yukselir. Sıkı takip, volatil piyasalarda erken cikis riski.',
    icon: '📍',
    color: '#F97316',
    riskLevel: 'low',
    category: 'protection',
    enabled: false,
    blocks: [
      { id: 'ts3_1', type: 'modifier', name: 'TRAILING_STOP', params: { percent: 3 } },
    ],
  },
  {
    id: 'trailing_stop_5',
    name: 'Trailing Stop %5',
    description: 'Fiyat zirveden %5 duserse sat. En populer trailing stop seviyesi - kar korur, ufak dalgalanmalara tolerans tanir. Cogu strateji ile uyumlu.',
    icon: '🎯',
    color: '#EA580C',
    riskLevel: 'low',
    category: 'protection',
    enabled: false,
    blocks: [
      { id: 'ts5_1', type: 'modifier', name: 'TRAILING_STOP', params: { percent: 5 } },
    ],
  },
  {
    id: 'trailing_stop_7',
    name: 'Trailing Stop %7',
    description: 'Fiyat zirveden %7 duserse sat. Genis trailing - buyuk trendlerde pozisyonda kalmayi saglar. Duzeltmelere tolerans tanir ama daha fazla kar geri verir.',
    icon: '🔖',
    color: '#C2410C',
    riskLevel: 'medium',
    category: 'protection',
    enabled: false,
    blocks: [
      { id: 'ts7_1', type: 'modifier', name: 'TRAILING_STOP', params: { percent: 7 } },
    ],
  },
];

export const strategyCategories = [
  { id: 'all', name: 'Tumu', icon: '🔥' },
  { id: 'scalper', name: 'Scalper', icon: '⚡' },
  { id: 'momentum', name: 'Momentum', icon: '📊' },
  { id: 'trend', name: 'Trend', icon: '📈' },
  { id: 'value', name: 'Dip Alim', icon: '💰' },
  { id: 'reversal', name: 'Donus', icon: '🔄' },
  { id: 'volatility', name: 'Volatilite', icon: '🎪' },
  { id: 'dca', name: 'DCA', icon: '📅' },
  { id: 'protection', name: 'Koruma', icon: '🛡️' },
];

export const riskLevelLabels = {
  low: { label: 'Dusuk Risk', color: '#22C55E' },
  medium: { label: 'Orta Risk', color: '#F59E0B' },
  high: { label: 'Yuksek Risk', color: '#EF4444' },
};
