import { UsersService } from './users.service';
import type { JwtPayload } from '../types/auth.types';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { NotificationPrefsDto } from './dto/notification-prefs.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(user: JwtPayload): Promise<{
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
    updateProfile(user: JwtPayload, dto: UpdateProfileDto): Promise<{
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
    updateNotificationPrefs(user: JwtPayload, dto: NotificationPrefsDto): Promise<{
        notificationPrefs: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
