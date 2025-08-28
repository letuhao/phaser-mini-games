import { createPRNG, hashString } from './prng';
import { pickIndex } from './weighted';
import type { Prize, SpinConfig, SpinOutcome, SpinRequest } from './types';

export function serverPickOutcome(cfg: SpinConfig, req: SpinRequest): SpinOutcome {
  const now = Date.now();
  const seedSource = `${req.phone}|${req.billNo}|${req.invoiceTotal}|${now}|${cfg.salt ?? ''}|${req.seedHint ?? ''}`;
  const rnd = createPRNG(hashString(seedSource));
  const index = pickIndex(cfg.prizes, rnd);
  const prize = cfg.prizes[index];

  // Angle: assume equal-size visual slices (FE can draw arc weights later).
  const n = cfg.prizes.length;
  const slice = 360 / n;
  const targetCenter = (index + 0.5) * slice; // degrees
  const min = cfg.minSpins ?? 3;
  const max = cfg.maxSpins ?? 6;
  const rotations = Math.floor(min + rnd() * Math.max(1, (max - min)));
  const angleDeg = rotations * 360 + targetCenter;

  return { prize, index, angleDeg, rotations };
}
