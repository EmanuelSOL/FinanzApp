import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { Category } from "./category.entity";
import { BiweeklyBudget } from "./biweekly-budget.entity";
import { Budget } from "./budget.entity"; 

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    amount: number;

    @Column()
    type: 'income' | 'expense';

    @Column()
    date: Date;

    @ManyToOne(() => User, user => user.transactions)
    user: User;

    @ManyToOne(() => Category, category => category.transactions)
    category: Category;

    @ManyToOne(() => BiweeklyBudget, biweeklyBudget => biweeklyBudget.transactions) 
    biweeklyBudget: BiweeklyBudget;

    @ManyToOne(() => Budget, budget => budget.transactions)
    budget: Budget;
}