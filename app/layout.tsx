import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { HotToaster } from "@/components/providers/HotToaster";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArqTech — Gestão de projetos para escritórios de arquitetura",
  description:
    "Plataforma B2B para unificar projetos, cliente e equipe em um só lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${manrope.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-surface text-on-surface">
        <QueryProvider>
          {children}
          <HotToaster />
        </QueryProvider>
      </body>
    </html>
  );
}
