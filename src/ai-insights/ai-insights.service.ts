import { Injectable } from '@nestjs/common';
import { InsightType, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiInsightsService {
  constructor(private prisma: PrismaService) {}

  async getInsights(userId: string) {
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

  async generateInsights(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions = await this.prisma.transaction.findMany({
      where: { userId, date: { gte: startOfMonth } },
      include: { category: true },
    });

    const insights: { title: string; description: string; type: InsightType }[] = [];

    const expenses = transactions.filter((t) => t.type === TransactionType.EXPENSE);
    const totalExpenses = expenses.reduce((s, t) => s + Number(t.amount), 0);

    const categoryMap = new Map<string, number>();
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
        type: InsightType.SPENDING,
      });
    }

    const recurring = expenses.filter((t) => t.isRecurring);
    if (recurring.length >= 2) {
      const total = recurring.reduce((s, t) => s + Number(t.amount), 0);
      insights.push({
        title: 'Subscription Alert',
        description: `You have ${recurring.length} recurring expenses totaling $${total.toFixed(2)}/mo. Review unused subscriptions.`,
        type: InsightType.SUBSCRIPTION,
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
        type: InsightType.SAVINGS,
      });
    }

    if (insights.length === 0) {
      insights.push({
        title: 'Getting Started',
        description: 'Add more transactions to unlock personalized AI financial insights.',
        type: InsightType.INVESTMENT,
      });
    }

    const created = await Promise.all(
      insights.map((insight) =>
        this.prisma.aiInsight.create({
          data: { userId, ...insight },
        }),
      ),
    );

    return created.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      type: i.type.toLowerCase(),
    }));
  }

  async dismiss(userId: string, id: string) {
    await this.prisma.aiInsight.updateMany({
      where: { id, userId },
      data: { dismissed: true },
    });
    return { message: 'Insight dismissed' };
  }
}
