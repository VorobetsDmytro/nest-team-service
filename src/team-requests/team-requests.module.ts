import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { TeamRequestApprovementModule } from '../team-request-approvement/team-request-approvement.module';
import { TeamsModule } from '../teams/teams.module';
import { User } from '../users/users.model';
import { UsersModule } from '../users/users.module';
import { TeamRequestsController } from './team-requests.controller';
import { TeamRequest } from './team-requests.model';
import { TeamRequestsService } from './team-requests.service';

@Module({
  controllers: [TeamRequestsController],
  providers: [TeamRequestsService],
  imports: [
    SequelizeModule.forFeature([
      TeamRequest,
      User
    ]),
    AuthModule,
    TeamRequestApprovementModule,
    forwardRef(() => UsersModule),
    forwardRef(() => TeamsModule)
  ],
  exports: [
    TeamRequestsService
  ]
})
export class TeamRequestsModule {}
