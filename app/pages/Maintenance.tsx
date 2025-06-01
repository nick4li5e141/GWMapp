import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface MaintenanceRequest {
  id: string;
  description: string;
  location: string;
  urgency: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Resolved';
  date: string;
}

const mockRequests: MaintenanceRequest[] = [
  {
    id: '1',
    description: 'Broken vacuum cleaner in storage room',
    location: 'Storage Room',
    urgency: 'High',
    status: 'Pending',
    date: '2024-06-01',
  },
  {
    id: '2',
    description: 'Leaky faucet in kitchen',
    location: 'Kitchen',
    urgency: 'Medium',
    status: 'In Progress',
    date: '2024-05-30',
  },
];

export default function Maintenance() {
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState(mockRequests);
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High'>('Low');

  const getStatusStyle = (status: MaintenanceRequest['status']) => {
    switch (status) {
      case 'Pending':
        return styles.statusPending;
      case 'In Progress':
        return styles.statusInProgress;
      case 'Resolved':
        return styles.statusResolved;
      default:
        return undefined;
    }
  };

  const handleSubmit = () => {
    if (!desc.trim() || !location.trim()) {
      Alert.alert('Please fill in all fields.');
      return;
    }
    const newRequest: MaintenanceRequest = {
      id: (requests.length + 1).toString(),
      description: desc,
      location,
      urgency,
      status: 'Pending',
      date: new Date().toISOString().slice(0, 10),
    };
    setRequests([newRequest, ...requests]);
    setDesc('');
    setLocation('');
    setUrgency('Low');
    setShowForm(false);
    Alert.alert('Request submitted!');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Maintenance</Text>

      <Pressable style={styles.reportButton} onPress={() => setShowForm(!showForm)}>
        <Text style={styles.reportButtonText}>{showForm ? 'Cancel' : 'Report a New Issue'}</Text>
      </Pressable>

      {showForm && (
        <View style={styles.formBox}>
          <Text style={styles.formLabel}>Description</Text>
          <TextInput
            style={styles.input}
            value={desc}
            onChangeText={setDesc}
            placeholder="Describe the issue..."
            multiline
          />
          <Text style={styles.formLabel}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Where is the issue?"
          />
          <Text style={styles.formLabel}>Urgency</Text>
          <View style={styles.urgencyRow}>
            {(['Low', 'Medium', 'High'] as const).map(level => (
              <Pressable
                key={level}
                style={[styles.urgencyButton, urgency === level && styles.urgencyButtonSelected]}
                onPress={() => setUrgency(level)}
              >
                <Text style={urgency === level ? styles.urgencyTextSelected : styles.urgencyText}>{level}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Request</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.sectionTitle}>My Requests</Text>
      {requests.length === 0 && <Text style={styles.noRequests}>No requests submitted yet.</Text>}
      {requests.map(req => (
        <View key={req.id} style={styles.requestCard}>
          <Text style={styles.reqDesc}>{req.description}</Text>
          <Text style={styles.reqMeta}>Location: {req.location}</Text>
          <Text style={styles.reqMeta}>Urgency: {req.urgency}</Text>
          <Text style={styles.reqMeta}>Status: <Text style={getStatusStyle(req.status)}>{req.status}</Text></Text>
          <Text style={styles.reqMeta}>Date: {req.date}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Contact Maintenance</Text>
      <View style={styles.contactBox}>
        <Text style={styles.contactText}>Email: maintenance@company.com</Text>
        <Text style={styles.contactText}>Phone: (555) 123-4567</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#334155',
  },
  reportButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  reportButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  formBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  formLabel: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    color: '#334155',
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    padding: 10,
    fontSize: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  urgencyRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  urgencyButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 10,
  },
  urgencyButtonSelected: {
    backgroundColor: '#f59e42',
  },
  urgencyText: {
    color: '#334155',
    fontWeight: 'bold',
  },
  urgencyTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#334155',
  },
  noRequests: {
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
  },
  reqDesc: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
    color: '#1e293b',
  },
  reqMeta: {
    color: '#475569',
    fontSize: 13,
    marginBottom: 2,
  },
  statusPending: {
    color: '#f59e42',
    fontWeight: 'bold',
  },
  statusInProgress: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  statusResolved: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  contactBox: {
    backgroundColor: '#e0e7ef',
    borderRadius: 8,
    padding: 14,
    marginTop: 10,
    marginBottom: 30,
  },
  contactText: {
    color: '#334155',
    fontSize: 15,
    marginBottom: 4,
  },
});
