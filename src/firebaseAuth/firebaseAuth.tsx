import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAhtILOlyaTHB1jzQGPtBuE50J6nj1qgC0",
  authDomain: "infrasafe-8b834.firebaseapp.com",
  projectId: "infrasafe-8b834",
  messagingSenderId: "793190604982",
  appId: "1:793190604982:web:c33a7ce655d48e8dad8617",
  measurementId: "G-6ZNNKQBKCV",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
