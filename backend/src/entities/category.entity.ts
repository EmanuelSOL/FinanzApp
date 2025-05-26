import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, Unique } from 'typeorm';
import { Budget } from './budget.entity';
import { Transaction } from './transaction.entity';
import { User } from './user.entity';

@Entity('categories')
@Unique(['name', 'user'])
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() 
  name: string;

  @ManyToOne(() => User, user => user.categories, { nullable: false }) 
  user: User;

  @OneToMany(() => Budget, budget => budget.category)
  budgets: Budget[];

  @OneToMany(() => Transaction, transaction => transaction.category)
  transactions: Transaction[];
}

