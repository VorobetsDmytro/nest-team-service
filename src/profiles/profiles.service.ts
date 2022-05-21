import { HttpException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { User } from '../users/users.model';
import * as uuid from 'uuid';
import * as path from "path";
import * as fs from 'fs';
import * as bcrypt from 'bcryptjs';
import { jwtPayloadDto } from '../auth/dto/jwtPayload.dto';
import { HttpExceptionMessages } from '../exceptions/HttpException';
import { UsersService } from '../users/users.service';
import { ChangeProfileDto } from './dto/change-profile.dto';

@Injectable()
export class ProfilesService {
    private STATIC_PATH: string = process.env.STATIC_PATH || 'static_path';
    constructor(@Inject(forwardRef(() => UsersService)) private usersService: UsersService){}

    async getProfile(req){
        const dtoParams = req.user as jwtPayloadDto;
        if(!dtoParams.id)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        const user = await this.usersService.getUserById(dtoParams.id);
        if(!user)
            throw new HttpException(HttpExceptionMessages.NoAccess, 403);
        return user;
    }

    async changeProfile(dto: ChangeProfileDto, avatar: Express.Multer.File | null = null, req){
        const dtoParams = req.user as jwtPayloadDto;
        if(!dtoParams.id)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        let user = await this.usersService.getUserById(dtoParams.id);
        if(!user)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        let password = '';
        if(dto.password && !this.usersService.isGoogleAccount(user))
            password = await bcrypt.hash(dto.password, 5);
        user = await this.usersService.updateUser({...dto, password}, user);
        if(avatar)
            await this.uploadAvatar(user, avatar);
        return user;
    }

    uploadFile(file: Express.Multer.File): string{
        const filePath = this.generateFileName(file);
        if(!fs.existsSync(this.STATIC_PATH))
            fs.mkdirSync(this.STATIC_PATH, {recursive: true});
        fs.writeFileSync(filePath, file.buffer);
        return filePath;
    }

    generateFileName(file: Express.Multer.File): string {
        const extension = file.originalname.split('.').pop();
        let filePath: string;
        do {
            const fileName = uuid.v4();
            filePath = path.resolve(this.STATIC_PATH, fileName) + `.${extension}`;
        } while (fs.existsSync(filePath));
        return filePath;
    }

    deleteFile(filePath: string): string | null{
        if(!fs.existsSync(filePath))
            return null;
        fs.unlinkSync(filePath);
        return filePath;
    }

    async uploadAvatar(user: User, avatarFile: Express.Multer.File): Promise<User> {
        if(user.avatar)
            this.deleteFile(user.avatar);
        const avatar = this.uploadFile(avatarFile);
        user.avatar = avatar;
        await user.save();
        return user;
    }

    async setAvatarUrl(user: User, avatar: string): Promise<User> {
        user.avatar = avatar;
        await user.save();
        return user;
    }
}
