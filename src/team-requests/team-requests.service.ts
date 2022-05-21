import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TeamsService } from '../teams/teams.service';
import { UsersService } from '../users/users.service';
import { CreateTeamRequestDto } from './dto/create-team-request.dto';
import { TeamRequest } from './team-requests.model';
import * as uuid from 'uuid';
import { User } from "../users/users.model";
import { ETeamRequestStatusType, ETeamRequestTypes } from "./team-requests.type";
import { TeamRequestApprovement } from "../team-request-approvement/team-requests-approvement.model";
import { Team } from "../teams/teams.model";
import { HttpExceptionMessages } from "../exceptions/HttpException";
import { AcceptReqeustParamsDto } from "./dto/accept-request.dto";
import { DeclineReqeustParamsDto } from "./dto/decline-request.dto";
import { TeamRequestApprovementService } from '../team-request-approvement/team-request-approvement.service';
import { GetTeamByIdParamsDto } from '../teams/dto/get-team-by-id.dto';

@Injectable()
export class TeamRequestsService {
    constructor(@InjectModel(TeamRequest) private teamRequestRepository: typeof TeamRequest,
                @Inject(forwardRef(() => TeamsService)) private teamsService: TeamsService,
                @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
                private teamRequestApprovementsService: TeamRequestApprovementService){}

    async joinTheTeam(dto: CreateTeamRequestDto, req){
        const userId = req.user?.id;
        const validationResultReq = await this.validateTeamRequestForCreation(userId!, dto.teamId);
        if(validationResultReq instanceof HttpException)
            throw validationResultReq;
        const [user, team] = validationResultReq;
        const checkUserOnTheTeam = this.teamsService.userOnTheTeam(user, team);
        if(checkUserOnTheTeam)
            throw new HttpException('This user is already on the team.', 400);
        const id = await this.generateTeamRequestsId();
        const teamRequest = await this.createTeamRequest({
            ...dto, 
            id, 
            userId, 
            requestType: ETeamRequestTypes.JOIN_THE_TEAM, 
            status: ETeamRequestStatusType.AWAITING
        });
        return teamRequest;
    }

    async moveToAnotherTeam(dto: CreateTeamRequestDto, req){
        const userId = req.user?.id;
        const validationResultReq = await this.validateTeamRequestForCreation(userId!);
        if(validationResultReq instanceof HttpException)
            throw validationResultReq;
        const [user, team] = validationResultReq;
        const id = await this.generateTeamRequestsId();
        const teamRequest = await this.createTeamRequest({
            id, 
            userId, 
            requestType: ETeamRequestTypes.MOVE_TO_ANOTHER_TEAM, 
            status: ETeamRequestStatusType.AWAITING, 
            teamId: team.id
        });
        const teamRequestApprovementId = await this.teamRequestApprovementsService.generateTeamRequestsApprovementId();
        await this.teamRequestApprovementsService.createTeamRequestApprovement({
            id: teamRequestApprovementId, 
            teamRequestId:teamRequest.id, 
            fromTeamId: user.teamId!, 
            toTeamId: dto.teamId
        });
        return teamRequest;
    }

    async deleteRequest(req){
        const userId = req.user?.id;
        if(!userId)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        const user = await this.usersService.getUserById(userId);
        if(!user)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        const getUsersAnAwaitingRequest = this.getUsersAnAwaitingRequest(user);
        if(!getUsersAnAwaitingRequest)
            throw new HttpException(`This team request is already verified.`, 400);
        await this.deleteTeamRequest(getUsersAnAwaitingRequest);
        return {message: 'Your team request was declined successfully.'};
    }

    async leaveTheTeam(req){
        const userId = req.user?.id;
        const validationResultReq = await this.validateTeamRequestForCreation(userId!);
        if(validationResultReq instanceof HttpException)
            throw validationResultReq;
        const [, team] = validationResultReq;
        const id = await this.generateTeamRequestsId();
        const teamRequest = await this.createTeamRequest({
            id, 
            userId, 
            requestType: ETeamRequestTypes.LEAVE_THE_TEAM, 
            status: ETeamRequestStatusType.AWAITING, 
            teamId: team.id
        });
        return teamRequest;
    }

