import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpExceptionMessages } from '../exceptions/HttpException';
import { v4 } from "uuid";
import { User } from "../users/users.model";
import { CreateRoleDto } from "./dto/create-role.dto";
import { Role } from "./roles.model";

@Injectable()
export class RolesService {
    constructor(@InjectModel(Role) private roleRepository: typeof Role){}

    async create(dto: CreateRoleDto){
        const checkRole = await this.getRoleByValue(dto.value);
        if(checkRole)
            throw new HttpException('This role is already exists.', 400);
        const roleId = await this.generateRoleId();
        const role = await this.createRole({...dto, id: roleId});
        return role;
    }

    async delete(value: string){
        if(!value)
            throw new HttpException(HttpExceptionMessages.IncorrectData, 400);
        const roleValue = await this.deleteRoleByValue(value);
        if(!roleValue)
            throw new HttpException('This role was not found.', 400);
        return {roleValue};
    }

    async generateRoleId(): Promise<string>{
        let role: Role | null, id: string;
        do {
            id = v4();
            role = await this.roleRepository.findByPk(id);
        } while (role);
        return id;
    }

    async createRole(dto: CreateRoleDto): Promise<Role> {
        return this.roleRepository.create(dto);
    }

    async getRoleByValue(value: string): Promise<Role | null> {
        return this.roleRepository.findOne({where: {value}});
    }

    async getAllRoles(): Promise<Role[]> {
        return this.roleRepository.findAll({include: [{model: User, attributes: {exclude: ['password']}}]});
    }

    async deleteRoleByValue(value: string): Promise<string | null> {
        const role = await this.roleRepository.findOne({where: {value}});
        if(!role)
            return null;
        await role.destroy();
        return value;
    }

    async setRoleToUser(role: Role, user: User): Promise<User> {
        user.roleId = role.id;
        user.role = role;
        await user.save();
        return user;
    }
}
