import { Backdrop } from '@/components/Backdrop';
import { Experience } from '@/components/Experience';
import { HeroLayer } from '@/components/sections/HeroLayer';
import { ProfileLayer } from '@/components/sections/ProfileLayer';
import { BenefitsLayer } from '@/components/sections/BenefitsLayer';
import { StatementLayer } from '@/components/sections/StatementLayer';
import { FaqSection } from '@/components/sections/FaqSection';
import { Nav } from '@/components/chrome/Nav';
import { MainShell } from '@/components/chrome/MainShell';
import { Preloader } from '@/components/sections/Preloader';
import { SECTIONS } from '@/lib/scroll/sections';
import { structuredData } from '@/lib/structured-data';

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()).replace(/</g, '\\u003c') }}
      />
      <Backdrop />
      <StatementLayer />
      <Experience />
      <HeroLayer />
      <ProfileLayer />
      <BenefitsLayer />
      <Nav />
      <MainShell>
        {SECTIONS.map((id) =>
          id === 'faq' ? (
            <FaqSection key={id} />
          ) : (
            <div key={id} id={id} data-section={id} aria-hidden="true" className={id === 'range' ? 'spacer spacer--short' : 'spacer'} />
          ),
        )}
      </MainShell>
      <Preloader />
    </>
  );
}
