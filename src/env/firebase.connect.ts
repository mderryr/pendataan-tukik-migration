// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {requireEnvVar,requireInProduction} from '@/utils/env-reading.utils'
// var admin = require("firebase-admin");
// var serviceAccount = require("path/to/serviceAccountKey.json");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const isProduction = false
const firebaseConfig = {
  apiKey: requireEnvVar("APIKEY"),
  authDomain: requireEnvVar("AUTHDOMAIN"),
  projectId: requireEnvVar("PROJECTID"),
  storageBucket: requireEnvVar("STORAGEBUCKER"),
  messagingSenderId: requireEnvVar("MESSAGINGSENDERID"),
  appId: requireEnvVar("APPID"),
  measurementId: isProduction 
    ? requireEnvVar("MEASUREMENTID")
    : requireEnvVar("MEASUREMENTID", true),
};

// console.log(firebaseConfig)

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);


// export const server = admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });