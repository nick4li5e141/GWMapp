import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
}

interface MarkedDates {
  [date: string]: MarkedDate;
}

const MySchedule = () => {
  const [showHolidays, setShowHolidays] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHolidays, setSelectedHolidays] = useState<MarkedDates>({});

  const markedDates: MarkedDates = {
    '2023-10-25': { selected: true, marked: true, selectedColor: '#00adf5' },
    '2023-10-26': { marked: true },
    '2023-10-27': { marked: true, dotColor: 'red', activeOpacity: 0 },
    '2023-10-28': { disabled: true, disableTouchEvent: true }
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
              <Text key={date} style={styles.workingDayText}>• {date}</Text>
            ))}
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
  }
});

export default MySchedule;
