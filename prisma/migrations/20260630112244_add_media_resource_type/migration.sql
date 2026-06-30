-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN     "duration" DOUBLE PRECISION,
ADD COLUMN     "resourceType" TEXT DEFAULT 'image';
