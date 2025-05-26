import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByEmail(signInDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas (usuario no encontrado)');
    }

    
    if (!user.password) {
      console.error(`Usuario con email ${signInDto.email} no tiene una contraseña definida.`);
      throw new UnauthorizedException('Error de autenticación: contacte al administrador.');
    }

    const isPasswordMatching = await bcrypt.compare(signInDto.password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Credenciales inválidas (contraseña incorrecta)');
    }


    const payload = {
      sub: user.id,
      email: user.email,
      ...(user.username && { username: user.username }),
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}

