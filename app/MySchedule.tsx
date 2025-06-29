// eslint-disable-next-line <rule-name>
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
// Import Firebase configuration

interface Job {
  id: string;
  shiftStart: string;
  shiftEnd: string;
  pay: number;
  location: string;
  assignedBy: string;
}

interface MarkedDate {
  selected?: boolean;
  marked?: boolean;
  selectedColor?: string;
  dotColor?: string;
  activeOpacity?: number;
  disabled?: boolean;
  textColor?: string;
  disableTouchEvent?: boolean;
  status?: 'unavailable' | 'pending' | 'available' | 'request_pending' | 'request_approved' | 'request_rejected' | 'scheduled';
  jobs?: Job[];
  hours?: number;
}

interface MarkedDates {
  [date: string]: MarkedDate;
}

const MySchedule = () => {
  console.log('Rendering MySchedule component');

  const [isRequestingDayOff, setIsRequestingDayOff] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [requestedDaysOff, setRequestedDaysOff] = useState<MarkedDates>({});
  const [fetchedDayOffRequests, setFetchedDayOffRequests] = useState<MarkedDates>({});
  const [hourlyRate, setHourlyRate] = useState(20); // Example hourly rate
  const [loading, setLoading] = useState(true); // Add loading state
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submission state
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // New state for storing user UID
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const router = useRouter();

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
    if (isRequestingDayOff) {
      setRequestedDaysOff(prev => {
        const newRequestedDays = { ...prev };
        if (newRequestedDays[day.dateString]) {
          delete newRequestedDays[day.dateString];
        } else {
          newRequestedDays[day.dateString] = { 
            selected: true, 
            selectedColor: '#FFC107',
            dotColor: '#FFC107',
            status: 'request_pending'
          };
        }
        return newRequestedDays;
      });
    } else {
      setSelectedDate(day.dateString);
    }
  };

  const workingDatesList = Object.keys(markedDates).filter(
    date => !markedDates[date].disabled
  );

  const selectedHolidaysList = Object.keys(requestedDaysOff);

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
        .collection('gwm')
        .doc(userId)
        .collection('scheduledHours')
        .doc(monthYear)
        .set({ totalHours: hours, lastUpdated: firestore.FieldValue.serverTimestamp() });

      console.log('Scheduled hours saved successfully for', monthYear);
    } catch (error) {
      console.error('Error saving scheduled hours:', error);
      // Optionally show an alert to the user
      // Alert.alert('Error', 'Failed to save schedule');
    }
  };

  // Function to fetch detailed scheduled shifts from Firestore
  const fetchScheduledShifts = async (userId: string, monthYear: string) => {
    try {
      // TODO: Implement fetching logic from Firebase Firestore
      // Example: Fetch a document from a specific path like
      // firestore().collection('gwm').doc(userId).collection('scheduledShiftsDetails').doc(monthYear)
      const docRef = firestore()
        .collection('gwm')
        .doc(userId)
        .collection('scheduledShiftsDetails')
        .doc(monthYear);

      // Attempting to fetch the document
      const docSnap = await docRef.get();

      // TODO: Process fetched data and update component state (e.g., the markedDates state)
      // The check for docSnap.exists and data processing should be handled here.
      console.log('Fetched scheduled shifts doc snap for', monthYear, ':', docSnap);

      if (docSnap.exists()) {
         const data = docSnap.data();
         console.log('Fetched scheduled shifts data:', data);
         return data; // Return fetched data
      } else {
         console.log('No detailed scheduled shifts found for', monthYear);
         return null;
      }

    } catch (error) {
      console.error('Error fetching scheduled shifts:', error);
      // Optionally show an alert to the user
      // Alert.alert('Error', 'Failed to fetch schedule details');
      throw error; // Re-throw the error or handle it as needed
    }
  };

  // Function to save detailed scheduled shifts to Firestore
  const saveScheduledShifts = async (userId: string, monthYear: string, shiftsData: MarkedDates) => {
    try {
      // TODO: Implement saving/updating logic to Firebase Firestore
      // Example: Set or update a document in a specific path like
      // firestore().collection('gwm').doc(userId).collection('scheduledShiftsDetails').doc(monthYear)
      await firestore()
        .collection('gwm')
        .doc(userId)
        .collection('scheduledShiftsDetails')
        .doc(monthYear)
        .set(shiftsData, { merge: true });

      console.log('Detailed scheduled shifts saved successfully for', monthYear);
    } catch (error) {
      console.error('Error saving detailed scheduled shifts:', error);
      // Optionally show an alert to the user
      // Alert.alert('Error', 'Failed to save schedule details');
      throw error; // Re-throw the error or handle it as needed
    }
  };

  // Function to fetch day off requests from Firestore
  const fetchDayOffRequests = async (userId: string) => {
    try {
      // Fetch all documents from the 'dayOffRequests' subcollection under the user's document in 'gwm'
      const snapshot = await firestore()
        .collection('gwm')
        .doc(userId)
        .collection('dayOffRequests')
        .get();

      const requestsData: MarkedDates = {};
      snapshot.forEach((doc) => {
        // Assuming each document ID is the date string (e.g., '2023-11-20')
        // and the document data contains the status and any other relevant info
        const date = doc.id;
        const data = doc.data();
        if (data && data.status) {
          // Map Firestore status to MarkedDate status
          let status: MarkedDate['status'];
          let color: string | undefined;

          if (data.status === 'pending') {
            status = 'request_pending';
            color = '#FFC107'; // Yellow/Orange for pending
          } else if (data.status === 'approved') {
            status = 'request_approved';
            color = '#4CAF50'; // Green for approved
          } else if (data.status === 'rejected') {
            status = 'request_rejected';
            color = '#F44336'; // Red for rejected
          } else {
            status = undefined; // Handle unexpected statuses
            color = undefined;
          }

          if (status && color) {
             requestsData[date] = {
               selected: true, // Highlight the entire day
               selectedColor: color, // Set color based on status
               textColor: color, // Optional: set text color to match highlight
               status: status,
               // Include other fields if needed, e.g., data.notes
             };
          }
        }
      });

      console.log('Fetched day off requests:', requestsData);
      setFetchedDayOffRequests(requestsData); // Update state with fetched requests
      return requestsData;

    } catch (error) {
      console.error('Error fetching day off requests:', error);
      // Optionally show an alert
      // Alert.alert('Error', 'Failed to fetch day off requests');
      throw error;
    }
  };

  // Function to save day off requests to Firestore
  const saveDayOffRequest = async (userId: string, requests: MarkedDates) => {
    try {
      const batch = firestore().batch();
      const dayOffRequestsCollectionRef = firestore()
        .collection('gwm')
        .doc(userId)
        .collection('dayOffRequests');

      // Iterate over the requested days off and set them in the batch
      Object.keys(requests).forEach(date => {
        const requestData = requests[date];
        // Assuming the status and other relevant info are in the requestData object
        batch.set(dayOffRequestsCollectionRef.doc(date), { 
          status: 'pending', // Set initial status to pending
          date: date, // Save date as a 'YYYY-MM-DD' string
          requestedAt: firestore.FieldValue.serverTimestamp(),
          // Add any other relevant fields here
         });
      });

      await batch.commit();

      console.log('Day off requests saved successfully!');
      Alert.alert('Success', 'Day off requests submitted.');

      // After saving, refresh the fetched requests
      // Use currentUserId from state
      if (currentUserId) { // Check if userId is available (using state variable)
        fetchDayOffRequests(currentUserId); // Use currentUserId state variable
      } else {
         console.error('Cannot refetch day off requests: User ID not available.');
      }

    } catch (error) {
      console.error('Error saving day off requests:', error);
      Alert.alert('Error', 'Failed to submit day off requests. Please try again.');
      throw error;
    }
  };

  // Use useEffect to fetch scheduled shifts and day off requests when the component mounts
  useEffect(() => {
    console.log('useEffect triggered');
    setLoading(true);

    const loadUserAndData = async () => {
      try {
        console.log('Loading user session...');
        const sessionData = await AsyncStorage.getItem('userSession');
        console.log('Session data:', sessionData);

        if (sessionData) {
          const session: { email: string; isAuthenticated: boolean } = JSON.parse(sessionData);
          if (session.isAuthenticated && session.email) {
            console.log('Session authenticated, fetching user UID by email...');
            const usersRef = firestore().collection('gwm');
            const userQuery = await usersRef.where('email', '==', session.email).limit(1).get();

            if (!userQuery.empty) {
              const userDoc = userQuery.docs[0];
              const userId = userDoc.id;
              setCurrentUserId(userId);
              console.log('Fetched user UID:', userId);

              // Fetch scheduled shifts
              const fetchedShifts: MarkedDates = {};
              const dates = ['2025-06-02', '2025-06-12']; // Keep all dates for calendar
              
              for (const date of dates) {
                const datesSnapshot = await firestore()
                  .collection('gwm')
                  .doc(userId)
                  .collection('scheduledShiftsDetails')
                  .doc('2023-10')
                  .collection(date)
                  .get();
                
                // Get all jobs for this date
                const jobs: Job[] = [];
                datesSnapshot.forEach((doc) => {
                  const data = doc.data();
                  if (data) {
                    jobs.push({
                      id: doc.id,
                      shiftStart: data.shiftStart,
                      shiftEnd: data.shiftEnd,
                      pay: data.pay,
                      location: data.location,
                      assignedBy: data.assignedBy,
                    });
                  }
                });

                if (jobs.length > 0) {
                  fetchedShifts[date] = {
                    status: 'scheduled',
                    marked: true,
                    selectedColor: '#00adf5',
                    jobs: jobs
                  };
                }
              }

              setMarkedDates(fetchedShifts);
              console.log('Fetched scheduled shifts:', fetchedShifts);

              // Fetch day off requests
              await fetchDayOffRequests(userId);
              console.log('Data fetching complete.');

            } else {
              console.error('User document not found for session email:', session.email);
              Alert.alert('Error', 'User not found in database.');
            }
          } else {
            console.log('Session found but not authenticated or missing email.');
            Alert.alert('Session Invalid', 'Please sign in again.');
          }
        } else {
          console.log('No user session found.');
          Alert.alert('Not Logged In', 'Please sign in to view your schedule.');
        }

      } catch (error) {
        console.error('Error in loadUserAndData:', error);
        Alert.alert('Error', 'Failed to load schedule data.');
      } finally {
        setLoading(false);
      }
    };

    loadUserAndData();
  }, [currentMonthYear]);

  // Handler for the submit button - potentially update to use saveScheduledShifts
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // Use currentUserId from state
      if (!currentUserId) {
        Alert.alert('Error', 'User not logged in.');
        setIsSubmitting(false);
        return;
      }

      // TODO: Instead of just saving total hours, save the detailed shifts data
      // You would likely save the `markedDates` object or a derived structure
      // await saveScheduledShifts(currentUserId, currentMonthYear, markedDates);

      // The existing logic for saving total hours can be removed or adjusted
      const totalHours = calculateTotalWorkingHoursForMonth(markedDates, currentMonthYear);
      await firestore()
        .collection('gwm') // Changed from 'users' to 'gwm'
        .doc(currentUserId) // Use currentUserId
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
          initialDate={new Date().toISOString().split('T')[0]}
          onDayPress={handleDayPress}
          monthFormat={'yyyy MM'}
          firstDay={1}
          enableSwipeMonths={true}
          markedDates={{
            ...(isRequestingDayOff ? requestedDaysOff : {}),
            ...(!isRequestingDayOff ? { ...markedDates, ...fetchedDayOffRequests } : {}),
            ...(!isRequestingDayOff && selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#00adf5' } } : {}),
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

        {!isRequestingDayOff && selectedDate && (
          <View style={styles.selectedDayDetails}>
            <Text style={styles.selectedDayHeaderText}>Schedule for {selectedDate}:</Text>
            {markedDates[selectedDate]?.jobs?.map((job, idx) => (
              <View key={job.id || idx} style={styles.jobItem}>
                <Text style={styles.jobText}>Shift: {job.shiftStart} - {job.shiftEnd}</Text>
                <Text style={styles.jobText}>Pay: ${job.pay}</Text>
                <Text style={styles.jobText}>Location: {job.location}</Text>
                <Text style={styles.jobText}>Assigned By: {job.assignedBy}</Text>
              </View>
            ))}
            {!markedDates[selectedDate]?.jobs?.length && (
              <Text style={styles.detailText}>No scheduled jobs for this date.</Text>
            )}
          </View>
        )}

        {!isRequestingDayOff && (
          <View style={styles.workingDaysContainer}>
            <Text style={styles.workingDaysTitle}>Next 7 Days Schedule:</Text>
            {Object.entries(markedDates)
              .filter(([date]) => {
                const jobDate = new Date(date);
                const today = new Date();
                const sevenDaysFromNow = new Date();
                sevenDaysFromNow.setDate(today.getDate() + 6);
                return jobDate >= today && jobDate <= sevenDaysFromNow;
              })
              .map(([date, data]) => (
                <View key={date} style={styles.jobItem}>
                  <Text style={styles.workingDayText}>• {date}</Text>
                  {data.jobs?.map((job, idx) => (
                    <View key={job.id || idx} style={styles.jobDetails}>
                      <Text style={styles.jobText}>Shift: {job.shiftStart} - {job.shiftEnd}</Text>
                      <Text style={styles.jobText}>Pay: ${job.pay}</Text>
                      <Text style={styles.jobText}>Location: {job.location}</Text>
                      <Text style={styles.jobText}>Assigned By: {job.assignedBy}</Text>
                    </View>
                  ))}
                </View>
              ))}
            <Text style={styles.totalHoursText}>Total Scheduled Hours ({currentMonthYear}): {totalScheduledHours}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
                isSubmitting && styles.submitButtonSubmitting,
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

        {isRequestingDayOff && (
          <View style={[styles.workingDaysContainer, { backgroundColor: '#fff3e0' }]}>
            <Text style={styles.workingDaysTitle}>Requested Day(s) Off:</Text>
            {Object.keys(requestedDaysOff).length > 0 ? (
              Object.keys(requestedDaysOff).map(date => (
                <View key={date} style={styles.pendingRequestItem}>
                  <Text style={styles.workingDayText}>• {date}</Text>
                  <Pressable 
                    onPress={() => handleDayPress({ dateString: date, day: 0, month: 0, year: 0, timestamp: 0 })} 
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </Pressable>
                </View>
              ))
            ) : (
              <Text style={styles.detailText}>Tap on a date in the calendar to select it for your request.</Text>
            )}
          </View>
        )}
      </ScrollView>

      {isRequestingDayOff && (
        <Pressable
          style={styles.sendInfoButton}
          onPress={() => {
            console.log('Submitting day off requests for:', Object.keys(requestedDaysOff));
            // Use currentUserId from state
            if (currentUserId) {
               saveDayOffRequest(currentUserId, requestedDaysOff);
            } else {
               Alert.alert('Error', 'User not logged in.');
            }
          }}
        >
          <Text style={styles.sendInfoText}>Submit Day Off Request</Text>
        </Pressable>
      )}

      <Pressable 
        style={[styles.holidayButton, isRequestingDayOff && styles.requestButtonActive]}
        onPress={() => setIsRequestingDayOff(!isRequestingDayOff)}
      >
        <Text style={[styles.holidayButtonText, isRequestingDayOff && styles.requestButtonTextActive]}>
          {isRequestingDayOff ? 'Show Schedule' : 'Request Day Off'}
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
  requestButtonActive: {
    backgroundColor: '#FFC107',
  },
  requestButtonTextActive: {
    color: '#333',
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
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
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
  jobItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  jobDetails: {
    marginLeft: 20,
    marginTop: 5,
  },
  jobText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  selectedDayDetails: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#eaf6ff',
    borderRadius: 8,
  },
  selectedDayHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  detailText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  pendingRequestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ffe0b2',
  },
  removeButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default MySchedule;