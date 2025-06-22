import { Ionicons } from '@expo/vector-icons';
import Firestore from '@react-native-firebase/firestore';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface EquipmentReading {
  id: string;
  name: string;
  currentValue: number;
  normalRange: { min: number; max: number };
  unit: string;
  isChecked: boolean;
  notes: string;
  icon: string; // Icon name for Ionicons
}

interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  category: 'cleaning' | 'inspection' | 'reading';
  isCompleted: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastCompleted?: string;
  icon: string; // Icon name for Ionicons
}

const mechanicalReadings: EquipmentReading[] = [
  {
    id: '1',
    name: 'Water Pump 1 - Pressure',
    currentValue: 0,
    normalRange: { min: 40, max: 60 },
    unit: 'PSI',
    isChecked: false,
    notes: '',
    icon: 'water',
  },
  {
    id: '2',
    name: 'Water Pump 2 - Pressure',
    currentValue: 0,
    normalRange: { min: 40, max: 60 },
    unit: 'PSI',
    isChecked: false,
    notes: '',
    icon: 'water',
  },
  {
    id: '3',
    name: 'Thermostatic Valve - Temperature',
    currentValue: 0,
    normalRange: { min: 120, max: 140 },
    unit: '°F',
    isChecked: false,
    notes: '',
    icon: 'thermometer',
  },
  {
    id: '4',
    name: 'Generator - Voltage',
    currentValue: 0,
    normalRange: { min: 110, max: 130 },
    unit: 'V',
    isChecked: false,
    notes: '',
    icon: 'flash',
  },
  {
    id: '5',
    name: 'Generator - Frequency',
    currentValue: 0,
    normalRange: { min: 59, max: 61 },
    unit: 'Hz',
    isChecked: false,
    notes: '',
    icon: 'pulse',
  },
  {
    id: '6',
    name: 'Generator - Oil Pressure',
    currentValue: 0,
    normalRange: { min: 30, max: 50 },
    unit: 'PSI',
    isChecked: false,
    notes: '',
    icon: 'speedometer',
  },
];

const maintenanceTasks: MaintenanceTask[] = [
  {
    id: '1',
    name: 'Vacuum Common Areas',
    description: 'Vacuum all common areas including hallways and lobbies',
    category: 'cleaning',
    isCompleted: false,
    frequency: 'daily',
    icon: 'home',
  },
  {
    id: '2',
    name: 'Clean Windows',
    description: 'Clean all accessible windows and glass surfaces',
    category: 'cleaning',
    isCompleted: false,
    frequency: 'weekly',
    icon: 'eye',
  },
  {
    id: '3',
    name: 'Check Mechanical Room',
    description: 'Inspect mechanical room for any visible issues or leaks',
    category: 'inspection',
    isCompleted: false,
    frequency: 'daily',
    icon: 'settings',
  },
  {
    id: '4',
    name: 'Empty Trash Bins',
    description: 'Empty all trash bins and replace liners',
    category: 'cleaning',
    isCompleted: false,
    frequency: 'daily',
    icon: 'trash',
  },
  {
    id: '5',
    name: 'Check Emergency Lights',
    description: 'Test emergency lighting system',
    category: 'inspection',
    isCompleted: false,
    frequency: 'weekly',
    icon: 'bulb',
  },
];

