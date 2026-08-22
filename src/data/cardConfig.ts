// Single source of truth for all card studio configuration:
// art styles, card templates, occasions, handwriting fonts, palettes and message ideas.

export type ArtStyle = {
  id: string;
  name: string;
  blurb: string;
  /** CSS filter used for the instant local preview */
  cssFilter: string;
  /** Accent color used in the picker chip */
  swatch: string;
};

export const ART_STYLES: ArtStyle[] = [
  {
    id: 'carnival-sketch',
    name: 'Carnival Sketch',
    blurb: 'Street-fair ink caricature with bold marker lines.',
    cssFilter: 'grayscale(1) contrast(1.75) brightness(1.12) saturate(0)',
    swatch: '#2C2A29'
  },
  {
    id: 'watercolor',
    name: 'Soft Watercolor',
    blurb: 'Loose washes of rose, cream and sage on paper.',
    cssFilter: 'saturate(1.35) contrast(0.92) brightness(1.1) sepia(0.12)',
    swatch: '#C98F92'
  },
  {
    id: 'pop-art',
    name: 'Pop Art Lines',
    blurb: 'Thick outlines and flat blocks of warm color.',
    cssFilter: 'saturate(1.9) contrast(1.5) hue-rotate(-8deg)',
    swatch: '#E2703A'
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    blurb: 'Dreamy chalk illustration, storybook warmth.',
    cssFilter: 'sepia(0.28) saturate(1.2) brightness(1.12) contrast(0.95)',
    swatch: '#D9B382'
  },
  {
    id: 'vintage-ink',
    name: 'Vintage Ink',
    blurb: 'Sepia pen-and-ink engraving on aged paper.',
    cssFilter: 'sepia(0.6) contrast(1.3) brightness(1.02)',
    swatch: '#8A6A4F'
  }
];

export type CardTemplate = {
  id: string;
  name: string;
  occasion: string;
  /** Card stock color */
  paper: string;
  /** Inner frame / mat color */
  mat: string;
  /** Border color */
  border: string;
  /** Default ink color */
  ink: string;
  /** Default handwriting font */
  fontId: string;
  headline: string;
  defaultMessage: string;
  preview: string;
};

