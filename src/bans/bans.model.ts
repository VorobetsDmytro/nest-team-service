import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from '../users/users.model';
import { CreateBanDto } from './dto/create-ban.dto';

interface BanAttributes {
    id: string;
    userId: string;
    banReason: string;
    bannedBy: string;
    unBannedAt: Date;
}

@Table({tableName: 'Ban'})
export class Ban extends Model<BanAttributes, CreateBanDto>{
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

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare banReason: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare bannedBy: string;

    @BelongsTo(() => User, 'bannedBy')
    declare bannedByUser: User;

    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    declare unBannedAt: Date;
}