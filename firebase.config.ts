import firebase from '@react-native-firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyCbF7KS5N4IbmXTHDyaHaqdPhMhSz-qa34',
  authDomain: 'gwm-app-af5ac.firebaseapp.com',
  projectId: 'gwm-app-af5ac',
  storageBucket: 'gwm-app-af5ac.appspot.com',
  messagingSenderId: '638237784165',
  appId: '1:638237784165:android:ffa2d49e29f00c4001ae8c', // <-- You must get this from your Firebase project settings
  databaseURL: 'https://gwm-app-af5ac.firebaseio.com',
  // Add other config options as needed
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

export { app, firebaseConfig };

