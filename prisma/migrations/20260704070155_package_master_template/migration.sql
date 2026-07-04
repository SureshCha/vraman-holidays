-- AlterTable
ALTER TABLE "ItineraryDay" ADD COLUMN     "alert" TEXT,
ADD COLUMN     "images" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "summaryStrip" TEXT;

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "departureCity" TEXT,
ADD COLUMN     "minGroupSize" INTEGER,
ADD COLUMN     "priceBasis" TEXT,
ADD COLUMN     "terms" TEXT,
ADD COLUMN     "validUntil" TIMESTAMP(3);
