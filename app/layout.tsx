import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Perfil WISC-IV",
  description: "Perfil de Puntuaciones Escalares por Subprueba WISC-IV",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-100">{children}</body>
    </html>
  );
}
