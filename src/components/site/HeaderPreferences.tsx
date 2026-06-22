"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Settings2 } from "lucide-react";
import { useCurrency } from "@/lib/hooks/useCurrency";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function HeaderPreferences() {
  const { currency, setCurrency } = useCurrency();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Preferences"
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none"
      >
        <Settings2 className="h-[1.1rem] w-[1.1rem]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Currency</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={currency} onValueChange={(v) => v && setCurrency(v)}>
          {SUPPORTED_CURRENCIES.map((code) => (
            <DropdownMenuRadioItem key={code} value={code}>
              {code}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={mounted ? theme ?? "system" : "system"}
          onValueChange={(v) => v && setTheme(v)}
        >
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
