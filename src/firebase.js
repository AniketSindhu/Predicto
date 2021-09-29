import firebase from "firebase/app";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXTUUFwJOCsqzABC03QIC5-TLXK64zYLQ",
  authDomain: "predicto-3b78d.firebaseapp.com",
  projectId: "predicto-3b78d",
  storageBucket: "predicto-3b78d.appspot.com",
  messagingSenderId: "419239596647",
  appId: "1:419239596647:web:051b43c6240860c397fac2",
};

firebase.initializeApp(firebaseConfig);

export default firebase.firestore();
