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
import { SECTIONS } from '@/lib/scroll/sections';

export default function Page() {
  return (
    <>
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
    </>
  );
}
