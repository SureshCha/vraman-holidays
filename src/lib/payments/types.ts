export interface InitiateParams {
  bookingId: string;
  amount: number; // minor units
  currency: string;
  returnUrl: string;
  failureUrl: string;
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
}

export interface PaymentGatewayAdapter {
  initiate(params: InitiateParams): Promise<InitiateResult>;
  verify(params: VerifyParams): Promise<VerifyResult>;
}
