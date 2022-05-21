import { Column, DataType, HasMany, Model, Table} from 'sequelize-typescript'
import { User } from '../users/users.model';
import { CreateRoleDto } from './dto/create-role.dto';

interface RoleAttributes {
    id: string;
    value: string;
}

@Table({tableName: 'Role', timestamps: false})
export class Role extends Model<RoleAttributes, CreateRoleDto>{
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
    declare value: string;

    @HasMany(() => User)
    declare users: User[];
}