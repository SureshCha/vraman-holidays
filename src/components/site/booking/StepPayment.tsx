"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Props {
  bookingId: string;
  bookingRef: string;
  totalAmount: number;
  currency: string;
  onBack: () => void;
}

// We fetch feature flags on client via a light API call
async function fetchFeatureFlags() {
  const res = await fetch("/api/settings/flags");
  if (!res.ok) return null;
  return res.json() as Promise<{
    enableEsewa: boolean;
    enableKhalti: boolean;
    enableStripe: boolean;
    enableBankTransfer: boolean;
    bankInstructions: string;
  }>;
}

export function StepPayment({ bookingId, bookingRef, totalAmount, currency, onBack }: Props) {
  const [flags, setFlags] = useState<Awaited<ReturnType<typeof fetchFeatureFlags>>>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [bankTransferSubmitted, setBankTransferSubmitted] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [amount, setAmount] = useState(totalAmount);
  const [promoError, setPromoError] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);

  useEffect(() => {
    fetchFeatureFlags().then(setFlags);
  }, []);

  const discounted = amount < totalAmount;
  const price = `${currency} ${(amount / 100).toLocaleString()}`;

  async function handleApplyPromo() {
    setPromoError("");
    if (!promoCode.trim() || applyingPromo) return;
    setApplyingPromo(true);
    try {
      // The server applies the discount to the booking and reserves a use,
      // then returns the authoritative new total — this is what gets charged.
      const res = await fetch("/api/promo-codes/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, code: promoCode }),
      });
      const data = await res.json() as { code?: string; totalAmount?: number; error?: string };
      if (!res.ok || data.totalAmount == null) {
        setPromoError(data.error ?? "Invalid code");
        return;
      }
      setAmount(data.totalAmount);
      setAppliedCode(data.code ?? promoCode.trim().toUpperCase());
      toast.success(`Promo "${data.code}" applied!`);
    } catch {
      setPromoError("Failed to apply code");
    } finally {
      setApplyingPromo(false);
    }
  }

  async function handleEsewa() {
    setLoading("esewa");
    try {
      const res = await fetch("/api/payments/esewa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json() as { formData?: Record<string, string>; formAction?: string };
      if (!data.formData || !data.formAction) { toast.error("eSewa error"); return; }

      // Submit a hidden form to eSewa
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.formAction;
      Object.entries(data.formData).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = v;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch {
      toast.error("Failed to initiate eSewa payment");
      setLoading(null);
    }
  }

  async function handleKhalti() {
    setLoading("khalti");
    try {
      const res = await fetch("/api/payments/khalti/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json() as { redirectUrl?: string };
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast.error("Khalti error");
        setLoading(null);
      }
    } catch {
      toast.error("Failed to initiate Khalti payment");
      setLoading(null);
    }
  }

  async function handleBankTransfer() {
    setLoading("bank");
    try {
      const res = await fetch("/api/payments/bank-transfer/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        toast.error(data.error ?? "Failed to initiate bank transfer");
        return;
      }
      setBankTransferSubmitted(true);
    } catch {
      toast.error("Failed to initiate bank transfer");
    } finally {
      setLoading(null);
    }
  }

  if (bankTransferSubmitted) {
    return (
      <div className="space-y-6">
        <div className="border rounded-xl p-4 bg-muted/20 flex justify-between items-center">
          <div>
            <p className="text-xs text-muted-foreground">Booking Reference</p>
            <p className="font-mono font-bold">{bookingRef}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-bold text-primary text-lg">{price}</p>
          </div>
        </div>
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-6 text-center space-y-3">
          <h3 className="font-semibold text-lg">Your booking is pending</h3>
          <p className="text-sm text-muted-foreground">
            Please complete the bank transfer and email your receipt with booking ref{" "}
            <span className="font-mono font-bold">{bookingRef}</span>. We&apos;ll confirm once payment is verified.
          </p>
          {flags?.bankInstructions && (
            <div className="rounded-lg border p-3 text-xs text-muted-foreground bg-muted/20 whitespace-pre-line text-left mt-4">
              {flags.bankInstructions}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-xl p-4 bg-muted/20 flex justify-between items-center">
        <div>
          <p className="text-xs text-muted-foreground">Booking Reference</p>
          <p className="font-mono font-bold">{bookingRef}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-bold text-primary text-lg">{price}</p>
          {discounted && <p className="text-xs text-green-600">Promo applied</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Promo code</label>
        {appliedCode ? (
          <p className="text-sm text-green-600">
            Code <span className="font-mono font-semibold">{appliedCode}</span> applied.
          </p>
        ) : (
          <div className="flex gap-2">
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter code"
              className="uppercase"
              disabled={applyingPromo || !!loading}
            />
            <Button type="button" variant="outline" onClick={handleApplyPromo} disabled={applyingPromo || !!loading}>
              {applyingPromo ? "Applying…" : "Apply"}
            </Button>
          </div>
        )}
        {promoError && <p className="text-xs text-destructive">{promoError}</p>}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Select Payment Method</h3>

        {!flags && <p className="text-sm text-muted-foreground">Loading payment options…</p>}

        {flags?.enableEsewa && (
          <Button
            className="w-full justify-start gap-3 h-14 text-base"
            variant="outline"
            onClick={handleEsewa}
            disabled={!!loading}
          >
            <span className="h-8 w-8 rounded bg-green-600 text-white text-xs font-bold flex items-center justify-center shrink-0">e</span>
            <div className="text-left">
              <p className="font-medium">eSewa</p>
              <p className="text-xs text-muted-foreground">Nepal&apos;s most popular digital wallet</p>
            </div>
            {loading === "esewa" && <span className="ml-auto text-xs">Redirecting…</span>}
          </Button>
        )}

        {flags?.enableKhalti && (
          <Button
            className="w-full justify-start gap-3 h-14 text-base"
            variant="outline"
            onClick={handleKhalti}
            disabled={!!loading}
          >
            <span className="h-8 w-8 rounded bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">K</span>
            <div className="text-left">
              <p className="font-medium">Khalti</p>
              <p className="text-xs text-muted-foreground">Pay with Khalti digital wallet</p>
            </div>
            {loading === "khalti" && <span className="ml-auto text-xs">Redirecting…</span>}
          </Button>
        )}

        {flags?.enableBankTransfer && (
          <>
            <Separator />
            <Button
              className="w-full justify-start gap-3 h-14 text-base"
              variant="outline"
              onClick={handleBankTransfer}
              disabled={!!loading}
            >
              <span className="h-8 w-8 rounded bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">🏦</span>
              <div className="text-left">
                <p className="font-medium">Bank Transfer</p>
                <p className="text-xs text-muted-foreground">Direct bank deposit</p>
              </div>
            </Button>
            {flags.bankInstructions && (
              <div className="rounded-lg border p-3 text-xs text-muted-foreground bg-muted/20 whitespace-pre-line">
                {flags.bankInstructions}
              </div>
            )}
          </>
        )}
      </div>

      <Button variant="ghost" size="sm" onClick={onBack} disabled={!!loading} className="w-full">
        ← Back to traveller details
      </Button>
    </div>
  );
}
