import { Module } from '@nestjs/common';
import { TokenService } from './reset-token.service';

@Module({
    providers: [TokenService],
    exports: [TokenService]
})
export class ResetTokenModule {}
