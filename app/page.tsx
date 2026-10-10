import { Experience } from '@/components/Experience';
import { MainShell } from '@/components/chrome/MainShell';
import { Preloader } from '@/components/sections/Preloader';
import { SECTIONS } from '@/lib/scroll/sections';

export default function Page() {
  return (
    <>
      <div className="backdrop" aria-hidden="true" />
      <Experience />
      <MainShell>
        {SECTIONS.map((id) => (
          <div key={id} id={id} data-section={id} aria-hidden="true" className={id === 'range' ? 'spacer spacer--short' : 'spacer'} />
        ))}
      </MainShell>
      <Preloader />
    </>
  );
}
