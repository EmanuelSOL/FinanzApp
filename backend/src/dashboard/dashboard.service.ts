// finanzasP/backend/src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm'; // Asegúrate de importar Between, MoreThanOrEqual, LessThanOrEqual
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity'; 
import { ExpenseByCategoryDto } from './dto/expense-by-category.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async getFinancialSummary(userId: number): Promise<any> {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const transactions = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.date >= :startDate', { startDate: firstDayOfMonth })
      .andWhere('transaction.date <= :endDate', { endDate: lastDayOfMonth })
      .getMany();

    let ingresosMes = 0;
    let gastosMes = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        ingresosMes += transaction.amount;
      } else if (transaction.type === 'expense') {
        gastosMes += transaction.amount;
      }
    });

    const allUserTransactions = await this.transactionsRepository.find({ where: { user: { id: userId } } });
    const historicalBalance = allUserTransactions.reduce((acc, curr) => {
        return acc + (curr.type === 'income' ? curr.amount : -curr.amount);
    }, 0);


    return {
      balanceTotal: historicalBalance,
      ingresosMes,
      gastosMes,
    };
  }

  async getExpensesByCategory(
    userId: number,
    period: string, // 'Este Mes', 'Mes Anterior', 'Este Año'
  ): Promise<ExpenseByCategoryDto[]> {
    let startDate: Date;
    let endDate: Date;
    const currentDate = new Date();

    switch (period) {
      case 'Mes Anterior':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        break;
      case 'Este Año':
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = new Date(currentDate.getFullYear(), 11, 31);
        break;
      case 'Este Mes':
      default:
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        break;
    }
    
    endDate.setHours(23, 59, 59, 999);

    const expenses = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('SUM(transaction.amount)', 'totalSpent')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: 'expense' })
      .andWhere('transaction.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('category.id, category.name')
      // Corrección aquí: usa la expresión de agregación en el ORDER BY
      .orderBy('SUM(transaction.amount)', 'DESC') 
      .getRawMany();

    return expenses.map(expense => ({
      categoryId: expense.categoryId,
      categoryName: expense.categoryName || 'Sin Categoría',
      totalSpent: parseFloat(expense.totalSpent) || 0,
    }));
  }
}

