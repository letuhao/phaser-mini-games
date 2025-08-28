import { Module } from '@nestjs/common';
import { SpinController } from './spin.controller';
import { SpinService } from './spin.service';

@Module({
  controllers: [SpinController],
  providers: [SpinService],
})
export class SpinModule {}
