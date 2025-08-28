import { Body, Controller, Post } from '@nestjs/common';
import { SpinService } from './spin.service';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

class SpinDto {
  @IsString() phone!: string;
  @IsString() billNo!: string;
  @IsNumber() @Min(0) invoiceTotal!: number;
  @IsOptional() @IsString() storeCode?: string;
  @IsOptional() @IsString() seedHint?: string;
}

@Controller('api')
export class SpinController {
  constructor(private readonly spinService: SpinService) {}

  @Post('spin')
  spin(@Body() body: SpinDto) {
    return this.spinService.spin(body);
  }
}
