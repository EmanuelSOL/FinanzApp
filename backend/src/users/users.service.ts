import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { email, password, username } = createUserDto; 

    const existingUserByEmail = await this.usersRepository.findOne({ where: { email } });
    if (existingUserByEmail) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    if (username) { 
        const existingUserByUsername = await this.usersRepository.findOne({ where: { username } });
        if (existingUserByUsername) {
          throw new ConflictException('El nombre de usuario ya está registrado');
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userEntity = this.usersRepository.create({
      username, 
      email,   
      password: hashedPassword, 
      
    });

    const savedUser = await this.usersRepository.save(userEntity);
    const { password: _, ...result } = savedUser; 
    return result;
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }
    return user;
  }

  async findOneById(id: number): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }
}