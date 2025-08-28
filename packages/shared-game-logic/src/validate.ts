import type { SpinRequest, SpinConfig } from './types';

export function validateSpinRequest(req: SpinRequest): string[] {
  const errors: string[] = [];
  if (!req.phone || req.phone.length < 6) errors.push('Invalid phone');
  if (!req.billNo) errors.push('Missing billNo');
  if (typeof req.invoiceTotal !== 'number' || req.invoiceTotal < 0) errors.push('Invalid invoiceTotal');
  return errors;
}

export function validateSpinConfig(cfg: SpinConfig): string[] {
  const errors: string[] = [];
  if (!cfg.prizes || cfg.prizes.length < 2) errors.push('At least 2 prizes required');
  const sum = cfg.prizes.reduce((a, p) => a + Math.max(0, p.weightPermille), 0);
  if (sum <= 0) errors.push('Total weight must be > 0');
  return errors;
}
