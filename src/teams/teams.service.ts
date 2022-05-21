import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { Team } from "./teams.model";
import * as uuid from 'uuid';
import { CreateTeamDto } from "./dto/create-team.dto";
import { User } from "../users/users.model";
import { TeamRequest } from "../team-requests/team-requests.model";
import { RolesService } from "../roles/roles.service";
import { TeamKick } from "../team-kicks/team-kicks.model";
import { UsersService } from "../users/users.service";
import { InjectModel } from '@nestjs/sequelize';
import { SetManagerBodyDto, SetManagerParamsDto } from './dto/set-manager.dto';
import { HttpExceptionMessages } from '../exceptions/HttpException';
import { CreateTeamKickDto } from '../team-kicks/dto/create-team-kick.dto';
import { TeamKicksService } from '../team-kicks/team-kicks.service';
import { TeamRequestsService } from '../team-requests/team-requests.service';
import { AddUserToTeamDto } from './dto/add-user-to-team.dto';
import { GetTeamByIdParamsDto } from './dto/get-team-by-id.dto';

@Injectable()
export class TeamsService {
    constructor(private rolesService: RolesService,
                @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
                @InjectModel(Team) private teamRepository: typeof Team,
                private teamKicksService: TeamKicksService,
                @Inject(forwardRef(() => TeamRequestsService)) private teamRequestsService: TeamRequestsService){}
    
    async create(dto: CreateTeamDto){
        const checkName = await this.getTeamByName(dto.teamName);
        if(checkName)
            throw new HttpException('This team name already exists.', 400);
        const id = await this.generateTeamId();
        const team = await this.createTeam({...dto, id});
        return team;
    }

    async setManager(dtoBody: SetManagerBodyDto, dtoParams: SetManagerParamsDto){
        const user = await this.usersService.getUserById(dtoBody.userId);
        if(!user)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        let team = await this.getTeamById(dtoParams?.teamId!);
        if(!team)
            throw new HttpException(HttpExceptionMessages.TeamWasNotFound, 400);
        const role = await this.rolesService.getRoleByValue('MANAGER');
        if(!role)
            throw new HttpException('Manager role was not found.', 400);
        const checkUserOnTheTeam = this.userOnTheTeam(user, team);
        if(!checkUserOnTheTeam)
            await this.addUserToTeam(user, team);
        if(team.managerId){
            const manager = await this.usersService.getUserById(team.managerId);
            if(!manager)
                throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
            await this.unsetManagerTeam(manager, team);
        }
        team = await this.setManagerTeam(user, team);
        return team;
    }

    async unsetManager(dtoParams: SetManagerParamsDto){
        let team = await this.getTeamById(dtoParams?.teamId!);
        if(!team)
            throw new HttpException(HttpExceptionMessages.TeamWasNotFound, 400);
        if(!team.managerId)
            throw new HttpException(`This team hasn't a manager.`, 400);
        const manager = await this.usersService.getUserById(team.managerId);
        if(!manager)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        team = await this.unsetManagerTeam(manager, team);
        return team;
    }

    async kick(dtoBody: CreateTeamKickDto, req){
        const reqUser = req.user as Express.User;
        if(!reqUser)
            throw new HttpException(HttpExceptionMessages.NoAccess, 403);
        const user = await this.usersService.getUserById(reqUser.id);
        if(!user)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        const kickUser = await this.usersService.getUserById(dtoBody.userId);
        if(!kickUser)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        const isAdmin = await this.usersService.isAdmin(user.id);
        if(!user.teamId && !isAdmin)
            throw new HttpException(`You don't have access to kick this user.`, 400);
        if(!kickUser.teamId)
            throw new HttpException(`This user is not a member of any team.`, 400);
        const team = await this.getTeamById(kickUser.teamId);
        if(!team)
            throw new HttpException(HttpExceptionMessages.TeamWasNotFound, 400);
        if(kickUser.teamId !== user.teamId && !isAdmin)
            throw new HttpException(`You don't have access to kick this user.`, 400);
        const teamKickId = await this.teamKicksService.generateTeamKickId();
        const teamKick = await this.teamKicksService.createTeamKick({
            ...dtoBody, 
            id: teamKickId, 
            userId: kickUser.id, 
            kickReason: dtoBody.kickReason, 
            teamId: team.id,
            kickedBy: user.id
        });
        const awaitingTeamRequest = await this.teamRequestsService.getUsersAnAwaitingRequest(kickUser);
        if(awaitingTeamRequest)
            await this.teamRequestsService.declineTeamRequest(awaitingTeamRequest);
        await this.kickUser(kickUser, team);
        return teamKick;
    }

