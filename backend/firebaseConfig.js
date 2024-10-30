import {initializeApp,getApps,getApp} from 'firebase/app'
import { initializeAuth, getReactNativePersistence,getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getFirestore} from 'firebase/firestore'
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
const firebaseConfig = { 
    apiKey: "AIzaSyBqc-nV9tcvNULDOOKmm1Jd4QpfE1Im_Y4",
    authDomain: "gluco-meter.firebaseapp.com",
    databaseURL: "https://gluco-meter-default-rtdb.firebaseio.com/",
    projectId: "gluco-meter",
    storageBucket: "gluco-meter.appspot.com",
    messagingSenderId: "33149749723",
    appId: "1:33149749723:web:ed734516c937fbbb013ffe",
    measurementId: "G-MXN64LQHMP"
  };
  let FIREBASE_APP, FIREBASE_AUTH;

if (!getApps().length) {
  try {
    FIREBASE_APP = initializeApp(firebaseConfig);
    FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    console.log("Error initializing app: " + error);
  }
} else {
  FIREBASE_APP = getApp();
  FIREBASE_AUTH = getAuth(FIREBASE_APP);
}

export {FIREBASE_APP,FIREBASE_AUTH}
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
 export const REALTIME_DB = getDatabase(FIREBASE_APP);
  export const FIRESTORE_DB = getFirestore(FIREBASE_APP);


