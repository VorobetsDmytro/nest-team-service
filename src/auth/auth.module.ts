import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ProfilesModule } from '../profiles/profiles.module';
import { ResetTokenModule } from '../reset-token/reset-token.module';
import { GoogleStrategy } from '../strategies/google.strategy';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy
  ],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'jwtsecret',
      signOptions: {
        expiresIn: '1h'
      }
    }),
    forwardRef(() => UsersModule),
    forwardRef(() => ProfilesModule),
    ResetTokenModule
  ],
  exports: [
    JwtModule,
    AuthService
  ]
})
export class AuthModule {}
