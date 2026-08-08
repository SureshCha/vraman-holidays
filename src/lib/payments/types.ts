export interface InitiateParams {
  bookingId: string;
  /** Short human-facing reference (e.g. booking.bookingRef); used by gateways with length-limited reference fields. */
  bookingRef?: string;
  amount: number; // minor units
  currency: string;
  /** Not all gateways accept a per-request return URL (e.g. IPS uses a static pre-registered pair). */
  returnUrl?: string;
  failureUrl?: string;
}

export interface InitiateResult {
  /** For redirect-based gateways (eSewa, Khalti) */
  redirectUrl?: string;
  /** For Stripe Payment Intent */
  clientSecret?: string;
  /** For eSewa form-POST method */
  formData?: Record<string, string>;
  formAction?: string;
}

export interface VerifyParams {
  bookingId: string;
  gatewayRef: string;
  rawQuery?: Record<string, string>;
}

export interface VerifyResult {
  success: boolean;
  gatewayTxnId: string;
  amount: number;
  rawResponse: unknown;
  /** Set by adapters (e.g. IPS) whose callback doesn't otherwise carry the booking id. */
  bookingId?: string;
}

export interface PaymentGatewayAdapter {
  initiate(params: InitiateParams): Promise<InitiateResult>;
  verify(params: VerifyParams): Promise<VerifyResult>;
}
