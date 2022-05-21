import { ValidationPipe } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth/auth.service";
import { NotFoundExceptionFilter } from "../filters/not-found-exception.filter";
import { GeneratorDto } from "../generators/generate-dto";
import { RolesService } from "../roles/roles.service";
import { TeamRequestApprovementService } from "../team-request-approvement/team-request-approvement.service";
import { TeamsService } from "../teams/teams.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { UsersService } from "../users/users.service";
import { TeamRequestsService } from "./team-requests.service";
import * as path from 'path';
import * as supertest from "supertest";
import { RoleTypes } from "../roles/roles.type";
import { CreateTeamDto } from "../teams/dto/create-team.dto";
import { CreateTeamRequestDto } from "./dto/create-team-request.dto";
process.env.WS_PORT = 8004;
import { AppModule } from "../app.module";
import { ETeamRequestStatusType, ETeamRequestTypes } from "./team-requests.type";
import { User } from "../users/users.model";
import { Role } from "../roles/roles.model";

describe('TeamRequestsController', () => {
    const gDto = new GeneratorDto('team-requests');
    let usersService: UsersService;
    let authService: AuthService;
    let rolesService: RolesService;
    let teamsService: TeamsService;
    let teamRequestsService: TeamRequestsService;
    let teamRequestApprovementsService: TeamRequestApprovementService;
    let adminToken: string;
    let playerToken: string;
    let managerToken: string;
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
        teamRequestsService = module.get<TeamRequestsService>(TeamRequestsService);
        teamRequestApprovementsService = module.get<TeamRequestApprovementService>(TeamRequestApprovementService);
        app = module.createNestApplication<NestExpressApplication>();
        const httpAdapter = app.get(HttpAdapterHost);
        app.useGlobalFilters(new NotFoundExceptionFilter(httpAdapter));
        app.useGlobalPipes(new ValidationPipe);
        app.useStaticAssets(path.resolve(process.env.STATIC_PATH || 'static_path'));
        app.setViewEngine('hbs');
        await app.init();
        httpServer = app.getHttpServer();
        [playerToken] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
        [managerToken] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
        [adminToken] = await createUser(gDto.generateUserDto(), RoleTypes.ADMIN);
    });
    afterAll(async () => {
        app.close();
    });
    describe('join the team', () => {
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const team = await teamsService.createTeam(dataTeam);
            const teamRequest: CreateTeamRequestDto = {
                teamId: team.id
            };
            const {body} = await supertest(httpServer)
                .post(`/team-requests/join-the-team`)
                .set("authorization", `Bearer ${userToken}`)
                .send(teamRequest)
                .expect(201);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id
            });
        });
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const team = await teamsService.createTeam(dataTeam);
            const teamRequest: CreateTeamRequestDto = {
                teamId: team.id
            };
            const {body} = await supertest(httpServer)
                .post(`/team-requests/join-the-team`)
                .set("authorization", `Bearer ${userToken}`)
                .send(teamRequest)
                .expect(201);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id
            });
        });
        it('should return a 400 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [userToken] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.createTeam(dataTeam);
            await supertest(httpServer)
                .post(`/team-requests/join-the-team`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const team = await teamsService.createTeam(dataTeam);
            const teamRequest: CreateTeamRequestDto = {
                teamId: team.id
            };
            await supertest(httpServer)
                .post(`/team-requests/join-the-team`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(teamRequest)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const team = await teamsService.createTeam(dataTeam);
            const teamRequest: CreateTeamRequestDto = {
                teamId: team.id
            }
            await supertest(httpServer)
                .post(`/team-requests/join-the-team`)
                .send(teamRequest)
                .expect(401);
        });
    });
    describe('move to another team', () => {
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            const teamRequest: CreateTeamRequestDto = {
                teamId: team.id
            };
            const {body} = await supertest(httpServer)
                .post(`/team-requests/move-to-another-team`)
                .set("authorization", `Bearer ${userToken}`)
                .send(teamRequest)
                .expect(201);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id
            });
        });
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            const teamRequest: CreateTeamRequestDto = {
                teamId: team.id
            };
            const {body} = await supertest(httpServer)
                .post(`/team-requests/move-to-another-team`)
                .set("authorization", `Bearer ${userToken}`)
                .send(teamRequest)
                .expect(201);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id
            });
        });
        it('should return a 400 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            await supertest(httpServer)
                .post(`/team-requests/move-to-another-team`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            const teamRequest: CreateTeamRequestDto = {
                teamId: team.id
            };
            await supertest(httpServer)
                .post(`/team-requests/move-to-another-team`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(teamRequest)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            const teamRequest: CreateTeamRequestDto = {
                teamId: team.id
            };
            await supertest(httpServer)
                .post(`/team-requests/move-to-another-team`)
                .send(teamRequest)
                .expect(401);
        });
    });
    describe('get all team requests', () => {
        it('should return all team requests', async () => {
            await supertest(httpServer)
                .get(`/team-requests/all`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
        });
        it('should return all team requests', async () => {
            await supertest(httpServer)
                .get(`/team-requests/all`)
                .set("authorization", `Bearer ${managerToken}`)
                .expect(200);
        });
        it('should return a 403 status code', async () => {
            await supertest(httpServer)
                .get(`/team-requests/all`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            await supertest(httpServer)
                .get(`/team-requests/all`)
                .expect(401);
        });
    });
    describe('leave the team', () => {
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            const {body} = await supertest(httpServer)
                .get(`/team-requests/leave-the-team`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(201);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id
            });
        });
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            await supertest(httpServer)
                .get(`/team-requests/leave-the-team`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(201);
        });
        it('should return a 403 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            await teamsService.managerPost(manager, team);
            await supertest(httpServer)
                .get(`/team-requests/leave-the-team`)
                .set("authorization", `Bearer ${managerToken}`)
                .expect(403);
        });
        it('should return a 403 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            await supertest(httpServer)
                .get(`/team-requests/leave-the-team`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            await supertest(httpServer)
                .get(`/team-requests/leave-the-team`)
                .expect(401);
        });
    });
    describe('manager post', () => {
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const {body} = await supertest(httpServer)
                .get(`/team-requests/manager-post/${team.id}`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(201);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id
            });
        });
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const {body} = await supertest(httpServer)
                .get(`/team-requests/manager-post/${team.id}`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(201);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id
            });
        });
        it('should return a 400 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await supertest(httpServer)
                .get(`/team-requests/manager-post/${team.id}aaa`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await supertest(httpServer)
                .get(`/team-requests/manager-post/${team.id}`)
                .set("authorization", `Bearer ${managerToken}`)
                .expect(403);
        });
        it('should return a 403 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await supertest(httpServer)
                .get(`/team-requests/manager-post/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await supertest(httpServer)
                .get(`/team-requests/manager-post/${team.id}`)
                .expect(401);
        });
    });
    describe('accept a request', () => {
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            await teamsService.managerPost(manager, team);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.JOIN_THE_TEAM,
                    user.id,
                    team.id
                ));
            const {body} = await supertest(httpServer)
                .get(`/team-requests/accept/${teamRequest.id}`)
                .set("authorization", `Bearer ${managerToken}`)
                .expect(200);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id,
                status: ETeamRequestStatusType.ACCEPTED
            });
        });
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const [, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            await teamsService.managerPost(manager, team);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.JOIN_THE_TEAM,
                    user.id,
                    team.id
                ));
            const {body} = await supertest(httpServer)
                .get(`/team-requests/accept/${teamRequest.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id,
                status: ETeamRequestStatusType.ACCEPTED
            });
        });
        it('should return a team request information', async () => {
            const dataTeamFrom: CreateTeamDto = gDto.generateTeamDto();
            const dataTeamTo: CreateTeamDto = gDto.generateTeamDto();
            let teamFrom = await teamsService.createTeam(dataTeamFrom);
            let teamTo = await teamsService.createTeam(dataTeamTo);
            const [, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const [managerTokenFrom, managerFrom] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            const [managerTokenTo, managerTo] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            await teamsService.addUserToTeam(user, teamFrom);
            await teamsService.managerPost(managerFrom, teamFrom);
            await teamsService.managerPost(managerTo, teamTo);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.MOVE_TO_ANOTHER_TEAM,
                    user.id,
                    teamFrom.id,
                    teamTo.id
                ));
            await teamRequestApprovementsService.createTeamRequestApprovement(gDto.generateTeamRequestApprovementDto(
                    teamRequest.id,
                    teamFrom.id,
                    teamTo.id
                ));
            const {body: bodyFirst} = await supertest(httpServer)
                .get(`/team-requests/accept/${teamRequest.id}`)
                .set("authorization", `Bearer ${managerTokenFrom}`)
                .expect(200);
            expect(bodyFirst).toMatchObject({
                userId: user?.id!,
                teamId: teamTo.id,
                status: ETeamRequestStatusType.AWAITING
            });
            const {body: bodySecond} = await supertest(httpServer)
                .get(`/team-requests/accept/${teamRequest.id}`)
                .set("authorization", `Bearer ${managerTokenTo}`)
                .expect(200);
            expect(bodySecond).toMatchObject({
                userId: user?.id!,
                teamId: teamFrom.id,
                status: ETeamRequestStatusType.ACCEPTED
            });
            const getUser = await usersService.getUserById(user.id);
            expect(getUser).toMatchObject({
                id: user.id,
                teamId: teamTo.id
            });
        });
        it('should return a 403 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            await teamsService.managerPost(manager, team);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.JOIN_THE_TEAM,
                    user.id,
                    team.id
                ));
            await supertest(httpServer)
                .get(`/team-requests/accept/${teamRequest.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const [, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            await teamsService.managerPost(manager, team);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.JOIN_THE_TEAM,
                    user.id,
                    team.id
                ));
            await supertest(httpServer)
                .get(`/team-requests/accept/${teamRequest.id}`)
                .expect(401);
        });
    });
    describe('decline a request', () => {
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.JOIN_THE_TEAM,
                    user.id,
                    team.id
                ));
            const {body} = await supertest(httpServer)
                .get(`/team-requests/decline/${teamRequest.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id,
                status: ETeamRequestStatusType.DECLINED
            });
        });
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            await teamsService.managerPost(manager, team);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.JOIN_THE_TEAM,
                    user.id,
                    team.id
                ));
            const {body} = await supertest(httpServer)
                .get(`/team-requests/decline/${teamRequest.id}`)
                .set("authorization", `Bearer ${managerToken}`)
                .expect(200);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id,
                status: ETeamRequestStatusType.DECLINED
            });
        });
        it('should return a 400 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.JOIN_THE_TEAM,
                    user.id,
                    team.id
                ));
            await supertest(httpServer)
                .get(`/team-requests/decline/${teamRequest.id}aaa`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.JOIN_THE_TEAM,
                    user.id,
                    team.id
                ));
            await supertest(httpServer)
                .get(`/team-requests/decline/${teamRequest.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.JOIN_THE_TEAM,
                    user.id,
                    team.id
                ));
            await supertest(httpServer)
                .get(`/team-requests/decline/${teamRequest.id}`)
                .expect(401);
        });
    });
    describe('decline your team request', () => {
        it('should return a 200 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                ETeamRequestTypes.JOIN_THE_TEAM,
                user.id,
                team.id
            ));
            await supertest(httpServer)
                .delete(`/team-requests`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(200);
        });
        it('should return a 200 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
             await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                ETeamRequestTypes.LEAVE_THE_TEAM,
                user.id,
                team.id
            ));
            await supertest(httpServer)
                .delete(`/team-requests`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(200);
        });
        it('should return a 400 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            await teamsService.createTeam(dataTeam);
            const [userToken] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await supertest(httpServer)
                .delete(`/team-requests`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(400);
        });
        it('should return a 401 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                ETeamRequestTypes.JOIN_THE_TEAM,
                user.id,
                team.id
            ));
            await supertest(httpServer)
                .delete(`/team-requests`)
                .expect(401);
        });
    });
});