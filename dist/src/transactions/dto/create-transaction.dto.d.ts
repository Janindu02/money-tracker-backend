import { ExpenseNature, TransactionStatus, TransactionType } from '@prisma/client';
export declare class CreateTransactionDto {
    name: string;
    description?: string;
    amount: number;
    type: TransactionType;
    status?: TransactionStatus;
    categoryId?: string;
    currency?: string;
    notes?: string;
    date: string;
    isRecurring?: boolean;
    recurringInterval?: string;
    receiptUrl?: string;
    expenseNature?: ExpenseNature;
}
