import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "A.R.K.A.N.T.A.",
  description:
    "Automatic Rig Konfigurator & Analytic Node for Tailored Architecture. Sistem rekomendasi rakitan PC yang disesuaikan dengan profil unik setiap pengguna.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
