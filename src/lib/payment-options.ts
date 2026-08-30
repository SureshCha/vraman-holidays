export const GATEWAY_OPTIONS = [
  { value: "ESEWA",         label: "eSewa" },
  { value: "KHALTI",        label: "Khalti" },
  { value: "IPS",           label: "connectIPS" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CASH",          label: "Cash" },
] as const;

/** For creating a new payment record. */
export const PAYMENT_STATUS_CREATE_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "SUCCESS", label: "Success" },
  { value: "FAILED",  label: "Failed" },
] as const;

/** For editing an existing payment record (includes REFUNDED). */
export const PAYMENT_STATUS_EDIT_OPTIONS = [
  { value: "PENDING",  label: "Pending" },
  { value: "SUCCESS",  label: "Success" },
  { value: "FAILED",   label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
] as const;
