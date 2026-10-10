import { store } from './store';

// Last line of defence for the preloader: if boot has not reported ready by the deadline (the boot
// chunk itself stalled, or boot threw), enter on the static path instead of waiting forever.
export function armBootFallback(ms: number): () => void {
  const t = setTimeout(() => {
    if (!store.get().ready) store.set({ webgl: false, ready: true });
  }, ms);
  return () => clearTimeout(t);
}
