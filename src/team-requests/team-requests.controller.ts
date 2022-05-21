import { Body, Controller, Delete, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { IsBannedGuard } from '../guards/is-banned.guard';
import { IsLogedInGuard } from '../guards/is-loged-in.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CreateTeamRequestDto } from './dto/create-team-request.dto';
import { TeamRequestsService } from './team-requests.service';

@Controller('team-requests')
export class TeamRequestsController {
    constructor(private teamRequestsService: TeamRequestsService){}

    @Post('/join-the-team')
    @Roles(['PLAYER'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    @HttpCode(201)
    joinTheTeam(@Body() dto: CreateTeamRequestDto, @Req() req){
        return this.teamRequestsService.joinTheTeam(dto, req);
    }

    @Post('/move-to-another-team')
    @Roles(['PLAYER'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    @HttpCode(201)
    moveToAnotherTeam(@Body() dto: CreateTeamRequestDto, @Req() req){
        return this.teamRequestsService.moveToAnotherTeam(dto, req);
    }

    @Get('/all')
    @Roles(['MANAGER', 'ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    getAll(){
        return this.teamRequestsService.getAllTeamRequests();
    }

    @Get('/leave-the-team')
    @Roles(['PLAYER'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    @HttpCode(201)
    leaveTheTeam(@Req() req){
        return this.teamRequestsService.leaveTheTeam(req);
    }

    @Get('/manager-post/:teamId')
    @Roles(['PLAYER'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    @HttpCode(201)
    managerPost(@Param('teamId') teamId: string, @Req() req){
        return this.teamRequestsService.managerPost({teamId}, req);
    }

    @Get('/accept/:teamRequestId')
    @Roles(['MANAGER', 'ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    acceptRequest(@Param('teamRequestId') teamRequestId: string, @Req() req){
        return this.teamRequestsService.acceptRequest({teamRequestId}, req);
    }

    @Get('/decline/:teamRequestId')
    @Roles(['MANAGER', 'ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    declineRequest(@Param('teamRequestId') teamRequestId: string, @Req() req){
        return this.teamRequestsService.declineRequest({teamRequestId}, req);
    }
    
    @Delete('/')
    @UseGuards(IsLogedInGuard)
    @UseGuards(IsBannedGuard)
    deleteRequest(@Req() req){
        return this.teamRequestsService.deleteRequest(req);
    }
}
