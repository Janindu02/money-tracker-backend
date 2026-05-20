import { TransactionsService } from './transactions.service';
import type { JwtPayload } from '../types/auth.types';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TransactionType } from '@prisma/client';
export declare class TransactionsController {
    private transactionsService;
    constructor(transactionsService: TransactionsService);
    create(user: JwtPayload, dto: CreateTransactionDto): Promise<{
        id: string;
        name: string;
        category: string;
        categoryId: string | undefined;
        amount: number;
        type: "income" | "expense";
        date: string;
        status: "completed" | "pending";
        currency: string;
        expenseNature: "need" | "desire" | undefined;
    }>;
    findAll(user: JwtPayload, query: FilterTransactionsDto): Promise<{
        currency: string;
        items: {
            id: string;
            name: string;
            category: string;
            categoryId: string | undefined;
            amount: number;
            type: "income" | "expense";
            date: string;
            status: "completed" | "pending";
            currency: string;
            expenseNature: "need" | "desire" | undefined;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getCategories(user: JwtPayload, type?: TransactionType): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string | null;
        icon: string | null;
        color: string | null;
        type: import("@prisma/client").$Enums.TransactionType;
        isDefault: boolean;
    }[]>;
    createCategory(user: JwtPayload, dto: CreateCategoryDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string | null;
        icon: string | null;
        color: string | null;
        type: import("@prisma/client").$Enums.TransactionType;
        isDefault: boolean;
    }>;
    updateCategory(user: JwtPayload, categoryId: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string | null;
        icon: string | null;
        color: string | null;
        type: import("@prisma/client").$Enums.TransactionType;
        isDefault: boolean;
    }>;
    removeCategory(user: JwtPayload, categoryId: string): Promise<{
        message: string;
    }>;
    findOne(user: JwtPayload, id: string): Promise<{
        id: string;
        name: string;
        category: string;
        categoryId: string | undefined;
        amount: number;
        type: "income" | "expense";
        date: string;
        status: "completed" | "pending";
        currency: string;
        expenseNature: "need" | "desire" | undefined;
    }>;
    update(user: JwtPayload, id: string, dto: UpdateTransactionDto): Promise<{
        id: string;
        name: string;
        category: string;
        categoryId: string | undefined;
        amount: number;
        type: "income" | "expense";
        date: string;
        status: "completed" | "pending";
        currency: string;
        expenseNature: "need" | "desire" | undefined;
    }>;
    remove(user: JwtPayload, id: string): Promise<{
        message: string;
    }>;
}
