import type { Metadata } from "next";
import CompareClient from "./CompareClient";

export const metadata: Metadata = {
  title: "Compare Packages | Vraman Holidays",
  description: "Compare travel packages side by side to find the perfect journey.",
};

export default function ComparePage() {
  return <CompareClient />;
}
