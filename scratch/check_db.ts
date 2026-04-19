
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCi-...", // I'll need to read the real config from the web project
    authDomain: "socialtrade-89547.firebaseapp.com",
    projectId: "socialtrade-89547",
    storageBucket: "socialtrade-89547.appspot.com",
    messagingSenderId: "305193910355",
    appId: "1:305193910355:web:78523c92330a6c085b3760"
};

// I should actually find the real config in the project.
