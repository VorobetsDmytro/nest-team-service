import { Module } from '@nestjs/common';
import { BansService } from './bans.service';

@Module({
  providers: [BansService],
  exports: [BansService]
})
export class BansModule {}
