import { PrismaService } from '../prisma/prisma.service';
import { CurrencyService } from '../currency/currency.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
export declare class GoalsService {
    private prisma;
    private currency;
    constructor(prisma: PrismaService, currency: CurrencyService);
    private mapGoal;
    create(userId: string, dto: CreateGoalDto): Promise<{
        id: string;
        name: string;
        saved: number;
        target: number;
        deadline: string;
        icon: string;
        category: string;
        percentComplete: number;
        completed: boolean;
        currency: string;
    }>;
    findAll(userId: string): Promise<{
        currency: string;
        items: {
            id: string;
            name: string;
            saved: number;
            target: number;
            deadline: string;
            icon: string;
            category: string;
            percentComplete: number;
            completed: boolean;
            currency: string;
        }[];
    }>;
    findOne(userId: string, id: string): Promise<{
        id: string;
        name: string;
        saved: number;
        target: number;
        deadline: string;
        icon: string;
        category: string;
        percentComplete: number;
        completed: boolean;
        currency: string;
    }>;
    update(userId: string, id: string, dto: UpdateGoalDto): Promise<{
        id: string;
        name: string;
        saved: number;
        target: number;
        deadline: string;
        icon: string;
        category: string;
        percentComplete: number;
        completed: boolean;
        currency: string;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
    getAnalytics(userId: string): Promise<{
        currency: string;
        totalTarget: number;
        totalSaved: number;
        overallProgress: number;
        completedCount: number;
        goals: {
            id: string;
            name: string;
            saved: number;
            target: number;
            deadline: string;
            icon: string;
            category: string;
            percentComplete: number;
            completed: boolean;
            currency: string;
        }[];
    }>;
}
