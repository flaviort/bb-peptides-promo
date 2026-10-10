import { useSyncExternalStore } from 'react';
import { wrapIndex } from './products';

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
  /** Index into PRODUCTS of the product on screen. */
  product: number;
  /** 'ui' when a control picked it (the stage should follow), 'stage' when the stage reported it. */
  productSource: 'ui' | 'stage';
  section: number;
  /** Product hovered in the range row. */
  hover: number | null;
  loaded: number;
  ready: boolean;
  entered: boolean;
  menuOpen: boolean;
  webgl: boolean;
}

export const store = createStore<AppState>({
  product: 0,
  productSource: 'ui',
  section: 0,
  hover: null,
  loaded: 0,
  ready: false,
  entered: false,
  menuOpen: false,
  webgl: true,
});

export function useApp<K>(select: (s: AppState) => K): K {
  return useSyncExternalStore(store.subscribe, () => select(store.get()), () => select(store.get()));
}

export function selectProduct(i: number): void {
  store.set({ product: wrapIndex(i), productSource: 'ui' });
}
