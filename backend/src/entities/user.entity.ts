import { Transaction } from "./transaction.entity";
import { Category } from "./category.entity";
import { Budget } from "./budget.entity";
import { BiweeklyBudget } from "./biweekly-budget.entity";
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('users') 
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: true })
    username?: string;

    @Column({ unique: true })
    email: string;

    @Column() 
    password?: string;

    @OneToMany(() => Category, category => category.user)
    categories: Category[]; 

    @OneToMany(() => Transaction, transaction => transaction.user)
    transactions: Transaction[];

    @OneToMany(() => Budget, budget => budget.user)
    budgets: Budget[];

    @OneToMany(() => BiweeklyBudget, biweeklyBudget => biweeklyBudget.user)
    biweeklyBudgets: BiweeklyBudget[];
}

