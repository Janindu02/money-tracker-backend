import { ExpenseNature } from '@prisma/client';
export declare class ExpenseSummaryQueryDto {
    categoryId?: string;
    expenseNature?: ExpenseNature;
    year?: number;
    month?: number;
    day?: number;
}
