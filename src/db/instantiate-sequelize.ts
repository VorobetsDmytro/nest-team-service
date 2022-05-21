import { Sequelize } from 'sequelize-typescript';
import { Role } from '../roles/roles.model';
import { ResetToken } from '../reset-token/reset-token.model';
import { User } from '../users/users.model';
import { Team } from '../teams/teams.model';
import { TeamRequest } from '../team-requests/team-requests.model';
import { TeamRequestApprovement } from '../team-request-approvement/team-requests-approvement.model';
import { TeamKick } from '../team-kicks/team-kicks.model';
import { Ban } from '../bans/bans.model';

const POSTGRES_DB = process.env.POSTGRES_DB || 'database';
const POSTGRES_USER = process.env.POSTGRES_USER || 'username';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'password';
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';

const dbInstance = new Sequelize({
    database: POSTGRES_DB,
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    host: POSTGRES_HOST,
    dialect: 'postgres',
    logging: false,
    models: [
        User,
        ResetToken,
        Role,
        Team,
        TeamRequest,
        TeamRequestApprovement,
        TeamKick,
        Ban
    ]
});

export default dbInstance;