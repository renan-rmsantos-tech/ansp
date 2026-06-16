import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANSP — Arca Nossa Senhora da Providência",
  description: "Sistema de solicitação de bolsa para família necessitada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
