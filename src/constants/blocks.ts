import { BlockDefinition } from '../types';
import { theme } from './theme';

// Trigger Blocks - Blue
export const triggerBlocks: BlockDefinition[] = [
  {
    type: 'trigger',
    name: 'WHEN_PRICE_ABOVE',
    label: 'Fiyat Üstünde',
    description: 'Fiyat belirtilen değerin üstüne çıktığında tetiklenir',
    color: theme.colors.trigger,
    params: [
      {
        name: 'threshold',
        label: 'Eşik Değer',
        type: 'number',
        required: true,
      },
    ],
    acceptsChildren: true,
  },
  {
    type: 'trigger',
    name: 'WHEN_PRICE_BELOW',
    label: 'Fiyat Altında',
    description: 'Fiyat belirtilen değerin altına düştüğünde tetiklenir',
    color: theme.colors.trigger,
    params: [
      {
        name: 'threshold',
        label: 'Eşik Değer',
        type: 'number',
        required: true,
      },
    ],
    acceptsChildren: true,
  },
  {
    type: 'trigger',
    name: 'WHEN_CHANGE_PERCENT',
    label: 'Yüzde Değişim',
    description: 'Belirtilen yüzde kadar değişim olduğunda tetiklenir',
    color: theme.colors.trigger,
    params: [
      {
        name: 'percent',
        label: 'Yüzde',
        type: 'number',
        required: true,
      },
      {
        name: 'direction',
        label: 'Yön',
        type: 'select',
        options: [
          { value: 'up', label: 'Yukarı' },
          { value: 'down', label: 'Aşağı' },
          { value: 'both', label: 'Her İki Yön' },
        ],
        defaultValue: 'up',
        required: true,
      },
    ],
    acceptsChildren: true,
  },
  {
    type: 'trigger',
    name: 'WHEN_DATE',
    label: 'Tarih Tetikleyici',
    description: 'Belirli bir tarihte tetiklenir',
    color: theme.colors.trigger,
    params: [
      {
        name: 'date',
        label: 'Tarih',
        type: 'date',
        required: true,
      },
    ],
    acceptsChildren: true,
  },
];

// Condition Blocks - Yellow
export const conditionBlocks: BlockDefinition[] = [
  {
    type: 'condition',
    name: 'IF_RSI',
    label: 'RSI Koşulu',
    description: 'RSI değeri belirtilen koşulu sağladığında',
    color: theme.colors.condition,
    params: [
      {
        name: 'period',
        label: 'Periyot',
        type: 'number',
        defaultValue: 14,
        required: true,
      },
      {
        name: 'operator',
        label: 'Operatör',
        type: 'select',
        options: [
          { value: 'above', label: 'Üstünde' },
          { value: 'below', label: 'Altında' },
        ],
        required: true,
      },
      {
        name: 'value',
        label: 'Değer',
        type: 'number',
        required: true,
      },
    ],
    acceptsChildren: true,
  },
  {
    type: 'condition',
    name: 'IF_MOVING_AVG',
    label: 'Hareketli Ortalama',
    description: 'Fiyat hareketli ortalamayı geçtiğinde',
    color: theme.colors.condition,
    params: [
      {
        name: 'period',
        label: 'Periyot',
        type: 'number',
        defaultValue: 20,
        required: true,
      },
      {
        name: 'type',
        label: 'Tip',
        type: 'select',
        options: [
          { value: 'sma', label: 'SMA' },
          { value: 'ema', label: 'EMA' },
        ],
        defaultValue: 'sma',
        required: true,
      },
      {
        name: 'crossDirection',
        label: 'Kesişim Yönü',
        type: 'select',
        options: [
          { value: 'above', label: 'Yukarı Kesişim' },
          { value: 'below', label: 'Aşağı Kesişim' },
        ],
        required: true,
      },
    ],
    acceptsChildren: true,
  },
  {
    type: 'condition',
    name: 'IF_VOLUME',
    label: 'Hacim Koşulu',
    description: 'Hacim belirtilen ortalamayı geçtiğinde',
    color: theme.colors.condition,
    params: [
      {
        name: 'multiplier',
        label: 'Çarpan',
        type: 'number',
        defaultValue: 1.5,
        required: true,
      },
      {
        name: 'period',
        label: 'Ortalama Periyodu',
        type: 'number',
        defaultValue: 20,
        required: true,
      },
    ],
    acceptsChildren: true,
  },
  {
    type: 'condition',
    name: 'IF_PROFIT',
    label: 'Kar/Zarar Koşulu',
    description: 'Kar veya zarar belirtilen seviyeye ulaştığında',
    color: theme.colors.condition,
    params: [
      {
        name: 'type',
        label: 'Tip',
        type: 'select',
        options: [
          { value: 'profit', label: 'Kar' },
          { value: 'loss', label: 'Zarar' },
        ],
        required: true,
      },
      {
        name: 'percent',
        label: 'Yüzde',
        type: 'number',
        required: true,
      },
    ],
    acceptsChildren: true,
  },
];

