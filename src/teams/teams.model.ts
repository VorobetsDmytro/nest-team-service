import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { TeamKick } from '../team-kicks/team-kicks.model';
import { TeamRequest } from '../team-requests/team-requests.model';
import { User } from '../users/users.model';
import { CreateTeamDto } from './dto/create-team.dto';


@Table({tableName: 'Team', timestamps: false})
export class Team extends Model<CreateTeamDto>{
    @Column({
        type: DataType.STRING, 
        unique: true,
        primaryKey: true
    })
    declare id: string;

    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false
    })
    declare teamName: string;

    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: true
    })
    declare managerId: string | null;

    @HasMany(() => User)
    declare users: User[];

    @HasMany(() => TeamRequest)
    declare teamRequests: TeamRequest[];

    @HasMany(() => TeamKick)
    declare teamKicks: TeamKick[];
}