    async managerPost(dtoParams: GetTeamByIdParamsDto, req){
        const userId = req.user?.id;
        const validationResultReq = await this.validateTeamRequestForCreation(userId!, dtoParams.teamId);
        if(validationResultReq instanceof HttpException)
            throw validationResultReq;
        const [, team] = validationResultReq;
        const id = await this.generateTeamRequestsId();
        const teamRequest = await this.createTeamRequest({
            id, 
            userId, 
            requestType: ETeamRequestTypes.MANAGER_POST, 
            status: ETeamRequestStatusType.AWAITING, 
            teamId: team.id
        });
        return teamRequest;
    }

    async acceptRequest(dtoParams: AcceptReqeustParamsDto, req){
        const userId = req.user?.id;
        const validationResultReq = await this.validateTeamRequestForAcceptingOrDeclining(userId!, dtoParams);
        if(validationResultReq instanceof HttpException)
            throw validationResultReq;
        let [user, team, teamRequest] = validationResultReq;
        const isAdmin = await this.usersService.isAdmin(user.id);
        if(teamRequest.requestType === ETeamRequestTypes.MANAGER_POST && !isAdmin)
            throw new HttpException(`You don't have access to accept this team request.`, 400);
        if(teamRequest.teamRequestApprovement)
            teamRequest.teamRequestApprovement = await this.teamRequestApprovementsService.acceptApprovement(teamRequest.teamRequestApprovement, teamRequest, team);
        teamRequest = await this.acceptTeamRequest(teamRequest);
        const userForExecute = await this.usersService.getUserById(teamRequest.userId);
        if(!userForExecute)
            throw new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        await this.executeRequest(teamRequest, team, userForExecute);
        return teamRequest;
    }

    async declineRequest(dtoParams: AcceptReqeustParamsDto, req){
        const userId = req.user?.id;
        const validationResultReq = await this.validateTeamRequestForAcceptingOrDeclining(userId!, dtoParams);
        if(validationResultReq instanceof HttpException)
            throw validationResultReq;
        let [, team, teamRequest] = validationResultReq;
        if(teamRequest.teamRequestApprovement)
            teamRequest.teamRequestApprovement = await this.teamRequestApprovementsService.declineApprovement(teamRequest.teamRequestApprovement, team);
        teamRequest = await this.declineTeamRequest(teamRequest);
        return teamRequest;
    }
    
    async createTeamRequest(dto: CreateTeamRequestDto): Promise<TeamRequest> {
        return this.teamRequestRepository.create(dto);
    }

    async getAllTeamRequests(): Promise<TeamRequest[]> {
        return this.teamRequestRepository.findAll();
    }

    async generateTeamRequestsId(): Promise<string> {
        let teamRequest: TeamRequest | null, id: string;
        do {
            id = uuid.v4();
            teamRequest = await this.teamRequestRepository.findByPk(id);
        } while (teamRequest);
        return id;
    }

    async deleteTeamRequest(teamRequest: TeamRequest): Promise<void> {
        if(teamRequest.teamRequestApprovement)
            await teamRequest.teamRequestApprovement.destroy();
        await teamRequest.destroy();
        return;
    }

    async getTeamRequestById(id: string): Promise<TeamRequest | null> {
        return this.teamRequestRepository.findByPk(id, {include: [TeamRequestApprovement]});
    }

    canUserSendAReqeust(user: User): boolean {
        if(user.teamRequests.length <= 0)
            return true;
        const lastRequest = user.teamRequests[user.teamRequests.length - 1];
        if(lastRequest.status !== ETeamRequestStatusType.AWAITING)
            return true;
        return false;
    }