    async addUser(dto: AddUserToTeamDto, teamId: string){
        const team = await this.getTeamById(teamId);
        if(!team)
            throw new HttpException(HttpExceptionMessages.TeamWasNotFound, 400);
        const user = await this.usersService.getUserById(dto.userId);
        if(!user)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        await this.addUserToTeam(user, team);
        return team;
    }

    async getCurrentTeam(req){
        const reqUser = req.user as Express.User;
        if(!reqUser)
            throw new HttpException(HttpExceptionMessages.NoAccess, 403);
        const user = await this.usersService.getUserById(reqUser?.id);
        if(!user)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        const team = await this.getTeamById(user.teamId!);
        if(!team)
            throw new HttpException(HttpExceptionMessages.TeamWasNotFound, 400);
        return team;
    }

    async getById(dto: GetTeamByIdParamsDto){
        const team = await this.getTeamById(dto.teamId!);
        if(!team)
            throw new HttpException(HttpExceptionMessages.TeamWasNotFound, 400);
        return team;
    }

    async getTeamByName(teamName: string): Promise<Team | null> {
        return this.teamRepository.findOne({where: {teamName}});
    }

    async getTeamById(id: string): Promise<Team | null> {
        return this.teamRepository.findByPk(id, {include: [{model: User, attributes: {exclude: ['password']}}, 
            TeamRequest, TeamKick]});
    }

    async generateTeamId(): Promise<string> {
        let team: Team | null, id: string;
        do {
            id = uuid.v4();
            team = await this.teamRepository.findByPk(id);
        } while (team);
        return id;
    }

    async createTeam(dto: CreateTeamDto): Promise<Team> {
        return this.teamRepository.create(dto, {include: [{model: User, attributes: {exclude: ['password']}}]});
    }

    async addUserToTeam(user: User, team: Team): Promise<Team> {
        await team.$add('users', user);
        if(team.users)
            team.users.push(user);
        return team;
    }

    async getAll(): Promise<Team[]> {
        return this.teamRepository.findAll({include: [{model: User, attributes: {exclude: ['password']}}, 
            TeamRequest, TeamKick]});
    }

    userOnTheTeam(user: User, team: Team): boolean {
        if(user.teamId && user.teamId === team.id)
            return true;
        return false;
    }

    async setManagerTeam(user: User, team: Team): Promise<Team | null> {
        team.managerId = user.id;
        const managerRole = await this.rolesService.getRoleByValue('MANAGER');
        if(!managerRole)
            return null;
        await this.rolesService.setRoleToUser(managerRole, user);
        await team.save();
        return team;
    }

    async unsetManagerTeam(user: User, team: Team): Promise<Team | null> {
        team.managerId = null;
        const playerRole = await this.rolesService.getRoleByValue('PLAYER');
        if(!playerRole)
            return null;
        await this.rolesService.setRoleToUser(playerRole, user);
        await team.save();
        return team;
    }

    async getManagerTeam(team: Team): Promise<User | null> {
        if(!team.managerId)
            return null;
        const manager = await this.usersService.getUserById(team.managerId);
        if(!manager)
            return null;
        return manager;
    }

    async managerPost(user: User, team: Team){
        const checkUserOnTheTeam = this.userOnTheTeam(user, team);
        if(!checkUserOnTheTeam)
            await this.addUserToTeam(user, team);
        const manager = await this.getManagerTeam(team);
        if(manager)
            await this.unsetManagerTeam(manager, team);
        await this.setManagerTeam(user, team);
    }

    async leaveTheTeam(user: User, team: Team): Promise<User> {
        if(team.managerId === user.id){
            team.managerId = null;
            await team.save();
        }
        user.teamId = null;
        await user.save();
        return user;
    }

    async moveToAnotherTeam(user: User, teamId: string): Promise<User | null> {
        const team = await Team.findByPk(teamId);
        if(!team)
            return null;
        user.teamId = team.id;
        await user.save();
        return user;
    }

    async kickUser(user: User, team: Team): Promise<User>{
        if(team.managerId === user.id)
            await this.unsetManagerTeam(user, team);
        user.teamId = null;
        await user.save();
        return user;
    }
}
