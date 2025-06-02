import { Checkbox, CheckboxIndicator } from '@gluestack-ui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

interface Job {
  id: string;
  client: string;
  location: string;
  tasks: string;
  time: string;
  taskList: Task[];
  description: string;
  notes: {
    id: string;
    content: string;
    timestamp: string;
    type: 'general' | 'issue' | 'followup';
  }[];
  locationData?: {
    latitude: number;
    longitude: number;
  };
}

interface Task {
  id: string;
  label: string;
  completed: boolean;
}

interface SessionData {
  email: string;
  name: string;
  isAuthenticated: boolean;
}

const currentJobs: Job[] = [
  {
    id: '1',
    client: 'Client A',
    location: '123 Main St, Anytown',
    tasks: 'Clean kitchen, bathrooms, vacuum carpets',
    time: '10:00 AM - 12:00 PM',
    taskList: [
      { id: '1', label: 'Clean kitchen countertops', completed: false },
      { id: '2', label: 'Clean bathroom fixtures', completed: false },
      { id: '3', label: 'Vacuum all carpets', completed: false },
      { id: '4', label: 'Mop kitchen floor', completed: false },
      { id: '5', label: 'Clean bathroom mirrors', completed: false }
    ],
    description: '',
    notes: []
  },
  {
    id: '2',
    client: 'Client B',
    location: '456 Oak Ave, Anytown',
    tasks: 'Window cleaning, dusting',
    time: '1:00 PM - 2:30 PM',
    taskList: [
      { id: '1', label: 'Clean all windows', completed: false },
      { id: '2', label: 'Dust all surfaces', completed: false },
      { id: '3', label: 'Clean window sills', completed: false },
      { id: '4', label: 'Wipe down blinds', completed: false }
    ],
    description: '',
    notes: []
  }
];

