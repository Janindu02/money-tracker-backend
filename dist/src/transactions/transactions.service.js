"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const prisma_service_1 = require("../prisma/prisma.service");
const currency_service_1 = require("../currency/currency.service");
const user_currency_util_1 = require("../utils/user-currency.util");
const date_range_util_1 = require("../utils/date-range.util");
let TransactionsService = class TransactionsService {
    prisma;
    currency;
    constructor(prisma, currency) {
        this.prisma = prisma;
        this.currency = currency;
    }
    async assertValidCategory(userId, categoryId) {
        const category = await this.prisma.category.findFirst({
            where: {
                id: categoryId,
                OR: [{ userId }, { isDefault: true }],
            },
        });
        if (!category) {
            throw new common_1.BadRequestException('Category not found. Refresh the page and select a category again.');
        }
        return category;
    }
    async mapTransaction(userId, t) {
        const raw = Number(t.amount);
        const displayCurrency = await (0, user_currency_util_1.getUserDisplayCurrency)(this.prisma, userId);
        const converted = await this.currency.toDisplayCurrency(raw, t.currency, displayCurrency);
        return {
            id: t.id,
            name: t.name,
            category: t.category?.name ?? 'Uncategorized',
            categoryId: t.categoryId ?? undefined,
            amount: t.type === 'EXPENSE' ? -Math.abs(converted) : Math.abs(converted),
            type: t.type.toLowerCase(),
            date: t.date.toISOString(),
            status: t.status.toLowerCase(),
            currency: displayCurrency,
            expenseNature: t.expenseNature?.toLowerCase(),
        };
    }
    async create(userId, dto) {
        const displayCurrency = await (0, user_currency_util_1.getUserDisplayCurrency)(this.prisma, userId);
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
                    expenseNature: dto.type === client_1.TransactionType.EXPENSE && dto.expenseNature
                        ? dto.expenseNature
                        : null,
                },
                include: { category: true },
            });
            return this.mapTransaction(userId, tx);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2003') {
                    throw new common_1.BadRequestException('Invalid category. Please refresh and select a category again.');
                }
                if (error.code === 'P2022') {
                    throw new common_1.BadRequestException('Database schema is out of date. Run: npx prisma db push');
                }
            }
            throw error;
        }
    }
    async findAll(userId, query) {
        const displayCurrency = await (0, user_currency_util_1.getUserDisplayCurrency)(this.prisma, userId);
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const dateRange = (0, date_range_util_1.buildDateRange)(query);
        const where = {
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
            meta: (0, pagination_dto_1.paginateMeta)(total, page, limit),
        };
    }
    async findOne(userId, id) {
        const tx = await this.prisma.transaction.findFirst({
            where: { id, userId },
            include: { category: true },
        });
        if (!tx)
            throw new common_1.NotFoundException('Transaction not found');
        return this.mapTransaction(userId, tx);
    }
    async update(userId, id, dto) {
        const existing = await this.prisma.transaction.findFirst({
            where: { id, userId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Transaction not found');
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
                        expenseNature: type === client_1.TransactionType.EXPENSE ? dto.expenseNature : null,
                    }),
                },
                include: { category: true },
            });
            return this.mapTransaction(userId, tx);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
                throw new common_1.BadRequestException('Invalid category. Please refresh and select a category again.');
            }
            throw error;
        }
    }
    async remove(userId, id) {
        await this.findOne(userId, id);
        await this.prisma.transaction.delete({ where: { id } });
        return { message: 'Transaction deleted' };
    }
    async getCategories(userId, type) {
        return this.prisma.category.findMany({
            where: {
                OR: [{ userId }, { isDefault: true }],
                ...(type && { type }),
            },
            orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
        });
    }
    async findOwnedCategory(userId, categoryId) {
        const category = await this.prisma.category.findFirst({
            where: { id: categoryId, userId },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        if (category.isDefault) {
            throw new common_1.ForbiddenException('Default categories cannot be modified');
        }
        return category;
    }
    async createCategory(userId, dto) {
        const type = dto.type ?? client_1.TransactionType.EXPENSE;
        const name = dto.name.trim();
        const existing = await this.prisma.category.findFirst({
            where: {
                name: { equals: name, mode: 'insensitive' },
                type,
                OR: [{ userId }, { isDefault: true }],
            },
        });
        if (existing) {
            throw new common_1.ConflictException(`Category "${name}" already exists`);
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
    async updateCategory(userId, categoryId, dto) {
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
                throw new common_1.ConflictException(`Category "${name}" already exists`);
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
    async removeCategory(userId, categoryId) {
        const category = await this.findOwnedCategory(userId, categoryId);
        const usageCount = await this.prisma.transaction.count({
            where: { categoryId: category.id },
        });
        if (usageCount > 0) {
            throw new common_1.BadRequestException('Cannot delete a category that is used by expenses. Reassign those expenses first.');
        }
        await this.prisma.category.delete({ where: { id: category.id } });
        return { message: 'Category deleted' };
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        currency_service_1.CurrencyService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map