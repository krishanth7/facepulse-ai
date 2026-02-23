import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/dashboard/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FacePulse AI | Real-Time Emotion Intelligence",
  description: "Next-gen AI SaaS for real-time facial emotion analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased overflow-x-hidden`}>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-screen p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
