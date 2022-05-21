import { Controller, Get, Res } from '@nestjs/common';

@Controller('ws')
export class WsController {
    @Get('/')
    root(@Res() res) {
      return res.render('index', {WS_PORT: process.env.WS_PORT, WS_HOST: process.env.WS_HOST});
    }
}
