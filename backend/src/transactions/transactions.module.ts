import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User, Category])], 
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}

