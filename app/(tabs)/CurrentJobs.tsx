import { Checkbox, CheckboxIndicator } from '@gluestack-ui/themed';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface Job {
  id: string;
  client: string;
  location: string;
  tasks: string;
  time: string;
  taskList: Task[];
  description: string;
}

interface Task {
  id: string;
  label: string;
  completed: boolean;
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
    description: ''
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
    description: ''
  },
  // Add more jobs as needed
];

const CurrentJobs = () => {
  const [jobs, setJobs] = useState<Job[]>(currentJobs);

  const toggleTask = (jobId: string, taskId: string) => {
    setJobs(jobs.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          taskList: job.taskList.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        };
      }
      return job;
    }));
  };

  const updateDescription = (jobId: string, text: string) => {
    setJobs(jobs.map(job =>
      job.id === jobId ? { ...job, description: text } : job
    ));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Current Jobs</Text>
      {jobs.map(job => (
        <View key={job.id} style={styles.jobCard}>
          <Text style={styles.clientName}>{job.client}</Text>
          <Text style={styles.jobLocation}>{job.location}</Text>
          <Text style={styles.jobTime}>{job.time}</Text>
          <Text style={styles.jobTasks}>Tasks: {job.tasks}</Text>
          
          {/* Task Checklist */}
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

          {/* Description Box */}
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
        </View>
      ))}
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
    marginTop: 10,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  descriptionInput: {
    height: 100,
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    textAlignVertical: 'top',
  },
});

export default CurrentJobs;
