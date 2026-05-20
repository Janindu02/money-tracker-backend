import { AnalyticsService } from './analytics.service';
import type { JwtPayload } from '../types/auth.types';
import { ExpenseSummaryQueryDto } from './dto/expense-summary-query.dto';
export declare class AnalyticsController {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    getSummary(user: JwtPayload): Promise<{
        currency: string;
        monthlyIncome: number;
        monthlyExpenses: number;
        monthlyNetChange: number;
        totalBalance: number;
        savingsYield: number;
        netWorth: number;
        netWorthChange: number;
    }>;
    getMonthly(user: JwtPayload, months?: number): Promise<{
        currency: string;
        data: {
            name: string;
            income: number;
            expenses: number;
        }[];
    }>;
    getCategories(user: JwtPayload, query: ExpenseSummaryQueryDto): Promise<{
        currency: string;
        data: {
            name: string;
            value: number;
            color: string;
        }[];
    }>;
    getExpenseSummary(user: JwtPayload, query: ExpenseSummaryQueryDto): Promise<{
        currency: string;
        totalExpenses: number;
        transactionCount: number;
        avgDaily: number;
        needTotal: number;
        desireTotal: number;
    }>;
    getTrends(user: JwtPayload): Promise<{
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
    getSavings(user: JwtPayload): Promise<{
        currency: string;
        data: {
            name: string;
            saved: number;
            target: number;
            progress: number;
        }[];
    }>;
}
