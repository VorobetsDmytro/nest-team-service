import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpExceptionMessages } from '../exceptions/HttpException';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/users.model';
import { UsersService } from '../users/users.service';
import { jwtPayloadDto } from './dto/jwtPayload.dto';
import * as bcrypt from 'bcryptjs';
import { ProfilesService } from '../profiles/profiles.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPassDto } from './dto/forgot-pass.dto';
import { TokenService } from '../reset-token/reset-token.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPassDto } from './dto/reset-pass.dto';
import { UserGoogleDto } from './dto/user-google.dto';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService,
                private usersService: UsersService,
                private profilesService: ProfilesService,
                private tokenService: TokenService,
                private mailerService: MailerService){}

    async register(dto: CreateUserDto, avatar: Express.Multer.File | null = null){
        const checkEmail = await this.usersService.getUserByEmail(dto.email);
        if(checkEmail)
            throw new HttpException(HttpExceptionMessages.EmailInUse, 400);
        const checkLogin = await this.usersService.getUserByLogin(dto.login);
        if(checkLogin)
            throw new HttpException(HttpExceptionMessages.LoginInUse, 400);
        const hashPassword = await bcrypt.hash(dto.password!, 5);
        const userId = await this.usersService.generateUserId();
        const newUser = await this.usersService.createUser({...dto, password: hashPassword, id: userId});
        if(!newUser)
            throw new HttpException(HttpExceptionMessages.CreatingUser, 400);
        if(avatar)
            await this.profilesService.uploadAvatar(newUser, avatar);
        const token = await this.generateToken(newUser);
        return {token};
    }

    async login(dto: LoginDto){
        const user = await this.usersService.getUserByLogin(dto.login);
        if(!user)
            throw new HttpException(HttpExceptionMessages.IncorrectData, 400);
        const isBanned = await this.usersService.isBanned(user);
        if(isBanned)
            throw new HttpException(`BANNED! By: <${isBanned.bannedBy}> Reason: ${isBanned.banReason}`, 400);
        const checkGoogleAccount = this.usersService.isGoogleAccount(user);
        if(checkGoogleAccount)
            throw new HttpException(`This is a google account. Use '/auth/google' url to login`, 400);
        const hashPassword = String(user.get('password'));
        const comparePasswords = await bcrypt.compare(dto.password, hashPassword);
        if(!comparePasswords)
            throw new HttpException(HttpExceptionMessages.IncorrectData, 400);
        const token = await this.generateToken(user);
        return {token};
    }

    async forgotPass(dto: ForgotPassDto){
        const user = await this.usersService.getUserByEmail(dto.email);
        if(!user)
            throw new HttpException(HttpExceptionMessages.IncorrectData, 400);
        const checkGoogleAccount = this.usersService.isGoogleAccount(user);
        if(checkGoogleAccount)
            throw new HttpException(`The google account can't changes it password`, 400);
        const userId = String(user.get('id'));
        let token = await this.tokenService.getTokenByUserId(userId);
        let tokenValue;
        if(!token){
            tokenValue = await this.tokenService.generateResetToken();
            token = await this.tokenService.createToken(userId, tokenValue);
            await token.save();
        }else
            tokenValue = String(token.get('value'));
        const link = await this.createResetPasswordLink(userId, tokenValue);
        const userEmail = String(user.get('email'));
        await this.sendEmail(userEmail, 'Reset password', link);
        return {message: `The reset link was sent to <${userEmail}> email.`};
    }

    async resetPass(dto: ResetPassDto, userId: string, token: string){
        const user = await this.usersService.getUserById(String(userId));
        if(!user)
            throw new HttpException(HttpExceptionMessages.InvalidLink, 400);
        const tokenDB = await this.tokenService.getTokenByUserIdAndTokenVal(String(userId), token);
        if(!tokenDB)
            throw new HttpException(HttpExceptionMessages.InvalidLink, 400);
        const hashPassword = await bcrypt.hash(dto.password, 5);
        await this.usersService.updateUser({password: hashPassword}, user);
        await this.tokenService.deleteResetToken(tokenDB);
        return {message: `The password was changed sucessfully.`};
    }

    async googleAuth(req){
        if(!req.user)
            throw new HttpException('Failure login', 400);
        const dto = req.user as UserGoogleDto;
        const userId = dto.id + 'google';
        let user = await this.usersService.getUserById(userId);
        if(!user){
            const checkEmail = await this.usersService.getUserByEmail(dto.email!);
            if(checkEmail)
                throw new HttpException(HttpExceptionMessages.EmailInUse, 400);
            user = await this.usersService.createUser({...dto, id: userId, firstName: dto.given_name!, lastName: dto.family_name, login: dto.email});
            if(!user)
                throw new HttpException(HttpExceptionMessages.CreatingUser, 400);
            await this.usersService.setGoogleUser(user);
            await this.profilesService.setAvatarUrl(user,  dto.picture!);
        } else {
            const isBanned = await this.usersService.isBanned(user);
            if(isBanned)
                throw new HttpException(`BANNED! By: <${isBanned.bannedBy}> Reason: ${isBanned.banReason}`, 400);
        }
        const token = await this.generateToken(user);
        return {token};
    }

    async generateToken(user: User): Promise<string> {
        const payload: jwtPayloadDto = {
            id: user.id,
            email: user.email,
            isGoogleAccount: user.isGoogleAccount,
            role: user.role.value
        }
        return this.jwtService.sign(payload);
    }

    async sendEmail(to: string, subject: string, text: string){
        await this.mailerService.sendMail({
            to,
            subject,
            text
        });
    }

    async createResetPasswordLink(userId: string, value: string): Promise<string> {
        const BASE_URL = process.env.BASE_URL;
        const PORT = process.env.PORT;
        const link = `${BASE_URL}:${PORT}/auth/reset-pass/${userId}/${value}`;
        return link;
    }
}
