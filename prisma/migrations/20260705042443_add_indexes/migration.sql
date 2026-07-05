-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "BlogPost_authorId_idx" ON "BlogPost"("authorId");

-- CreateIndex
CREATE INDEX "BlogPost_status_idx" ON "BlogPost"("status");

-- CreateIndex
CREATE INDEX "Booking_packageId_idx" ON "Booking"("packageId");

-- CreateIndex
CREATE INDEX "Booking_departureId_idx" ON "Booking"("departureId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");

-- CreateIndex
CREATE INDEX "ItineraryDay_packageId_idx" ON "ItineraryDay"("packageId");

-- CreateIndex
CREATE INDEX "MediaAsset_uploadedById_idx" ON "MediaAsset"("uploadedById");

-- CreateIndex
CREATE INDEX "Navigation_parentId_idx" ON "Navigation"("parentId");

-- CreateIndex
CREATE INDEX "Navigation_location_idx" ON "Navigation"("location");

-- CreateIndex
CREATE INDEX "Package_destinationId_idx" ON "Package"("destinationId");

-- CreateIndex
CREATE INDEX "Package_status_idx" ON "Package"("status");

-- CreateIndex
CREATE INDEX "PackageDeparture_packageId_idx" ON "PackageDeparture"("packageId");

-- CreateIndex
CREATE INDEX "PageSection_pageId_idx" ON "PageSection"("pageId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_bookingId_idx" ON "PaymentTransaction"("bookingId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Testimonial_packageId_idx" ON "Testimonial"("packageId");

-- CreateIndex
CREATE INDEX "Testimonial_status_idx" ON "Testimonial"("status");

-- CreateIndex
CREATE INDEX "Traveller_bookingId_idx" ON "Traveller"("bookingId");
