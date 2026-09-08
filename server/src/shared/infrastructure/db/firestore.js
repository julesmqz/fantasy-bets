import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue as AdminFieldValue } from 'firebase-admin/firestore';
import { InMemoryFirestore, InMemoryFieldValue } from './inMemoryFirestore.js';

let db;
let FieldValue;

const hasEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
const isCloud = !!(process.env.K_SERVICE || process.env.FUNCTION_TARGET || process.env.FIREBASE_CONFIG);
const hasCredentials = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
const isProduction = process.env.NODE_ENV === 'production';
const forceInMemory = process.env.USE_IN_MEMORY_FIRESTORE === 'true';
const forceReal = process.env.USE_IN_MEMORY_FIRESTORE === 'false';

const shouldUseRealFirestore =
  forceReal || (!forceInMemory && (hasEmulator || isCloud || hasCredentials || isProduction));

if (shouldUseRealFirestore) {
  const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'fantasy-bets-mvp';

  if (!getApps().length) {
    initializeApp({
      projectId
    });
  }

  db = getFirestore();
  FieldValue = AdminFieldValue;
} else {
  db = new InMemoryFirestore();
  FieldValue = InMemoryFieldValue;
}

export { db, FieldValue };
