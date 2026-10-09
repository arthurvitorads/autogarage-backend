
import "dotenv/config";
import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (getApps().length === 0) {
  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);

    initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    initializeApp();
  }
}

export const firebaseAuth = getAuth();