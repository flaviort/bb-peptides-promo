// Rejects with Error('timeout') when p has not settled after ms. Used so a stalled 3D chunk or
// label build can never strand the visitor on the preloader.
export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}
