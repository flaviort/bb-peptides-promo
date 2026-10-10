import { doseLabel, type Flavor } from './flavors';

// Each benefit points at something printed on the can. `spot` names the label region the
// stage turns to the camera and lights up (see LABEL_SPOTS in lib/stage/spots.ts).
export const BENEFITS = [
  {
    kicker: '01', icon: 'dose', spot: 'dose',
    title: () => 'A measured dose',
    body: (f: Flavor) => `${doseLabel(f)} in every can, printed right on the front. Hemp THC balanced with CBD, so it is easy to pace.`,
  },
  {
    kicker: '02', icon: 'glass', spot: 'alcohol',
    title: () => 'Zero alcohol, zero hangover',
    body: () => 'All of the unwind, none of the morning after. Sip one, or stack a second if the night calls for it.',
  },
  {
    kicker: '03', icon: 'juice', spot: 'juice',
    title: (f: Flavor) => `${f.juicePct}% organic juice`,
    body: () => 'Real organic fruit juice in every can. You taste the fruit first, because it is actually there.',
  },
  {
    kicker: '04', icon: 'leaf', spot: 'light',
    title: (f: Flavor) => `${f.calories} calories, ${f.sugarG}g sugar`,
    body: () => 'A touch of organic cane sugar and no artificial flavors. Light enough for a second round.',
  },
] as const;

export type BenefitIcon = (typeof BENEFITS)[number]['icon'];

export const CLAIMS: { icon: BenefitIcon; label: string }[] = [
  { icon: 'dose', label: 'Low dose' },
  { icon: 'glass', label: '0% alc' },
  { icon: 'juice', label: 'Organic juice' },
  { icon: 'leaf', label: 'No artificial' },
];

export const FAQS = [
  {
    q: 'Is Hiatus legal?',
    a: 'Yes. Hiatus is made with hemp-derived THC and contains less than 0.3% Delta 9 THC by dry weight, in line with the 2018 Farm Bill. It is sold to adults 21 and over. Some states restrict hemp products, so check your local rules.',
  },
  {
    q: 'What does it feel like?',
    a: 'A light, happy lift that settles into calm. Most people feel it within about 5 minutes and feel it fade after about 90. Clear enough to keep the conversation going.',
  },
  {
    q: 'How is it different from an edible?',
    a: 'Edibles can take an hour or two to arrive and then stick around for hours. Hiatus uses a water-soluble extract that shows up in minutes and leaves just as politely, so it is easy to pace.',
  },
  {
    q: 'Will it make me anxious?',
    a: 'Every can pairs THC with CBD, and the doses are kept low to keep things mellow. Start with one can, give it a few minutes, and go from there.',
  },
  {
    q: 'Where do you ship?',
    a: 'Most US states, to adults 21 and over. A few states do not allow hemp products to ship online. If yours is one of them, look for Hiatus at a local Cypress Hemp retailer.',
  },
  {
    q: 'Is it tested?',
    a: 'Every batch is third-party lab tested for potency, purity and safety. Results are published on cypresshemp.com.',
  },
] as const;

export const LEGAL = [
  'Hiatus contains hemp-derived THC. For adults 21 and over only. Do not drive or operate machinery after use. Keep out of reach of children and pets. Do not use if pregnant or nursing.',
  'These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.',
  'Contains less than 0.3% Delta 9 THC by dry weight, in line with the 2018 Farm Bill. State laws vary, so check yours before you order.',
] as const;

export const NAV_LINKS = [
  { label: 'Flavors', section: 0 },
  { label: 'How it feels', section: 2 },
  { label: 'Take a hiatus', section: 6 },
  { label: 'FAQ', section: 8 },
] as const;
