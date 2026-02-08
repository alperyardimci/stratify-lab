import { TranslationKeys } from './en';

export const tr: TranslationKeys = {
  // Common
  common: {
    loading: 'Yükleniyor...',
    error: 'Hata',
    success: 'Başarılı',
    cancel: 'İptal',
    confirm: 'Onayla',
    close: 'Kapat',
    done: 'Tamam',
    clear: 'Temizle',
    apply: 'Uygula',
    save: 'Kaydet',
    delete: 'Sil',
    edit: 'Düzenle',
    back: 'Geri',
    next: 'İleri',
    yes: 'Evet',
    no: 'Hayır',
    ok: 'Tamam',
    settings: 'Ayarlar',
    language: 'Dil',
  },

  // Chart
  chart: {
    noData: 'Veri bulunamadı',
    buy: 'Alış',
    sell: 'Satış',
    priceChart: 'Fiyat Grafiği',
  },

  // Simulator Screen
  simulator: {
    title: 'Simülasyon',
    subtitle: 'Strateji performansını geçmiş verilerde test edin',

    // Active Strategies
    strategiesActive: '{count} Strateji Aktif',
    noStrategySelected: 'Strateji seçilmedi. "En İyi Stratejiyi Bul" ile otomatik öneri alın.',

    // Asset Selection
    assetSelection: 'Varlık Seçimi',
    assetType: 'Varlık Tipi',
    stock: 'Hisse Senedi',
    crypto: 'Kripto',
    forex: 'Döviz/Altın',
    selectAsset: 'Varlık seçin...',
    selectCrypto: 'Kripto seçin...',
    cryptoMultiSelect: 'Kripto Para (birden fazla seçebilirsiniz)',
    cryptosSelected: '{count} kripto seçildi',

    // Investment Details
    investmentDetails: 'Yatırım Detayları',
    investmentAmount: 'Yatırım Miktarı ($)',
    timeRange: 'Zaman Aralığı',

    // Time Periods
    periods: {
      '1w': '1 Hafta',
      '1m': '1 Ay',
      '3m': '3 Ay',
      '6m': '6 Ay',
      '1y': '1 Yıl',
      '2y': '2 Yıl',
    },

    // Buttons
    findBestStrategy: 'En İyi Stratejiyi Bul',
    analyzing: 'Analiz Ediliyor...',
    startSimulation: 'Simülasyonu Başlat',
    simulating: 'Simüle Ediliyor...',

    // Results
    portfolioSummary: 'Portföy Özeti',
    initial: 'Başlangıç',
    portfolioValue: 'Portföy Değeri',
    profitLoss: 'Kâr/Zarar',
    currentPositions: 'Mevcut Pozisyonlar',
    cash: 'Kasa',
    assetBasedSummary: 'Varlık Bazlı Özet',
    transactionHistory: 'İşlem Geçmişi (Kronolojik)',
    events: 'olay',
    buys: 'alım',
    sells: 'satış',
    skipped: 'atlandı',
    showMore: '+{count} olay daha göster',
    collapse: 'Daralt',

    // Event Types
    eventTypes: {
      buy: 'ALIM',
      sell: 'SATIŞ',
      skip_buy: 'ALIM YOK',
      skip_sell: 'SATIŞ YOK',
    },

    // Transaction Details
    price: 'Fiyat',
    amount: 'Miktar',
    total: 'Tutar',
    afterTransaction: 'İşlem sonrası',

    // Alerts
    selectAssetAlert: 'Lütfen en az bir varlık seçin',
    validAmountAlert: 'Lütfen geçerli bir miktar girin',
    simulationFailed: 'Simülasyon başarısız oldu',
    strategyApplied: 'Önerilen strateji aktif edildi. Şimdi simülasyonu çalıştırabilirsiniz.',
  },

  // Optimization
  optimization: {
    title: 'Strateji Optimizasyonu',
    testing: 'Stratejiler Test Ediliyor...',
    analyzing: 'Piyasa Analiz Ediliyor...',
    phase1: 'Giriş Stratejileri Test Ediliyor',
    phase2: 'Kombinasyonlar Test Ediliyor',
    phase3: 'Koruma Ekleniyor',
    complete: 'Tamamlandı!',
    assetsUnifiedBudget: '{count} varlık, tek kasa (${amount})',
    profitableFound: '{count} kârlı strateji bulundu',
    bestSoFar: 'Şimdiye kadar en iyi:',
    bestStrategies: 'En İyi Stratejiler',
    combinationsTested: '{count} kombinasyon test edildi',
    progressTested: '{current}/{total} strateji test edildi',
    transactions: 'işlem',
    tapToApply: 'Uygulamak için dokun',
    best: 'EN İYİ',
    successRate: 'Başarı Oranı:',
    loadingData: '{name} verisi yükleniyor...',
    buyAndHold: 'Al ve Tut',
  },

  // Crypto Picker
  cryptoPicker: {
    title: 'Kripto Para Seç',
    selected: '{count} seçildi',
    clearAll: 'Temizle',
  },

  // Strategies Tab
  strategies: {
    title: 'Stratejiler',
    subtitle: 'Alım-satım stratejilerini seçin ve kombine edin',
    allCategories: 'Tümü',

    // Categories
    categories: {
      scalper: 'Scalper',
      momentum: 'Momentum',
      trend: 'Trend',
      value: 'Dip Alım',
      reversal: 'Dönüş',
      volatility: 'Volatilite',
      dca: 'DCA',
      protection: 'Koruma',
    },

    // Risk Levels
    riskLevels: {
      low: 'Düşük Risk',
      medium: 'Orta Risk',
      high: 'Yüksek Risk',
    },

    enabled: 'Aktif',
    disabled: 'Pasif',
  },

  // Settings
  settings: {
    title: 'Ayarlar',
    language: 'Dil',
    languageDescription: 'Tercih ettiğiniz dili seçin',
    theme: 'Tema',
    about: 'Hakkında',
    version: 'Sürüm',
    disclaimer: 'Sorumluluk Reddi',
    disclaimerTitle: '⚠️ Önemli Uyarı',
    disclaimerText: 'Bu uygulama yalnızca eğitim ve simülasyon amaçlıdır. Gösterilen sonuçlar gelecekteki performansı garanti etmez. Bu bir YATIRIM TAVSİYESİ DEĞİLDİR. Herhangi bir yatırım kararı vermeden önce mutlaka kendi araştırmanızı yapın ve yetkili bir finansal danışmana danışın. Geçmiş performans gelecekteki sonuçların göstergesi değildir. Yatırdığınız sermayenin bir kısmını veya tamamını kaybedebilirsiniz.',
    disclaimerAccept: 'Anladım',
  },

  // Engine Labels
  engine: {
    priceChange: 'Fiyat Değişimi',
    timing: 'Zamanlama',
    priceAbove: 'Fiyat Üstünde',
    priceBelow: 'Fiyat Altında',
    rsiStrategy: 'RSI Stratejisi',
    movingAverage: 'Hareketli Ortalama',
    volumeStrategy: 'Hacim Stratejisi',
    profitLoss: 'Kâr/Zarar',
    stopLoss: 'Stop Loss',
    takeProfit: 'Kâr Al',
    trailingStop: 'Trailing Stop',
    profit: 'Kâr',
    loss: 'Zarar',
    peak: 'Zirve',
    insufficientBalance: 'Yetersiz bakiye: $${cash} mevcut, $${required} gerekli',
    insufficientCash: 'Yetersiz bakiye: Kasada $${cash} var',
    cannotSell: 'Satılamadı: {symbol} pozisyonu yok',
    lossLimitExceeded: 'Zarar limiti %{percent} aşıldı, pozisyon kapatıldı',
  },

  // Strategy Names
  strategyNames: {
    // DCA
    dca_weekly: 'Haftalık DCA',
    dca_biweekly: 'İki Haftalık DCA',
    dca_monthly: 'Aylık DCA',
    // Trend
    trend_ma_cross_20: 'MA20 Kesişimi',
    trend_ma_cross_50: 'MA50 Kesişimi',
    trend_ema_cross: 'EMA Kesişimi',
    trend_breakout_3: 'Kırılım %3',
    trend_breakout_5: 'Kırılım %5',
    // Momentum
    rsi_oversold_30: 'RSI < 30',
    rsi_oversold_25: 'RSI < 25 Agresif',
    rsi_overbought_70: 'RSI > 70',
    rsi_overbought_80: 'RSI > 80 Agresif',
    volume_spike_1_5x: 'Hacim 1.5x',
    volume_spike_2x: 'Hacim 2x',
    volume_spike_3x: 'Hacim 3x Ekstrem',
    // Value / Dip
    buy_dip_3: 'Dip Alımı %3',
    buy_dip_5: 'Dip Alımı %5',
    buy_dip_7: 'Dip Alımı %7',
    buy_dip_10: 'Büyük Dip %10',
    buy_dip_15: 'Crash Alımı %15',
    // Volatility
    volatility_squeeze: 'Volatilite Sıkışması',
    mean_reversion: 'Ortalamaya Dönüş',
    // Reversal
    reversal_rsi_bounce: 'RSI Bounce',
    reversal_profit_take: 'Kâr Realizasyonu',
    // Scalper
    scalper_quick_profit: 'Hızlı Kâr %5',
    scalper_ultra_quick: 'Ultra Hızlı %3',
    aggressive_all_in: 'All-In Momentum',
    quick_flip: 'Hızlı Flip',
    momentum_burst: 'Momentum Patlama',
    rsi_sniper: 'RSI Sniper',
    breakout_rider: 'Kırılım Sürücüsü',
    panic_buy: 'Panik Alımı',
    swing_trader: 'Swing Trader',
    double_down: 'Double Down',
    pump_catcher: 'Pump Avcısı',
    day_trader_combo: 'Günlük Trader',
    // Protection
    stop_loss_5: 'Stop Loss %5',
    stop_loss_7: 'Stop Loss %7',
    stop_loss_10: 'Stop Loss %10',
    stop_loss_15: 'Stop Loss %15',
    take_profit_10: 'Kâr Al %10',
    take_profit_15: 'Kâr Al %15',
    take_profit_20: 'Kâr Al %20',
    take_profit_30: 'Kâr Al %30',
    trailing_stop_3: 'Trailing Stop %3',
    trailing_stop_5: 'Trailing Stop %5',
    trailing_stop_7: 'Trailing Stop %7',
  },

  // Strategy Descriptions
  strategyDescriptions: {
    // DCA
    dca_weekly: 'Her pazartesi kasanın %10\'u ile otomatik alım. Fiyat dalgalanmalarından etkilenmeden düzgün maliyet ortalaması oluşturur. Uzun vadeli yatırımcılar için ideal.',
    dca_biweekly: 'Her 2 haftada bir kasanın %15\'i ile alım. Haftalık DCA\'dan daha az işlem ücreti öderken benzer maliyet ortalaması sağlar. Orta vadeli birikim için uygun.',
    dca_monthly: 'Her ayın 1\'inde kasanın %20\'si ile alım. Maaş günü yatırımı gibi düşünün - düzenli geliri olan yatırımcılar için pratik. En düşük işlem maliyeti.',
    // Trend
    trend_ma_cross_20: 'Fiyat 20 günlük ortalamayı yukarı kesince kasanın %50\'si ile al, aşağı kesince tüm pozisyonu sat. Kısa vadeli trendleri yakalar. Yan piyasada çok sinyal üretebilir.',
    trend_ma_cross_50: 'Fiyat 50 günlük ortalamayı yukarı kesince %40 al, aşağı kesince sat. Daha uzun vadeli trendler için. Daha az yanlış sinyal ama gecikme olabilir.',
    trend_ema_cross: '12 günlük üstel hareketli ortalama (EMA) kullanır. EMA son fiyatlara daha fazla ağırlık verir, bu yüzden SMA\'dan daha hızlı tepki verir. Volatil piyasalar için.',
    trend_breakout_3: 'Fiyat tek günde %3 yukarı hareket edince kasanın %25\'i ile al. Momentum başlangıcını yakalar. Stop loss ile birlikte kullanın, aksi halde pump & dump riski.',
    trend_breakout_5: 'Fiyat tek günde %5 yukarı fırladığında kasanın %30\'u ile al. Güçlü momentum sinyali. Çok nadir tetiklenir ama tetiklendiğinde genellikle büyük hareket başlar.',
    // Momentum
    rsi_oversold_30: '14 günlük RSI 30\'un altına düştüğünde kasanın %25\'i ile al. RSI aşırı satım bölgesi - fiyat genellikle toparlanır. Düşüş trendinde erken giriş riski var, stop loss ile kullanın.',
    rsi_oversold_25: 'RSI 25\'in altında ekstrem aşırı satım. Kasanın %40\'ı ile agresif alım. Çok nadir tetiklenir ama tetiklendiğinde genellikle güçlü toparlanma olur. Yüksek risk/ödül oranı.',
    rsi_overbought_70: 'RSI 70\'in üstüne çıktığında pozisyonun %50\'sini sat. Aşırı alım bölgesi - fiyat genellikle düşer. Güçlü yükseliş trendinde erken çıkış riski var.',
    rsi_overbought_80: 'RSI 80\'in üstünde ekstrem aşırı alım. Pozisyonun %75\'ini sat. Çok nadir olur ama genellikle sert düzeltme öncesi gösterge. Kâr realizasyonu için ideal.',
    volume_spike_1_5x: 'İşlem hacmi 20 günlük ortalamanın 1.5 katına ulaşınca kasanın %15\'i ile al. Artan ilgi göstergesi - genellikle fiyat hareketi öncüsü. Konservatif hacim stratejisi.',
    volume_spike_2x: 'Hacim ortalamanın 2 katına fırladığında kasanın %25\'i ile al. Kurumsal ilgi veya önemli haber sinyali. Pump başlangıcı olabilir - trailing stop ile kullanın.',
    volume_spike_3x: 'Hacim ortalamanın 3 katına ulaştığında kasanın %35\'i ile al. Nadir olay - büyük haber veya manipülasyon. Yüksek risk ama büyük kazanç potansiyeli. Hemen stop koyun.',
    // Value / Dip
    buy_dip_3: 'Fiyat tek günde %3 düştüğünde kasanın %15\'i ile al. Küçük düzeltmeleri değer fırsatı olarak kullanır. Sık tetiklenir, maliyeti ortalamaya yayar. Volatil piyasalarda etkili.',
    buy_dip_5: 'Fiyat %5 düştüğünde kasanın %20\'si ile al. Orta ölçekli düzeltmeleri yakalar. Dip alımı stratejilerinin en dengeli seçeneği. Stop loss ile kombine edilebilir.',
    buy_dip_7: 'Fiyat %7 düştüğünde kasanın %30\'u ile al. Büyük düzeltmeleri fırsat olarak kullanır. Daha az tetiklenir ama daha iyi fiyattan giriş sağlar. Sabır gerektirir.',
    buy_dip_10: 'Fiyat %10 düştüğünde kasanın %40\'ı ile agresif al. Sert düzeltmelerde önemli pozisyon. Nadiren tetiklenir. Yükselen piyasalarda iyi sonuç verir, düşen piyasada dikkat.',
    buy_dip_15: 'Fiyat %15 crash yaptığında kasanın %60\'ı ile maksimum al. Flash crash veya panik satış anında aktif olur. Çok nadir ama büyük fırsat. Risk yönetimi şart.',
    // Volatility
    volatility_squeeze: 'Fiyat tek günde %4 hareket ettiğinde kasanın %20\'si ile al. Sakin piyasa sonrası patlama stratejisi - düşük volatilite dönemleri genellikle büyük hareketlerle biter. Yön fark etmez.',
    mean_reversion: 'Fiyat %8 düştüğünde kasanın %35\'i ile al. Aşırı satışlar genellikle ortalamaya döner. İstatistiksel arbitraj mantığı. Trend değişiminde zarar edebilir - stop loss zorunlu.',
    // Reversal
    reversal_rsi_bounce: 'RSI 35\'in altındayken kasanın %20\'si ile al. Trend dönüşü sinyali - aşırı satımdan toparlanma beklentisi. Daha konservatif RSI stratejisi, 30 seviyesini beklemez.',
    reversal_profit_take: 'Pozisyon %15 kâra ulaştığında pozisyonun %30\'unu sat. Kârı kilitleme stratejisi - tüm pozisyonu satmaz, yükseliş devam ederse kazanmaya devam eder. Risk yönetimi için ideal.',
    // Scalper
    scalper_quick_profit: 'Pozisyon %5 kâra ulaşınca otomatik sat, %2 zararda stop. Klasik scalping - küçük ama hızlı kârlar. Risk/ödül oranı 2.5:1. Çok sayıda işlem, düşük birim kâr.',
    scalper_ultra_quick: 'Pozisyon %3 kârda sat, %1 stopla. En agresif scalping - çok kısa tutuş süresi. Yüksek işlem maliyeti riski. Yüksek hacimli likit varlıklarda etkili.',
    aggressive_all_in: 'Fiyat %5 yükselince tüm kasayı yatır, %3 trailing stop ile koruma. Momentum sörfünde maksimum pozisyon. Trend devam ederse büyük kâr, yoksa trailing stop korur.',
    quick_flip: 'Fiyat %5 düştüğünde kasanın %80\'i ile al, %8 kâr hedefi, %3 stop loss. Dip alıp hızlı sat stratejisi. Toparlanma beklentisi - ayı piyasasında dikkatli kullan.',
    momentum_burst: 'Hacim 2.5 katına çıkınca kasanın %70\'i ile gir, %12 kâr hedefi, %4 trailing stop. Hacim patlaması = büyük hareket beklentisi. Pump avcısı ama kontrollü risk.',
    rsi_sniper: 'RSI 20\'nin altına düştüğünde kasanın %60\'ı ile al. Ekstrem aşırı satım - nadir ama yüksek olasılıklı toparlanma. %10 kâr hedefi, %4 stop. Hassas giriş.',
    breakout_rider: 'Fiyat %7 yükselince kasanın %75\'i ile gir, %5 trailing stop ile takip et. Güçlü kırılımı yakala ve trend devam ettikçe kal. Trailing stop kârı korur.',
    panic_buy: 'Fiyat %15 crash yaptığında tüm kasayla gir. %20 kâr hedefi, %10 stop. Flash crash fırsatçılığı - herkes satarken al. Çok nadir ama devasa potansiyel.',
    swing_trader: 'Fiyat 9 günlük EMA\'yı yukarı kesince kasanın %80\'i ile al, aşağı kesince tamamını sat. Kısa vadeli swing trade - hızlı giriş çıkış. EMA\'nın hızlı tepkisini kullanır.',
    double_down: 'Fiyat %10 her düştüğünde kasanın %50\'si ile al. Martingale benzeri - düşüşte pozisyon artır. Toparlanmada büyük kâr, ama devam eden düşüşte tehlikeli. Sınırlı bütçe ile.',
    pump_catcher: 'Hacim 4 katına fırladığında kasanın %90\'ı ile gir. Büyük pump yakalama stratejisi. %15 kâr hedefi, %5 trailing. Manipülasyon olabilir - hızlı çıkış zorunlu.',
    day_trader_combo: 'RSI 35\'in altında VE hacim 1.5 katında kasanın %60\'ı ile al. Çift onay sistemi - hem momentum hem hacim sinyali. %8 kâr, %3 stop. Yanlış sinyal riski düşük.',
    // Protection
    stop_loss_5: 'Pozisyon %5 zarara düştüğünde tamamını sat. Sıkı risk kontrolü - küçük zararla çık. Volatil varlıklarda sık tetiklenebilir. Scalper ve kısa vadeli işlemler için.',
    stop_loss_7: 'Pozisyon %7 zararda tamamını sat. Orta sıklıkta stop - günlük dalgalanmalara biraz tolerans tanır. Genel amaçlı koruma stratejisi.',
    stop_loss_10: 'Pozisyon %10 zararda tamamını sat. Standart stop loss seviyesi - çoğu yatırım stratejisi için uygun. Normal piyasa dalgalanmalarını tolere eder.',
    stop_loss_15: 'Pozisyon %15 zararda tamamını sat. Geniş tolerans - büyük dalgalanmalara izin verir. Uzun vadeli yatırımlar veya volatil varlıklar için. Daha büyük zarar riski.',
    take_profit_10: 'Pozisyon %10 kâra ulaşınca tamamını sat. Makul kâr hedefi - hızlı kâr realizasyonu. Küçük ama tutarlı kârlar biriktirmek için. Büyük rallileri kaçırabilir.',
    take_profit_15: 'Pozisyon %15 kârda tamamını sat. Orta vadeli kâr hedefi - biraz daha sabır gerektirir. Dengeli risk/ödül oranı sunar.',
    take_profit_20: 'Pozisyon %20 kârda tamamını sat. İddialı kâr hedefi - güçlü yükseliş beklentisi. Daha az sıklıkta tetiklenir ama daha büyük kâr. Sabır gerektirir.',
    take_profit_30: 'Pozisyon %30 kârda tamamını sat. Büyük hedef - uzun vadeli tutuş gerektirir. Boğa piyasasında ideal, yan piyasada tetiklenmeyebilir. Trailing stop ile kombine edin.',
    trailing_stop_3: 'Fiyat zirve yaptıktan sonra %3 düşerse sat. Dinamik koruma - kâr yükselirken stop da yükselir. Sıkı takip, volatil piyasalarda erken çıkış riski.',
    trailing_stop_5: 'Fiyat zirveden %5 düşerse sat. En popüler trailing stop seviyesi - kâr korur, ufak dalgalanmalara tolerans tanır. Çoğu strateji ile uyumlu.',
    trailing_stop_7: 'Fiyat zirveden %7 düşerse sat. Geniş trailing - büyük trendlerde pozisyonda kalmayı sağlar. Düzeltmelere tolerans tanır ama daha fazla kâr geri verir.',
  },
};
