import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumiqs AI — AI-Powered Business Consultant",
  description: "Make smarter business decisions with AI-powered insights, analysis, and strategy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="font-sans bg-slate-950 text-white antialiased">
          {children}
          <Toaster theme="dark" position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
