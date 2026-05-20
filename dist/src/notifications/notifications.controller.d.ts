import { NotificationsService } from './notifications.service';
import type { JwtPayload } from '../types/auth.types';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(user: JwtPayload, query: PaginationDto): Promise<{
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
    getUnreadCount(user: JwtPayload): Promise<{
        count: number;
    }>;
    markAllAsRead(user: JwtPayload): Promise<{
        message: string;
    }>;
    markAsRead(user: JwtPayload, id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        read: boolean;
        emailSent: boolean;
    }>;
}
