const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
const initializeAdmin = () => {
  if (admin.apps.length === 0) {
    // Check if using a service account or environment variables
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Using a service account key file
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } else {
      // Using environment variables for configuration
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }
    
    console.log('Firebase Admin SDK initialized');
  }
  
  return admin;
};

// Get Firebase Admin instance
const getAdmin = () => {
  if (admin.apps.length === 0) {
    return initializeAdmin();
  }
  return admin;
};

// Get Firebase Auth instance
const getAuth = () => {
  return getAdmin().auth();
};

// Get Firebase Storage instance
const getStorage = () => {
  return getAdmin().storage();
};

module.exports = {
  initializeAdmin,
  getAdmin,
  getAuth,
  getStorage,
};