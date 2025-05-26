// finanzasP/backend/src/budgets/budgets.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from '../entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Transaction } from '../entities/transaction.entity';

export interface BudgetWithSpentAmount extends Budget {
  spentAmount: number;
}

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private budgetsRepository: Repository<Budget>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async createOrUpdate(createBudgetDto: CreateBudgetDto, userId: number): Promise<Budget> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);
    }

    const category = await this.categoriesRepository.findOne({
        where: { id: createBudgetDto.categoryId, user: { id: userId } },
    });
    if (!category) {
      throw new NotFoundException(
        `Categoría con ID ${createBudgetDto.categoryId} no encontrada o no pertenece al usuario.`,
      );
    }

    let budget = await this.budgetsRepository.findOne({
      where: {
        user: { id: userId },
        category: { id: createBudgetDto.categoryId },
        month: createBudgetDto.month,
        year: createBudgetDto.year,
      },
    });

    if (budget) { 
      budget.amount = createBudgetDto.amount;
    } else { 
      budget = this.budgetsRepository.create({
        ...createBudgetDto,
        user,
        category,
      });
    }
    return this.budgetsRepository.save(budget);
  }

  async findAllByUserForMonth(userId: number, month: number, year: number): Promise<BudgetWithSpentAmount[]> {
    // 1. Obtener solo los presupuestos que existen para el usuario, mes y año.
    const existingBudgets = await this.budgetsRepository.find({
        where: {
            user: { id: userId },
            month,
            year,
        },
        relations: ['category', 'user'], // Asegúrate de cargar la categoría
        order: { category: { name: 'ASC' } } // Opcional: ordenar por nombre de categoría
    });

    if (!existingBudgets.length) {
        return []; // Si no hay presupuestos definidos, retorna un array vacío.
    }

    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const budgetsWithSpent: BudgetWithSpentAmount[] = [];

    // 2. Para cada presupuesto existente, calcular el gasto.
    for (const budget of existingBudgets) {
        if (!budget.category) { // Sanity check, aunque la relación debería estar cargada
            console.warn(`Presupuesto con ID ${budget.id} no tiene categoría asociada o no se cargó.`);
            budgetsWithSpent.push({ ...budget, spentAmount: 0 });
            continue;
        }

        const transactionsSum = await this.transactionsRepository
            .createQueryBuilder('transaction')
            .select('SUM(transaction.amount)', 'totalSpent')
            .where('transaction.userId = :userId', { userId })
            .andWhere('transaction.categoryId = :categoryId', { categoryId: budget.category.id })
            .andWhere('transaction.type = :type', { type: 'expense' })
            .andWhere('transaction.date >= :startDate', { startDate: firstDayOfMonth })
            .andWhere('transaction.date <= :endDate', { endDate: lastDayOfMonth })
            .getRawOne();

        const spentAmount = parseFloat(transactionsSum?.totalSpent) || 0;
        budgetsWithSpent.push({ ...budget, spentAmount });
    }
    
    return budgetsWithSpent;
  }

  async findOne(id: number, userId: number): Promise<Budget> {
    const budget = await this.budgetsRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['category', 'user'],
    });
    if (!budget) {
      throw new NotFoundException(`Presupuesto con ID ${id} no encontrado o no pertenece al usuario.`);
    }
    return budget;
  }

  async update(id: number, updateBudgetDto: UpdateBudgetDto, userId: number): Promise<Budget> {
    const budgetToUpdate = await this.findOne(id, userId); 
    const updatedBudget = this.budgetsRepository.merge(budgetToUpdate, updateBudgetDto);
    return this.budgetsRepository.save(updatedBudget);
  }

  async remove(id: number, userId: number): Promise<void> {
    const result = await this.budgetsRepository.delete({ id, user: { id: userId } });
    if (result.affected === 0) {
      throw new NotFoundException(`Presupuesto con ID ${id} no encontrado o no pertenece al usuario.`);
    }
  }
}