// Action Blocks - Green
export const actionBlocks: BlockDefinition[] = [
  {
    type: 'action',
    name: 'BUY',
    label: 'Al',
    description: 'Belirtilen miktarda alış yap',
    color: theme.colors.action,
    params: [
      {
        name: 'amount',
        label: 'Miktar',
        type: 'number',
        required: true,
      },
    ],
    acceptsChildren: false,
  },
  {
    type: 'action',
    name: 'SELL',
    label: 'Sat',
    description: 'Belirtilen miktarda satış yap',
    color: theme.colors.action,
    params: [
      {
        name: 'amount',
        label: 'Miktar',
        type: 'number',
        required: true,
      },
    ],
    acceptsChildren: false,
  },
  {
    type: 'action',
    name: 'BUY_PERCENT',
    label: 'Yüzde Al',
    description: 'Bakiyenin belirtilen yüzdesini kullanarak al',
    color: theme.colors.action,
    params: [
      {
        name: 'percent',
        label: 'Yüzde',
        type: 'number',
        defaultValue: 50,
        required: true,
      },
    ],
    acceptsChildren: false,
  },
  {
    type: 'action',
    name: 'SELL_PERCENT',
    label: 'Yüzde Sat',
    description: 'Pozisyonun belirtilen yüzdesini sat',
    color: theme.colors.action,
    params: [
      {
        name: 'percent',
        label: 'Yüzde',
        type: 'number',
        defaultValue: 100,
        required: true,
      },
    ],
    acceptsChildren: false,
  },
];

// Modifier Blocks - Purple
export const modifierBlocks: BlockDefinition[] = [
  {
    type: 'modifier',
    name: 'STOP_LOSS',
    label: 'Zarar Durdur',
    description: 'Zarar belirtilen yüzdeye ulaştığında otomatik satış',
    color: theme.colors.modifier,
    params: [
      {
        name: 'percent',
        label: 'Zarar Yüzdesi',
        type: 'number',
        defaultValue: 10,
        required: true,
      },
    ],
    acceptsChildren: false,
  },
  {
    type: 'modifier',
    name: 'TAKE_PROFIT',
    label: 'Kar Al',
    description: 'Kar belirtilen yüzdeye ulaştığında otomatik satış',
    color: theme.colors.modifier,
    params: [
      {
        name: 'percent',
        label: 'Kar Yüzdesi',
        type: 'number',
        defaultValue: 20,
        required: true,
      },
    ],
    acceptsChildren: false,
  },
  {
    type: 'modifier',
    name: 'TRAILING_STOP',
    label: 'Takip Eden Stop',
    description: 'Fiyatı takip eden dinamik zarar durdur',
    color: theme.colors.modifier,
    params: [
      {
        name: 'percent',
        label: 'Takip Yüzdesi',
        type: 'number',
        defaultValue: 5,
        required: true,
      },
    ],
    acceptsChildren: false,
  },
];

// All blocks combined
export const allBlocks: BlockDefinition[] = [
  ...triggerBlocks,
  ...conditionBlocks,
  ...actionBlocks,
  ...modifierBlocks,
];

// Get block definition by name
export const getBlockDefinition = (name: string): BlockDefinition | undefined => {
  return allBlocks.find(block => block.name === name);
};
