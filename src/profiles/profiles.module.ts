import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/users.model';
import { UsersModule } from '../users/users.module';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService],
  imports: [
    SequelizeModule.forFeature([
      User
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule)
  ],
  exports: [
    ProfilesService
  ]
})
export class ProfilesModule {}
