
"use client";

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { firebaseConfig } from "./config";

export function initializeFirebase() {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);

  return { app, db, auth, storage };
}

export * from "./provider";
export * from "./auth/use-user";
export * from "./firestore/use-collection";
export * from "./firestore/use-doc";
