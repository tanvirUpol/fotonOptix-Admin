import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCu5KhtC-Aje_ipHSrbnvjAxe3DeyFidrc",
    authDomain: "opsapps-images.firebaseapp.com",
    projectId: "opsapps-images",
    storageBucket: "opsapps-images.appspot.com",
    messagingSenderId: "1032121091911",
    appId: "1:1032121091911:web:5ede42cf59c7976c996e62"
  };
  

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };




