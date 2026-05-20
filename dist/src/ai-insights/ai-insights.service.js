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
exports.AiInsightsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let AiInsightsService = class AiInsightsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getInsights(userId) {
        const stored = await this.prisma.aiInsight.findMany({
            where: { userId, dismissed: false },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        if (stored.length > 0) {
            return stored.map((i) => ({
                id: i.id,
                title: i.title,
                description: i.description,
                type: i.type.toLowerCase(),
            }));
        }
        return this.generateInsights(userId);
    }
    async generateInsights(userId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const transactions = await this.prisma.transaction.findMany({
            where: { userId, date: { gte: startOfMonth } },
            include: { category: true },
        });
        const insights = [];
        const expenses = transactions.filter((t) => t.type === client_1.TransactionType.EXPENSE);
        const totalExpenses = expenses.reduce((s, t) => s + Number(t.amount), 0);
        const categoryMap = new Map();
        for (const t of expenses) {
            const cat = t.category?.name ?? 'Other';
            categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + Number(t.amount));
        }
        const topCategory = [...categoryMap.entries()].sort((a, b) => b[1] - a[1])[0];
        if (topCategory && totalExpenses > 0) {
            const pct = Math.round((topCategory[1] / totalExpenses) * 100);
            insights.push({
                title: 'Spending Trend',
                description: `${topCategory[0]} accounts for ${pct}% of your monthly spending. Review if this aligns with your budget.`,
                type: client_1.InsightType.SPENDING,
            });
        }
        const recurring = expenses.filter((t) => t.isRecurring);
        if (recurring.length >= 2) {
            const total = recurring.reduce((s, t) => s + Number(t.amount), 0);
            insights.push({
                title: 'Subscription Alert',
                description: `You have ${recurring.length} recurring expenses totaling $${total.toFixed(2)}/mo. Review unused subscriptions.`,
                type: client_1.InsightType.SUBSCRIPTION,
            });
        }
        const goals = await this.prisma.goal.findMany({ where: { userId } });
        const incomplete = goals.filter((g) => !g.completed && Number(g.saved) < Number(g.target));
        if (incomplete.length > 0) {
            const g = incomplete[0];
            const remaining = Number(g.target) - Number(g.saved);
            insights.push({
                title: 'Smart Savings Suggestion',
                description: `Add $${(remaining / 6).toFixed(0)}/month to reach "${g.name}" within 6 months.`,
                type: client_1.InsightType.SAVINGS,
            });
        }
        if (insights.length === 0) {
            insights.push({
                title: 'Getting Started',
                description: 'Add more transactions to unlock personalized AI financial insights.',
                type: client_1.InsightType.INVESTMENT,
            });
        }
        const created = await Promise.all(insights.map((insight) => this.prisma.aiInsight.create({
            data: { userId, ...insight },
        })));
        return created.map((i) => ({
            id: i.id,
            title: i.title,
            description: i.description,
            type: i.type.toLowerCase(),
        }));
    }
    async dismiss(userId, id) {
        await this.prisma.aiInsight.updateMany({
            where: { id, userId },
            data: { dismissed: true },
        });
        return { message: 'Insight dismissed' };
    }
};
exports.AiInsightsService = AiInsightsService;
exports.AiInsightsService = AiInsightsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiInsightsService);
//# sourceMappingURL=ai-insights.service.js.map