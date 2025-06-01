// Import necessary modules and hooks
import { useRouter } from 'expo-router'; // For navigation between pages
import React, { ReactElement } from 'react'; // React types and functions
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Core UI components

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
});

// Define the functional component
export default function Homepage(): ReactElement {
  const employeeName = 'Employee Name'; // Hardcoded employee name (can be dynamic)
  const router = useRouter(); // Router hook for navigation

  // Navigation handlers for each button
  const handleMySchedule = () => {
    router.push('/pages/MySchedule'); // Navigate to MySchedule page
  };

  const handleCurrentJob = () => {
    router.push('/pages/CurrentJobs'); // Navigate to CurrentJobs page
  };

  const handleBenefit = () => {
    router.push('/pages/Benefit'); // Navigate to Benefit page
  };

  const handleMaintenance = () => {
    router.push('/pages/Maintenance'); // Navigate to Maintenance page
  };

  // Return the UI
  return (
    <View style={styles.container}>
      {/* Header Info */}
      <Text style={styles.name}>WASHINGTON MURRAY</Text>
      <Text style={styles.title}>V.P. OPERATIONS</Text>

      {/* Welcome message */}
      <Text style={styles.welcomeMessage}>Welcome, {employeeName}!</Text>

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
        source={require('../../assets/images/logo.png')} // Make sure this path is correct
      />
    </View>
  );
}
