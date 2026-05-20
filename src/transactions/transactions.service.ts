import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExpenseNature, Prisma, TransactionType } from '@prisma/client';
import { paginateMeta, PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CurrencyService } from '../currency/currency.service';
import { getUserDisplayCurrency } from '../utils/user-currency.util';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { buildDateRange } from '../utils/date-range.util';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private currency: CurrencyService,
  ) {}

  private async assertValidCategory(userId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId }, { isDefault: true }],
      },
    });
    if (!category) {
      throw new BadRequestException(
        'Category not found. Refresh the page and select a category again.',
      );
    }
    return category;
  }

  private async mapTransaction(
    userId: string,
    t: {
      id: string;
      name: string;
      amount: Prisma.Decimal;
      type: TransactionType;
      date: Date;
      status: string;
      currency: string;
      categoryId: string | null;
      expenseNature: ExpenseNature | null;
      category: { name: string } | null;
    },
  ) {
    const raw = Number(t.amount);
    const displayCurrency = await getUserDisplayCurrency(this.prisma, userId);
    const converted = await this.currency.toDisplayCurrency(
      raw,
      t.currency,
      displayCurrency,
    );
    return {
      id: t.id,
      name: t.name,
      category: t.category?.name ?? 'Uncategorized',
      categoryId: t.categoryId ?? undefined,
      amount: t.type === 'EXPENSE' ? -Math.abs(converted) : Math.abs(converted),
      type: t.type.toLowerCase() as 'income' | 'expense',
      date: t.date.toISOString(),
      status: t.status.toLowerCase() as 'completed' | 'pending',
      currency: displayCurrency,
      expenseNature: t.expenseNature?.toLowerCase() as 'need' | 'desire' | undefined,
    };
  }

  async create(userId: string, dto: CreateTransactionDto) {
    const displayCurrency = await getUserDisplayCurrency(this.prisma, userId);

    if (dto.categoryId) {
      await this.assertValidCategory(userId, dto.categoryId);
    }

    try {
      const tx = await this.prisma.transaction.create({
        data: {
          userId,
          name: dto.name,
          description: dto.description,
          amount: dto.amount,
          type: dto.type,
          status: dto.status ?? 'COMPLETED',
          categoryId: dto.categoryId,
          currency: dto.currency ?? displayCurrency,
          notes: dto.notes,
          date: new Date(dto.date),
          isRecurring: dto.isRecurring ?? false,
          recurringInterval: dto.recurringInterval,
          receiptUrl: dto.receiptUrl,
          expenseNature:
            dto.type === TransactionType.EXPENSE && dto.expenseNature
              ? dto.expenseNature
              : null,
        },
        include: { category: true },
      });
      return this.mapTransaction(userId, tx);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Invalid category. Please refresh and select a category again.',
          );
        }
        if (error.code === 'P2022') {
          throw new BadRequestException(
            'Database schema is out of date. Run: npx prisma db push',
          );
        }
      }
      throw error;
    }
  }

  async findAll(userId: string, query: FilterTransactionsDto) {
    const displayCurrency = await getUserDisplayCurrency(this.prisma, userId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const dateRange = buildDateRange(query);
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.expenseNature && { expenseNature: query.expenseNature }),
      ...(dateRange && { date: dateRange }),
      ...(query.minAmount !== undefined || query.maxAmount !== undefined
        ? {
            amount: {
              ...(query.minAmount !== undefined && { gte: query.minAmount }),
              ...(query.maxAmount !== undefined && { lte: query.maxAmount }),
            },
          }
        : {}),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const sortBy = query.sortBy ?? 'date';
    const sortOrder = query.sortOrder ?? 'desc';

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { category: true },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const mapped = await Promise.all(items.map((t) => this.mapTransaction(userId, t)));

    return {
      currency: displayCurrency,
      items: mapped,
      meta: paginateMeta(total, page, limit),
    };
  }

  async findOne(userId: string, id: string) {
    const tx = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    if (!tx) throw new NotFoundException('Transaction not found');
    return this.mapTransaction(userId, tx);
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const existing = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException('Transaction not found');

    if (dto.categoryId) {
      await this.assertValidCategory(userId, dto.categoryId);
    }

    const type = dto.type ?? existing.type;

    try {
      const tx = await this.prisma.transaction.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.amount !== undefined && { amount: dto.amount }),
          ...(dto.type !== undefined && { type: dto.type }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          ...(dto.currency !== undefined && { currency: dto.currency }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
          ...(dto.date !== undefined && { date: new Date(dto.date) }),
          ...(dto.isRecurring !== undefined && { isRecurring: dto.isRecurring }),
          ...(dto.recurringInterval !== undefined && {
            recurringInterval: dto.recurringInterval,
          }),
          ...(dto.receiptUrl !== undefined && { receiptUrl: dto.receiptUrl }),
          ...(dto.expenseNature !== undefined && {
            expenseNature:
              type === TransactionType.EXPENSE ? dto.expenseNature : null,
          }),
        },
        include: { category: true },
      });
      return this.mapTransaction(userId, tx);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException(
          'Invalid category. Please refresh and select a category again.',
        );
      }
      throw error;
    }
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.transaction.delete({ where: { id } });
    return { message: 'Transaction deleted' };
  }

  async getCategories(userId: string, type?: TransactionType) {
    return this.prisma.category.findMany({
      where: {
        OR: [{ userId }, { isDefault: true }],
        ...(type && { type }),
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  private async findOwnedCategory(userId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, userId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (category.isDefault) {
      throw new ForbiddenException('Default categories cannot be modified');
    }
    return category;
  }

  async createCategory(userId: string, dto: CreateCategoryDto) {
    const type = dto.type ?? TransactionType.EXPENSE;
    const name = dto.name.trim();

    const existing = await this.prisma.category.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        type,
        OR: [{ userId }, { isDefault: true }],
      },
    });
    if (existing) {
      throw new ConflictException(`Category "${name}" already exists`);
    }

    return this.prisma.category.create({
      data: {
        userId,
        name,
        icon: dto.icon ?? 'Wallet',
        color: dto.color,
        type,
        isDefault: false,
      },
    });
  }

  async updateCategory(userId: string, categoryId: string, dto: UpdateCategoryDto) {
    const category = await this.findOwnedCategory(userId, categoryId);

    if (dto.name) {
      const name = dto.name.trim();
      const duplicate = await this.prisma.category.findFirst({
        where: {
          id: { not: categoryId },
          name: { equals: name, mode: 'insensitive' },
          type: category.type,
          OR: [{ userId }, { isDefault: true }],
        },
      });
      if (duplicate) {
        throw new ConflictException(`Category "${name}" already exists`);
      }
    }

    return this.prisma.category.update({
      where: { id: category.id },
      data: {
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
    });
  }

  async removeCategory(userId: string, categoryId: string) {
    const category = await this.findOwnedCategory(userId, categoryId);

    const usageCount = await this.prisma.transaction.count({
      where: { categoryId: category.id },
    });
    if (usageCount > 0) {
      throw new BadRequestException(
        'Cannot delete a category that is used by expenses. Reassign those expenses first.',
      );
    }

    await this.prisma.category.delete({ where: { id: category.id } });
    return { message: 'Category deleted' };
  }
}
