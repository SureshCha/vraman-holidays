import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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

  try {
    const settings = await getSettings();
    const { theme } = settings;
    themeStyles = `
      :root {
        --brand-primary: ${theme.primaryColor};
        --brand-secondary: ${theme.secondaryColor};
        --brand-accent: ${theme.accentColor};
        --brand-font: ${theme.fontFamily};
        --brand-radius: ${theme.borderRadius};
        --primary: ${theme.primaryColor};
        --secondary: ${theme.secondaryColor};
        --accent: ${theme.accentColor};
        --radius: ${theme.borderRadius};
      }
    `;
  } catch {
    // Settings not seeded yet — use defaults from globals.css
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {themeStyles && (
          <style
            dangerouslySetInnerHTML={{ __html: themeStyles }}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
