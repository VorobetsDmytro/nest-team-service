import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Ban } from '../bans/bans.model';
import { ProfilesService } from '../profiles/profiles.service';
import { Role } from '../roles/roles.model';
import { RolesService } from '../roles/roles.service';
import { RoleType } from '../roles/roles.type';
import { TeamRequest } from '../team-requests/team-requests.model';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './users.model';
import { v4 } from "uuid";
import * as bcrypt from 'bcryptjs';
import { HttpExceptionMessages } from '../exceptions/HttpException';
import { GetUserIdParamsDto } from './dto/get-userId.dto';
import { CreateBanDto } from '../bans/dto/create-ban.dto';
import { BansService } from '../bans/bans.service';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User) private userRepository: typeof User,
                private rolesService: RolesService,
                @Inject(forwardRef(() => ProfilesService)) private profilesService: ProfilesService,
                private bansService: BansService,
                @Inject(forwardRef(() => TeamsService)) private teamsService: TeamsService){}

    async create(dto: CreateUserDto, avatar: Express.Multer.File | null = null){
        const checkEmail = await this.getUserByEmail(dto.email);
        if(checkEmail)
            throw new HttpException(HttpExceptionMessages.EmailInUse, 400);
        const checkLogin = await this.getUserByLogin(dto.login);
        if(checkLogin)
            throw new HttpException(HttpExceptionMessages.LoginInUse, 400);
        const hashPassword = await bcrypt.hash(dto.password!, 5);
        const userId = await this.generateUserId();
        const newUser = await this.createUser({...dto, password: hashPassword, id: userId});
        if(!newUser)
            throw new HttpException(HttpExceptionMessages.CreatingUser, 400);
        if(avatar)
            await this.profilesService.uploadAvatar(newUser, avatar);
        return newUser;
    }

    async getOne(dtoParams: GetUserIdParamsDto){
        if(!dtoParams.userId)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        const user = await this.getUserById(dtoParams.userId);
        if(!user)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        return user;
    }
    
    async update(dto: UpdateUserDto, avatar: Express.Multer.File | null = null, dtoParams: GetUserIdParamsDto){
        if(!dtoParams.userId)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        let user = await this.getUserById(dtoParams.userId);
        if(!user)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        if(dto.email){
            const checkEmail = await this.getUserByEmail(dto.email);
            if(checkEmail)
                throw new HttpException(HttpExceptionMessages.EmailInUse, 400);
        }
        if(dto.login){
            const checkLogin = await this.getUserByLogin(dto.login);
            if(checkLogin)
                throw new HttpException(HttpExceptionMessages.LoginInUse, 400);
        }
        user = await this.updateUser(dto, user);
        if(!user)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        if(avatar)
            await this.profilesService.uploadAvatar(user, avatar);
        return user;
    }

    async changePass(dto: ChangePasswordDto, dtoParams: GetUserIdParamsDto){
        if(!dtoParams.userId)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        let user = await this.getUserById(dtoParams.userId);
        if(!user)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        if(this.isGoogleAccount(user))
            throw new HttpException(`Google account can't change his password.`, 400);
        if(dto.password){
            const hashPassword = await bcrypt.hash(dto.password!, 5)
            user = await this.updateUser({...dto, password: hashPassword}, user);
        }
        return user;
    }

    async delete(dtoParams: GetUserIdParamsDto){
        if(!dtoParams.userId)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        const userId = await this.deleteUser(dtoParams.userId);
        if(!userId)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        return {message: `The user 'ID: ${userId}' was deleted.`};
    }

    async ban(dtoBody: CreateBanDto, dtoParams: GetUserIdParamsDto, req){
        const reqUser = req.user as Express.User;
        if(!reqUser)
            throw new HttpException(HttpExceptionMessages.NoAccess, 403);
        if(!dtoParams.userId)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        const user = await this.getUserById(dtoParams.userId);
        if(!user)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        const lastBan = await this.isBanned(user);
        if(lastBan && !lastBan.unBannedAt)
            throw new HttpException('This user has already been banned', 400);
        if(user.teamId){
            const team = await this.teamsService.getTeamById(user.teamId);
            if(team)
                await this.teamsService.kickUser(user, team);
        }
        const banId = await this.bansService.generateBanId();
        const ban = await this.bansService.createBan({...dtoBody, id: banId, userId: user.id, bannedBy: reqUser.id});
        return ban;
    }

    async unban(dtoParams: GetUserIdParamsDto, req){
        const reqUser = req.user as Express.User;
        if(!reqUser)
            throw new HttpException(HttpExceptionMessages.NoAccess, 403);
        if(!dtoParams.userId)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        const user = await this.getUserById(dtoParams.userId);
        if(!user)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        const lastBan = await this.isBanned(user);
        if(!lastBan)
            throw new HttpException('This user is not banned.', 400);
        await this.bansService.unban(lastBan);
        return lastBan;
    }

    async createUser(dto: CreateUserDto): Promise<User | null>{
        const role = await this.rolesService.getRoleByValue('PLAYER');
        if(!role)
            return null;
        const newUser = await User.create({...dto, roleId: role.id});
        newUser.role = role;
        return newUser;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({where:{email}, include: [Role]});
    }

    async getUserById(userId: string): Promise<User | null> {
        return this.userRepository.findByPk(userId, {include: [Role, TeamRequest, Ban], attributes: {exclude: ['password']}});
    }

    async gerUserByIdWithPassword(userId: string): Promise<User | null> {
        return this.userRepository.findByPk(userId, {include: [Role, TeamRequest, Ban]});
    }

    async getAllUsers(): Promise<User[]>{
        return this.userRepository.findAll({include: [Role, TeamRequest], attributes: {exclude: ['password']}});
    }

    async updateUser(dto: UpdateUserDto | ChangePasswordDto, user: User): Promise<User>{
        await user.update(dto);
        return user;
    }

    async deleteUser(userId: string): Promise<string | null> {
        const user = await this.getUserById(userId);
        if(!user)
            return null;
        if(user.avatar)
            this.profilesService.deleteFile(user.avatar);
        await user.destroy();
        return userId;
    }

    async generateUserId(): Promise<string>{
        let user: User | null, id: string;
        do {
            id = v4();
            user = await User.findByPk(id);
        } while (user);
        return id;
    }

    isGoogleAccount(user: User): boolean{
        return Boolean(user.get('isGoogleAccount'));
    }

    async getUserByLogin(login: string): Promise<User | null> {
        return this.userRepository.findOne({where: {login}, include: [Ban, Role]});
    }

    async isAdmin(userId: string) {
        const user = await this.getUserById(userId);
        if(!user)
            return false;
        const adminRole: RoleType = "ADMIN";
        const role = await this.rolesService.getRoleByValue(adminRole);
        if(!role)
            return false;
        if(user.role.value === role.value)
            return true;
        return false;
    }

    async isBanned(user: User): Promise<Ban | null> {
        if(user.bans.length <= 0)
            return null;
        const lastBan = user.bans[user.bans.length - 1];
        if(lastBan.unBannedAt)
            return null;
        return lastBan;
    }

    async setGoogleUser(user: User){
        user.set('isGoogleAccount', true);
        await user.save();
    }
}