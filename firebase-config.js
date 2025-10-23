// Firebase Configuration
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "quickkeys-typing.firebaseapp.com",
  projectId: "quickkeys-typing",
  storageBucket: "quickkeys-typing.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

module.exports = {
  db,
  auth,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit
};