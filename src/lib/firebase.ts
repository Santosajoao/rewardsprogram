// Caminho: lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
// NOVO: Importar o getAuth
import { getAuth } from "firebase/auth";

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
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializa e exporta a base de dados
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Inicializa o Storage
const storage = getStorage(app);

// NOVO: Inicializa a Autenticação
const auth = getAuth(app);

// Adiciona 'auth' à exportação
export { app, db, storage, auth };
