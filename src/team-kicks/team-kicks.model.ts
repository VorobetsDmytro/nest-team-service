import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Team } from '../teams/teams.model';
import { User } from '../users/users.model';
import { CreateTeamKickDto } from './dto/create-team-kick.dto';

interface TeamKickAttributes {
    id: string;
    userId: string;
    kickReason: string;
    kickedBy: string;
}

@Table({tableName: 'TeamKick'})
export class TeamKick extends Model<TeamKickAttributes, CreateTeamKickDto>{
    @Column({
        type: DataType.STRING, 
        unique: true,
        primaryKey: true
    })
    declare id: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare userId: User;

    @BelongsTo(() => User, 'userId')
    declare user: User;

    @ForeignKey(() => Team)
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare teamId: Team;

    @BelongsTo(() => Team)
    declare team: Team;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare kickReason: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare kickedBy: string;

    @BelongsTo(() => User, 'kickedBy')
    declare kickedByUser: User;
}