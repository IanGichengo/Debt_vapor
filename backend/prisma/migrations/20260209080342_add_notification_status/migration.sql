-- CreateTable
CREATE TABLE "notification_statuses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_statuses_userId_idx" ON "notification_statuses"("userId");

-- CreateIndex
CREATE INDEX "notification_statuses_notificationId_idx" ON "notification_statuses"("notificationId");

-- CreateIndex
CREATE INDEX "notification_statuses_deleted_updatedAt_idx" ON "notification_statuses"("deleted", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_statuses_userId_notificationId_key" ON "notification_statuses"("userId", "notificationId");

-- AddForeignKey
ALTER TABLE "notification_statuses" ADD CONSTRAINT "notification_statuses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
