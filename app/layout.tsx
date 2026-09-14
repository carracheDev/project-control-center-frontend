import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: "Project Control Center",
  description: "Pilotage des projets de validation et de développement logiciel",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr">
      <body>
        <PwaRegister />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
