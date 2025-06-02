import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export the initialized app and Firestore instance
export const app = firebase.app();
export const db = firestore();

export { firebaseConfig };

