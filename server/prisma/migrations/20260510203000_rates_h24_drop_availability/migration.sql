ALTER TABLE "maid_listing" ADD COLUMN "ratesH24" INTEGER;

UPDATE "maid_listing"
SET "ratesH24" = GREATEST(("ratesH2" * 8), ("ratesH1" * 12))
WHERE "ratesH24" IS NULL;

ALTER TABLE "maid_listing" ALTER COLUMN "ratesH24" SET NOT NULL;

ALTER TABLE "maid_listing" DROP COLUMN IF EXISTS "available24Hours";
