import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "K Web Solutions — Full-Stack Web Development & Digital Studio",
  description:
    "K Web Solutions crafts high-performance web applications, responsive business websites, and tailored dashboards with React, Node.js, and modern cloud technologies.",
  icons: {
    icon: "/images/logo-128.png",
    apple: "/images/logo-128.png",
  },
  keywords: [
    "K Web Solutions",
    "Full-Stack Web Developer",
    "React Developer",
    "Next.js Developer",
    "Tailwind CSS Specialist",
    "TypeScript Developer",
    "SaaS Application Engineer",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-charcoal-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-electric-500/30 selection:text-white">
        {/* Accessible Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-electric-500 focus:text-charcoal-950 focus:font-bold focus:rounded-lg"
        >
          Skip to main content
        </a>

        {/* Global Navbar */}
        <Navbar />

        {/* Main Application Content */}
        <main id="main-content" className="flex-1">
          {children}
        </main>

        {/* Global Footer */}
        <Footer />
      </body>
    </html>
  );
}
