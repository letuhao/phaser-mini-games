import { Module } from '@nestjs/common';
import { SpinModule } from './spin/spin.module';

@Module({
  imports: [SpinModule],
})
export class AppModule {}
