import { ValidationPipe } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth/auth.service";
import { NotFoundExceptionFilter } from "../filters/not-found-exception.filter";
import { GeneratorDto } from "../generators/generate-dto";
import { RolesService } from "../roles/roles.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { User } from "../users/users.model";
import { UsersService } from "../users/users.service";
import * as path from 'path';
import { RoleTypes } from "../roles/roles.type";
import { Role } from "../roles/roles.model";
import { TeamsService } from "./teams.service";
import { CreateTeamDto } from "./dto/create-team.dto";
import * as supertest from "supertest";
import { SetManagerBodyDto } from "./dto/set-manager.dto";
import { Team } from "./teams.model";
import { CreateTeamKickDto } from "../team-kicks/dto/create-team-kick.dto";
import { AddUserToTeamDto } from "./dto/add-user-to-team.dto";
process.env.WS_PORT = 8002;
import { AppModule } from "../app.module";

describe('UsersController', () => {
    const gDto = new GeneratorDto('teams');
    let usersService: UsersService;
    let authService: AuthService;
    let rolesService: RolesService;
    let teamsService: TeamsService;
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
        teamsService = module.get<TeamsService>(TeamsService);
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
    describe('create a team', () => {
        it('should return a team', async () => {
            const data: CreateTeamDto = {
                teamName: 'createteam1'
            };
            const {body} = await supertest(httpServer)
                .post('/teams')
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(201);
            expect(body).toMatchObject({
                teamName: data.teamName
            });
        });
        it('should return a team', async () => {
            const data: CreateTeamDto = {
                teamName: 'createteam2'
            };
            const {body} = await supertest(httpServer)
                .post('/teams')
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(201);
            expect(body).toMatchObject({
                teamName: data.teamName
            });
        });
        it('should return a 400 status code', async () => {
            await supertest(httpServer)
                .post('/teams')
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const data: CreateTeamDto = {
                teamName: 'createteam4'
            };
            await supertest(httpServer)
                .post('/teams')
                .set("authorization", `Bearer ${playerToken}`)
                .send(data)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const data: CreateTeamDto = {
                teamName: 'createteam5a'
            };
            await supertest(httpServer)
                .post('/teams')
                .send(data)
                .expect(401);
        });
    });
    describe('set a manager', () => {
        it('should return a team information', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            const team = await teamsService.createTeam(dataTeam);
            const data : SetManagerBodyDto = {
                userId: user?.id!
            }
            const {body} = await supertest(httpServer)
                .post(`/teams/set-manager/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(200);
            expect(body).toMatchObject({
                id: team.id,
                managerId: user?.id!
            });
        });
        it('should return a team information', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            const team = await teamsService.createTeam(dataTeam);
            const data : SetManagerBodyDto = {
                userId: user?.id!
            }
            const {body} = await supertest(httpServer)
                .post(`/teams/set-manager/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(200);
            expect(body).toMatchObject({
                id: team.id,
                managerId: user?.id!
            });
        });
        it('should return a 400 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            await usersService.createUser(dataUser);
            const team = await teamsService.createTeam(dataTeam);
            await supertest(httpServer)
                .post(`/teams/set-manager/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            const team = await teamsService.createTeam(dataTeam);
            const data : SetManagerBodyDto = {
                userId: user?.id!
            }
            await supertest(httpServer)
                .post(`/teams/set-manager/${team.id}aa`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            const team = await teamsService.createTeam(dataTeam);
            const data : SetManagerBodyDto = {
                userId: user?.id! + 'aaa'
            }
            await supertest(httpServer)
                .post(`/teams/set-manager/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            const team = await teamsService.createTeam(dataTeam);
            const data : SetManagerBodyDto = {
                userId: user?.id!
            }
            await supertest(httpServer)
                .post(`/teams/set-manager/${team.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .send(data)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            const team = await teamsService.createTeam(dataTeam);
            const data : SetManagerBodyDto = {
                userId: user?.id!
            }
            await supertest(httpServer)
                .post(`/teams/set-manager/${team.id}`)
                .send(data)
                .expect(401);
        });
    });
    describe('unset manager', () => {
        it('should return a team information', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            team = await teamsService.setManagerTeam(user!, team);
            const {body} = await supertest(httpServer)
                .post(`/teams/unset-manager/${team?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
            expect(body).toMatchObject({
                id: team?.id,
                managerId: null
            });
        });
        it('should return a team information', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            team = await teamsService.setManagerTeam(user!, team);
            const {body} = await supertest(httpServer)
                .post(`/teams/unset-manager/${team?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
            expect(body).toMatchObject({
                id: team?.id,
                managerId: null
            });
        });
        it('should return a 400 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            team = await teamsService.setManagerTeam(user!, team);
            await supertest(httpServer)
                .post(`/teams/unset-manager/${team?.id}aa`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            team = await teamsService.setManagerTeam(user!, team);
            await supertest(httpServer)
                .post(`/teams/unset-manager/${team?.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            team = await teamsService.setManagerTeam(user!, team);
            await supertest(httpServer)
                .post(`/teams/unset-manager/${team?.id}`)
                .expect(401);
        });
    });
    describe('kick a user from a team', () => {
        it('should return a team kick information', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            await teamsService.managerPost(manager!, team);
            team = await teamsService.addUserToTeam(user!, team!);
            const teamKick: CreateTeamKickDto = {
                userId: user?.id!,
                kickReason: 'At will'
            };
            const {body} = await supertest(httpServer)
                .post(`/teams/kick`)
                .set("authorization", `Bearer ${managerToken}`)
                .send(teamKick)
                .expect(200);
            expect(body).toMatchObject({
                userId: user?.id!,
                kickedBy: manager.id
            });
        });
        it('should return a team kick information', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            await teamsService.managerPost(manager!, team);
            team = await teamsService.addUserToTeam(user!, team!);
            const teamKick: CreateTeamKickDto = {
                userId: user?.id!,
                kickReason: 'At will'
            };
            const {body} = await supertest(httpServer)
                .post(`/teams/kick`)
                .set("authorization", `Bearer ${managerToken}`)
                .send(teamKick)
                .expect(200);
            expect(body).toMatchObject({
                userId: user?.id!,
                kickedBy: manager.id
            });
        });
        it('should return a 400 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            await teamsService.managerPost(manager!, team);
            team = await teamsService.addUserToTeam(user!, team!);
            const teamKick: CreateTeamKickDto = {
                userId: user?.id! + 'aaa',
                kickReason: 'At will'
            };
            await supertest(httpServer)
                .post(`/teams/kick`)
                .set("authorization", `Bearer ${managerToken}`)
                .send(teamKick)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            await teamsService.managerPost(manager!, team);
            team = await teamsService.addUserToTeam(user!, team!);
            await supertest(httpServer)
                .post(`/teams/kick`)
                .set("authorization", `Bearer ${managerToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            await teamsService.managerPost(manager!, team);
            team = await teamsService.addUserToTeam(user!, team!);
            const teamKick: CreateTeamKickDto = {
                userId: user?.id! + 'aaa',
                kickReason: 'At will'
            };
            await supertest(httpServer)
                .post(`/teams/kick`)
                .set("authorization", `Bearer ${playerToken}`)
                .send(teamKick)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            await teamsService.managerPost(manager!, team);
            team = await teamsService.addUserToTeam(user!, team!);
            const teamKick: CreateTeamKickDto = {
                userId: user?.id! + 'aaa',
                kickReason: 'At will'
            };
            await supertest(httpServer)
                .post(`/teams/kick`)
                .send(teamKick)
                .expect(401);
        });
    });
    describe('add user to team', () => {
        it('should return a team information', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            const data: AddUserToTeamDto = {
                userId: user?.id!
            };
            const {body} = await supertest(httpServer)
                .post(`/teams/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(200);
            expect(body).toMatchObject({
                teamName: team.teamName
            });
        });
        it('should return a team information', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            const data: AddUserToTeamDto = {
                userId: user?.id!
            };
            const {body} = await supertest(httpServer)
                .post(`/teams/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(200);
            expect(body).toMatchObject({
                teamName: team.teamName
            });
        });
        it('should return a 400 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            const data: AddUserToTeamDto = {
                userId: user?.id! + 'aaa'
            };
            await supertest(httpServer)
                .post(`/teams/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            await supertest(httpServer)
                .post(`/teams/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            const data: AddUserToTeamDto = {
                userId: user?.id!
            };
            await supertest(httpServer)
                .post(`/teams/${team.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .send(data)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            const data: AddUserToTeamDto = {
                userId: user?.id!
            };
            await supertest(httpServer)
                .post(`/teams/${team.id}`)
                .send(data)
                .expect(401);
        });
    });
    describe('get your team', () => {
        it('should return a team information', async () => {
            const [playerToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team: Team | null = await teamsService.createTeam(dataTeam);
            team = await teamsService.addUserToTeam(user!, team!);
            const {body} = await supertest(httpServer)
                .get(`/teams`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(200);
            expect(body).toMatchObject({
                teamName: team.teamName
            });
        });
        it('should return a team information', async () => {
            const [playerToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team: Team | null = await teamsService.createTeam(dataTeam);
            team = await teamsService.addUserToTeam(user!, team!);
            const {body} = await supertest(httpServer)
                .get(`/teams`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(200);
            expect(body).toMatchObject({
                teamName: team.teamName
            });
        });
        it('should return a 400 status code', async () => {
            const [playerToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team: Team | null = await teamsService.createTeam(dataTeam);
            await supertest(httpServer)
                .get(`/teams`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(400);
        });
        it('should return a 401 status code', async () => {
            const [playerToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team: Team | null = await teamsService.createTeam(dataTeam);
            team = await teamsService.addUserToTeam(user!, team!);
            await supertest(httpServer)
                .get(`/teams`)
                .expect(401);
        });
    });
    describe('get all teams', () => {
        it('should return all teams', async () => {
            await supertest(httpServer)
                .get(`/teams/all`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
        });
        it('should return all teams', async () => {
            await supertest(httpServer)
                .get(`/teams/all`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(200);
        });
        it('should return a 401 status code', async () => {
            await supertest(httpServer)
                .get(`/teams/all`)
                .expect(401);
        });
    });
    describe('get a team by id', () => {
        it('should return a team information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const team: Team | null = await teamsService.createTeam(dataTeam);
            await supertest(httpServer)
                .get(`/teams/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
        });
        it('should return a team information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const team: Team | null = await teamsService.createTeam(dataTeam);
            await supertest(httpServer)
                .get(`/teams/${team.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(200);
        });
        it('should return a 400 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const team: Team | null = await teamsService.createTeam(dataTeam);
            await supertest(httpServer)
                .get(`/teams/${team.id}aaa`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 401 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const team: Team | null = await teamsService.createTeam(dataTeam);
            await supertest(httpServer)
                .get(`/teams/${team.id}`)
                .expect(401);
        });
    });
});