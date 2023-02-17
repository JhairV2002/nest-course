import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dtop';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    try {
      // generate the hash password
      const hash = await argon.hash(dto.password);
      // save new user in the db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      // return the saven user
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // error code to duplicate field
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    //find user by email

    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
      },
    });

    // if user not exist throw exception

    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }
    // compare password
    const pwMatches = await argon.verify(user.hash, dto.password);
    // paswword incorrect throw exception
    if (!pwMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }

    // send back the user
    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ acess_token: string }> {
    const payload = {
      // user id
      sub: userId,
      email: email,
    };
    const secret = this.configService.get('SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15min',
      secret,
    });

    return {
      acess_token: token,
    };
  }
}
