"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const passwordHash = await bcrypt.hash('Password123!', 12);
    const user = await prisma.user.upsert({
        where: { email: 'demo@finova.app' },
        update: {},
        create: {
            email: 'demo@finova.app',
            passwordHash,
            firstName: 'Alex',
            lastName: 'Rivers',
            phone: '+1 (555) 012-3456',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            plan: 'Finova Plus',
            location: 'San Francisco, CA',
            emailVerified: true,
            currency: 'LKR',
        },
    });
    const categories = await Promise.all([
        { name: 'Dining', type: client_1.TransactionType.EXPENSE, icon: 'Utensils', isDefault: true },
        { name: 'Income', type: client_1.TransactionType.INCOME, icon: 'DollarSign', isDefault: true },
        { name: 'Subscriptions', type: client_1.TransactionType.EXPENSE, icon: 'Tv', isDefault: true },
        { name: 'Groceries', type: client_1.TransactionType.EXPENSE, icon: 'ShoppingCart', isDefault: true },
        { name: 'Transport', type: client_1.TransactionType.EXPENSE, icon: 'Car', isDefault: true },
        { name: 'Shopping', type: client_1.TransactionType.EXPENSE, icon: 'Bag', isDefault: true },
        { name: 'Health', type: client_1.TransactionType.EXPENSE, icon: 'Heart', isDefault: true },
        { name: 'Housing', type: client_1.TransactionType.EXPENSE, icon: 'Home', isDefault: true },
    ].map((cat) => prisma.category.upsert({
        where: { id: `default-${cat.name.toLowerCase()}` },
        update: cat,
        create: { id: `default-${cat.name.toLowerCase()}`, ...cat },
    })));
    const catMap = Object.fromEntries(categories.map((c) => [c.name, c.id]));
    await prisma.transaction.deleteMany({ where: { userId: user.id } });
    await prisma.transaction.createMany({
        data: [
            { userId: user.id, name: 'Starbucks', categoryId: catMap.Dining, amount: 12.5, type: client_1.TransactionType.EXPENSE, expenseNature: client_1.ExpenseNature.DESIRE, date: new Date('2024-05-17'), status: client_1.TransactionStatus.COMPLETED },
            { userId: user.id, name: 'Salary Deposit', categoryId: catMap.Income, amount: 5200, type: client_1.TransactionType.INCOME, date: new Date('2024-05-15'), status: client_1.TransactionStatus.COMPLETED },
            { userId: user.id, name: 'Netflix', categoryId: catMap.Subscriptions, amount: 15.99, type: client_1.TransactionType.EXPENSE, expenseNature: client_1.ExpenseNature.DESIRE, date: new Date('2024-05-14'), status: client_1.TransactionStatus.COMPLETED, isRecurring: true, recurringInterval: 'monthly' },
            { userId: user.id, name: 'Whole Foods', categoryId: catMap.Groceries, amount: 86.42, type: client_1.TransactionType.EXPENSE, expenseNature: client_1.ExpenseNature.NEED, date: new Date('2024-05-13'), status: client_1.TransactionStatus.COMPLETED },
            { userId: user.id, name: 'Uber', categoryId: catMap.Transport, amount: 24.8, type: client_1.TransactionType.EXPENSE, expenseNature: client_1.ExpenseNature.NEED, date: new Date('2024-05-12'), status: client_1.TransactionStatus.PENDING },
            { userId: user.id, name: 'Freelance Payment', categoryId: catMap.Income, amount: 1800, type: client_1.TransactionType.INCOME, date: new Date('2024-05-10'), status: client_1.TransactionStatus.COMPLETED },
        ],
    });
    await prisma.budget.deleteMany({ where: { userId: user.id } });
    await prisma.budget.createMany({
        data: [
            { userId: user.id, name: 'Housing', spent: 2100, limit: 2200, icon: 'Home', period: client_1.BudgetPeriod.MONTHLY, month: 5, year: 2024 },
            { userId: user.id, name: 'Food', spent: 680, limit: 800, icon: 'Utensils', period: client_1.BudgetPeriod.MONTHLY, month: 5, year: 2024 },
            { userId: user.id, name: 'Transport', spent: 420, limit: 400, icon: 'Car', period: client_1.BudgetPeriod.MONTHLY, month: 5, year: 2024 },
        ],
    });
    await prisma.goal.deleteMany({ where: { userId: user.id } });
    await prisma.goal.createMany({
        data: [
            { userId: user.id, name: 'New Home Fund', saved: 24000, target: 50000, deadline: new Date('2024-12-31'), icon: 'Home', category: 'Property' },
            { userId: user.id, name: 'Emergency Fund', saved: 15000, target: 15000, icon: 'Shield', category: 'Safety', completed: true },
        ],
    });
    await prisma.notification.deleteMany({ where: { userId: user.id } });
    await prisma.notification.createMany({
        data: [
            { userId: user.id, title: 'Budget Alert', message: 'Transport category is over budget by $20', type: client_1.NotificationType.ALERT },
            { userId: user.id, title: 'Goal Milestone', message: 'New Home Fund reached 48% completion', type: client_1.NotificationType.SUCCESS },
        ],
    });
    await prisma.aiInsight.deleteMany({ where: { userId: user.id } });
    await prisma.aiInsight.createMany({
        data: [
            { userId: user.id, title: 'Subscription Alert', description: 'You have recurring subscriptions costing $47/mo.', type: client_1.InsightType.SUBSCRIPTION },
            { userId: user.id, title: 'Spending Trend', description: 'Dining out is up 24% vs your average.', type: client_1.InsightType.SPENDING },
        ],
    });
    console.log('Seed completed. Demo user: demo@finova.app / Password123!');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map