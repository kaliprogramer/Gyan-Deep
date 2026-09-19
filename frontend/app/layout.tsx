import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Gyan-Deep",
  description: "Gyan-Deep Learning Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased `}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans">
        <ThemeProvider>
        {children}
        </ThemeProvider>
      </body>
    </html>
  );
}