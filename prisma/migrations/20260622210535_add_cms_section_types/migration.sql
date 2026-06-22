-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SectionType" ADD VALUE 'PAGE_HEADER';
ALTER TYPE "SectionType" ADD VALUE 'FEATURE_GRID';
ALTER TYPE "SectionType" ADD VALUE 'CHECKLIST';
ALTER TYPE "SectionType" ADD VALUE 'CREDENTIALS';
