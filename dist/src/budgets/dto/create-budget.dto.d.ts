import { BudgetPeriod } from '@prisma/client';
export declare class CreateBudgetDto {
    name: string;
    limit: number;
    categoryId?: string;
    period?: BudgetPeriod;
    month?: number;
    year?: number;
    icon?: string;
}
