import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";
import ProposeForm from "./ProposeForm";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Propose Your Trip | ${settings.brand.name}`,
    description: "Tell us your dream destination and we'll craft a personalised itinerary just for you.",
  };
}

export default function ProposePage() {
  return <ProposeForm />;
}
