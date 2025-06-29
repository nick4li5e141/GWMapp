// Import necessary modules and hooks
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { ReactElement, useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SessionData {
  email: string;
  name: string;
  isAuthenticated: boolean;
}

// Define styles with explicit types for better TypeScript support
interface Styles {
  container: { flex: number; alignItems: 'center'; justifyContent: 'center'; padding: number };
  logo: { width: number; height: number; marginBottom: number };
  name: { fontSize: number; fontWeight: 'bold'; marginTop: number };
  title: { fontSize: number; marginBottom: number; color: string };
  welcomeMessage: { fontSize: number; marginVertical: number; textAlign: 'center' };
  contactInfo: { fontSize: number; marginVertical: number; color: string };
  buttonContainer: { marginTop: number };
  button: {
    backgroundColor: string;
    padding: number;
    borderRadius: number;
    marginVertical: number;
    alignItems: 'center';
  };
  buttonText: { color: string; fontSize: number; fontWeight: 'bold' };
  signOutButton: {
    backgroundColor: string;
    padding: number;
    borderRadius: number;
    marginVertical: number;
    alignItems: 'center';
    position: 'absolute';
    top: number;
    right: number;
    boxShadow: string;
  };
}

// Define the stylesheet for the component
const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1, // Takes up the full height
    alignItems: 'center', // Centers content horizontally
    justifyContent: 'center', // Centers content vertically
    padding: 20, // Adds padding around the content
    backgroundColor:  '#ffffff',
  },
  
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20, // Space below the logo
  },

  name:{
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#111111',
  },

  title: {
    fontSize: 18,
    marginBottom: 20,
    color: '#222222', // Dark grey text
  },
  welcomeMessage: {
    fontSize: 18,
    marginVertical: 20,
    textAlign: 'center',
  },
  contactInfo: {
    fontSize: 18,
    marginVertical: 20,
    color: '#333333',
    textAlign: 'center',
    
  },
  buttonContainer: {
    marginTop: 30, // Space above the group of buttons
  },
  button: {
    backgroundColor: '#007BFF', // Blue background
    padding: 10,
    borderRadius: 5,
    marginVertical: 5, // Space between buttons
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    right: 20,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
});

// Define the functional component
export default function Homepage(): ReactElement {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Employee Name');
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionData = await AsyncStorage.getItem('userSession');
        if (!sessionData) {
          router.replace('/');
          return;
        }
        const session: SessionData = JSON.parse(sessionData);
        if (!session.isAuthenticated) {
          router.replace('/');
          return;
        }
        setUserName(session.name);
      } catch (error) {
        console.error('Error checking auth:', error);
        router.replace('/');
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      console.log('Starting sign out process...');
      
      // Clear ALL storage data to ensure complete sign out
      await AsyncStorage.clear();
      console.log('All storage cleared');
      
      // Verify session is cleared
      const sessionData = await AsyncStorage.getItem('userSession');
      if (sessionData) {
        console.error('Session still exists after clear!');
        // Force clear again
        await AsyncStorage.clear();
      }
      
      // Force a small delay to ensure AsyncStorage operations are complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Navigating to sign in page...');
      // Navigate to the root signin page
      router.replace('/');
      
    } catch (error) {
      console.error('Error during sign out:', error);
      Alert.alert(
        'Sign Out Error',
        'Failed to sign out properly. Please try again.',
        [
          {
            text: 'OK',
            onPress: async () => {
              try {
                await AsyncStorage.clear();
                router.replace('/');
              } catch (e) {
                console.error('Failed to force clear session:', e);
              }
            }
          }
        ]
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  // Navigation handlers for each button
  const handleMySchedule = () => {
    router.push('/MySchedule');
  };

  const handleCurrentJob = () => {
    router.push('/CurrentJobs');
  };

  const handleBenefit = () => {
    router.push('/Benefit');
  };

  const handleMaintenance = () => {
    router.push('/Maintenance');
  };

  return (
    <View style={styles.container}>
      {/* Sign Out Button */}
      <TouchableOpacity 
        style={[styles.signOutButton, isSigningOut && { opacity: 0.7 }]} 
        onPress={handleSignOut}
        disabled={isSigningOut}
      >
        <Text style={styles.buttonText}>
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </Text>
      </TouchableOpacity>

      {/* Header Info */}
      <Text style={styles.name}>WASHINGTON MURRAY</Text>
      <Text style={styles.title}>V.P. OPERATIONS</Text>

      {/* Welcome message */}
      <Text style={styles.welcomeMessage}>Welcome, {userName}!</Text>

      {/* Button Group */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleMySchedule}>
          <Text style={styles.buttonText}>My Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleCurrentJob}>
          <Text style={styles.buttonText}>Current Job</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleBenefit}>
          <Text style={styles.buttonText}>Benefit Page</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleMaintenance}>
          <Text style={styles.buttonText}>Maintenance Page</Text>
        </TouchableOpacity>
      </View>

      {/* Company Logo */}
      <Image
        style={styles.logo}
        source={require('../../assets/images/logo.png')}
      />
    </View>
  );
}
