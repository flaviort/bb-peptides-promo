export type FlavorId = 'mango' | 'peach' | 'lemonade' | 'cherry';

export interface Flavor {
  id: FlavorId;
  name: string;
  lines: string[];
  short: string;
  thc: number;
  cbd: number;
  juicePct: number;
  calories: number;
  sugarG: number;
  colors: { p: string; s: string; d: string };
  label: { hi: string; lo: string };
  images: { product: string; fruit: string[] };
}

const ph = (file: string) => `/placeholders/${file}`;
const media = (id: FlavorId) => ({
  label: { hi: `/labels/${id}.webp`, lo: `/labels/${id}-sm.webp` },
  images: {
    product: ph(`product-${id}.png`),
    fruit: [ph(`fruit-${id}-01.png`), ph(`fruit-${id}-02.png`)],
  },
});

export const FLAVORS: readonly Flavor[] = [
  {
    id: 'mango', name: 'Mango Satsuma', lines: ['Mango', 'Satsuma'],
    short: 'Tropical, bright and juicy. A beach chair you can hold.',
    thc: 2, cbd: 20, juicePct: 13, calories: 30, sugarG: 2,
    colors: { p: '#D9662B', s: '#F4A957', d: '#7A2E12' }, ...media('mango'),
  },
  {
    id: 'peach', name: 'Peach Strawberry', lines: ['Peach', 'Strawberry'],
    short: 'Sweet and bold. Ripe peach and strawberry, perfectly balanced.',
    thc: 5, cbd: 15, juicePct: 15, calories: 30, sugarG: 2,
    colors: { p: '#C8644E', s: '#F0A48C', d: '#6E2A1F' }, ...media('peach'),
  },
  {
    id: 'lemonade', name: 'Lemonade', lines: ['Lemonade'],
    short: 'Fresh, zesty and sunny. A front porch in a can.',
    thc: 5, cbd: 125, juicePct: 16, calories: 35, sugarG: 3,
    colors: { p: '#DFA12A', s: '#F7D57E', d: '#6F470B' }, ...media('lemonade'),
  },
  {
    id: 'cherry', name: 'Cherry Pomegranate', lines: ['Cherry', 'Pomegranate'],
    short: 'Tart cherry, deep pomegranate. Rich, tangy and a little moody.',
    thc: 5, cbd: 125, juicePct: 11, calories: 35, sugarG: 2,
    colors: { p: '#8C3036', s: '#DA7A7C', d: '#4A1418' }, ...media('cherry'),
  },
];

export const FLAVOR_COUNT = FLAVORS.length;
export const PRODUCT_URL = 'https://www.cypresshemp.com/products/hiatus-thc-seltzer';

export function wrapIndex(i: number, n: number = FLAVOR_COUNT): number {
  return ((i % n) + n) % n;
}

export function doseLabel(f: Flavor): string {
  return `${f.thc}mg THC + ${f.cbd}mg CBD`;
}
