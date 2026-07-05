import type { Metadata } from "next";
import WishlistClient from "./WishlistClient";

export const metadata: Metadata = {
  title: "My Wishlist | Vraman Holidays",
  description: "Your saved travel packages — compare and book when you're ready.",
};

export default function WishlistPage() {
  return <WishlistClient />;
}
