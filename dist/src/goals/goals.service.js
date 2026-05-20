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
exports.GoalsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const currency_service_1 = require("../currency/currency.service");
const user_currency_util_1 = require("../utils/user-currency.util");
let GoalsService = class GoalsService {
    prisma;
    currency;
    constructor(prisma, currency) {
        this.prisma = prisma;
        this.currency = currency;
    }
    async mapGoal(userId, g) {
        const display = await (0, user_currency_util_1.getUserDisplayCurrency)(this.prisma, userId);
        const saved = await this.currency.toDisplayCurrency(Number(g.saved), 'USD', display);
        const target = await this.currency.toDisplayCurrency(Number(g.target), 'USD', display);
        const percent = target > 0 ? Math.round((saved / target) * 100) : 0;
        return {
            id: g.id,
            name: g.name,
            saved: Math.round(saved * 100) / 100,
            target: Math.round(target * 100) / 100,
            deadline: g.deadline
                ? g.deadline.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : g.completed
                    ? 'Complete'
                    : 'No deadline',
            icon: g.icon ?? 'Target',
            category: g.category ?? 'General',
            percentComplete: percent,
            completed: g.completed || saved >= target,
            currency: display,
        };
    }
    async create(userId, dto) {
        const goal = await this.prisma.goal.create({
            data: {
                userId,
                name: dto.name,
                target: dto.target,
                saved: dto.saved ?? 0,
                deadline: dto.deadline ? new Date(dto.deadline) : null,
                icon: dto.icon,
                category: dto.category,
            },
        });
        return this.mapGoal(userId, goal);
    }
    async findAll(userId) {
        const displayCurrency = await (0, user_currency_util_1.getUserDisplayCurrency)(this.prisma, userId);
        const goals = await this.prisma.goal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        const items = await Promise.all(goals.map((g) => this.mapGoal(userId, g)));
        return { currency: displayCurrency, items };
    }
    async findOne(userId, id) {
        const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
        if (!goal)
            throw new common_1.NotFoundException('Goal not found');
        return this.mapGoal(userId, goal);
    }
    async update(userId, id, dto) {
        const existing = await this.findOne(userId, id);
        const goal = await this.prisma.goal.update({
            where: { id },
            data: {
                ...dto,
                ...(dto.deadline && { deadline: new Date(dto.deadline) }),
                ...(dto.saved !== undefined &&
                    dto.target !== undefined &&
                    dto.saved >= dto.target && { completed: true }),
            },
        });
        const mapped = await this.mapGoal(userId, goal);
        if (mapped.completed && !existing.completed) {
            await this.prisma.notification.create({
                data: {
                    userId,
                    title: 'Goal Milestone',
                    message: `${goal.name} has been completed!`,
                    type: client_1.NotificationType.SUCCESS,
                },
            });
        }
        return mapped;
    }
    async remove(userId, id) {
        await this.findOne(userId, id);
        await this.prisma.goal.delete({ where: { id } });
        return { message: 'Goal deleted' };
    }
    async getAnalytics(userId) {
        const { currency, items: goals } = await this.findAll(userId);
        const totalTarget = goals.reduce((s, g) => s + g.target, 0);
        const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
        return {
            currency,
            totalTarget,
            totalSaved,
            overallProgress: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0,
            completedCount: goals.filter((g) => g.completed).length,
            goals,
        };
    }
};
exports.GoalsService = GoalsService;
exports.GoalsService = GoalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        currency_service_1.CurrencyService])
], GoalsService);
//# sourceMappingURL=goals.service.js.map