import Image from 'next/image';
import type { CSSProperties } from 'react';
import { COPYRIGHT, FOOTER_LINKS, LEGAL, SOCIAL, SUPPORT_EMAIL } from '@/lib/content';
import { SITE_ORIGIN } from '@/lib/products';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <a className="footer-logo" href={SITE_ORIGIN} target="_blank" rel="noreferrer" aria-label="Bodybuilding Peptides +, powered by bodybuilding.com">
          <Image src="/logos/bb-peptides-full-white.svg" alt="" width={500} height={133} unoptimized />
        </a>
        <ul className="footer-social">
          {SOCIAL.map((s) => (
            <li key={s.id}>
              <a className="social" href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
                <span style={{ '--icon': `url(/social/${s.id}.svg)` } as CSSProperties} />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <ul className="footer-links dim-list">
        {FOOTER_LINKS.map((l) => (
          <li key={l.label}><a href={l.href} target="_blank" rel="noreferrer">{l.label}</a></li>
        ))}
      </ul>
      <p className="footer-legal">
        {LEGAL} For questions about our pharmacy partners, contact <a href={`mailto:${SUPPORT_EMAIL}`}>our support team</a>.
      </p>
      <p className="footer-copy">{COPYRIGHT}</p>
    </footer>
  );
}
