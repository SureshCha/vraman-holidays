-- Footer background media (optional) for SiteSettings
ALTER TABLE "SiteSettings" ADD COLUMN "footer" JSONB NOT NULL DEFAULT '{}';

-- Idempotency for payment webhooks: dedupe (gateway, gatewayTxnId, outcome).
-- Composite so a fail-then-succeed on the same gateway intent can both record.
CREATE UNIQUE INDEX "PaymentTransaction_gateway_gatewayTxnId_status_key" ON "PaymentTransaction"("gateway", "gatewayTxnId", "status");
