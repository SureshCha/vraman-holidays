import { Suspense } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { CompareBar } from "@/components/site/CompareBar";
import { ChatBot } from "@/components/site/ChatBot";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense>
        <SiteHeader />
      </Suspense>
      <div className="flex-1">
        <Suspense>{children}</Suspense>
      </div>
      <Suspense>
        <SiteFooter />
      </Suspense>
      <Suspense>
        <WhatsAppButton />
      </Suspense>
      <CompareBar />
      <ChatBot />
    </div>
  );
}
