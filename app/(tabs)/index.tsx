import { useRouter } from 'expo-router';
import React, { ReactElement } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Styles {
  container: {
    flex: number;
    alignItems: 'center';
    justifyContent: 'center';
    padding: number;
  };
  logo: {
    width: number;
    height: number;
    marginBottom: number;
  };
  name: {
    fontSize: number;
    fontWeight: 'bold';
    marginTop: number;
  };
  title: {
    fontSize: number;
    marginBottom: number;
    color: string;
  };
  welcomeMessage: {
    fontSize: number;
    marginVertical: number;
    textAlign: 'center';
  };
  contactInfo: {
    fontSize: number;
    marginVertical: number;
    color: string;
  };
  buttonContainer: {
    marginTop: number;
  };
  button: {
    backgroundColor: '#007BFF'; // Example button color
    padding: number;
    borderRadius: number;
    marginVertical: number;
    alignItems: 'center';
  };
  buttonText: {
    color: 'white';
    fontSize: number;
    fontWeight: 'bold';
  };
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150, // Adjust size as needed
    height: 150, // Adjust size as needed
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    color: '#555',
  },
  welcomeMessage: {
    fontSize: 18,
    marginVertical: 20,
    textAlign: 'center',
  },
  contactInfo: {
    fontSize: 16,
    marginVertical: 5,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 30,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default function Homepage(): ReactElement {
  // Placeholder for employee name - this would likely come from user authentication context
  const employeeName = 'Employee Name';
  const router = useRouter();

  const handleMySchedule = () => {
    router.push('/pages/MySchedule');
  };

  const handleCurrentJob = () => {
    router.push('/pages/CurrentJobs');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>WASHINGTON MURRAY</Text>
      <Text style={styles.title}>V.P. OPERATIONS</Text>

      <Text style={styles.welcomeMessage}>Welcome, {employeeName}!</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleMySchedule}>
          <Text style={styles.buttonText}>My Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleCurrentJob}>
          <Text style={styles.buttonText}>Current Job</Text>
        </TouchableOpacity>
      </View>

      <Image
        style={styles.logo}
        source={require('../../assets/images/logo.png')} 
      />
    </View>
  );
}