    getUsersAnAwaitingRequest(user: User): TeamRequest | null {
        if(user.teamRequests.length <= 0)
            return null;
        const lastRequest = user.teamRequests[user.teamRequests.length - 1];
        if(lastRequest.status !== ETeamRequestStatusType.AWAITING)
            return null;
        return lastRequest;
    }

    isTeamRequestVerified(teamRequest: TeamRequest): boolean{
        return teamRequest.status !== ETeamRequestStatusType.AWAITING;
    }

    async acceptTeamRequest(teamRequest: TeamRequest): Promise<TeamRequest> {
        const teamRequestApprovement = teamRequest.teamRequestApprovement;
        if(!teamRequestApprovement || 
            (teamRequestApprovement.fromTeamApprove && teamRequestApprovement.toTeamApprove)) {
                teamRequest.status = ETeamRequestStatusType.ACCEPTED;
                await teamRequest.save();
            }
        return teamRequest;
    }

    async declineTeamRequest(teamRequest: TeamRequest): Promise<TeamRequest> {
        teamRequest.status = ETeamRequestStatusType.DECLINED;
        await teamRequest.save();
        return teamRequest;
    }

    async executeRequest(teamRequest: TeamRequest, team: Team, user: User): Promise<void> {
        if(teamRequest.status !== ETeamRequestStatusType.ACCEPTED)
            return;
        switch (teamRequest.requestType) {
            case ETeamRequestTypes.JOIN_THE_TEAM:
                await this.teamsService.addUserToTeam(user, team);
                break;
            case ETeamRequestTypes.LEAVE_THE_TEAM:
                await this.teamsService.leaveTheTeam(user, team);
                break;
            case ETeamRequestTypes.MOVE_TO_ANOTHER_TEAM:
                await this.teamsService.moveToAnotherTeam(user, teamRequest.teamRequestApprovement.toTeamId);
                break;
            case ETeamRequestTypes.MANAGER_POST:
                await this.teamsService.managerPost(user, team);
                break;
            default:
                return;
        }
    }

    async validateTeamRequestForCreation(userId: string | undefined, teamId?: string): Promise<[User, Team] | HttpException>{
        if(!userId)
            return new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        const user = await this.usersService.getUserById(userId);
        if(!user)
            return new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        const team = await this.teamsService.getTeamById(teamId ? teamId : user.teamId!);
        if(!team)
            return new HttpException(HttpExceptionMessages.TeamWasNotFound, 400);
        const canUserSendAReqeust = this.canUserSendAReqeust(user);
        if(!canUserSendAReqeust)
            return new HttpException('This user has already an awaiting team request.', 400);
        return [user, team];
    }

    async validateTeamRequestForAcceptingOrDeclining(userId: string, dtoParams: AcceptReqeustParamsDto | DeclineReqeustParamsDto): 
    Promise<[User, Team, TeamRequest] | HttpException>{
        if(!userId)
            return new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        const user = await this.usersService.getUserById(userId);
        if(!user)
            return new HttpException(HttpExceptionMessages.UserWasNotFound, 400);
        const isAdmin = await this.usersService.isAdmin(user.id);
        if(!user.teamId && !isAdmin)
            return new HttpException(HttpExceptionMessages.TeamWasNotFound, 400);
        let team = await this.teamsService.getTeamById(user.teamId!);
        if(!team && !isAdmin)
            return new HttpException(HttpExceptionMessages.TeamWasNotFound, 400);
        let teamRequest = await this.getTeamRequestById(dtoParams?.teamRequestId!);
        if(!teamRequest)
            return new HttpException('The team request was not found.', 400);
        if(isAdmin)
            team = await this.teamsService.getTeamById(teamRequest.teamId);
        if(!team)
            return new HttpException(HttpExceptionMessages.TeamWasNotFound, 400);
        const isTeamRequestVerified = this.isTeamRequestVerified(teamRequest);
        if(isTeamRequestVerified)
            return new HttpException('This team request is already verified.', 400);
        if(teamRequest.teamId !== team.id)
            return new HttpException(`You don't have access to accept this team request.`, 400);
        return [user, team, teamRequest];
    }
}
