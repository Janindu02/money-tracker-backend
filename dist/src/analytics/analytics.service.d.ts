import { PrismaService } from '../prisma/prisma.service';
import { CurrencyService } from '../currency/currency.service';
import type { ExpenseSummaryQueryDto } from './dto/expense-summary-query.dto';
export declare class AnalyticsService {
    private prisma;
    private currency;
    constructor(prisma: PrismaService, currency: CurrencyService);
    private convert;
    getDashboardSummary(userId: string): Promise<{
        currency: string;
        monthlyIncome: number;
        monthlyExpenses: number;
        monthlyNetChange: number;
        totalBalance: number;
        savingsYield: number;
        netWorth: number;
        netWorthChange: number;
    }>;
    getMonthlySummaries(userId: string, months?: number): Promise<{
        currency: string;
        data: {
            name: string;
            income: number;
            expenses: number;
        }[];
    }>;
    getCategorySpending(userId: string, query?: ExpenseSummaryQueryDto): Promise<{
        currency: string;
        data: {
            name: string;
            value: number;
            color: string;
        }[];
    }>;
    getSpendingTrends(userId: string): Promise<{
        currency: string;
        cashFlow: {
            name: string;
            income: number;
            expenses: number;
        }[];
        incomeVsExpenses: {
            name: string;
            income: number;
            expenses: number;
            net: number;
        }[];
    }>;
    getExpenseSummary(userId: string, query?: ExpenseSummaryQueryDto): Promise<{
        currency: string;
        totalExpenses: number;
        transactionCount: number;
        avgDaily: number;
        needTotal: number;
        desireTotal: number;
    }>;
    getSavingsTrends(userId: string): Promise<{
        currency: string;
        data: {
            name: string;
            saved: number;
            target: number;
            progress: number;
        }[];
    }>;
}
