import { ValidationPipe } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundExceptionFilter } from "../filters/not-found-exception.filter";
import { GeneratorDto } from "../generators/generate-dto";
import { TokenService } from "../reset-token/reset-token.service";
import { UsersService } from "../users/users.service";
import { ResetPassDto } from "./dto/reset-pass.dto";
import * as path from 'path';
import * as supertest from "supertest";
import * as bcrypt from 'bcryptjs';
process.env.WS_PORT = 8003;
import { AppModule } from "../app.module";

describe('AuthController', () => {
    const gDto = new GeneratorDto('auth');
    let usersService: UsersService;
    let resettokenService: TokenService;
    let app: NestExpressApplication;
    let httpServer;
    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                AppModule
            ]
        }).compile();
        usersService = module.get<UsersService>(UsersService);
        resettokenService = module.get<TokenService>(TokenService);
        app = module.createNestApplication<NestExpressApplication>();
        const httpAdapter = app.get(HttpAdapterHost);
        app.useGlobalFilters(new NotFoundExceptionFilter(httpAdapter));
        app.useGlobalPipes(new ValidationPipe);
        app.useStaticAssets(path.resolve(process.env.STATIC_PATH || 'static_path'));
        app.setViewEngine('hbs');
        await app.init();
        httpServer = app.getHttpServer();
    });
    afterAll(async () => {
        app.close();
    });
    describe('registration', () => {
        it('should return an user token', async () => {
            const data = gDto.generateUserDto();
            await supertest(httpServer)
                .post(`/auth/register`)
                .send(data)
                .expect(201);
        });
        it('should return an user token', async () => {
            const data = gDto.generateUserDto();
            await supertest(httpServer)
                .post(`/auth/register`)
                .send(data)
                .expect(201);
        });
        it('should return a 400 status code', async () => {
            const data = gDto.generateUserDto();
            await usersService.createUser(data);
            await supertest(httpServer)
                .post(`/auth/register`)
                .send(data)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const data = gDto.generateUserDto();
            await supertest(httpServer)
                .post(`/auth/register`)
                .send({...data, firstName: ''})
                .expect(400);
        });
    });
    describe('login', () => {
        it('should return an user token', async () => {
            const data = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(data.password, 5);
            await usersService.createUser({...data, password: hashPassword});
            await supertest(httpServer)
                .post(`/auth/login`)
                .send(data)
                .expect(200);
        });
        it('should return an user token', async () => {
            const data = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(data.password, 5);
            await usersService.createUser({...data, password: hashPassword});
            await supertest(httpServer)
                .post(`/auth/login`)
                .send(data)
                .expect(200);
        });
        it('should return a 400 status code', async () => {
            const data = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(data.password, 5);
            await usersService.createUser({...data, password: hashPassword});
            await supertest(httpServer)
                .post(`/auth/login`)
                .send({...data, password: ''})
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const data = gDto.generateUserDto();
            await supertest(httpServer)
                .post(`/auth/login`)
                .send(data)
                .expect(400);
        });
    });
    describe('forgot password', () => {
        it('should return a reset link information', async () => {
            const data = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(data.password, 5);
            const user = await usersService.createUser({...data, password: hashPassword});
            await supertest(httpServer)
                .post(`/auth/forgot-pass`)
                .send({email: user?.email})
                .expect(201);
        });
        it('should return a reset link information', async () => {
            const data = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(data.password, 5);
            const user = await usersService.createUser({...data, password: hashPassword});
            await supertest(httpServer)
                .post(`/auth/forgot-pass`)
                .send({email: user?.email})
                .expect(201);
        });
        it('should return a 400 status code', async () => {
            const data = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(data.password, 5);
            await usersService.createUser({...data, password: hashPassword});
            await supertest(httpServer)
                .post(`/auth/forgot-pass`)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const data = gDto.generateUserDto();
            await supertest(httpServer)
                .post(`/auth/forgot-pass`)
                .send({email: data.email})
                .expect(400);
        });
    });
    describe('reset-pass', () => {
        it('should return a successful message', async () => {
            const userData = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(userData.password, 5);
            const user = await usersService.createUser({...userData, password: hashPassword});
            const valueToken = await resettokenService.generateResetToken();
            const rtoken = await resettokenService.createToken(user?.id!, valueToken);
            const data: ResetPassDto = {
                password: 'newpass'
            }
            await supertest(httpServer)
                .post(`/auth/reset-pass/${user?.id}/${rtoken.value}`)
                .send(data)
                .expect(200);
            const getUser = await usersService.gerUserByIdWithPassword(user?.id!);
            const password = await bcrypt.compare(data.password, getUser?.password!);
            expect(password).toBe(true);
        });
        it('should return a successful message', async () => {
            const userData = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(userData.password, 5);
            const user = await usersService.createUser({...userData, password: hashPassword});
            const valueToken = await resettokenService.generateResetToken();
            const rtoken = await resettokenService.createToken(user?.id!, valueToken);
            const data: ResetPassDto = {
                password: 'newpass123'
            }
            await supertest(httpServer)
                .post(`/auth/reset-pass/${user?.id}/${rtoken.value}`)
                .send(data)
                .expect(200);
            const getUser = await usersService.gerUserByIdWithPassword(user?.id!);
            const password = await bcrypt.compare(data.password, getUser?.password!);
            expect(password).toBe(true);
        });
        it('should return a 400 status code', async () => {
            const userData = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(userData.password, 5);
            const user = await usersService.createUser({...userData, password: hashPassword});
            const valueToken = await resettokenService.generateResetToken();
            const rtoken = await resettokenService.createToken(user?.id!, valueToken);
            const data: ResetPassDto = {
                password: 'newpass'
            }
            await supertest(httpServer)
                .post(`/auth/reset-pass/${user?.id}/${rtoken.value}`)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const userData = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(userData.password, 5);
            const user = await usersService.createUser({...userData, password: hashPassword});
            const valueToken = await resettokenService.generateResetToken();
            const rtoken = await resettokenService.createToken(user?.id!, valueToken);
            const data: ResetPassDto = {
                password: 'newpass'
            }
            await supertest(httpServer)
                .post(`/auth/reset-pass/${user?.id}aaa/${rtoken.value}`)
                .send(data)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const userData = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(userData.password, 5);
            const user = await usersService.createUser({...userData, password: hashPassword});
            const valueToken = await resettokenService.generateResetToken();
            const rtoken = await resettokenService.createToken(user?.id!, valueToken);
            const data: ResetPassDto = {
                password: 'newpass'
            }
            await supertest(httpServer)
                .post(`/auth/reset-pass/${user?.id}/${rtoken.value}aaa`)
                .send(data)
                .expect(400);
        });
    });
});