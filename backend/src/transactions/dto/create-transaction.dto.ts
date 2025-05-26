import { IsString, IsNotEmpty, IsNumber, IsIn, IsDateString, IsOptional, IsInt } from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty({ message: 'El monto es requerido' })
  @IsNumber({}, { message: 'El monto debe ser un número' })
  amount: number;

  @IsNotEmpty({ message: 'El tipo es requerido' })
  @IsIn(['income', 'expense'], { message: 'El tipo debe ser "income" o "expense"' })
  type: 'income' | 'expense';

  @IsNotEmpty({ message: 'La fecha es requerida' })
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida en formato ISO8601' })
  date: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  description: string;

  @IsOptional()
  @IsInt({ message: 'El ID de la categoría debe ser un número entero' })
  categoryId?: number; 


}

