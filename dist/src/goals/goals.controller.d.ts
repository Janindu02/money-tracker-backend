import { GoalsService } from './goals.service';
import type { JwtPayload } from '../types/auth.types';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
export declare class GoalsController {
    private goalsService;
    constructor(goalsService: GoalsService);
    create(user: JwtPayload, dto: CreateGoalDto): Promise<{
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
    findAll(user: JwtPayload): Promise<{
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
    getAnalytics(user: JwtPayload): Promise<{
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
    findOne(user: JwtPayload, id: string): Promise<{
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
    update(user: JwtPayload, id: string, dto: UpdateGoalDto): Promise<{
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
    remove(user: JwtPayload, id: string): Promise<{
        message: string;
    }>;
}
