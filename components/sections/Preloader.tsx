'use client';

import { useEffect, useRef, useState } from 'react';
import { store, useApp } from '@/lib/store';
import { KEYS, readFlag, writeFlag } from '@/lib/persist';
import { RollLabel } from '@/components/ui/RollLabel';
import { cn } from '@/lib/cn';

const STRIPES = [1, 2, 3, 4, 5];

export function Preloader() {
  const loaded = useApp((s) => s.loaded);
  const ready = useApp((s) => s.ready);
  const ageOk = useApp((s) => s.ageOk);
  const entered = useApp((s) => s.entered);
  const [denied, setDenied] = useState(false);
  const [gone, setGone] = useState(false);
  // Set when the visitor confirms, so the gate stays on screen through the fade instead of flashing the counter.
  const [leavingGate, setLeavingGate] = useState(false);
  const deniedLink = useRef<HTMLAnchorElement>(null);

  // Mirrors the inline script in app/layout.tsx so the counter replaces the hidden gate right after hydration.
  useEffect(() => {
    if (readFlag(KEYS.age) === true) store.set({ ageOk: true });
  }, []);

  useEffect(() => {
    if (!ready || !ageOk || entered) return;
    const t = setTimeout(() => store.set({ entered: true }), 400);
    return () => clearTimeout(t);
  }, [ready, ageOk, entered]);

  useEffect(() => {
    if (!entered) return;
    const t = setTimeout(() => setGone(true), 1000);
    return () => clearTimeout(t);
  }, [entered]);

  useEffect(() => {
    if (denied) deniedLink.current?.focus();
  }, [denied]);

  if (gone) return null;

  const confirm = () => {
    // The gate stays focusable through the fade; ignore a second Enter.
    if (store.get().entered) return;
    writeFlag(KEYS.age, true);
    // Confirmed before the stage finished loading: the counter takes over and the effect above enters once ready.
    if (!store.get().ready) {
      store.set({ ageOk: true });
      return;
    }
    setLeavingGate(true);
    store.set({ ageOk: true, entered: true });
  };

  // The gate is server rendered and shows from the first paint, so the question is never held behind the 3D load.
  const showGate = !ageOk || leavingGate;
  const pct = Math.round(loaded * 100);

  return (
    <div
      role={showGate ? 'dialog' : undefined}
      aria-modal={showGate || undefined}
      aria-labelledby={showGate ? (denied ? 'gate-denied-title' : 'gate-title') : undefined}
      className={cn('preloader fixed inset-0 z-[60] grid place-items-center bg-cream px-6 text-center', entered && 'is-leaving')}
    >
      <div className="grid justify-items-center gap-8">
        <div className="flex h-24 items-end gap-2" aria-hidden="true">
          {STRIPES.map((n, i) => (
            <i
              key={n}
              className="block h-full w-3 origin-bottom rounded-full transition-transform duration-300 motion-reduce:transition-none"
              style={{ background: `var(--color-stripe-${n})`, transform: `scaleY(${Math.min(1, Math.max(0.04, loaded * 5 - i))})` }}
            />
          ))}
        </div>

        {!showGate && !denied && (
          <p className="font-mono text-sm tracking-[0.6em] text-ink/70" aria-live="polite">
            {String(pct).padStart(2, '0')}%
          </p>
        )}

        {showGate && !denied && (
          <div data-gate className="grid max-w-md justify-items-center gap-5">
            <p className="eyebrow text-[var(--d)]">Hold up</p>
            <h2 id="gate-title" className="display text-[clamp(2.4rem,6vw,4rem)] text-[var(--d)]">Are you 21 or older?</h2>
            <p className="text-lg text-ink/75">Hiatus contains hemp-derived THC. You need to be 21 or older to come in.</p>
            <div className="mt-2 flex gap-3 max-sm:flex-col">
              <button type="button" autoFocus onClick={confirm} aria-label="I'm 21 or older" className="roll-host btn btn-primary">
                <RollLabel text="I'm 21 or older" />
              </button>
              <button type="button" onClick={() => setDenied(true)} className="btn btn-ghost glass">Not yet</button>
            </div>
            <p className="text-xs text-ink/75">
              By entering you agree to the{' '}
              <a className="underline" href="https://www.cypresshemp.com/policies/terms-of-service" target="_blank" rel="noreferrer">Terms</a>
              {' '}and{' '}
              <a className="underline" href="https://www.cypresshemp.com/policies/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a>.
            </p>
          </div>
        )}

        {denied && (
          <div className="grid max-w-md justify-items-center gap-5" role="status">
            <h2 id="gate-denied-title" className="display text-[clamp(2.2rem,5vw,3.5rem)] text-[var(--d)]">Come back when you&apos;re 21</h2>
            <p className="text-lg text-ink/75">We&apos;ll keep a can cold for you.</p>
            <a ref={deniedLink} className="btn btn-ghost glass" href="https://www.cypresshemp.com">Visit Cypress Hemp</a>
          </div>
        )}
      </div>
    </div>
  );
}
