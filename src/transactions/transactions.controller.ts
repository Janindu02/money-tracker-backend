import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { JwtPayload } from '../types/auth.types';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TransactionType } from '@prisma/client';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List transactions with filters' })
  findAll(@CurrentUser() user: JwtPayload, @Query() query: FilterTransactionsDto) {
    return this.transactionsService.findAll(user.sub, query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get transaction categories' })
  getCategories(
    @CurrentUser() user: JwtPayload,
    @Query('type') type?: TransactionType,
  ) {
    return this.transactionsService.getCategories(user.sub, type);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a custom category' })
  createCategory(@CurrentUser() user: JwtPayload, @Body() dto: CreateCategoryDto) {
    return this.transactionsService.createCategory(user.sub, dto);
  }

  @Patch('categories/:categoryId')
  @ApiOperation({ summary: 'Update a custom category' })
  updateCategory(
    @CurrentUser() user: JwtPayload,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.transactionsService.updateCategory(user.sub, categoryId, dto);
  }

  @Delete('categories/:categoryId')
  @ApiOperation({ summary: 'Delete a custom category' })
  removeCategory(
    @CurrentUser() user: JwtPayload,
    @Param('categoryId') categoryId: string,
  ) {
    return this.transactionsService.removeCategory(user.sub, categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.transactionsService.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.transactionsService.remove(user.sub, id);
  }
}
