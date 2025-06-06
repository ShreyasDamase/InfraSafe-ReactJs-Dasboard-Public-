import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "<YOUR_FIREBASE_API_KEY>",
  authDomain: "<YOUR_FIREBASE_AUTH_DOMAIN>",
  projectId: "<YOUR_FIREBASE_PROJECT_ID>",
  messagingSenderId: "<YOUR_FIREBASE_MESSAGING_SENDER_ID>",
  appId: "<YOUR_FIREBASE_APP_ID>",
  measurementId: "<YOUR_FIREBASE_MEASUREMENT_ID>",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
