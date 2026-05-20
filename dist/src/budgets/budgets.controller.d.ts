import { BudgetsService } from './budgets.service';
import type { JwtPayload } from '../types/auth.types';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
export declare class BudgetsController {
    private budgetsService;
    constructor(budgetsService: BudgetsService);
    create(user: JwtPayload, dto: CreateBudgetDto): Promise<{
        id: string;
        name: string;
        spent: number;
        limit: number;
        icon: string;
        overBudget: boolean;
        percentUsed: number;
        currency: string;
    }>;
    findAll(user: JwtPayload, month?: number, year?: number): Promise<{
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
    getAnalytics(user: JwtPayload): Promise<{
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
    findOne(user: JwtPayload, id: string): Promise<{
        id: string;
        name: string;
        spent: number;
        limit: number;
        icon: string;
        overBudget: boolean;
        percentUsed: number;
    }>;
    update(user: JwtPayload, id: string, dto: UpdateBudgetDto): Promise<{
        id: string;
        name: string;
        spent: number;
        limit: number;
        icon: string;
        overBudget: boolean;
        percentUsed: number;
    }>;
    remove(user: JwtPayload, id: string): Promise<{
        message: string;
    }>;
}
