import { Controller, Get, Request, UseGuards, UnauthorizedException, Query, DefaultValuePipe } from '@nestjs/common'; // Asegúrate de importar Query y DefaultValuePipe
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { ExpenseByCategoryDto } from './dto/expense-by-category.dto'; 

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(@Request() req) {
    console.log('User object in getSummary:', req.user);

    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User identifier not found in request processed by JwtStrategy');
    }
    const userId = req.user.id;
    return this.dashboardService.getFinancialSummary(userId);
  }

  @Get('expenses-by-category')
  async getExpensesByCategory(
    @Request() req,
    @Query('period', new DefaultValuePipe('Este Mes')) period: string,
  ): Promise<ExpenseByCategoryDto[]> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User identifier not found in request');
    }
    const userId = req.user.id;
    return this.dashboardService.getExpensesByCategory(userId, period);
  }
}

