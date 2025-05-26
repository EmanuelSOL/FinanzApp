import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe, 
  ValidationPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('transactions')
@UseGuards(AuthGuard('jwt')) 
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @Body(new ValidationPipe()) createTransactionDto: CreateTransactionDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.transactionsService.create(createTransactionDto, userId);
  }

  @Get()
  findAllByUser(@Request() req) {
    const userId = req.user.id;
    return this.transactionsService.findAllByUser(userId);
  }

  @Get('recent')
  findRecent(
    @Request() req,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    const userId = req.user.id;
    return this.transactionsService.findRecentByUser(userId, limit);
  }
}

