import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";

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
        className="h-full antialiased"
      >
        <body className="flex min-h-full flex-col bg-slate-50 text-slate-950">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
