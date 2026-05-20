import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CurrencyService } from '../currency/currency.service';
import { getUserDisplayCurrency } from '../utils/user-currency.util';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(
    private prisma: PrismaService,
    private currency: CurrencyService,
  ) {}

  private async mapBudget(
    userId: string,
    b: {
      id: string;
      name: string;
      spent: { toNumber?: () => number } | number;
      limit: { toNumber?: () => number } | number;
      icon: string | null;
    },
  ) {
    const rawSpent = typeof b.spent === 'number' ? b.spent : Number(b.spent);
    const rawLimit = typeof b.limit === 'number' ? b.limit : Number(b.limit);
    const spent = await this.currency.toDisplayCurrency(rawSpent, 'USD', await getUserDisplayCurrency(this.prisma, userId));
    const limit = await this.currency.toDisplayCurrency(rawLimit, 'USD', await getUserDisplayCurrency(this.prisma, userId));
    return {
      id: b.id,
      name: b.name,
      spent: Math.round(spent * 100) / 100,
      limit: Math.round(limit * 100) / 100,
      icon: b.icon ?? 'Wallet',
      overBudget: spent > limit,
      percentUsed: limit > 0 ? Math.round((spent / limit) * 100) : 0,
    };
  }

  async create(userId: string, dto: CreateBudgetDto) {
    const displayCurrency = await getUserDisplayCurrency(this.prisma, userId);
    const now = new Date();
    const budget = await this.prisma.budget.create({
      data: {
        userId,
        name: dto.name,
        limit: dto.limit,
        categoryId: dto.categoryId,
        period: dto.period,
        month: dto.month ?? now.getMonth() + 1,
        year: dto.year ?? now.getFullYear(),
        icon: dto.icon,
      },
    });
    const mapped = await this.mapBudget(userId, budget);
    return { currency: displayCurrency, ...mapped };
  }

  async findAll(userId: string, month?: number, year?: number) {
    const displayCurrency = await getUserDisplayCurrency(this.prisma, userId);
    const now = new Date();
    const budgets = await this.prisma.budget.findMany({
      where: {
        userId,
        month: month ?? now.getMonth() + 1,
        year: year ?? now.getFullYear(),
      },
      orderBy: { name: 'asc' },
    });

    for (const budget of budgets) {
      const spent = Number(budget.spent);
      const limit = Number(budget.limit);
      if (spent > limit && !budget.alertSent) {
        const over = await this.currency.toDisplayCurrency(spent - limit, 'USD', displayCurrency);
        const symbol = displayCurrency === 'LKR' ? 'Rs' : displayCurrency;
        await this.prisma.notification.create({
          data: {
            userId,
            title: 'Budget Alert',
            message: `${budget.name} is over budget by ${symbol} ${over.toFixed(2)}`,
            type: NotificationType.ALERT,
          },
        });
        await this.prisma.budget.update({
          where: { id: budget.id },
          data: { alertSent: true },
        });
      }
    }

    const mapped = await Promise.all(budgets.map((b) => this.mapBudget(userId, b)));
    return { currency: displayCurrency, items: mapped };
  }

  async findOne(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({ where: { id, userId } });
    if (!budget) throw new NotFoundException('Budget not found');
    return this.mapBudget(userId, budget);
  }

  async update(userId: string, id: string, dto: UpdateBudgetDto) {
    await this.findOne(userId, id);
    const budget = await this.prisma.budget.update({ where: { id }, data: dto });
    return this.mapBudget(userId, budget);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.budget.delete({ where: { id } });
    return { message: 'Budget deleted' };
  }

  async getAnalytics(userId: string) {
    const result = await this.findAll(userId);
    const budgets = result.items;
    const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
    return {
      currency: result.currency,
      totalLimit,
      totalSpent,
      remaining: Math.round((totalLimit - totalSpent) * 100) / 100,
      overBudgetCount: budgets.filter((b) => b.overBudget).length,
      categories: budgets,
    };
  }
}
