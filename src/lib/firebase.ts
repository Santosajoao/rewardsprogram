// Caminho: lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
// Você também pode importar outros serviços aqui (Auth, Storage, etc.)

// Seu objeto de configuração lendo as variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializa o Firebase (padrão "Singleton" para Next.js)
// Isso evita que o app seja inicializado múltiplas vezes no hot-reload (desenvolvimento)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exporta as instâncias dos serviços que você precisa
const db = initializeFirestore(app, {
  // Isso ativa o cache local (IndexedDB)
  localCache: persistentLocalCache({
    // Isso permite que o cache funcione corretamente mesmo com múltiplas abas abertas
    tabManager: persistentMultipleTabManager()
  })
});
export { app, db };
