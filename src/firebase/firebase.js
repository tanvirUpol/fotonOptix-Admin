import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCFWXshvAZXVmdqqOeHBJHpoKOcJf-ODuc",
  authDomain: "foton-optix.firebaseapp.com",
  projectId: "foton-optix",
  storageBucket: "foton-optix.appspot.com",
  messagingSenderId: "764835041322",
  appId: "1:764835041322:web:34bb42c6846f1825bdf353",
  measurementId: "G-309MB561MR",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
