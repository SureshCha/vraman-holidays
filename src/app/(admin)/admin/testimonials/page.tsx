import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { TestimonialsClient } from "./TestimonialsClient";

export default async function TestimonialsPage() {
  await connection();
  const session = await auth();
  if (!session) notFound();
  const testimonials = await db.testimonial.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Testimonials</h1>
        <p className="text-muted-foreground text-sm">Approve or hide customer reviews.</p>
      </div>
      <TestimonialsClient testimonials={testimonials.map((t) => ({ ...t, imageUrl: t.imageUrl ?? "", location: t.location ?? "", packageId: t.packageId ?? "", createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() }))} />
    </div>
  );
}
