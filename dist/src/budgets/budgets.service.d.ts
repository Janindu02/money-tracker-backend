import { PrismaService } from '../prisma/prisma.service';
import { CurrencyService } from '../currency/currency.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
export declare class BudgetsService {
    private prisma;
    private currency;
    constructor(prisma: PrismaService, currency: CurrencyService);
    private mapBudget;
    create(userId: string, dto: CreateBudgetDto): Promise<{
        id: string;
        name: string;
        spent: number;
        limit: number;
        icon: string;
        overBudget: boolean;
        percentUsed: number;
        currency: string;
    }>;
    findAll(userId: string, month?: number, year?: number): Promise<{
        currency: string;
        items: {
            id: string;
            name: string;
            spent: number;
            limit: number;
            icon: string;
            overBudget: boolean;
            percentUsed: number;
        }[];
    }>;
    findOne(userId: string, id: string): Promise<{
        id: string;
        name: string;
        spent: number;
        limit: number;
        icon: string;
        overBudget: boolean;
        percentUsed: number;
    }>;
    update(userId: string, id: string, dto: UpdateBudgetDto): Promise<{
        id: string;
        name: string;
        spent: number;
        limit: number;
        icon: string;
        overBudget: boolean;
        percentUsed: number;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
    getAnalytics(userId: string): Promise<{
        currency: string;
        totalLimit: number;
        totalSpent: number;
        remaining: number;
        overBudgetCount: number;
        categories: {
            id: string;
            name: string;
            spent: number;
            limit: number;
            icon: string;
            overBudget: boolean;
            percentUsed: number;
        }[];
    }>;
}
