import { Injectable } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CurrencyService } from '../currency/currency.service';
import { getUserDisplayCurrency } from '../utils/user-currency.util';
import { buildDateRange, currentMonthRange } from '../utils/date-range.util';
import type { ExpenseSummaryQueryDto } from './dto/expense-summary-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private currency: CurrencyService,
  ) {}

  private async convert(userId: string, amount: number, from: string) {
    const display = await getUserDisplayCurrency(this.prisma, userId);
    return this.currency.toDisplayCurrency(amount, from, display);
  }

  async getDashboardSummary(userId: string) {
    const displayCurrency = await getUserDisplayCurrency(this.prisma, userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const transactions = await this.prisma.transaction.findMany({
      where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
    });

    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    for (const t of transactions) {
      const amount = await this.convert(userId, Number(t.amount), t.currency);
      if (t.type === TransactionType.INCOME) monthlyIncome += amount;
      else monthlyExpenses += amount;
    }

    const goals = await this.prisma.goal.findMany({ where: { userId } });
    let totalSaved = 0;
    for (const g of goals) {
      totalSaved += await this.convert(userId, Number(g.saved), 'USD');
    }

    return {
      currency: displayCurrency,
      monthlyIncome: Math.round(monthlyIncome * 100) / 100,
      monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
      monthlyNetChange: Math.round((monthlyIncome - monthlyExpenses) * 100) / 100,
      totalBalance: Math.round((totalSaved + monthlyIncome - monthlyExpenses) * 100) / 100,
      savingsYield: 4.2,
      netWorth: Math.round(totalSaved * 100) / 100,
      netWorthChange: 12.5,
    };
  }

  async getMonthlySummaries(userId: string, months = 6) {
    const displayCurrency = await getUserDisplayCurrency(this.prisma, userId);
    const result: { name: string; income: number; expenses: number }[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const txs = await this.prisma.transaction.findMany({
        where: { userId, date: { gte: start, lte: end } },
      });

      let income = 0;
      let expenses = 0;
      for (const t of txs) {
        const amount = await this.convert(userId, Number(t.amount), t.currency);
        if (t.type === TransactionType.INCOME) income += amount;
        else expenses += amount;
      }

      result.push({
        name: date.toLocaleString('en-US', { month: 'short' }),
        income: Math.round(income * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
      });
    }

    return { currency: displayCurrency, data: result };
  }

  async getCategorySpending(userId: string, query?: ExpenseSummaryQueryDto) {
    const displayCurrency = await getUserDisplayCurrency(this.prisma, userId);
    const dateRange = buildDateRange(query ?? {}) ?? currentMonthRange();

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: dateRange,
        ...(query?.categoryId && { categoryId: query.categoryId }),
        ...(query?.expenseNature && { expenseNature: query.expenseNature }),
      },
      include: { category: true },
    });

    const map = new Map<string, number>();
    const colors = ['#10b981', '#0ea5e9', '#6366f1', '#f59e0b', '#94a3b8', '#ec4899'];

    for (const t of transactions) {
      const cat = t.category?.name ?? 'Other';
      const amount = await this.convert(userId, Number(t.amount), t.currency);
      map.set(cat, (map.get(cat) ?? 0) + amount);
    }

    const data = Array.from(map.entries()).map(([name, value], i) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: colors[i % colors.length],
    }));

    return { currency: displayCurrency, data };
  }

  async getSpendingTrends(userId: string) {
    const monthly = await this.getMonthlySummaries(userId, 6);
    const summaries = monthly.data;
    return {
      currency: monthly.currency,
      cashFlow: summaries,
      incomeVsExpenses: summaries.map((s) => ({
        name: s.name,
        income: s.income,
        expenses: s.expenses,
        net: Math.round((s.income - s.expenses) * 100) / 100,
      })),
    };
  }

  async getExpenseSummary(userId: string, query?: ExpenseSummaryQueryDto) {
    const displayCurrency = await getUserDisplayCurrency(this.prisma, userId);
    const dateRange = buildDateRange(query ?? {}) ?? currentMonthRange();
    const daysInRange = Math.max(
      1,
      Math.ceil((dateRange.lte.getTime() - dateRange.gte.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: dateRange,
        ...(query?.categoryId && { categoryId: query.categoryId }),
        ...(query?.expenseNature && { expenseNature: query.expenseNature }),
      },
    });

    let totalExpenses = 0;
    let needTotal = 0;
    let desireTotal = 0;

    for (const t of transactions) {
      const amount = await this.convert(userId, Number(t.amount), t.currency);
      totalExpenses += amount;
      if (t.expenseNature === 'NEED') needTotal += amount;
      else if (t.expenseNature === 'DESIRE') desireTotal += amount;
    }

    return {
      currency: displayCurrency,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      transactionCount: transactions.length,
      avgDaily: Math.round((totalExpenses / daysInRange) * 100) / 100,
      needTotal: Math.round(needTotal * 100) / 100,
      desireTotal: Math.round(desireTotal * 100) / 100,
    };
  }

  async getSavingsTrends(userId: string) {
    const displayCurrency = await getUserDisplayCurrency(this.prisma, userId);
    const goals = await this.prisma.goal.findMany({ where: { userId } });
    const data = await Promise.all(
      goals.map(async (g) => {
        const saved = await this.convert(userId, Number(g.saved), 'USD');
        const target = await this.convert(userId, Number(g.target), 'USD');
        return {
          name: g.name,
          saved: Math.round(saved * 100) / 100,
          target: Math.round(target * 100) / 100,
          progress: target > 0 ? Math.round((saved / target) * 100) : 0,
        };
      }),
    );
    return { currency: displayCurrency, data };
  }
}
