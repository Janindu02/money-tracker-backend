import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { NotificationPrefsDto } from './dto/notification-prefs.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        plan: true,
        location: true,
        currency: true,
        darkMode: true,
        role: true,
        emailVerified: true,
        notificationPrefs: true,
        createdAt: true,
        googleId: true,
        passwordHash: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const { passwordHash, googleId, ...safeUser } = user;

    return {
      ...safeUser,
      authProvider: googleId && passwordHash ? 'both' : googleId ? 'google' : 'email',
      hasGoogleLinked: Boolean(googleId),
      hasPassword: Boolean(passwordHash),
      memberSince: user.createdAt.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        plan: true,
        location: true,
        currency: true,
        darkMode: true,
      },
    });
  }

  async updateNotificationPrefs(userId: string, dto: NotificationPrefsDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const current = (user?.notificationPrefs as Record<string, boolean>) ?? {};
    return this.prisma.user.update({
      where: { id: userId },
      data: { notificationPrefs: { ...current, ...dto } },
      select: { notificationPrefs: true },
    });
  }
}
