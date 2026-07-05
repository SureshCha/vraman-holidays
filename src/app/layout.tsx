import type { Metadata } from "next";
import { Geist, Geist_Mono, Mulish, Fraunces, Changa_One } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { SiteAnalytics } from "@/components/site/Analytics";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LenisProvider } from "@/components/LenisProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Brand sans (Mulish) — a free, close stand-in for Avenir Next, used for
// headings and body. Replace with licensed Avenir Next via next/font/local later.
const mulish = Mulish({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Logo wordmark only — Fraunces is a warm, characterful display serif that gives
// the "Vraman Holidays" lettering a premium, branded feel. Scoped to the logo
// (via --font-logo) so it never touches site headings/body.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Display headings only (H1/H2) — Changa One is a free OFL heavy display face.
// Single weight (Regular); see globals.css `font-synthesis: none` on h1/h2.
const changaOne = Changa_One({
  variable: "--font-changa",
  subsets: ["latin"],
  weight: ["400"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSettings();
    return {
      title: {
        template: settings.seoDefaults.titleTemplate || `%s | ${settings.brand.name}`,
        default: settings.brand.name,
      },
      description: settings.seoDefaults.defaultDescription,
      icons: settings.brand.faviconUrl
        ? { icon: settings.brand.faviconUrl }
        : undefined,
    };
  } catch {
    return {
      title: "Vraman Holidays",
      description: "Boutique travel agency in Thamel, Kathmandu",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let themeStyles = "";

  // Reject CSS values that contain characters which could enable CSS injection
  function safeCss(value: string): string {
    return /[;{}()"'`\\]|javascript:/i.test(value) ? "" : value;
  }

  try {
    const settings = await getSettings();
    const { theme } = settings;
    themeStyles = `
      :root {
        --brand-primary: ${safeCss(theme.primaryColor)};
        --brand-secondary: ${safeCss(theme.secondaryColor)};
        --brand-accent: ${safeCss(theme.accentColor)};
        --brand-font: ${safeCss(theme.fontFamily)};
        --brand-radius: ${safeCss(theme.borderRadius)};
        --primary: ${safeCss(theme.primaryColor)};
        --primary-foreground: oklch(0.985 0 0);
        --secondary: ${safeCss(theme.secondaryColor)};
        --accent: ${safeCss(theme.accentColor)};
        --radius: ${safeCss(theme.borderRadius)};
      }
      /* Keep the brand's primary (CTAs), secondary (e.g. the hero/CTA "Propose"
         buttons) and accent (eyebrows/details) identity in dark mode — otherwise
         the dark-grey default --secondary makes those buttons near-invisible.
         Neutral surfaces stay on the dark scale. */
      .dark {
        --primary: ${safeCss(theme.primaryColor)};
        --primary-foreground: oklch(0.985 0 0);
        --secondary: ${safeCss(theme.secondaryColor)};
        --secondary-foreground: oklch(0.205 0 0);
        --accent: ${safeCss(theme.accentColor)};
        --accent-foreground: oklch(0.205 0 0);
        --radius: ${safeCss(theme.borderRadius)};
      }
    `;
  } catch {
    // Settings not seeded yet — use defaults from globals.css
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${mulish.variable} ${fraunces.variable} ${changaOne.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {themeStyles && (
          <style
            dangerouslySetInnerHTML={{ __html: themeStyles }}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col overflow-x-clip">
        <ThemeProvider>
          <LenisProvider>
            {children}
          </LenisProvider>
        </ThemeProvider>
        <SiteAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      </body>
    </html>
  );
}
