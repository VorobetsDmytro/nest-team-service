import { BelongsTo, Column, DataType, ForeignKey, HasOne, Model, Table } from 'sequelize-typescript';
import { Team } from '../teams/teams.model';
import { User } from '../users/users.model';
import { CreateTeamRequestDto } from './dto/create-team-request.dto';
import { TeamRequestApprovement } from '../team-request-approvement/team-requests-approvement.model';

interface TeamRequestAttributes {
    id: string;
    requestType: string;
    userId: string;
    teamId: string;
    status: string;
}

@Table({tableName: 'TeamRequest'})
export class TeamRequest extends Model<TeamRequestAttributes, CreateTeamRequestDto>{
    @Column({
        type: DataType.STRING, 
        unique: true,
        primaryKey: true
    })
    declare id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare requestType: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare userId: string;

    @BelongsTo(() => User)
    declare user: User;

    @ForeignKey(() => Team)
    @Column({
        type: DataType.STRING
    })
    declare teamId: string;

    @BelongsTo(() => Team, 'teamId')
    declare team: Team;

    @HasOne(() => TeamRequestApprovement)
    declare teamRequestApprovement: TeamRequestApprovement;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare status: string;
}