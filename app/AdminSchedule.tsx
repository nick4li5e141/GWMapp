import React, { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// Mock employee data
const mockEmployees = [
  { id: '1', name: 'Alice Johnson' },
  { id: '2', name: 'Bob Smith' },
  { id: '3', name: 'Charlie Lee' },
];

// Mock calendar days for the current week
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AdminSchedule() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [assigned, setAssigned] = useState<{ [key: string]: string[] }>({}); // { employeeId: [days] }

  const handleToggleDay = (employeeId: string, day: string) => {
    setAssigned(prev => {
      const current = prev[employeeId] || [];
      if (current.includes(day)) {
        return { ...prev, [employeeId]: current.filter(d => d !== day) };
      } else {
        return { ...prev, [employeeId]: [...current, day] };
      }
    });
  };

  const totalScheduledHours = 20;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Admin: Employee Scheduling</Text>
      <Text style={styles.sectionTitle}>Select Employee</Text>
      <FlatList
        data={mockEmployees}
        keyExtractor={item => item.id}
        horizontal
        style={{ marginBottom: 20 }}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.employeeButton, selectedEmployee === item.id && styles.employeeButtonSelected]}
            onPress={() => setSelectedEmployee(item.id)}
          >
            <Text style={selectedEmployee === item.id ? styles.employeeButtonTextSelected : styles.employeeButtonText}>
              {item.name}
            </Text>
          </Pressable>
        )}
      />

      {selectedEmployee && (
        <View style={styles.scheduleBox}>
          <Text style={styles.sectionTitle}>Assign Shifts for {mockEmployees.find(e => e.id === selectedEmployee)?.name}</Text>
          <View style={styles.daysRow}>
            {daysOfWeek.map(day => (
              <Pressable
                key={day}
                style={[styles.dayButton, assigned[selectedEmployee]?.includes(day) && styles.dayButtonAssigned]}
                onPress={() => handleToggleDay(selectedEmployee, day)}
              >
                <Text style={assigned[selectedEmployee]?.includes(day) ? styles.dayButtonTextAssigned : styles.dayButtonText}>{day}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.infoText}>
            Tap days to assign/unassign shifts. (This is a mockup; no backend yet.)
          </Text>
        </View>
      )}
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#334155',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#334155',
  },
  employeeButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    marginRight: 10,
  },
  employeeButtonSelected: {
    backgroundColor: '#3b82f6',
  },
  employeeButtonText: {
    color: '#334155',
    fontWeight: 'bold',
  },
  employeeButtonTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  scheduleBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    elevation: 2,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  dayButton: {
    backgroundColor: '#e0e7ef',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginHorizontal: 2,
    minWidth: 40,
    alignItems: 'center',
  },
  dayButtonAssigned: {
    backgroundColor: '#10b981',
  },
  dayButtonText: {
    color: '#334155',
    fontWeight: 'bold',
  },
  dayButtonTextAssigned: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoText: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
}); 