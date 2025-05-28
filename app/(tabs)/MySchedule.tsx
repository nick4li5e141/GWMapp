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
}

interface MarkedDates {
  [date: string]: MarkedDate;
}

const MySchedule = () => {
  const [showHolidays, setShowHolidays] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const markedDates: MarkedDates = {
    '2023-10-25': { selected: true, marked: true, selectedColor: '#00adf5' },
    '2023-10-26': { marked: true },
    '2023-10-27': { marked: true, dotColor: 'red', activeOpacity: 0 },
    '2023-10-28': { disabled: true, disableTouchEvent: true }
  };

  const holidayDates: MarkedDates = {
    '2023-11-01': { marked: true, dotColor: '#4CAF50', textColor: '#4CAF50' },
    '2023-11-02': { marked: true, dotColor: '#4CAF50', textColor: '#4CAF50' },
    '2023-11-03': { marked: true, dotColor: '#4CAF50', textColor: '#4CAF50' },
    '2023-11-06': { marked: true, dotColor: '#4CAF50', textColor: '#4CAF50' },
    '2023-11-07': { marked: true, dotColor: '#4CAF50', textColor: '#4CAF50' },
    '2023-11-08': { marked: true, dotColor: '#4CAF50', textColor: '#4CAF50' },
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    console.log('selected day', day);
  };

  const workingDatesList = Object.keys(markedDates).filter(
    date => !markedDates[date].disabled
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Schedule</Text>

      <ScrollView style={{ flex: 1 }}>
        <Calendar
          style={styles.calendar}
          initialDate={'2023-10-25'}
          onDayPress={handleDayPress}
          onDayLongPress={(day: DateData) => { console.log('long pressed day', day) }}
          monthFormat={'yyyy MM'}
          onMonthChange={(month: DateData) => { console.log('month changed', month) }}
          firstDay={1}
          enableSwipeMonths={true}
          markedDates={{
            ...(showHolidays ? holidayDates : markedDates),
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
            textDayHeaderFontSize: 16,
            'stylesheet.calendar.day.basic': {
              base: {
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4
              },
              selected: {
                backgroundColor: '#00adf5',
                borderRadius: 4
              },
              today: {
                backgroundColor: '#e6f7ff',
                borderRadius: 4
              }
            }
          }}
        />

        <View style={styles.workingDaysContainer}>
          <Text style={styles.workingDaysTitle}>Days You're Scheduled to Work:</Text>
          {workingDatesList.map(date => (
            <Text key={date} style={styles.workingDayText}>• {date}</Text>
          ))}
        </View>
      </ScrollView>

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
});

export default MySchedule;
