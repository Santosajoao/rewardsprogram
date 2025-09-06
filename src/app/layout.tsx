import "./globals.css";
import AppBar from "@/components/AppBar";
import React from "react";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body cz-shortcut-listen="true">
        <AppBar />
        {children}
      </body>
    </html>
  );
}