export const CARD_TEMPLATES: CardTemplate[] = [
  {
    id: 'classic-cream',
    name: 'Classic Cream',
    occasion: 'Just Because',
    paper: '#FDFBF7',
    mat: '#FFFFFF',
    border: '#E4D9C8',
    ink: '#2C2A29',
    fontId: 'caveat',
    headline: 'Thinking of you',
    defaultMessage: 'Just a little something to make you smile today.\nI love you more than words.',
    preview: 'https://d64gsuwffb70l.cloudfront.net/6a7b6ca8c9ffa014ba228ee7_1786474356459_bdacf1cd.jpg'
  },
  {
    id: 'rose-birthday',
    name: 'Rose Birthday',
    occasion: 'Birthday',
    paper: '#FFF7F4',
    mat: '#FFFFFF',
    border: '#E7B9B4',
    ink: '#7B3F45',
    fontId: 'gochi',
    headline: 'Happy Birthday!',
    defaultMessage: 'Happiest birthday to my favorite human.\nHere is to another year of us.',
    preview: 'https://d64gsuwffb70l.cloudfront.net/6a7b6ca8c9ffa014ba228ee7_1786474382827_a08c4c2c.jpg'
  },
  {
    id: 'gold-anniversary',
    name: 'Gold Anniversary',
    occasion: 'Anniversary',
    paper: '#FBF6EA',
    mat: '#FFFDF6',
    border: '#D2AE68',
    ink: '#5A4526',
    fontId: 'greatvibes',
    headline: 'Still my favorite',
    defaultMessage: 'Every year with you is my favorite year.\nForever yours.',
    preview: 'https://d64gsuwffb70l.cloudfront.net/6a7b6ca8c9ffa014ba228ee7_1786474383452_68ae09ef.jpg'
  },
  {
    id: 'evergreen-holiday',
    name: 'Evergreen Holiday',
    occasion: 'Holiday',
    paper: '#F4F7F1',
    mat: '#FFFFFF',
    border: '#8FA98A',
    ink: '#2F4635',
    fontId: 'architects',
    headline: 'Warmest wishes',
    defaultMessage: 'Wishing you a cozy, joyful season from our family to yours.',
    preview: 'https://d64gsuwffb70l.cloudfront.net/6a7b6ca8c9ffa014ba228ee7_1786474410770_b12276fa.jpg'
  },
  {
    id: 'thank-you-linen',
    name: 'Thank You Linen',
    occasion: 'Thank You',
    paper: '#FAF8F2',
    mat: '#FFFFFF',
    border: '#C9BFAA',
    ink: '#3A382F',
    fontId: 'caveat',
    headline: 'Thank you',
    defaultMessage: 'Thank you for being so kind. It truly meant the world to me.',
    preview: 'https://d64gsuwffb70l.cloudfront.net/6a7b6ca8c9ffa014ba228ee7_1786474358404_1160f263.jpg'
  },
  {
    id: 'love-note',
    name: 'Little Love Note',
    occasion: 'Love',
    paper: '#FFF6F6',
    mat: '#FFFFFF',
    border: '#DFA0A0',
    ink: '#8A3B44',
    fontId: 'dancing',
    headline: 'Hey you',
    defaultMessage: 'Loving you is the easiest thing I do all day.',
    preview: 'https://d64gsuwffb70l.cloudfront.net/6a7b6ca8c9ffa014ba228ee7_1786474382801_5a6dd880.jpg'
  },
  {
    id: 'get-well',
    name: 'Get Well Soon',
    occasion: 'Get Well',
    paper: '#F4F8FB',
    mat: '#FFFFFF',
    border: '#A9C3D6',
    ink: '#2E4657',
    fontId: 'architects',
    headline: 'Feel better soon',
    defaultMessage: 'Sending you soup, sunshine and a very silly drawing. Rest up.',
    preview: 'https://d64gsuwffb70l.cloudfront.net/6a7b6ca8c9ffa014ba228ee7_1786474384272_203af243.jpg'
  },
  {
    id: 'congrats-confetti',
    name: 'Congrats Confetti',
    occasion: 'Congratulations',
    paper: '#FFFBF2',
    mat: '#FFFFFF',
    border: '#E0B44A',
    ink: '#5B4212',
    fontId: 'gochi',
    headline: 'Congratulations!',
    defaultMessage: 'You did the thing! So proud of you I could burst.',
    preview: 'https://d64gsuwffb70l.cloudfront.net/6a7b6ca8c9ffa014ba228ee7_1786474412324_0a28b62a.jpg'
  },
  {
    id: 'pet-portrait',
    name: 'Pet Portrait',
    occasion: 'Pets',
    paper: '#FBF7F1',
    mat: '#FFFFFF',
    border: '#C4A484',
    ink: '#463625',
    fontId: 'gochi',
    headline: 'From your favorite pup',
    defaultMessage: 'Woof. That means I love you.\nAlso, more treats please.',
    preview: 'https://d64gsuwffb70l.cloudfront.net/6a7b6ca8c9ffa014ba228ee7_1786474430759_d8140e0f.jpg'
  },
  {
    id: 'business-thanks',
    name: 'Client Appreciation',
    occasion: 'Business',
    paper: '#F8F8F6',
    mat: '#FFFFFF',
    border: '#B9B4A7',
    ink: '#2B2B2B',
    fontId: 'architects',
    headline: 'We appreciate you',
    defaultMessage: 'Thank you for trusting us this year. It has been a genuine pleasure.',
    preview: 'https://d64gsuwffb70l.cloudfront.net/6a7b6ca8c9ffa014ba228ee7_1786474357176_4a320046.jpg'
  },
  {
    id: 'vintage-pet-ink',
    name: 'Vintage Ink Study',
    occasion: 'Just Because',
    paper: '#FAF6EE',
    mat: '#FFFDF8',
    border: '#B79E7E',
    ink: '#4A3A28',
    fontId: 'playfair',
    headline: 'A small study of you',
    defaultMessage: 'Drawn badly, meant sincerely. Thinking of you today.',
    preview: 'https://d64gsuwffb70l.cloudfront.net/6a7b6ca8c9ffa014ba228ee7_1786474448615_86d7e757.jpg'
  },
  {
    id: 'marker-portrait',
    name: 'Marker Portrait',
    occasion: 'Birthday',
    paper: '#FFFCF5',
    mat: '#FFFFFF',
    border: '#D8C39C',
    ink: '#33302B',
    fontId: 'caveat',
    headline: 'Another trip around the sun',
    defaultMessage: 'Same silly face, one more year of being my favorite.',
    preview: 'https://d64gsuwffb70l.cloudfront.net/6a7b6ca8c9ffa014ba228ee7_1786474365029_e04a9e8b.jpg'
  }
];


