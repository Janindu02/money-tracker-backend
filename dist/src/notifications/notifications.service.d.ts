import { PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    private formatTime;
    private mapNotification;
    findAll(userId: string, query: PaginationDto): Promise<{
        items: {
            id: string;
            title: string;
            message: string;
            time: string;
            read: boolean;
            type: "alert" | "info" | "success";
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
    markAsRead(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        read: boolean;
        emailSent: boolean;
    }>;
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
}
