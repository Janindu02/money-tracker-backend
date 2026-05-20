import { PrismaService } from '../prisma/prisma.service';

export async function getUserDisplayCurrency(
  prisma: PrismaService,
  userId: string,
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currency: true },
  });
  return user?.currency ?? 'LKR';
}
