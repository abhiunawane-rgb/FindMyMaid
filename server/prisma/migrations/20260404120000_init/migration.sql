-- CreateTable
CREATE TABLE "app_user" (
    "id" TEXT NOT NULL,
    "phoneNorm" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maid_listing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "photoUrl" TEXT,
    "ratesM30" INTEGER NOT NULL,
    "ratesH1" INTEGER NOT NULL,
    "ratesH2" INTEGER NOT NULL,
    "servicesJson" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maid_listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_user_phoneNorm_role_key" ON "app_user"("phoneNorm", "role");

-- CreateIndex
CREATE UNIQUE INDEX "maid_listing_userId_key" ON "maid_listing"("userId");

-- AddForeignKey
ALTER TABLE "maid_listing" ADD CONSTRAINT "maid_listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
