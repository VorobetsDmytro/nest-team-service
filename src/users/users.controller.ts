import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBanDto } from '../bans/dto/create-ban.dto';
import { Roles } from '../decorators/roles.decorator';
import { IsBannedGuard } from '../guards/is-banned.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService){}

    @Post('/')
    @Roles(['ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    @UseInterceptors(FileInterceptor('avatarFile'))
    create(@Body() dto: CreateUserDto, @UploadedFile() avatar: Express.Multer.File){
        return this.usersService.create(dto, avatar);
    }

    @Post('/ban/:userId')
    @Roles(['ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    ban(@Body() dto: CreateBanDto, @Param('userId') userId: string, @Req() req){
        return this.usersService.ban(dto, {userId}, req);
    }

    @Get('/unban/:userId')
    @Roles(['ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    unban(@Param('userId') userId: string, @Req() req){
        return this.usersService.unban({userId}, req);
    }

    @Get('/:userId')
    @Roles(['MANAGER', 'ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    getOne(@Param('userId') userId: string){
        return this.usersService.getOne({userId});
    }

    @Get('/')
    @Roles(['ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    getAll(){
        return this.usersService.getAllUsers();
    }

    @Patch('/:userId')
    @Roles(['ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    @UseInterceptors(FileInterceptor('avatarFile'))
    update(@Body() dto: UpdateUserDto, @UploadedFile() avatar: Express.Multer.File, @Param('userId') userId: string){
        return this.usersService.update(dto, avatar, {userId});
    }

    @Patch('/change-pass/:userId')
    @Roles(['ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    changePass(@Body() dto: ChangePasswordDto, @Param('userId') userId: string){
        return this.usersService.changePass(dto, {userId});
    }

    @Delete('/:userId')
    @Roles(['ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    delete(@Param('userId') userId: string){
        return this.usersService.delete({userId});
    }
}