import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyCN65FJM4TD0ONH64uJeTZrPWPIx4m8oUo",
  authDomain: "mecare-db83b.firebaseapp.com",
  projectId: "mecare-db83b",
  storageBucket: "mecare-db83b.firebasestorage.app",
  messagingSenderId: "475320030495",
  appId: "1:475320030495:web:4daf3e6b052ef98528cc2a",
  measurementId: "G-RGTKD67KW5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth=  getAuth(app)

const googlePprovider=new GoogleAuthProvider()
export {auth,googlePprovider,signInWithPopup}