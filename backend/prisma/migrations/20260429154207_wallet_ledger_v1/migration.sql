/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `WalletTransaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_reference_key" ON "WalletTransaction"("reference");