export type HandFont = {
  id: string;
  name: string;
  /** CSS + canvas font family */
  family: string;
  /** multiplier so all fonts optically match */
  scale: number;
};

export const HAND_FONTS: HandFont[] = [
  { id: 'caveat', name: 'Caveat', family: '"Caveat", cursive', scale: 1 },
  { id: 'gochi', name: 'Gochi Hand', family: '"Gochi Hand", cursive', scale: 0.9 },
  { id: 'architects', name: 'Architects Daughter', family: '"Architects Daughter", cursive', scale: 0.82 },
  { id: 'dancing', name: 'Dancing Script', family: '"Dancing Script", cursive', scale: 0.95 },
  { id: 'greatvibes', name: 'Great Vibes', family: '"Great Vibes", cursive', scale: 1.05 },
  { id: 'playfair', name: 'Playfair Italic', family: '"Playfair Display", serif', scale: 0.8 }
];

export const INK_COLORS = ['#2C2A29', '#7B3F45', '#5A4526', '#2F4635', '#2E4657', '#8A3B44', '#4B3B6B', '#1F1F1F'];

export const OCCASIONS = ['All', ...Array.from(new Set(CARD_TEMPLATES.map((t) => t.occasion)))];

/** Brand copy — single source of truth for the product name and promise. */
export const BRAND = {
  name: 'Kindred Cards & Outreach',
  short: 'Kindred',
  tagline: 'Outreach on the things that matter.',
  promise:
    'Handmade cards you send from your own email. No API keys, no marketing platform — just you, a photo, and the people who matter.',
  footerLine: 'made with Kindred Cards & Outreach'
};

/** Every export size the studio can produce. Used by the studio, the gallery copy and the exporter. */
export type ExportLayout = {
  id: string;
  name: string;
  blurb: string;
  width: number;
  height: number;
  /** padding as a fraction of the shorter edge */
  pad: number;
  filename: string;
};

export const EXPORT_LAYOUTS: ExportLayout[] = [
  {
    id: 'card',
    name: 'Card PNG (3:4)',
    blurb: 'Full 900 × 1200 keepsake card — email it or print it.',
    width: 900,
    height: 1200,
    pad: 0,
    filename: 'card'
  },
  {
    id: 'square',
    name: 'Square 1:1',
    blurb: 'Facebook, Instagram feed and LinkedIn posts.',
    width: 1080,
    height: 1080,
    pad: 0.05,
    filename: 'square-post'
  },
  {
    id: 'story',
    name: 'Story 9:16',
    blurb: 'Instagram / Facebook stories and Reels covers.',
    width: 1080,
    height: 1920,
    pad: 0.07,
    filename: 'story'
  },
  {
    id: 'wide',
    name: 'Wide 16:9',
    blurb: 'Email header, website banner or listing flyer.',
    width: 1920,
    height: 1080,
    pad: 0.06,
    filename: 'wide-banner'
  }
];

export const getLayout = (id: string) => EXPORT_LAYOUTS.find((l) => l.id === id) ?? EXPORT_LAYOUTS[0];

export const REPEAT_RULES = [
  { id: 'once', label: 'Send once' },
  { id: 'weekly', label: 'Every week' },
  { id: 'monthly', label: 'Every month' },
  { id: 'yearly', label: 'Every year' }
];

export const MESSAGE_IDEAS = [
  'You are the best part of every ordinary day.',
  'Just a reminder that I picked you, and I would pick you again.',
  'Thank you for all the little things nobody else notices.',
  'Happy birthday to the person who makes the cake worth eating.',
  'Proud of you today and every day. Keep going.',
  'Sending you a very serious portrait of a very silly face.',
  'Home is wherever you are.',
  'Thank you for your business this year. It genuinely means a lot.'
];

export const HERO_IMAGE =
  'https://d64gsuwffb70l.cloudfront.net/6a7b6ca8c9ffa014ba228ee7_1786474339263_aa857b45.jpg';


export const CRM_SUBSCRIBE_URL = 'https://famous.ai/api/crm/6a7b6ca8c9ffa014ba228ee7/subscribe';

export const getTemplate = (id: string) => CARD_TEMPLATES.find((t) => t.id === id) ?? CARD_TEMPLATES[0];
export const getFont = (id: string) => HAND_FONTS.find((f) => f.id === id) ?? HAND_FONTS[0];
export const getStyle = (id: string) => ART_STYLES.find((s) => s.id === id) ?? ART_STYLES[0];
