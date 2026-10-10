import type { Pager } from './Pager';

let pager: Pager | null = null;

export function setPager(p: Pager | null) {
  pager = p;
}

export function goToSection(index: number) {
  pager?.goTo(index);
}
