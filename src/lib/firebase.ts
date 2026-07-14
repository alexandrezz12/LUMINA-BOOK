import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";

const firebaseConfig = {
  projectId: "exalted-capsule-zs7sz",
  appId: "1:746453554979:web:3e385c92277dccc4bb5e96",
  apiKey: "AIzaSyCjgpp643XOCK19OwCDXN6pbDCUHdpgdLQ",
  authDomain: "exalted-capsule-zs7sz.firebaseapp.com",
  storageBucket: "exalted-capsule-zs7sz.firebasestorage.app",
  messagingSenderId: "746453554979"
};

// Initialize app only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific databaseId or fallback
const dbId = (import.meta as any).env.VITE_FIRESTORE_DATABASE_ID !== undefined
  ? (import.meta as any).env.VITE_FIRESTORE_DATABASE_ID
  : "ai-studio-ff9d1e97-7ecc-4cb1-b141-38aa1a452884";

const db = dbId === "(default)" || dbId === "" ? getFirestore(app) : getFirestore(app, dbId);

const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firebase connected successfully");
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.warn("Firebase client appears to be offline. Verify your internet/rules.");
    }
  }
}
testConnection();

export { app, db, auth };
