import { Backdrop } from '@/components/Backdrop';
import { Experience } from '@/components/Experience';
import { Frame } from '@/components/chrome/Frame';
import { HeroLayer } from '@/components/sections/HeroLayer';
import { MainShell } from '@/components/chrome/MainShell';
import { Nav } from '@/components/chrome/Nav';
import { Preloader } from '@/components/sections/Preloader';
import { SECTIONS } from '@/lib/scroll/sections';

export default function Page() {
  return (
    <>
      <Backdrop />
      <Experience />
      <HeroLayer />
      <Frame />
      <Nav />
      <MainShell>
        {SECTIONS.map((id) => (
          <div key={id} id={id} data-section={id} aria-hidden="true" className={id === 'range' ? 'spacer spacer--short' : 'spacer'} />
        ))}
      </MainShell>
      <Preloader />
    </>
  );
}
