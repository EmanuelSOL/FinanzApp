import { IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateBudgetDto {
  @IsOptional()
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(0.01, { message: 'El monto debe ser mayor que cero' })
  amount?: number;
}
