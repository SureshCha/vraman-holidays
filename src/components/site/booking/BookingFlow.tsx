"use client";

import { useState } from "react";
import { StepTravellerInfo } from "./StepTravellerInfo";
import { StepPayment } from "./StepPayment";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { format } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";

interface PackageInfo {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  durationDays: number;
  durationNights: number;
  priceFrom: number;
  currency: string;
  destinationName: string;
}

interface DepartureInfo {
  id: string;
  departureDate: string;
  returnDate: string;
  maxSeats: number;
  bookedSeats: number;
  priceOverride?: number;
  currency: string;
}

interface Props {
  package: PackageInfo;
  departure?: DepartureInfo;
}

const STEPS = ["Traveller Info", "Payment"] as const;

export function BookingFlow({ package: pkg, departure }: Props) {
  const [step, setStep] = useState<0 | 1>(0);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const price = departure?.priceOverride ?? pkg.priceFrom;

  return (
    <div className="space-y-6">
      {/* Package summary card */}
      <div className="border rounded-xl overflow-hidden flex gap-4 p-4 bg-muted/20">
        {pkg.coverImage && (
          <div className="relative h-20 w-28 rounded-lg overflow-hidden shrink-0">
            <Image src={pkg.coverImage} alt={pkg.title} fill className="object-cover" sizes="112px" />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="font-semibold text-sm leading-tight">{pkg.title}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{pkg.destinationName}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{pkg.durationDays}D/{pkg.durationNights}N</span>
            {departure && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(departure.departureDate), "dd MMM yyyy")}
              </span>
            )}
          </div>
          <p className="font-bold text-primary text-sm">
            {pkg.currency} {(price / 100).toLocaleString()}
            <span className="text-xs font-normal text-muted-foreground"> / person</span>
          </p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
              i === step ? "bg-primary text-primary-foreground" :
              i < step   ? "bg-green-500 text-white" :
                           "bg-muted text-muted-foreground"
            }`}>
              {i + 1}
            </div>
            <span className={`text-sm ${i === step ? "font-medium" : "text-muted-foreground"}`}>{label}</span>
            {i < STEPS.length - 1 && <div className="h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      {/* Steps */}
      {step === 0 && (
        <StepTravellerInfo
          packageId={pkg.id}
          departureId={departure?.id}
          onComplete={(id, ref, total) => {
            setBookingId(id);
            setBookingRef(ref);
            setTotalAmount(total);
            setStep(1);
          }}
        />
      )}
      {step === 1 && bookingId && (
        <StepPayment
          bookingId={bookingId}
          bookingRef={bookingRef ?? ""}
          totalAmount={totalAmount || price}
          currency={pkg.currency}
          onBack={() => setStep(0)}
        />
      )}
    </div>
  );
}
