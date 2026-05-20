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
exports.BudgetsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const currency_service_1 = require("../currency/currency.service");
const user_currency_util_1 = require("../utils/user-currency.util");
let BudgetsService = class BudgetsService {
    prisma;
    currency;
    constructor(prisma, currency) {
        this.prisma = prisma;
        this.currency = currency;
    }
    async mapBudget(userId, b) {
        const rawSpent = typeof b.spent === 'number' ? b.spent : Number(b.spent);
        const rawLimit = typeof b.limit === 'number' ? b.limit : Number(b.limit);
        const spent = await this.currency.toDisplayCurrency(rawSpent, 'USD', await (0, user_currency_util_1.getUserDisplayCurrency)(this.prisma, userId));
        const limit = await this.currency.toDisplayCurrency(rawLimit, 'USD', await (0, user_currency_util_1.getUserDisplayCurrency)(this.prisma, userId));
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
    async create(userId, dto) {
        const displayCurrency = await (0, user_currency_util_1.getUserDisplayCurrency)(this.prisma, userId);
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
    async findAll(userId, month, year) {
        const displayCurrency = await (0, user_currency_util_1.getUserDisplayCurrency)(this.prisma, userId);
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
                        type: client_1.NotificationType.ALERT,
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
    async findOne(userId, id) {
        const budget = await this.prisma.budget.findFirst({ where: { id, userId } });
        if (!budget)
            throw new common_1.NotFoundException('Budget not found');
        return this.mapBudget(userId, budget);
    }
    async update(userId, id, dto) {
        await this.findOne(userId, id);
        const budget = await this.prisma.budget.update({ where: { id }, data: dto });
        return this.mapBudget(userId, budget);
    }
    async remove(userId, id) {
        await this.findOne(userId, id);
        await this.prisma.budget.delete({ where: { id } });
        return { message: 'Budget deleted' };
    }
    async getAnalytics(userId) {
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
};
exports.BudgetsService = BudgetsService;
exports.BudgetsService = BudgetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        currency_service_1.CurrencyService])
], BudgetsService);
//# sourceMappingURL=budgets.service.js.map