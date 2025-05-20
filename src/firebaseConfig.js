// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDigE6zdu31v5xe4hTamK2Ot0_iRIfItS4",
  authDomain: "echovault-b5bc3.firebaseapp.com",
  projectId: "echovault-b5bc3",
  storageBucket: "echovault-b5bc3.appspot.com",
  messagingSenderId: "454263474915",
  appId: "1:454263474915:web:c83f30accdf4b20c9213d6",
  measurementId: "G-2ZC9F8JLC7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
