declare module '@react-native-firebase/auth' {
  interface Auth {
    createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;
    signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;
    signInWithCredential(credential: AuthCredential): Promise<UserCredential>;
    GoogleAuthProvider: {
      credential(idToken: string): AuthCredential;
    };
  }

  interface UserCredential {
    user: User;
  }

  interface User {
    uid: string;
    email: string | null;
  }

  interface AuthCredential {
    providerId: string;
    token: string;
  }

  const auth: () => Auth;
  export default auth;
} 