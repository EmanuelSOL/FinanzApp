import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { Budget } from '../entities/budget.entity';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Transaction } from '../entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Budget, User, Category, Transaction])],
  controllers: [BudgetsController],
  providers: [BudgetsService],
})
export class BudgetsModule {}


