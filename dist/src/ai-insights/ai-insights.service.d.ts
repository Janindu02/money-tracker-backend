import { PrismaService } from '../prisma/prisma.service';
export declare class AiInsightsService {
    private prisma;
    constructor(prisma: PrismaService);
    getInsights(userId: string): Promise<{
        id: string;
        title: string;
        description: string;
        type: string;
    }[]>;
    generateInsights(userId: string): Promise<{
        id: string;
        title: string;
        description: string;
        type: string;
    }[]>;
    dismiss(userId: string, id: string): Promise<{
        message: string;
    }>;
}
