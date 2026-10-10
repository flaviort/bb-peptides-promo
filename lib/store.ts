import { useSyncExternalStore } from 'react';
import { wrapIndex } from './flavors';

export function createStore<T extends object>(initial: T) {
  let state = initial;
  const subs = new Set<() => void>();
  return {
    get: () => state,
    set(patch: Partial<T>) {
      let changed = false;
      for (const k in patch) if (!Object.is(state[k], patch[k])) changed = true;
      if (!changed) return;
      state = { ...state, ...patch };
      subs.forEach((fn) => fn());
    },
    subscribe(fn: () => void) {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
  };
}

export interface AppState {
  flavor: number;
  flavorSource: 'ui' | 'stage';
  section: number;
  ageOk: boolean;
  loaded: number;
  ready: boolean;
  entered: boolean;
  menuOpen: boolean;
  webgl: boolean;
}

export const store = createStore<AppState>({
  flavor: 0,
  flavorSource: 'ui',
  section: 0,
  ageOk: false,
  loaded: 0,
  ready: false,
  entered: false,
  menuOpen: false,
  webgl: true,
});

export function useApp<K>(select: (s: AppState) => K): K {
  return useSyncExternalStore(store.subscribe, () => select(store.get()), () => select(store.get()));
}

export function selectFlavor(i: number): void {
  store.set({ flavor: wrapIndex(i), flavorSource: 'ui' });
}
