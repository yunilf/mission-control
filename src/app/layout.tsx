import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { Bell, Search } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "yunAi.agent - Mission Control",
  description: "Mission Control para tu agencia de IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <Navigation />
        <div className="md:pl-64 flex flex-col min-h-screen pb-16 md:pb-0">
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40 flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-4 w-full md:w-96">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full bg-secondary/50 border border-border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-secondary transition-colors"
                />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sistemas Operativos
              </div>
              <button className="relative p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive border border-background"></span>
              </button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
