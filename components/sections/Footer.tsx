import { LEGAL } from '@/lib/content';
import { PRODUCT_URL } from '@/lib/flavors';

const LINKS = [
  { label: 'Shop Hiatus', href: PRODUCT_URL },
  { label: 'Cypress Hemp', href: 'https://www.cypresshemp.com' },
  { label: 'Terms', href: 'https://www.cypresshemp.com/policies/terms-of-service' },
  { label: 'Privacy', href: 'https://www.cypresshemp.com/policies/privacy-policy' },
];

export function Footer() {
  return (
    <footer className="mt-28 border-t border-ink/15 pt-10 pb-16 text-center">
      <ul className="dim-list flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-bold tracking-[0.14em] uppercase">
        {LINKS.map((l) => (
          <li key={l.label}>
            <a href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
          </li>
        ))}
      </ul>
      <div className="mx-auto mt-10 grid max-w-[64rem] justify-items-center gap-3 text-center text-[0.8125rem] leading-relaxed text-ink/75">
        {LEGAL.map((p) => <p key={p}>{p}</p>)}
        <p>Powered by Cypress Hemp. © 2026 Cypress Hemp II LLC, Powhatan, VA.</p>
      </div>
    </footer>
  );
}
