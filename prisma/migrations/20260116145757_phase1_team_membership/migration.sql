-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PARENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- Add column
ALTER TABLE "User" ADD COLUMN "activeTeamId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_userId_teamId_key" ON "TeamMember"("userId", "teamId");
CREATE INDEX "TeamMember_userId_idx" ON "TeamMember"("userId");
CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");
CREATE INDEX "User_activeTeamId_idx" ON "User"("activeTeamId");

-- Backfill
INSERT INTO "TeamMember" ("userId", "teamId", "role", "createdAt")
SELECT "id", "teamId", "role", NOW()
FROM "User"
WHERE "teamId" IS NOT NULL
ON CONFLICT ("userId", "teamId") DO NOTHING;

UPDATE "User"
SET "activeTeamId" = "teamId"
WHERE "teamId" IS NOT NULL
  AND "activeTeamId" IS NULL;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey"
FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "User" ADD CONSTRAINT "User_activeTeamId_fkey"
FOREIGN KEY ("activeTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Drop old columns
ALTER TABLE "User" DROP CONSTRAINT "User_teamId_fkey";
ALTER TABLE "User" DROP COLUMN "teamId";
ALTER TABLE "User" DROP COLUMN "role";
