import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { IsBannedGuard } from '../guards/is-banned.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
    constructor(private rolesService: RolesService){}

    @Post('/create')
    @Roles(['ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    @HttpCode(201)
    create(@Body() dto: CreateRoleDto){
        return this.rolesService.create(dto);
    }

    @Get('/all')
    @Roles(['ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    @HttpCode(200)
    getAll(){
        return this.rolesService.getAllRoles();
    }

    @Delete('/delete/:value')
    @Roles(['ADMIN'])
    @UseGuards(RolesGuard)
    @UseGuards(IsBannedGuard)
    @HttpCode(200)
    delete(@Param('value') value: string){
        return this.rolesService.delete(value);
    }
}
