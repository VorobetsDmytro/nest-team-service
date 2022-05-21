import { Module } from '@nestjs/common';
import { WsController } from './ws.controller';

@Module({
  controllers: [WsController],
  providers: []
})
export class WsModule {}
