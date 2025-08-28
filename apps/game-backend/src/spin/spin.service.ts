import { Injectable } from '@nestjs/common';
import { serverPickOutcome } from '@minigames/shared-logic/src/spin';
import { validateSpinConfig } from '@minigames/shared-logic/src/validate';
import type { SpinOutcome, SpinRequest, SpinConfig } from '@minigames/shared-logic/src/types';
import { themes } from '@minigames/themes/src';

@Injectable()
export class SpinService {
  private cfg: SpinConfig;

  constructor() {
    const t = themes['levis-r3'] as any;
    this.cfg = t.spin as SpinConfig;
    const errors = validateSpinConfig(this.cfg);
    if (errors.length) {
      throw new Error('Invalid SpinConfig: ' + errors.join(', '));
    }
  }

  spin(req: SpinRequest): SpinOutcome {
    // Business rule example: invoice >= 2,500,000 (exclude tax) required
    if (req.invoiceTotal < 2_500_000) {
      throw new Error('Invoice not eligible (min 2,500,000)');
    }
    return serverPickOutcome(this.cfg, req);
  }
}
