import "./globals.css";
import AppBar from "@/components/AppBar";
import React from "react";
import ThemeRegistry from "../components/ThemeRegistry"; // Importe o registro
import type { Metadata } from "next";

// Adicione isso:
export const metadata: Metadata = {
  title: "Meu App de Pontos", // Título padrão
  description: "App de fidelidade",
  manifest: "/manifest.json", // <-- AQUI CONECTA O MANIFESTO
  icons: {
    apple: "/apple-touch-icon.png", // <-- AQUI CONECTA O ÍCONE DO IOS
  },
  themeColor: "#ffffff", // Garante que a barra de status do navegador combine
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body cz-shortcut-listen="true">
        <ThemeRegistry>
          <AppBar />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
