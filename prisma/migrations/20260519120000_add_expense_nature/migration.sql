-- CreateEnum
CREATE TYPE "ExpenseNature" AS ENUM ('NEED', 'DESIRE');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "expenseNature" "ExpenseNature";
