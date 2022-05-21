import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TeamKick } from './team-kicks.model';
import { TeamKicksService } from './team-kicks.service';

@Module({
  providers: [TeamKicksService],
  imports: [
    SequelizeModule.forFeature([
      TeamKick
    ])
  ],
  exports: [TeamKicksService]
})
export class TeamKicksModule {}
