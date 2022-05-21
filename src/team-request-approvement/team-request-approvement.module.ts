import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TeamRequestApprovementService } from './team-request-approvement.service';
import { TeamRequestApprovement } from './team-requests-approvement.model';

@Module({
  providers: [TeamRequestApprovementService],
  imports: [
    SequelizeModule.forFeature([
      TeamRequestApprovement
    ]),
  ],
  exports: [TeamRequestApprovementService]
})
export class TeamRequestApprovementModule {}
