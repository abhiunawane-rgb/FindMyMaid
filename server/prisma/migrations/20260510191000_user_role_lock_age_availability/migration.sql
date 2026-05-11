ALTER TABLE "maid_listing"
ADD COLUMN "age" INTEGER NOT NULL DEFAULT 18,
ADD COLUMN "available24Hours" BOOLEAN NOT NULL DEFAULT false;

DROP INDEX IF EXISTS "app_user_phoneNorm_role_key";
CREATE UNIQUE INDEX "app_user_phoneNorm_key" ON "app_user"("phoneNorm");
