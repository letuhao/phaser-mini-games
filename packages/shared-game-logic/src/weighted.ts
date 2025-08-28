// Weighted pick utilities working with permille.
import type { Prize } from './types';

export function normalizeWeights(prizes: Prize[]): { cumulative: number[], total: number } {
  const weights = prizes.map(p => Math.max(0, p.weightPermille));
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  const cumulative = weights.map(w => (acc += w));
  return { cumulative, total };
}

export function pickIndex(prizes: Prize[], rnd: () => number): number {
  const { cumulative, total } = normalizeWeights(prizes);
  if (total <= 0) return Math.floor(rnd() * prizes.length); // fallback uniform
  const r = rnd() * total;
  for (let i = 0; i < cumulative.length; i++) {
    if (r < cumulative[i]) return i;
  }
  return prizes.length - 1;
}
