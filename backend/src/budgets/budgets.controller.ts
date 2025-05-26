import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, ValidationPipe, ParseIntPipe, Put, Query } from '@nestjs/common';
import { BudgetsService, BudgetWithSpentAmount } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  createOrUpdate(@Body(new ValidationPipe()) createBudgetDto: CreateBudgetDto, @Request() req) {
    const userId = req.user.id;
    return this.budgetsService.createOrUpdate(createBudgetDto, userId);
  }

  @Get()
  findAllByUserForMonth( 
    @Request() req,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ): Promise<BudgetWithSpentAmount[]> { 
    const userId = req.user.id;
    return this.budgetsService.findAllByUserForMonth(userId, month, year);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id;
    return this.budgetsService.findOne(id, userId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateBudgetDto: UpdateBudgetDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.budgetsService.update(id, updateBudgetDto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id;
    return this.budgetsService.remove(id, userId);
  }
}
