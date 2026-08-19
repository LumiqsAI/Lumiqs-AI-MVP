import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://lumiqs-ai-mvp-web.vercel.app"),
  title: "Lumiqs AI — AI-Powered Business Consultant",
  description: "Make smarter business decisions with AI-powered insights, analysis, and strategy.",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    title: "Lumiqs AI — Make smarter business decisions",
    description: "Business context, analysis, strategy, and execution in one decision workspace.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" data-theme="light" suppressHydrationWarning>
        <body className="font-sans antialiased">
          <ThemeProvider>
            {children}
            <Toaster theme="light" position="top-right" richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
