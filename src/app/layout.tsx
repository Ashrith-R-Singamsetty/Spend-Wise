import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpendWise — Personal Expense Tracker",
  description:
    "Track spending, manage budgets, and build better financial habits with SpendWise — your premium personal finance companion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-bg-primary text-text-primary font-sans antialiased">
        <ConvexClientProvider>
          <Sidebar />
          <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
            <div className="max-w-2xl mx-auto px-4 md:px-8 py-2 md:py-4">
              {children}
            </div>
          </main>
          <BottomNav />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
