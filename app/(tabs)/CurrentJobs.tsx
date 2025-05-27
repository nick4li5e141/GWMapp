import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface Job {
  id: string;
  client: string;
  location: string;
  tasks: string;
  time: string;
}

const currentJobs: Job[] = [
  {
    id: '1',
    client: 'Client A',
    location: '123 Main St, Anytown',
    tasks: 'Clean kitchen, bathrooms, vacuum carpets',
    time: '10:00 AM - 12:00 PM'
  },
  {
    id: '2',
    client: 'Client B',
    location: '456 Oak Ave, Anytown',
    tasks: 'Window cleaning, dusting',
    time: '1:00 PM - 2:30 PM'
  },
  // Add more jobs as needed
];

const CurrentJobs = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Current Jobs</Text>
      {
        currentJobs.map(job => (
          <View key={job.id} style={styles.jobCard}>
            <Text style={styles.clientName}>{job.client}</Text>
            <Text style={styles.jobLocation}>{job.location}</Text>
            <Text style={styles.jobTime}>{job.time}</Text>
            <Text style={styles.jobTasks}>Tasks: {job.tasks}</Text>
          </View>
        ))
      }
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  jobCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  jobLocation: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  jobTime: {
    fontSize: 16,
    color: '#007BFF',
    marginBottom: 10,
  },
  jobTasks: {
    fontSize: 14,
    color: '#666',
  },
});

export default CurrentJobs;
