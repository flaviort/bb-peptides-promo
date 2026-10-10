import { SITE_ORIGIN } from './products';

export const HOW_IT_WORKS = [
  {
    title: 'Take the online assessment',
    body: 'Tell us about your goals, health history and symptoms. It happens 100% online, through a secure medical questionnaire.',
  },
  {
    title: 'A licensed provider reviews it',
    body: 'A licensed healthcare provider reviews your information. If they need more, they may ask for a phone or video consultation first.',
  },
  {
    title: 'Treatment ships to you',
    body: 'When a prescription is appropriate, it is fulfilled by a licensed U.S. compounding pharmacy and shipped directly to you.',
  },
] as const;

export const CANDIDATE_NOTE = 'A prescription is required. Prescriptions are issued only when medically appropriate, and not everyone is a candidate.';

export const FAQS = [
  {
    q: 'What are peptides?',
    a: 'Peptides are short chains of amino acids used in physician-guided wellness programs to support goals across metabolic health, recovery and repair, healthy aging, brain health, immune function, skin and hair, and sexual wellness. Options on our platform include 5-Amino-1MQ and MOTS-C to support weight management, BPC-157 and Glow Blend to support recovery, and Semax / Selank to support cognitive wellness.',
  },
  {
    q: 'How do I choose the right peptide?',
    a: 'Start with your goals (weight loss, recovery, healthy aging, brain health, sleep, immune support, skin and hair, sexual wellness, or digestive wellness) then complete our online health assessment. A licensed healthcare provider reviews your medical history, symptoms, and goals and, if appropriate, recommends a personalized treatment plan. Prescriptions are issued only when medically appropriate, and not everyone is a candidate.',
  },
  {
    q: 'How should I store my peptides?',
    a: 'Storage instructions depend on the specific formulation prescribed for you. Follow the guidance included with your medication from the licensed compounding pharmacy and your healthcare provider. If you have questions about refrigeration, light exposure, or how long a product remains usable after opening, contact your provider or pharmacy for product-specific directions.',
  },
  {
    q: 'Do I need a healthcare provider before use?',
    a: 'Yes. A prescription is required. Treatments are available only after evaluation by a licensed healthcare provider. Getting started is easy: complete our online health assessment, and a provider will review your information. In many cases the consultation can be completed through our secure medical questionnaire; if more information is needed, they may request a phone or video consultation before recommending treatment. When prescribed, medication is fulfilled by a licensed U.S. compounding pharmacy and shipped directly to you.',
  },
] as const;

export const LEGAL =
  'All medications are prescribed by licensed healthcare providers and fulfilled by licensed U.S. compounding pharmacies. Compounded medications are not FDA-approved. Individual results may vary. Results are not guaranteed. The information on this website is for educational purposes only and is not intended as medical advice or to diagnose, treat, cure, or prevent any disease.';

export const SUPPORT_EMAIL = 'support@trybbpeptides.com';

export const COPYRIGHT = '© 2026 Bodybuilding Peptides, Inc. All rights reserved. Bodybuilding Peptides is a trademark of Bodybuilding.com, Inc.';

export const FOOTER_LINKS = [
  { label: 'All products', href: `${SITE_ORIGIN}/` },
  { label: 'About', href: `${SITE_ORIGIN}/about` },
  { label: 'FAQ', href: `${SITE_ORIGIN}/faq` },
  { label: 'Terms and Conditions', href: `${SITE_ORIGIN}/terms-and-conditions` },
  { label: 'Privacy Policy', href: `${SITE_ORIGIN}/privacy-policy` },
  { label: 'Returns & Refunds', href: `${SITE_ORIGIN}/returns-and-refunds` },
] as const;

export const SOCIAL = [
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/bodybuildingcom/' },
  { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/Bodybuildingcom/' },
  { id: 'twitter-x', label: 'X', href: 'https://twitter.com/bodybuildingcom' },
  { id: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@bodybuildingcom' },
  { id: 'threads', label: 'Threads', href: 'https://www.threads.net/@bodybuildingcom' },
] as const;
