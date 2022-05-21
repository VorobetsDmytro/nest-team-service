import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from '../users/users.model';

interface ResetTokenAttributes {
    value: string;
    userId: string;
}

@Table({tableName: 'ResetToken', timestamps: false})
export class ResetToken extends Model<ResetTokenAttributes>{
    @Column({
        type: DataType.STRING,
        unique: true,
        primaryKey: true,
        allowNull: false
    })
    declare value: string;

    @ForeignKey(() => User)
    declare userId: User;
}