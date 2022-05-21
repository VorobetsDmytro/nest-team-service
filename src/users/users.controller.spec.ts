import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from "./users.service";
import { AuthService } from "../auth/auth.service";
import { RolesService } from "../roles/roles.service";
import { BansService } from "../bans/bans.service";
import { NestExpressApplication } from "@nestjs/platform-express";
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './users.model';
import { GeneratorDto } from '../generators/generate-dto';
import { Role } from '../roles/roles.model';
import { RoleTypes } from '../roles/roles.type';
import * as supertest from "supertest";
import * as bcrypt from 'bcryptjs';
import { CreateBanDto } from '../bans/dto/create-ban.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { NotFoundExceptionFilter } from '../filters/not-found-exception.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as path from 'path';
process.env.WS_PORT = 8001;
import { AppModule } from "../app.module";

describe('UsersController', () => {
    const gDto = new GeneratorDto('users');
    let usersService: UsersService;
    let authService: AuthService;
    let rolesService: RolesService;
    let bansService: BansService;
    let adminToken: string;
    let playerToken: string;
    let playerUser: User;
    let adminUser: User;
    let app: NestExpressApplication;
    let httpServer;
    const createUser = async (userDto: CreateUserDto, role: string): Promise<[string, User, Role]> => {
        const userRole = await rolesService.getRoleByValue(role);
        let user = await usersService.createUser(userDto);
        user = await rolesService.setRoleToUser(userRole!, user!);
        const token = await authService.generateToken(user!);
        return [token, user, userRole!];
    }
    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                AppModule
            ]
        }).compile();
        usersService = module.get<UsersService>(UsersService);
        authService = module.get<AuthService>(AuthService);
        rolesService = module.get<RolesService>(RolesService);
        bansService = module.get<BansService>(BansService);
        app = module.createNestApplication<NestExpressApplication>();
        const httpAdapter = app.get(HttpAdapterHost);
        app.useGlobalFilters(new NotFoundExceptionFilter(httpAdapter));
        app.useGlobalPipes(new ValidationPipe);
        app.useStaticAssets(path.resolve(process.env.STATIC_PATH || 'static_path'));
        app.setViewEngine('hbs');
        await app.init();
        httpServer = app.getHttpServer();
        [playerToken, playerUser] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
        [adminToken, adminUser] = await createUser(gDto.generateUserDto(), RoleTypes.ADMIN);
    });
    afterAll(async () => {
        app.close();
    });
    describe('create an user', () => {
        it('should return an user', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            const {body} = await supertest(httpServer)
                .post('/users')
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(201);
            expect(body).toMatchObject({
                email: data.email,
                login: data.login,
                firstName: data.firstName,
                lastName: data.lastName
            });
        });
        it('should return an user', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            const {body} = await supertest(httpServer)
                .post('/users')
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(201);
            expect(body).toMatchObject({
                email: data.email,
                login: data.login,
                firstName: data.firstName,
                lastName: data.lastName
            });
        });
        it('should return a 400 status code', async () => {
            const data = gDto.generateUserDto();
            data.firstName = '';
            await supertest(httpServer)
                .post('/users')
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            await usersService.createUser(data);
            await supertest(httpServer)
                .post('/users')
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(400);
        });
        it('should return a 401 status code', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            await supertest(httpServer)
                .post('/users')
                .send(data)
                .expect(401);
        });
        it('should return a 403 status code', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            await supertest(httpServer)
                .post('/users')
                .set("authorization", `Bearer ${playerToken}`)
                .send(data)
                .expect(403);
        });
    });
    describe('ban an user', () => {
        it('should return a ban user info', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            const ban: CreateBanDto = {
                banReason: 'Spam'
            } 
            const banUser = await usersService.createUser(data);
            const {body} = await supertest(httpServer)
                .post(`/users/ban/${banUser?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(ban)
                .expect(201);
            expect(body).toMatchObject({
                userId: banUser?.id,
                banReason: ban.banReason
            });
        });
        it('should return a ban user info', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            const ban: CreateBanDto = {
                banReason: 'Hax'
            } 
            const banUser = await usersService.createUser(data);
            const {body} = await supertest(httpServer)
                .post(`/users/ban/${banUser?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(ban)
                .expect(201);
            expect(body).toMatchObject({
                userId: banUser?.id,
                banReason: ban.banReason
            });
        });
        it('should return a 400 status code', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            const ban: CreateBanDto = {
                banReason: 'Hax'
            } 
            const banUser = await usersService.createUser(data);
            await supertest(httpServer)
                .post(`/users/ban/${banUser?.id}aaa`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(ban)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            const banUser = await usersService.createUser(data);
            await supertest(httpServer)
                .post(`/users/ban/${banUser?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send({})
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            const ban: CreateBanDto = {
                banReason: 'Hax'
            } 
            const banUser = await usersService.createUser(data);
            await supertest(httpServer)
                .post(`/users/ban/${banUser?.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .send(ban)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            const ban: CreateBanDto = {
                banReason: 'Hax'
            } 
            const banUser = await usersService.createUser(data);
            await supertest(httpServer)
                .post(`/users/ban/${banUser?.id}`)
                .send(ban)
                .expect(401);
        });
    });
    describe('unban an user by id', () => {
        it('should return unban info', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const banDto: CreateBanDto = gDto.generateBanDto(adminUser.id!, userData.id!);
            const unbanUser = await usersService.createUser(userData);
            const ban = await bansService.createBan(banDto);
            const {body} = await supertest(httpServer)
                .get(`/users/unban/${unbanUser?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
            expect(body).toMatchObject({
                id: ban.id,
                banReason: ban.banReason,
                bannedBy: adminUser.id,
                userId: unbanUser?.id
            });
        });
        it('should return unban info', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const banDto: CreateBanDto = gDto.generateBanDto(adminUser.id!, userData.id!);
            const unbanUser = await usersService.createUser(userData);
            const ban = await bansService.createBan(banDto);
            const {body} = await supertest(httpServer)
                .get(`/users/unban/${unbanUser?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
            expect(body).toMatchObject({
                id: ban.id,
                banReason: ban.banReason,
                bannedBy: adminUser.id,
                userId: unbanUser?.id
            });
        });
        it('should return a 400 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const banDto: CreateBanDto = gDto.generateBanDto(adminUser.id!, userData.id!);
            const unbanUser = await usersService.createUser(userData);
            await bansService.createBan(banDto);
            await supertest(httpServer)
                .get(`/users/unban/${unbanUser?.id}aaa`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const banDto: CreateBanDto = gDto.generateBanDto(adminUser.id!, userData.id!);
            const unbanUser = await usersService.createUser(userData);
            await bansService.createBan(banDto);
            await supertest(httpServer)
                .get(`/users/unban/${unbanUser?.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const banDto: CreateBanDto = gDto.generateBanDto(adminUser.id!, userData.id!);
            const unbanUser = await usersService.createUser(userData);
            await bansService.createBan(banDto);
            await supertest(httpServer)
                .get(`/users/unban/${unbanUser?.id}`)
                .expect(401);
        });
    });
    describe('get all users', () => {
        it('should return all users', async () => {
            await supertest(httpServer)
                .get('/users/')
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
        });
        it('should return a 403 status code', async () => {
            await supertest(httpServer)
                .get('/users/')
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            await supertest(httpServer)
                .get('/users/')
                .expect(401);
        });
    });
    describe('get an user by id', () => {
        it('should return user', async () => {
            const {body} = await supertest(httpServer)
                .get(`/users/${playerUser.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
            expect(body).toMatchObject({
                id: playerUser.id
            });
        });
        it('should return 400 status code', async () => {
            await supertest(httpServer)
                .get(`/users/${playerUser.id}a`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            await supertest(httpServer)
                .get(`/users/${playerUser.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            await supertest(httpServer)
                .get(`/users/${playerUser.id}`)
                .expect(401);
        });
    });
    describe('update an user', () => {
        it('should return an updated user', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: UpdateUserDto = {
                firstName: 'Newfirstname'
            };
            const user = await usersService.createUser(userData);
            const {body} = await supertest(httpServer)
                .patch(`/users/${user?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(200);
            expect(body).toMatchObject({
                id: user?.id,
                firstName: data.firstName
            });
        });
        it('should return an updated user', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: UpdateUserDto = {
                firstName: 'Newfirstname',
                lastName: 'Newlastname'
            };
            const user = await usersService.createUser(userData);
            const {body} = await supertest(httpServer)
                .patch(`/users/${user?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(200);
            expect(body).toMatchObject({
                id: user?.id,
                firstName: data.firstName,
                lastName: data.lastName
            });
        });
        it('should return a 400 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: UpdateUserDto = {
                firstName: 'Newfirstname123',
                lastName: 'Newlastname'
            };
            const user = await usersService.createUser(userData);
            await supertest(httpServer)
                .patch(`/users/${user?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: UpdateUserDto = {
                firstName: 'Newfirstname',
                lastName: 'Newlastname'
            };
            const user = await usersService.createUser(userData);
            await supertest(httpServer)
                .patch(`/users/${user?.id}aaa`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: UpdateUserDto = {
                firstName: 'Newfirstname',
                lastName: 'Newlastname'
            };
            const user = await usersService.createUser(userData);
            await supertest(httpServer)
                .patch(`/users/${user?.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .send(data)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: UpdateUserDto = {
                firstName: 'Newfirstname',
                lastName: 'Newlastname'
            };
            const user = await usersService.createUser(userData);
            await supertest(httpServer)
                .patch(`/users/${user?.id}`)
                .send(data)
                .expect(401);
        });
    });
    describe('change a pass user', () => {
        it('should return an updated user', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: ChangePasswordDto = {
                password: 'newpass'
            }
            const user = await usersService.createUser(userData);
            let {body} = await supertest(httpServer)
                .patch(`/users/change-pass/${user?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(200);
            const password = await bcrypt.compare(data.password, body.password);
            expect({...body, password}).toMatchObject({
                id: user?.id,
                password: true
            });
        });
        it('should return an updated user', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: ChangePasswordDto = {
                password: 'newpass'
            }
            const user = await usersService.createUser(userData);
            let {body} = await supertest(httpServer)
                .patch(`/users/change-pass/${user?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(200);
            const password = await bcrypt.compare(data.password, body.password);
            expect({...body, password}).toMatchObject({
                id: user?.id,
                password: true
            });
        });
        it('should return a 400 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const user = await usersService.createUser(userData);
            await supertest(httpServer)
                .patch(`/users/change-pass/${user?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return an updated user', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: ChangePasswordDto = {
                password: 'newpass'
            }
            const user = await usersService.createUser(userData);
            await supertest(httpServer)
                .patch(`/users/change-pass/${user?.id}a`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: ChangePasswordDto = {
                password: 'newpass'
            }
            const user = await usersService.createUser(userData);
            await supertest(httpServer)
                .patch(`/users/change-pass/${user?.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .send(data)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: ChangePasswordDto = {
                password: 'newpass'
            }
            const user = await usersService.createUser(userData);
            await supertest(httpServer)
                .patch(`/users/change-pass/${user?.id}`)
                .send(data)
                .expect(401);
        });
    });
    describe('delete an user' , () => {
        it('should return an information message', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const user = await usersService.createUser(userData);
            await supertest(httpServer)
                .delete(`/users/${user?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
        });
        it('should return an information message', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const user = await usersService.createUser(userData);
            await supertest(httpServer)
                .delete(`/users/${user?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
        });
        it('should return a 400 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const user = await usersService.createUser(userData);
            await supertest(httpServer)
                .delete(`/users/${user?.id}aa`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const user = await usersService.createUser(userData);
            await supertest(httpServer)
                .delete(`/users/${user?.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const user = await usersService.createUser(userData);
            await supertest(httpServer)
                .delete(`/users/${user?.id}`)
                .expect(401);
        });
    });
});