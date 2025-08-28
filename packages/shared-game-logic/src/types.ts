// Shared types for prizes and outcomes
export type Permille = number; // 0..1000

export interface Prize {
  id: string;          // unique prize id
  label: string;       // display label (e.g., "Voucher 100K")
  weightPermille: Permille; // weight in permille
  type: 'voucher' | 'ticket' | 'physical' | 'none';
  meta?: Record<string, any>;
}

export interface SpinConfig {
  prizes: Prize[];
  salt?: string;             // optional secret salt for RNG seeding
  minSpins?: number;         // minimum full rotations
  maxSpins?: number;         // maximum full rotations
}

export interface SpinRequest {
  phone: string;
  billNo: string;
  invoiceTotal: number;
  storeCode?: string;
  seedHint?: string; // e.g., timestamp or UUID from FE for extra entropy
}

export interface SpinOutcome {
  prize: Prize;
  index: number;       // index of prize in the array
  angleDeg: number;    // angle to animate to (center of segment)
  rotations: number;   // how many full spins to animate
}
