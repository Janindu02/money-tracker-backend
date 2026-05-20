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
import { BudgetsService } from './budgets.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { JwtPayload } from '../types/auth.types';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@ApiTags('budgets')
@ApiBearerAuth()
@Controller('budgets')
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(user.sub, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.budgetsService.findAll(user.sub, month, year);
  }

  @Get('analytics')
  getAnalytics(@CurrentUser() user: JwtPayload) {
    return this.budgetsService.getAnalytics(user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.budgetsService.findOne(user.sub, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(user.sub, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.budgetsService.remove(user.sub, id);
  }
}
