import { db } from "@/lib/db";
import { cacheTag } from "next/cache";
import { PromoPopupClient } from "./PromoPopupClient";

async function getActivePopups() {
  "use cache";
  cacheTag("promo-popups");

  const now = new Date();
  return db.promoPopup.findMany({
    where: {
      visible: true,
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } },
      ],
    },
    orderBy: { order: "asc" },
    select: { id: true, imageUrl: true, linkUrl: true, alt: true, title: true },
  });
}

export async function PromoPopup() {
  const popups = await getActivePopups();
  if (popups.length === 0) return null;
  return <PromoPopupClient slides={popups} />;
}
