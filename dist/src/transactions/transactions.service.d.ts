import { TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CurrencyService } from '../currency/currency.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class TransactionsService {
    private prisma;
    private currency;
    constructor(prisma: PrismaService, currency: CurrencyService);
    private assertValidCategory;
    private mapTransaction;
    create(userId: string, dto: CreateTransactionDto): Promise<{
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
    findAll(userId: string, query: FilterTransactionsDto): Promise<{
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
    findOne(userId: string, id: string): Promise<{
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
    update(userId: string, id: string, dto: UpdateTransactionDto): Promise<{
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
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
    getCategories(userId: string, type?: TransactionType): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string | null;
        icon: string | null;
        color: string | null;
        type: import("@prisma/client").$Enums.TransactionType;
        isDefault: boolean;
    }[]>;
    private findOwnedCategory;
    createCategory(userId: string, dto: CreateCategoryDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string | null;
        icon: string | null;
        color: string | null;
        type: import("@prisma/client").$Enums.TransactionType;
        isDefault: boolean;
    }>;
    updateCategory(userId: string, categoryId: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string | null;
        icon: string | null;
        color: string | null;
        type: import("@prisma/client").$Enums.TransactionType;
        isDefault: boolean;
    }>;
    removeCategory(userId: string, categoryId: string): Promise<{
        message: string;
    }>;
}
