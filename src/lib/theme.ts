"use client";

import { createTheme } from "@mui/material/styles";
// 1. Importar as duas fontes do next/font/google
import { Inter, Poppins } from "next/font/google";

// 2. Carregar a fonte 'Inter' para o corpo do texto
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ['400', '500', '700'], // Pesos para o texto normal
});

// 3. Carregar a fonte 'Poppins' para os títulos
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ['500', '700', '800'], // Pesos mais fortes para os títulos
});

// 4. Criar o tema do MUI
const theme = createTheme({
  typography: {
    // 5. Definir a 'Inter' como a fonte principal para todo o site
    fontFamily: inter.style.fontFamily,

    // 6. Sobrescrever a fonte APENAS para os títulos
    h1: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 800, // Podemos definir pesos específicos
    },
    h2: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 700,
    },
    h3: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 700,
    },
    h4: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 700,
    },
    h5: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 500,
    },
    h6: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 500,
    },
  },
  
  // As suas cores personalizadas permanecem as mesmas
  palette: {
    primary: {
      main: '#e85100',
    },
    secondary: {
      main: '#dc004e',
    },
        
  },
});

export default theme;
