'use client';

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { isValidEmail } from '@/lib/email';
import { RollLabel } from '@/components/ui/RollLabel';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const successRef = useRef<HTMLParagraphElement>(null);

  // The form unmounts on success; move focus to the message so it is announced and focus is not lost.
  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError('Enter your email first.');
    if (!isValidEmail(email)) return setError("That email doesn't look right. Try again.");
    setError('');
    setDone(true); // UI only: nothing is sent anywhere yet.
  };

  return (
    <div className="mt-24">
      <h2 aria-label="Stay groovy" className="display stripe-type wave-text text-[clamp(2.8rem,6vw,6rem)] text-[var(--d)]">
        {/* Each letter rides a rolling wave; the staggered delay sets the phase along the line. */}
        {Array.from('Stay groovy').map((ch, i) => (
          <span key={i} aria-hidden="true" style={{ '--i': i } as CSSProperties}>
            {ch === ' ' ? '\u00a0' : ch}
          </span>
        ))}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-lg text-ink/75">New flavors, restocks and the occasional good idea. No spam, ever.</p>
      {done ? (
        <p ref={successRef} tabIndex={-1} role="status" className="mt-8 text-xl font-bold outline-none">You&apos;re on the list. Stay groovy.</p>
      ) : (
        <form noValidate onSubmit={submit} className="mx-auto mt-8 flex max-w-lg gap-2 max-sm:flex-col">
          <label htmlFor="nl-email" className="sr-only">Email</label>
          <input
            id="nl-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            aria-invalid={!!error}
            aria-describedby={error ? 'nl-error' : undefined}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            className="glass min-w-0 flex-1 rounded-full px-6 py-4 text-lg placeholder:text-ink/60 select-text"
          />
          <button type="submit" aria-label="Join" className="roll-host btn btn-primary">
            <RollLabel text="Join" />
          </button>
        </form>
      )}
      {error && <p id="nl-error" role="alert" className="mt-3 text-sm font-bold text-[var(--d)]">{error}</p>}
    </div>
  );
}
