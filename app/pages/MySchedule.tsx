import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

interface MarkedDate {
  selected?: boolean;
  marked?: boolean;
  selectedColor?: string;
  dotColor?: string;
  activeOpacity?: number;
  disabled?: boolean;
  textColor?: string;
  disableTouchEvent?: boolean;
  status?: 'unavailable' | 'pending' | 'available';
  hours?: number;
}

interface MarkedDates {
  [date: string]: MarkedDate;
}

const MySchedule = () => {
  const [showHolidays, setShowHolidays] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHolidays, setSelectedHolidays] = useState<MarkedDates>({});
  const [hourlyRate, setHourlyRate] = useState(20); // Example hourly rate
  const [loading, setLoading] = useState(true); // Add loading state
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submission state
  const router = useRouter();

  const markedDates: MarkedDates = {
    '2023-10-25': { selected: true, marked: true, selectedColor: '#00adf5', hours: 8 },
    '2023-10-26': { marked: true, hours: 7 },
    '2023-10-27': { marked: true, dotColor: 'red', activeOpacity: 0, hours: 0 },
    '2023-10-28': { disabled: true, disableTouchEvent: true, hours: 0 }
  };

  const holidayDates: MarkedDates = {
    '2023-11-01': { 
      marked: true, 
      dotColor: '#4CAF50', 
      textColor: '#4CAF50',
      status: 'available'
    },
    '2023-11-02': { 
      marked: true, 
      dotColor: '#FFC107', 
      textColor: '#FFC107',
      status: 'pending'
    },
    '2023-11-03': { 
      marked: true, 
      dotColor: '#FFC107', 
      textColor: '#FFC107',
      status: 'pending'
    },
    '2023-11-06': { 
      marked: true, 
      dotColor: '#F44336', 
      textColor: '#F44336',
      status: 'unavailable'
    },
    '2023-11-07': { 
      marked: true, 
      dotColor: '#4CAF50', 
      textColor: '#4CAF50',
      status: 'available'
    },
    '2023-11-08': { 
      marked: true, 
      dotColor: '#F44336', 
      textColor: '#F44336',
      status: 'unavailable'
    },
  };

  const handleDayPress = (day: DateData) => {
    if (showHolidays) {
      setSelectedHolidays(prev => {
        const newHolidays = { ...prev };
        if (newHolidays[day.dateString]) {
          delete newHolidays[day.dateString];
        } else {
          newHolidays[day.dateString] = { 
            selected: true, 
            selectedColor: '#4CAF50'
          };
        }
        return newHolidays;
      });
    } else {
      setSelectedDate(day.dateString);
    }
  };

  const workingDatesList = Object.keys(markedDates).filter(
    date => !markedDates[date].disabled
  );

  const selectedHolidaysList = Object.keys(selectedHolidays);

  // Function to calculate total working hours for a given month
  const calculateTotalWorkingHoursForMonth = (dates: MarkedDates, monthYear: string): number => {
    let totalHours = 0;
    const [year, month] = monthYear.split('-');

    Object.keys(dates).forEach(date => {
      const [dateYear, dateMonth] = date.split('-');
      // Check if the date is in the target month and is not disabled
      if (dateYear === year && dateMonth === month && !dates[date]?.disabled) {
        // Use the hours property if available, otherwise assume a default (or 0)
        totalHours += dates[date]?.hours || 0; 
      }
    });
    return totalHours;
  };

  const currentMonthYear = '2023-10'; // Example: calculate for October 2023
  const totalScheduledHours = calculateTotalWorkingHoursForMonth(markedDates, currentMonthYear);

  // Function to save scheduled hours to Firestore
  const saveScheduledHours = async (userId: string, monthYear: string, hours: number) => {
    try {
      await firestore()
        .collection('users') // Assuming you have a 'users' collection
        .doc(userId) // Use the user's UID as the document ID
        .collection('scheduledHours') // Subcollection for scheduled hours
        .doc(monthYear) // Document for the specific month/year (e.g., '2023-10')
        .set({ totalHours: hours, lastUpdated: firestore.FieldValue.serverTimestamp() });

      console.log('Scheduled hours saved successfully for', monthYear);
    } catch (error) {
      console.error('Error saving scheduled hours:', error);
      // Optionally show an alert to the user
      // Alert.alert('Error', 'Failed to save schedule');
    }
  };

  // Use useEffect to save hours when they are calculated (or when component mounts/updates)
  useEffect(() => {
    const currentUser = (auth() as any).currentUser; // Bypass TypeScript error
    if (currentUser) {
      saveScheduledHours(currentUser.uid, currentMonthYear, totalScheduledHours);
    }
    setLoading(false); // Set loading to false after initial load/save attempt
  }, [totalScheduledHours, currentMonthYear]); // Depend on these values

  // Handler for the submit button
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const currentUser = (auth() as any).currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'No user logged in');
        return;
      }

      // Calculate total hours for the current month
      const totalHours = calculateTotalWorkingHoursForMonth(markedDates, currentMonthYear);

      // Save to Firestore
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('scheduledHours')
        .doc(currentMonthYear)
        .set({
          totalHours: totalHours,
          lastUpdated: firestore.FieldValue.serverTimestamp(),
          status: 'submitted'
        });

      // Navigate to payroll page after submitting
      router.push('/(tabs)/payroll');
      
    } catch (error) {
      console.error('Error submitting hours:', error);
      Alert.alert('Error', 'Failed to submit hours. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    // Optional: Render a loading indicator while fetching/saving
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading Schedule...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Schedule</Text>

      <ScrollView style={{ flex: 1 }}>
        <Calendar
          style={styles.calendar}
          initialDate={'2023-10-25'}
          onDayPress={handleDayPress}
          monthFormat={'yyyy MM'}
          firstDay={1}
          enableSwipeMonths={true}
          markedDates={{
            ...(showHolidays ? holidayDates : markedDates),
            ...(showHolidays ? selectedHolidays : {}),
            [selectedDate]: { selected: true, selectedColor: '#00adf5' }
          }}
          theme={{
            todayTextColor: '#00adf5',
            selectedDayBackgroundColor: '#00adf5',
            selectedDayTextColor: '#ffffff',
            arrowColor: '#00adf5',
            dotColor: '#00adf5',
            selectedDotColor: '#ffffff',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 16
          }}
        />

        {showHolidays && (
          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Status Legend:</Text>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFC107' }]} />
              <Text style={styles.legendText}>Pending</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.legendText}>Unavailable</Text>
            </View>
          </View>
        )}

        {!showHolidays && (
          <View style={styles.workingDaysContainer}>
            <Text style={styles.workingDaysTitle}>Days You're Scheduled to Work:</Text>
            {workingDatesList.map(date => (
              <Text key={date} style={styles.workingDayText}>• {date} - {markedDates[date]?.hours || 0} hours</Text>
            ))}
            <Text style={styles.totalHoursText}>Total Scheduled Hours ({currentMonthYear}): {totalScheduledHours}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
                isSubmitting && styles.submitButtonSubmitting
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Hours & View Payroll'}
              </Text>
            </Pressable>
          </View>
        )}

        {showHolidays && selectedHolidaysList.length > 0 && (
          <View style={[styles.workingDaysContainer, { backgroundColor: '#e8f5e9' }]}>
            <Text style={styles.workingDaysTitle}>Selected Holiday Dates:</Text>
            {selectedHolidaysList.map(date => (
              <Text key={date} style={styles.workingDayText}>• {date}</Text>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ✅ Added Send Info button for holiday mode */}
      {showHolidays && (
        <Pressable
          style={styles.sendInfoButton}
          onPress={() => {
            console.log('Sending selected holidays:', selectedHolidaysList);
            // Add your logic to send this data
          }}
        >
          <Text style={styles.sendInfoText}>Send Info</Text>
        </Pressable>
      )}

      <Pressable 
        style={[styles.holidayButton, showHolidays && styles.holidayButtonActive]}
        onPress={() => setShowHolidays(!showHolidays)}
      >
        <Text style={[styles.holidayButtonText, showHolidays && styles.holidayButtonTextActive]}>
          {showHolidays ? 'Show Schedule' : 'Show Holiday Availability'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 5,
    marginBottom: 20,
  },
  holidayButton: {
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  holidayButtonActive: {
    backgroundColor: '#4CAF50',
  },
  holidayButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  holidayButtonTextActive: {
    color: '#fff',
  },
  workingDaysContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#eaf6ff',
    borderRadius: 8,
  },
  workingDaysTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  workingDayText: {
    fontSize: 14,
    paddingVertical: 2,
  },
  legendContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
  // ✅ Style for Send Info button
  sendInfoButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  sendInfoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalHoursText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonPressed: {
    backgroundColor: '#2196F3',
  },
  submitButtonSubmitting: {
    backgroundColor: '#94a3b8',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MySchedule;