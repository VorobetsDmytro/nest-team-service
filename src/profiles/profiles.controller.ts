import { Body, Controller, Get, Patch, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsBannedGuard } from '../guards/is-banned.guard';
import { IsLogedInGuard } from '../guards/is-loged-in.guard';
import { ChangeProfileDto } from './dto/change-profile.dto';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
    constructor(private profilesService: ProfilesService){}

    @Get('/')
    @UseGuards(IsLogedInGuard)
    @UseGuards(IsBannedGuard)
    getProfile(@Req() req){
        return this.profilesService.getProfile(req);
    }

    @Patch('/')
    @UseGuards(IsLogedInGuard)
    @UseGuards(IsBannedGuard)
    @UseInterceptors(FileInterceptor('avatarFile'))
    changeProfile(@Body() dto: ChangeProfileDto, @UploadedFile() avatar: Express.Multer.File, @Req() req){
        return this.profilesService.changeProfile(dto, avatar, req);
    }
}
