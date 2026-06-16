-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "travelInsurance" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Traveller" ADD COLUMN     "address" TEXT,
ADD COLUMN     "specialRequests" TEXT;

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;
