import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { JwtPayload } from '../types/auth.types';
import { ExpenseSummaryQueryDto } from './dto/expense-summary-query.dto';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Dashboard financial summary' })
  getSummary(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getDashboardSummary(user.sub);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Monthly income vs expenses' })
  getMonthly(@CurrentUser() user: JwtPayload, @Query('months') months?: number) {
    return this.analyticsService.getMonthlySummaries(user.sub, months ?? 6);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Spending by category' })
  getCategories(
    @CurrentUser() user: JwtPayload,
    @Query() query: ExpenseSummaryQueryDto,
  ) {
    return this.analyticsService.getCategorySpending(user.sub, query);
  }

  @Get('expenses/summary')
  @ApiOperation({ summary: 'Expense stats with optional filters' })
  getExpenseSummary(
    @CurrentUser() user: JwtPayload,
    @Query() query: ExpenseSummaryQueryDto,
  ) {
    return this.analyticsService.getExpenseSummary(user.sub, query);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Spending trends' })
  getTrends(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getSpendingTrends(user.sub);
  }

  @Get('savings')
  @ApiOperation({ summary: 'Savings trends' })
  getSavings(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getSavingsTrends(user.sub);
  }
}
