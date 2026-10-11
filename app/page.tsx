import { Backdrop } from '@/components/Backdrop';
import { Experience } from '@/components/Experience';
import { Frame } from '@/components/chrome/Frame';
import { HeroLayer } from '@/components/sections/HeroLayer';
import { ProductLayer } from '@/components/sections/ProductLayer';
import { RangeLayer } from '@/components/sections/RangeLayer';
import { MainShell } from '@/components/chrome/MainShell';
import { ClosingSection } from '@/components/sections/ClosingSection';
import { Nav } from '@/components/chrome/Nav';
import { Preloader } from '@/components/sections/Preloader';
import { RotateNotice } from '@/components/chrome/RotateNotice';
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
      <Experience />
      <HeroLayer />
      <ProductLayer />
      <RangeLayer />
      <Frame />
      <Nav />
      <MainShell>
        {SECTIONS.map((id) =>
          id === 'closing' ? (
            <ClosingSection key={id} />
          ) : (
            <div key={id} id={id} data-section={id} aria-hidden="true" className={id === 'range' ? 'spacer spacer--short' : 'spacer'} />
          ),
        )}
      </MainShell>
      <Preloader />
      <RotateNotice />
    </>
  );
}
