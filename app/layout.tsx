import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Al Fath Kayu - Wood Costing System",
  description: "Multi-Wood-Type Precision Costing System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
