import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

//firebase config
const firebaseConfig = {
    apiKey: "AIzaSyA9r3Hs1w5wZs0-vlrKLCu_N_xBGk3Bu_0",
    authDomain: "kalla-dfabf.firebaseapp.com",
    projectId: "kalla-dfabf",
    storageBucket: "kalla-dfabf.appspot.com",
    messagingSenderId: "994854803087",
    appId: "1:994854803087:web:c93b7634e784e1b2db82fa",
    measurementId: "G-JS6E18QLRR",
    databaseURL: "https://kalla-dfabf-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export default firebase;