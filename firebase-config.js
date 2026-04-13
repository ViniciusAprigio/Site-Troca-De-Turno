import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0Q_xn9oCo5s26UoAZgvmPdtSZcmCb6H4",
  authDomain: "troca-de-turno-9e5ba.firebaseapp.com",
  projectId: "troca-de-turno-9e5ba",
  storageBucket: "troca-de-turno-9e5ba.firebasestorage.app",
  messagingSenderId: "861169637221",
  appId: "1:861169637221:web:6b88c280d5ec19a51ff38c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
};