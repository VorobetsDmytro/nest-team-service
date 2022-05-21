import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { CreateTeamRequestApprovementDto } from './dto/create-team-request-approvement.dto';
import { TeamRequest } from '../team-requests/team-requests.model';

interface TeamRequestApprovementAttributes {
    id: string;
    fromTeamId: string;
    fromTeamApprove: boolean;
    toTeamId: string;
    toTeamApprove: boolean;
}

@Table({tableName: 'TeamRequestApprovement', timestamps: false})
export class TeamRequestApprovement extends Model<TeamRequestApprovementAttributes, CreateTeamRequestApprovementDto>{
    @Column({
        type: DataType.STRING, 
        unique: true,
        primaryKey: true
    })
    declare id: string;

    @ForeignKey(() => TeamRequest)
    @Column({
        type: DataType.STRING
    })
    declare teamRequestId: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare fromTeamId: string;

    @Column({
        type: DataType.BOOLEAN, 
        allowNull: true
    })
    declare fromTeamApprove: boolean;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare toTeamId: string;

    @Column({
        type: DataType.BOOLEAN, 
        allowNull: true
    })
    declare toTeamApprove: boolean;
}