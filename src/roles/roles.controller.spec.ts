import { ValidationPipe } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth/auth.service";
import { NotFoundExceptionFilter } from "../filters/not-found-exception.filter";
import { GeneratorDto } from "../generators/generate-dto";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { User } from "../users/users.model";
import { UsersService } from "../users/users.service";
import { Role } from "./roles.model";
import { RolesService } from "./roles.service";
import * as path from 'path';
import * as supertest from "supertest";
import { RoleTypes } from "./roles.type";
import { CreateRoleDto } from "./dto/create-role.dto";
process.env.WS_PORT = 8005;
import { AppModule } from "../app.module";

describe('RolesController', () => {
    const gDto = new GeneratorDto('roles');
    let usersService: UsersService;
    let authService: AuthService;
    let rolesService: RolesService;
    let adminToken: string;
    let playerToken: string;
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
        app = module.createNestApplication<NestExpressApplication>();
        const httpAdapter = app.get(HttpAdapterHost);
        app.useGlobalFilters(new NotFoundExceptionFilter(httpAdapter));
        app.useGlobalPipes(new ValidationPipe);
        app.useStaticAssets(path.resolve(process.env.STATIC_PATH || 'static_path'));
        app.setViewEngine('hbs');
        await app.init();
        httpServer = app.getHttpServer();
        [playerToken] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
        [adminToken] = await createUser(gDto.generateUserDto(), RoleTypes.ADMIN);
    });
    afterAll(async () => {
        app.close();
    });
    describe('create role', () => {
        it('should return a role', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.PLAYER);
            await supertest(httpServer)
                .post(`/roles/create`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(201);
        });
        it('should return a role', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.MANAGER);
            await supertest(httpServer)
                .post(`/roles/create`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(201);
        });
        it('should return a role', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.ADMIN);
            await supertest(httpServer)
                .post(`/roles/create`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(201);
        });
        it('should return a 400 status code', async () => {
            await supertest(httpServer)
                .post(`/roles/create`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.ADMIN);
            await supertest(httpServer)
                .post(`/roles/create`)
                .set("authorization", `Bearer ${playerToken}`)
                .send(data)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.ADMIN);
            await supertest(httpServer)
                .post(`/roles/create`)
                .send(data)
                .expect(401);
        });
    });
    describe('get all roles', () => {
        it('should return all roles', async () => {
            await supertest(httpServer)
                .get(`/roles/all`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
        });
        it('should return a 403 status code', async () => {
            await supertest(httpServer)
                .get(`/roles/all`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            await supertest(httpServer)
                .get(`/roles/all`)
                .expect(401);
        });
    });
    describe('delete role by value', () => {
        it('should return a deleted role information', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.ADMIN);
            const role = await rolesService.createRole(data);
            const {body} = await supertest(httpServer)
                .delete(`/roles/delete/${role.value}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
            expect(body).toMatchObject({
                roleValue: role.value
            });
        });
        it('should return a deleted role information', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.PLAYER);
            const role = await rolesService.createRole(data);
            const {body} = await supertest(httpServer)
                .delete(`/roles/delete/${role.value}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
            expect(body).toMatchObject({
                roleValue: role.value
            });
        });
        it('should return a 400 status code', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.ADMIN);
            const role = await rolesService.createRole(data);
            await supertest(httpServer)
                .delete(`/roles/delete/${role.value}aaa`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.PLAYER);
            const role = await rolesService.createRole(data);
            await supertest(httpServer)
                .delete(`/roles/delete/${role.value}`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.PLAYER);
            const role = await rolesService.createRole(data);
            await supertest(httpServer)
                .delete(`/roles/delete/${role.value}`)
                .expect(401);
        });
    });
});