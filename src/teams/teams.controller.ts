import { Body, Controller, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { IsBannedGuard } from '../guards/is-banned.guard';
import { IsLogedInGuard } from '../guards/is-loged-in.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CreateTeamKickDto } from '../team-kicks/dto/create-team-kick.dto';
import { AddUserToTeamDto } from './dto/add-user-to-team.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { SetManagerBodyDto } from './dto/set-manager.dto';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
    constructor(private teamsService: TeamsService){}

    @Post('/')
    @Roles(['ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    @HttpCode(201)
    create(@Body() dto: CreateTeamDto){
        return this.teamsService.create(dto);
    }

    @Post('/set-manager/:teamId')
    @Roles(['ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    @HttpCode(200)
    setManager(@Body() dto: SetManagerBodyDto, @Param('teamId') teamId: string){
        return this.teamsService.setManager(dto, {teamId});
    }

    @Post('/unset-manager/:teamId')
    @Roles(['ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    @HttpCode(200)
    unsetManager(@Param('teamId') teamId: string){
        return this.teamsService.unsetManager({teamId});
    }

    @Post('/kick')
    @Roles(['MANAGER', 'ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    @HttpCode(200)
    kick(@Body() dto: CreateTeamKickDto, @Req() req){
        return this.teamsService.kick(dto, req);
    }

    @Post('/:teamId')
    @Roles(['ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    @HttpCode(200)
    addUser(@Body() dto: AddUserToTeamDto, @Param('teamId') teamId: string){
        return this.teamsService.addUser(dto, teamId);
    }

    @Get('/')
    @UseGuards(IsLogedInGuard)
    @UseGuards(IsBannedGuard)
    @HttpCode(200)
    get(@Req() req){
        return this.teamsService.getCurrentTeam(req);
    }

    @Get('/all')
    @UseGuards(IsLogedInGuard)
    @UseGuards(IsBannedGuard)
    @HttpCode(200)
    getAll(){
        return this.teamsService.getAll();
    }

    @Get('/:teamId')
    @UseGuards(IsLogedInGuard)
    @UseGuards(IsBannedGuard)
    @HttpCode(200)
    getById(@Param('teamId') teamId: string){
        return this.teamsService.getById({teamId});
    }
}
