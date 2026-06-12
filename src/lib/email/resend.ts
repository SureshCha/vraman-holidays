import "server-only";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

// Resend throws if no API key — create instance only when key is available
export const resend = apiKey ? new Resend(apiKey) : null;
