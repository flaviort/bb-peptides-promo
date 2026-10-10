import type { Pager } from './Pager';

let pager: Pager | null = null;

export function setPager(p: Pager | null) {
  pager = p;
}

export function goToSection(index: number) {
  pager?.goTo(index);
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) pager?.scrollToElement(el);
}
