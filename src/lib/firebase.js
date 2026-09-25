import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-WE0Z4E7CLK",
};
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
// Firebase has no native Microsoft provider — use the generic OIDC provider.
export const microsoftProvider = new OAuthProvider("microsoft.com");

// Whitelisted emails that always get Admin status, regardless of Sheets state.
export const ADMIN_EMAILS = ["haarris82@gmail.com", "abdullah527382@gmail.com"];
