import { ExpenseNature, TransactionStatus, TransactionType } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class FilterTransactionsDto extends PaginationDto {
    type?: TransactionType;
    status?: TransactionStatus;
    categoryId?: string;
    expenseNature?: ExpenseNature;
    year?: number;
    month?: number;
    day?: number;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    sortBy?: 'date' | 'amount' | 'name';
    sortOrder?: 'asc' | 'desc';
}
