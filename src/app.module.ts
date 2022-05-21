import { Module } from "@nestjs/common";
import { UsersModule } from './users/users.module';
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigModule } from "@nestjs/config";
import { User } from "./users/users.model";
import { ResetToken } from "./reset-token/reset-token.model";
import { Role } from "./roles/roles.model";
import { Team } from "./teams/teams.model";
import { TeamRequest } from "./team-requests/team-requests.model";
import { TeamRequestApprovement } from "./team-request-approvement/team-requests-approvement.model";
import { TeamKick } from "./team-kicks/team-kicks.model";
import { Ban } from "./bans/bans.model";
import { RolesModule } from './roles/roles.module';
import { ProfilesModule } from './profiles/profiles.module';
import { AuthModule } from './auth/auth.module';
import { ResetTokenModule } from './reset-token/reset-token.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { BansModule } from './bans/bans.module';
import { TeamsModule } from './teams/teams.module';
import { TeamKicksModule } from './team-kicks/team-kicks.module';
import { TeamRequestsModule } from './team-requests/team-requests.module';
import { TeamRequestApprovementModule } from './team-request-approvement/team-request-approvement.module';
import { WsModule } from './ws/ws.module';
import { WsService } from "./ws/ws.service";

@Module({
    controllers: [],
    providers: [WsService],
    imports: [
        ConfigModule.forRoot({
            envFilePath: process.env.ENV_FILE || '.env'
        }),
        MailerModule.forRoot({
            transport: {
              host: process.env.EMAIL_HOST || 'host',
              port: process.env.EMAIL_PORT || 587,
              auth: {
                user: process.env.EMAIL_USER || 'user',
                pass: process.env.EMAIL_PASS || 'pass',
              },
            },
            defaults: {
              from: `Email helper <${process.env.EMAIL_USER || 'user'}>`,
            }
        }),
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: process.env.POSTGRES_HOST || 'host',
            port: process.env.POSTGRES_PORT || 5432,
            username: process.env.POSTGRES_USER || 'username',
            password: process.env.POSTGRES_PASSWORD || 'password',
            database: process.env.POSTGRES_DB || 'db',
            models: [
                User,
                ResetToken,
                Role,
                Team,
                TeamRequest,
                TeamRequestApprovement,
                TeamKick,
                Ban
            ],
            logging: false
        }),
        UsersModule,
        RolesModule,
        ProfilesModule,
        AuthModule,
        ResetTokenModule,
        BansModule,
        TeamsModule,
        TeamKicksModule,
        TeamRequestsModule,
        TeamRequestApprovementModule,
        WsModule
    ]
})
export class AppModule { }