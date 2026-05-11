-- CreateTable
CREATE TABLE "maid_review" (
    "id" TEXT NOT NULL,
    "maidListingId" TEXT NOT NULL,
    "reviewerUserId" TEXT NOT NULL,
    "authorDisplayName" VARCHAR(120) NOT NULL,
    "authorPhotoUri" VARCHAR(2048),
    "rating" INTEGER NOT NULL,
    "comment" VARCHAR(2000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maid_review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "maid_review_maidListingId_reviewerUserId_key" ON "maid_review"("maidListingId", "reviewerUserId");

-- AddForeignKey
ALTER TABLE "maid_review" ADD CONSTRAINT "maid_review_maidListingId_fkey" FOREIGN KEY ("maidListingId") REFERENCES "maid_listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
