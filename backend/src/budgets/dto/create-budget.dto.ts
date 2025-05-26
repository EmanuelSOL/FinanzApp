import { IsNumber, IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateBudgetDto {
  @IsNotEmpty({ message: 'El monto es requerido' })
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(0.01, { message: 'El monto debe ser mayor que cero' })
  amount: number;

  @IsNotEmpty({ message: 'El ID de la categoría es requerido' })
  @IsInt({ message: 'El ID de la categoría debe ser un número entero' })
  categoryId: number;

  @IsNotEmpty({ message: 'El mes es requerido' })
  @IsInt({ message: 'El mes debe ser un número entero' })
  @Min(1)
  @Max(12)
  month: number;

  @IsNotEmpty({ message: 'El año es requerido' })
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(2000)
  year: number;
}

