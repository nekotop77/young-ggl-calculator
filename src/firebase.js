import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCRtweCqyb2V4Sdlow9swfUj9eSb87Zli8",
  authDomain: "young-ggl-calculator.firebaseapp.com",
  projectId: "young-ggl-calculator",
  storageBucket: "young-ggl-calculator.appspot.com",
  messagingSenderId: "100632318911",
  appId: "1:100632318911:web:11dc6c9b984748660ec70a",
  measurementId: "G-QYZSHH2XKR"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { analytics }; 