import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { NotificationPrefsDto } from './dto/notification-prefs.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        authProvider: string;
        hasGoogleLinked: boolean;
        hasPassword: boolean;
        memberSince: string;
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        avatar: string | null;
        plan: string;
        location: string | null;
        role: import("@prisma/client").$Enums.Role;
        currency: string;
        darkMode: boolean;
        emailVerified: boolean;
        notificationPrefs: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        avatar: string | null;
        plan: string;
        location: string | null;
        currency: string;
        darkMode: boolean;
    }>;
    updateNotificationPrefs(userId: string, dto: NotificationPrefsDto): Promise<{
        notificationPrefs: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
