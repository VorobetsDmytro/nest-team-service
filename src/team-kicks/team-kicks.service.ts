import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as uuid from 'uuid';
import { CreateTeamKickDto } from "./dto/create-team-kick.dto";
import { TeamKick } from "./team-kicks.model";

@Injectable()
export class TeamKicksService {
    constructor(@InjectModel(TeamKick) private teamKickRepository: typeof TeamKick){}
    async generateTeamKickId(): Promise<string> {
        let teamKick: TeamKick | null, id: string;
        do {
            id = uuid.v4();
            teamKick = await this.teamKickRepository.findByPk(id);
        } while (teamKick);
        return id;
    }

    async createTeamKick(dto: CreateTeamKickDto): Promise<TeamKick> {
        return this.teamKickRepository.create(dto);
    }
}
