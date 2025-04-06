import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCeD_QlOYM8ngJ5qRJkhFtbvCsOHR5QF7g",
    authDomain: "hal-qilamiz.firebaseapp.com",
    projectId: "hal-qilamiz",
    storageBucket: "hal-qilamiz.firebasestorage.app",
    messagingSenderId: "972497787993",
    appId: "1:972497787993:web:d861385b5a76de1c03e548",
    measurementId: "G-0VY509SS31"
};

// Initialize Firebase if it hasn't been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const storage = getStorage(app);

// ADD THESE EXPORTS:
export { auth, storage };
