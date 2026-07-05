import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Let's Plan Your Journey | ${settings.brand.name}`,
    description: "Every unforgettable journey begins with a conversation. Tell us where you wish to go.",
  };
}

export default function ContactPage() {
  return <ContactForm />;
}