const CurrentJobs = () => {
  const [jobs, setJobs] = useState<Job[]>(currentJobs);
  const [userId, setUserId] = useState<string>('');
  const [userDocId, setUserDocId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserSession = async () => {
      try {
        const sessionData = await AsyncStorage.getItem('userSession');
        if (sessionData) {
          const session: SessionData = JSON.parse(sessionData);
          setUserId(session.email);
          
          // Get user's document ID from the gwm collection
          const usersRef = firestore().collection('gwm');
          const userQuery = await usersRef.where('email', '==', session.email).get();
          
          if (!userQuery.empty) {
            const docId = userQuery.docs[0].id;
            setUserDocId(docId);
            // Load jobs after getting userDocId
            await loadUserJobs(docId);
          } else {
            // If user document doesn't exist, create it
            const newUserDoc = await usersRef.add({
              email: session.email,
              name: session.name,
              createdAt: firestore.FieldValue.serverTimestamp()
            });
            setUserDocId(newUserDoc.id);
            // Load jobs after creating new user document
            await loadUserJobs(newUserDoc.id);
          }
        }
      } catch (error) {
        console.error('Error loading user session:', error);
        Alert.alert('Error', 'Failed to load user session');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSession();
  }, []);

  const loadUserJobs = async (docId: string) => {
    try {
      const jobsRef = firestore()
        .collection('gwm')
        .doc(docId)
        .collection('jobs');

      const jobsSnapshot = await jobsRef.get();
      
      if (!jobsSnapshot.empty) {
        const fetchedJobs = jobsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            taskList: data.taskList || [],
            description: data.description || '',
            locationData: data.locationData || undefined
          } as Job;
        });
        setJobs(fetchedJobs);
      } else {
        // If no jobs exist, initialize with default jobs
        const batch = firestore().batch();
        for (const job of currentJobs) {
          const jobRef = jobsRef.doc(job.id);
          batch.set(jobRef, {
            ...job,
            updatedAt: firestore.FieldValue.serverTimestamp(),
            status: 'in_progress'
          });
        }
        await batch.commit();
        setJobs(currentJobs);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      Alert.alert('Error', 'Failed to load jobs');
    }
  };

  const toggleTask = async (jobId: string, taskId: string) => {
    try {
      const updatedJobs = jobs.map(job => {
        if (job.id === jobId) {
          const updatedTaskList = job.taskList.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          );
          
          // Update Firestore
          firestore()
            .collection('gwm')
            .doc(userDocId)
            .collection('jobs')
            .doc(jobId)
            .update({
              taskList: updatedTaskList,
              updatedAt: firestore.FieldValue.serverTimestamp()
            });
          
          return {
            ...job,
            taskList: updatedTaskList
          };
        }
        return job;
      });
      
      setJobs(updatedJobs);
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const updateDescription = async (jobId: string, text: string) => {
    try {
      const updatedJobs = jobs.map(job =>
        job.id === jobId ? { ...job, description: text } : job
      );
      
      // Update Firestore
      await firestore()
        .collection('gwm')
        .doc(userDocId)
        .collection('jobs')
        .doc(jobId)
        .update({
          description: text,
          updatedAt: firestore.FieldValue.serverTimestamp()
        });
      
      setJobs(updatedJobs);
    } catch (error) {
      console.error('Error updating description:', error);
      Alert.alert('Error', 'Failed to update description');
    }
  };

  const handleSubmit = async () => {
    if (!userId || !userDocId) {
      Alert.alert('Error', 'User session not found. Please sign in again.');
      return;
    }

    try {
      setLoading(true);
      
      // Create a batch write
      const batch = firestore().batch();
      
      // Add each job to the user's jobs subcollection
      for (const job of jobs) {
        const jobRef = firestore()
          .collection('gwm')
          .doc(userDocId)
          .collection('jobs')
          .doc(job.id);
        
        batch.set(jobRef, {
          ...job,
          updatedAt: firestore.FieldValue.serverTimestamp(),
          status: 'in_progress'
        });
      }
      
      // Commit the batch
      await batch.commit();
      
      Alert.alert('Success', 'Your job updates have been saved successfully!');
    } catch (error) {
      console.error('Error saving jobs:', error);
      Alert.alert('Error', 'Failed to save job updates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinLocation = async (jobId: string) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to pin your location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Update the job with location data
      setJobs(jobs.map(job =>
        job.id === jobId
          ? { ...job, locationData: { latitude, longitude } }
          : job
      ));
      
      Alert.alert('Location Pinned', `Location has been pinned for ${jobs.find(j => j.id === jobId)?.client}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to get location.');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading jobs...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Current Jobs</Text>
      {jobs.map(job => (
        <View key={job.id} style={styles.jobCard}>
          <Text style={styles.clientName}>{job.client}</Text>
          <Text style={styles.jobLocation}>{job.location}</Text>
          <Text style={styles.jobTime}>{job.time}</Text>
          <Text style={styles.jobTasks}>Tasks: {job.tasks}</Text>

          <View style={styles.taskList}>
            <Text style={styles.taskListTitle}>Task Checklist:</Text>
            {job.taskList.map(task => (
              <View key={task.id} style={styles.taskItem}>
                <Checkbox
                  value={task.id}
                  isChecked={task.completed}
                  onChange={() => toggleTask(job.id, task.id)}
                  style={styles.checkbox}
                >
                  <CheckboxIndicator style={styles.checkboxIndicator}>
                    {task.completed && <View style={styles.checkmark} />}
                  </CheckboxIndicator>
                </Checkbox>
                <Text style={[
                  styles.taskLabel,
                  task.completed && styles.completedTask
                ]}>
                  {task.label}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionTitle}>Additional Notes:</Text>
            <TextInput
              value={job.description}
              onChangeText={(text) => updateDescription(job.id, text)}
              placeholder="Add any additional notes or comments here..."
              multiline
              numberOfLines={4}
              style={styles.descriptionInput}
            />
          </View>

          <View style={styles.locationButton}>
            <Button 
              title={job.locationData ? "Update Location" : "PIN Location"} 
              onPress={() => handlePinLocation(job.id)} 
              color="#3b82f6" 
            />
            {job.locationData && (
              <Text style={styles.locationText}>
                Location: {job.locationData.latitude.toFixed(6)}, {job.locationData.longitude.toFixed(6)}
              </Text>
            )}
          </View>
        </View>
      ))}

      <View style={{ marginVertical: 20, paddingHorizontal: 20 }}>
        <Button 
          title={loading ? "Saving..." : "Submit"} 
          onPress={handleSubmit} 
          color="#10b981"
          disabled={loading}
        />
      </View>
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
    marginBottom: 15,
  },
  taskList: {
    marginTop: 10,
    marginBottom: 15,
  },
  taskListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxIndicator: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#007BFF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 12,
    height: 12,
    backgroundColor: '#007BFF',
    borderRadius: 2,
  },
  taskLabel: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  completedTask: {
    color: '#10b981',
    textDecorationLine: 'line-through',
  },
  descriptionBox: {
    marginTop: 15,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  locationButton: {
    marginTop: 15,
  },
  locationText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default CurrentJobs;
