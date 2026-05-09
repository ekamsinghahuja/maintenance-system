import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Maintenance Fee Manager",
  description: "Collect society maintenance fees with resident sign-in and flat mapping.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={cn("h-full antialiased", "font-sans", geist.variable)}
      >
        <body className="flex min-h-full flex-col bg-slate-50 text-slate-950">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
