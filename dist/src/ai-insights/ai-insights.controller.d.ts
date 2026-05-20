import { AiInsightsService } from './ai-insights.service';
import type { JwtPayload } from '../types/auth.types';
export declare class AiInsightsController {
    private aiInsightsService;
    constructor(aiInsightsService: AiInsightsService);
    getInsights(user: JwtPayload): Promise<{
        id: string;
        title: string;
        description: string;
        type: string;
    }[]>;
    generate(user: JwtPayload): Promise<{
        id: string;
        title: string;
        description: string;
        type: string;
    }[]>;
    dismiss(user: JwtPayload, id: string): Promise<{
        message: string;
    }>;
}
