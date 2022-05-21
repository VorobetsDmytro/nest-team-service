import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { RolesModule } from '../roles/roles.module';
import { TeamKicksModule } from '../team-kicks/team-kicks.module';
import { TeamRequestsModule } from '../team-requests/team-requests.module';
import { User } from '../users/users.model';
import { UsersModule } from '../users/users.module';
import { TeamsController } from './teams.controller';
import { Team } from './teams.model';
import { TeamsService } from './teams.service';

@Module({
  controllers: [TeamsController],
  providers: [TeamsService],
  imports: [
    SequelizeModule.forFeature([
      Team,
      User
    ]),
    RolesModule,
    AuthModule,
    TeamKicksModule,
    forwardRef(() => TeamRequestsModule),
    forwardRef(() => UsersModule)
  ],
  exports: [
    TeamsService
  ]
})
export class TeamsModule {}
