import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(User) // Es necesario para encontrar la entidad User
    private usersRepository: Repository<User>,
    @InjectRepository(Category) 
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    userId: number,
  ): Promise<Transaction> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);
    }

    let category: Category | null = null;
    if (createTransactionDto.categoryId) {
      category = await this.categoriesRepository.findOne({
        where: { id: createTransactionDto.categoryId, user: { id: userId } }, // Se asegura que la categoría pertenezca al usuario
      });
      if (!category) {
        throw new NotFoundException(
          `Categoría con ID ${createTransactionDto.categoryId} no encontrada o no pertenece al usuario.`,
        );
      }
    }

    const newTransaction = this.transactionsRepository.create({
      ...createTransactionDto,
      date: new Date(createTransactionDto.date), 
      user,
      category: category || undefined,
    });

    return this.transactionsRepository.save(newTransaction);
  }

  async findRecentByUser(
    userId: number,
    limit: number = 5,
  ): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { user: { id: userId } },
      order: { date: 'DESC', id: 'DESC' }, 
      take: limit,
      relations: ['category'],
    });
  }

  async findAllByUser(userId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({
        where: { user: { id: userId } },
        order: { date: 'DESC', id: 'DESC' },
        relations: ['category'],
    });
  }
}