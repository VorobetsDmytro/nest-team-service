import { ValidationPipe } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth/auth.service";
import { NotFoundExceptionFilter } from "../filters/not-found-exception.filter";
import { GeneratorDto } from "../generators/generate-dto";
import { Role } from "../roles/roles.model";
import { RolesService } from "../roles/roles.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { User } from "../users/users.model";
import { UsersService } from "../users/users.service";
import * as supertest from "supertest";
import * as path from 'path';
import { RoleTypes } from "../roles/roles.type";
process.env.WS_PORT = 8006;
import { AppModule } from "../app.module";

describe('UsersController', () => {
    const gDto = new GeneratorDto('profiles');
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
    describe('get your profile', () => {
        it('should return a user profile', async () => {
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const {body} = await supertest(httpServer)
                .get('/profiles')
                .set("authorization", `Bearer ${userToken}`)
                .expect(200);
            expect(body).toMatchObject({
                id: user?.id,
                email: user?.email
            });
        });
        it('should return an user profile', async () => {
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.ADMIN);
            const {body} = await supertest(httpServer)
                .get('/profiles')
                .set("authorization", `Bearer ${userToken}`)
                .expect(200);
            expect(body).toMatchObject({
                id: user?.id,
                email: user?.email
            });
        });
        it('should return a 401 status code', async () => {
            await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await supertest(httpServer)
                .get('/profiles')
                .expect(401);
        });
    });
    describe('change an user profile', () => {
        it('should return a user profile ', async () => {
            const [userToken] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const data = gDto.generateChangeProfileDto();
            const {body} = await supertest(httpServer)
                .patch('/profiles')
                .set("authorization", `Bearer ${userToken}`)
                .send(data)
                .expect(200);
            expect(body).toMatchObject({
                avatar: data.avatar,
                login: data.login
            });
        });
        it('should return an user profile ', async () => {
            const [userToken] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            const data = gDto.generateChangeProfileDto();
            const {body} = await supertest(httpServer)
                .patch('/profiles')
                .set("authorization", `Bearer ${userToken}`)
                .send(data)
                .expect(200);
            expect(body).toMatchObject({
                avatar: data.avatar,
                login: data.login
            });
        });
        it('should return a 401 status code ', async () => {
            await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const data = gDto.generateChangeProfileDto();
            await supertest(httpServer)
                .patch('/profiles')
                .send(data)
                .expect(401);
        });
    });
});