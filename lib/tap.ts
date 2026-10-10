export interface Point { x: number; y: number }

// A press that ends within a few pixels of where it started. Anything further is a drag or a
// scrolling swipe, and must not open links.
export function isTap(down: Point | null, up: Point, slop = 6): boolean {
  return down !== null && Math.hypot(up.x - down.x, up.y - down.y) < slop;
}
