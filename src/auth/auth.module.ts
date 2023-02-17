import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AtuhController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtEstrategy } from './strategy/jwt.strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AtuhController],
  providers: [AuthService, JwtEstrategy],
})
export class AuthModule {}
