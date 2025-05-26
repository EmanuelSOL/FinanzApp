import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service'; 

interface JwtPayload {
  sub: number; // El ID del usuario
  email: string;
  username?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService, // Inyecta UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'tuPalabraSecretaPorDefecto',
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    const user = await this.usersService.findOneById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found or token invalid');
    }

    return { id: payload.sub, email: payload.email, username: payload.username || user.username };
  }
}