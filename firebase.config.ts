import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCbF7KS5N4IbmXTHDyaHaqdPhMhSz-qa34',
  authDomain: 'gwm-app-af5ac.firebaseapp.com',
  projectId: 'gwm-app-af5ac',
  storageBucket: 'gwm-app-af5ac.appspot.com',
  messagingSenderId: '638237784165',
  appId: '1:638237784165:android:ffa2d49e29f00c4001ae8c',
  databaseURL: 'https://gwm-app-af5ac.firebaseio.com'
};

// Initialize Firebase only if it hasn't been initialized yet
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Export the initialized app and Firestore instance
export const firebaseApp = app;
export const db = getFirestore(app);

export { firebaseConfig };

