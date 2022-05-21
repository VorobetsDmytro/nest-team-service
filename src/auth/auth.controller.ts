import { Body, Controller, Get, HttpCode, Param, Post, Req, UploadedFile, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { ForgotPassDto } from './dto/forgot-pass.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPassDto } from './dto/reset-pass.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @Post('/register')
    @UseInterceptors(FileInterceptor('avatarFile'))
    @HttpCode(201)
    register(@Body() dto: CreateUserDto, @UploadedFile() avatar: Express.Multer.File){
        return this.authService.register(dto, avatar);
    }

    @Post('/login')
    @HttpCode(200)
    login(@Body() dto: LoginDto){
        return this.authService.login(dto);
    }

    @Post('/forgot-pass')
    @HttpCode(201)
    forgotPass(@Body() dto: ForgotPassDto){
        return this.authService.forgotPass(dto);
    }

    @Post('/reset-pass/:userId/:token')
    @HttpCode(200)
    resetPass(@Body() dto: ResetPassDto, @Param('userId') userId: string, @Param('token') token: string){
        return this.authService.resetPass(dto, userId, token);
    }

    @Get('/google')
    @UseGuards(AuthGuard('google'))
    google(){}

    @Get('/google/callback')
    @UseGuards(AuthGuard('google'))
    @UseFilters(new HttpExceptionFilter())
    googleAuth(@Req() req){
        return this.authService.googleAuth(req);
    }
}
