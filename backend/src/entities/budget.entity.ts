import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, OneToMany } from 'typeorm'; 
import { User } from './user.entity';
import { Category } from './category.entity';
import { Transaction } from './transaction.entity';

@Entity('budgets')
@Unique(['user', 'category', 'month', 'year'])
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  month: number; 

  @Column()
  year: number;

  @ManyToOne(() => User, user => user.budgets, { nullable: false })
  user: User;

  @ManyToOne(() => Category, category => category.budgets, { nullable: false, onDelete: 'CASCADE' })
  category: Category;

  @OneToMany(() => Transaction, transaction => transaction.budget)
  transactions: Transaction[]; 

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

