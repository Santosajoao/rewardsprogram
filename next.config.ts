import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   reactStrictMode: true,
};

// Importa o wrapper do PWA
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public", // Onde os arquivos do Service Worker serão gerados (dentro da pasta public)
  register: true, // Registra automaticamente o Service Worker
  skipWaiting: true, // Força o novo Service Worker a ativar imediatamente
  disable: process.env.NODE_ENV === "development", // Desativa o PWA em modo de desenvolvimento (para evitar dores de cabeça com cache)
});
module.exports = withPWA(nextConfig);
export default nextConfig;