export default function Maintenance() {
  const [readings, setReadings] = useState<EquipmentReading[]>(mechanicalReadings);
  const [tasks, setTasks] = useState<MaintenanceTask[]>(maintenanceTasks);
  const [selectedReading, setSelectedReading] = useState<EquipmentReading | null>(null);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [currentValue, setCurrentValue] = useState('');
  const [notes, setNotes] = useState('');

  const getReadingStatus = (reading: EquipmentReading) => {
    if (!reading.isChecked) return 'unchecked';
    if (reading.currentValue >= reading.normalRange.min && reading.currentValue <= reading.normalRange.max) {
      return 'normal';
    }
    return 'abnormal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#10b981';
      case 'abnormal': return '#ef4444';
      case 'unchecked': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return 'Normal';
      case 'abnormal': return 'Abnormal';
      case 'unchecked': return 'Not Checked';
      default: return 'Unknown';
    }
  };

  const handleReadingUpdate = () => {
    if (!selectedReading || !currentValue.trim()) {
      Alert.alert('Please enter a value');
      return;
    }

    const value = parseFloat(currentValue);
    if (isNaN(value)) {
      Alert.alert('Please enter a valid number');
      return;
    }

    setReadings(prev => prev.map(reading => 
      reading.id === selectedReading.id 
        ? { ...reading, currentValue: value, isChecked: true, notes }
        : reading
    ));

    setCurrentValue('');
    setNotes('');
    setSelectedReading(null);
    setShowReadingModal(false);
    Alert.alert('Reading Updated', 'The equipment reading has been recorded.');
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, isCompleted: !task.isCompleted, lastCompleted: new Date().toISOString().split('T')[0] }
        : task
    ));
  };

  const getCompletionRate = () => {
    const completed = tasks.filter(task => task.isCompleted).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const handleSubmitToFirestore = async () => {
    const userId = 'user_001'; // Replace with dynamic user ID if needed
    const today = new Date().toISOString().split('T')[0];

    const dataToSend = {
      date: today,
      readings, // from your state
      tasks,    // from your state
      submittedAt: Firestore.FieldValue.serverTimestamp(),
    };

    try {
      await Firestore()
        .collection('gwm')
        .doc(userId)
        .collection('maintenance')
        .add(dataToSend);
      Alert.alert('Success', 'Maintenance data submitted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit maintenance data.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Address Card */}
      <View style={styles.addressCard}>
        <Ionicons name="location" size={24} color="#3b82f6" style={styles.addressIcon} />
        <Text style={styles.addressText}>223 Perry St, Whitby, ON</Text>
      </View>

      <Text style={styles.header}>Maintenance Dashboard</Text>

      {/* Progress Overview */}
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Today's Progress</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${getCompletionRate()}%` }]} />
        </View>
        <Text style={styles.progressText}>{getCompletionRate()}% Complete</Text>
      </View>

      {/* Mechanical Room Readings */}
      <View style={styles.sectionGroup}>
        <Text style={styles.sectionTitle}>Mechanical Room Readings</Text>
        <Text style={styles.sectionSubtitle}>Check and record equipment measurements</Text>
        {readings.map(reading => {
          const status = getReadingStatus(reading);
          return (
            <Pressable 
              key={reading.id} 
              style={styles.readingCard}
              onPress={() => {
                setSelectedReading(reading);
                setCurrentValue(reading.currentValue.toString());
                setNotes(reading.notes);
                setShowReadingModal(true);
              }}
            >
              <View style={styles.readingHeader}>
                <View style={styles.readingTitleRow}>
                  <Ionicons name={reading.icon as any} size={24} color="#3b82f6" style={styles.readingIcon} />
                  <Text style={styles.readingName}>{reading.name}</Text>
                </View>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(status) }]}> 
                  <Text style={styles.statusText}>{getStatusText(status)}</Text>
                </View>
              </View>
              <View style={styles.readingDetails}>
                <Text style={styles.readingValue}>
                  {reading.isChecked ? `${reading.currentValue} ${reading.unit}` : 'Not recorded'}
                </Text>
                <Text style={styles.readingRange}>
                  Normal Range: {reading.normalRange.min} - {reading.normalRange.max} {reading.unit}
                </Text>
              </View>
              {reading.notes && (
                <Text style={styles.readingNotes}>Notes: {reading.notes}</Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Maintenance Tasks */}
      <View style={styles.sectionGroup}>
        <Text style={styles.sectionTitle}>Maintenance Tasks</Text>
        <Text style={styles.sectionSubtitle}>Daily and weekly maintenance activities</Text>
        {tasks.map(task => (
          <Pressable 
            key={task.id} 
            style={[styles.taskCard, task.isCompleted && styles.taskCompleted]}
            onPress={() => toggleTask(task.id)}
          >
            <View style={styles.taskHeader}>
              <View style={[styles.checkbox, task.isCompleted && styles.checkboxChecked]}>
                {task.isCompleted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.taskInfo}>
                <View style={styles.taskTitleRow}>
                  <Ionicons name={task.icon as any} size={20} color="#64748b" style={styles.taskIcon} />
                  <Text style={[styles.taskName, task.isCompleted && styles.taskNameCompleted]}>
                    {task.name}
                  </Text>
                </View>
                <Text style={styles.taskDescription}>{task.description}</Text>
                <Text style={styles.taskFrequency}>{task.frequency} task</Text>
              </View>
            </View>
            {task.lastCompleted && (
              <Text style={styles.lastCompleted}>Last completed: {task.lastCompleted}</Text>
            )}
          </Pressable>
        ))}
      </View>

      {/* Reading Modal */}
      {showReadingModal && selectedReading && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Ionicons name={selectedReading.icon as any} size={32} color="#3b82f6" style={styles.modalIcon} />
              <Text style={styles.modalTitle}>Update {selectedReading.name}</Text>
            </View>
            <Text style={styles.modalLabel}>Current Reading ({selectedReading.unit})</Text>
            <TextInput
              style={styles.modalInput}
              value={currentValue}
              onChangeText={setCurrentValue}
              placeholder={`Enter ${selectedReading.unit} value`}
              keyboardType="numeric"
            />
            <Text style={styles.modalLabel}>Notes (Optional)</Text>
            <TextInput
              style={[styles.modalInput, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes or observations..."
              multiline
            />
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowReadingModal(false);
                  setSelectedReading(null);
                  setCurrentValue('');
                  setNotes('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleReadingUpdate}
              >
                <Text style={styles.saveButtonText}>Save Reading</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      <Pressable
        style={{
          backgroundColor: '#3b82f6',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
          marginVertical: 20,
        }}
        onPress={handleSubmitToFirestore}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          Submit Maintenance Data
        </Text>
      </Pressable>
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
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#334155',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#334155',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 15,
  },
  readingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  readingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  readingIcon: {
    marginRight: 8,
  },
  readingName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  readingDetails: {
    marginBottom: 8,
  },
  readingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  readingRange: {
    fontSize: 14,
    color: '#64748b',
  },
  readingNotes: {
    fontSize: 14,
    color: '#475569',
    fontStyle: 'italic',
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  taskCompleted: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskIcon: {
    marginRight: 8,
  },
  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  taskDescription: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  taskFrequency: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  lastCompleted: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 8,
    fontStyle: 'italic',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    flex: 1,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#334155',
  },
  modalInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    marginTop: 8,
    elevation: 1,
  },
  addressIcon: {
    marginRight: 10,
  },
  addressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3730a3',
  },
  sectionGroup: {
    marginBottom: 24,
  },
});
