import { PrismaService } from '../prisma/prisma.service';
export declare function getUserDisplayCurrency(prisma: PrismaService, userId: string): Promise<string>;
