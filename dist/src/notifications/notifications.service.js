"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    formatTime(date) {
        const diff = Date.now() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60)
            return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24)
            return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    }
    mapNotification(n) {
        return {
            id: n.id,
            title: n.title,
            message: n.message,
            time: this.formatTime(n.createdAt),
            read: n.read,
            type: n.type.toLowerCase(),
        };
    }
    async findAll(userId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where: { userId } }),
        ]);
        return {
            items: items.map((n) => this.mapNotification(n)),
            meta: (0, pagination_dto_1.paginateMeta)(total, page, limit),
        };
    }
    async markAsRead(userId, id) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId },
        });
        if (!notification)
            throw new common_1.NotFoundException('Notification not found');
        return this.prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    }
    async markAllAsRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
        return { message: 'All notifications marked as read' };
    }
    async getUnreadCount(userId) {
        const count = await this.prisma.notification.count({
            where: { userId, read: false },
        });
        return { count };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map