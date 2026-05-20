"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserDisplayCurrency = getUserDisplayCurrency;
async function getUserDisplayCurrency(prisma, userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { currency: true },
    });
    return user?.currency ?? 'LKR';
}
//# sourceMappingURL=user-currency.util.js.map