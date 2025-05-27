import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

const MySchedule = () => {
  // You would typically fetch and manage schedule data here
  const markedDates = {
    '2023-10-25': { selected: true, marked: true, selectedColor: 'blue' },
    '2023-10-26': { marked: true },
    '2023-10-27': { marked: true, dotColor: 'red', activeOpacity: 0 },
    '2023-10-28': { disabled: true, disableTouchEvent: true }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Schedule</Text>
      <Calendar
        // Customize the calendar appearance here
        style={styles.calendar}
        // Initially visible month. Default = now
        initialDate={'2023-10-25'} // You might want to use a dynamic date
        // Minimum date that can be selected, dates before minDate will be grayed out.
        // minDate={'2023-01-01'}
        // Maximum date that can be selected, dates after maxDate will be grayed out.
        // maxDate={'2030-12-31'}
        // Handler for day presses
        onDayPress={(day) => { console.log('selected day', day) }}
        // Handler for day long presses
        onDayLongPress={(day) => { console.log('long pressed day', day) }}
        // Month format in calendar title.
        monthFormat={'yyyy MM'}
        // Handler when month changes in calendar
        onMonthChange={(month) => { console.log('month changed', month) }}
        // Hide month navigation arrows.
        // hideArrows={true}
        // Replace default arrows with custom ones (directional icons)
        // renderArrow={(direction) => (<Arrow />)}
        // Do not show days of other months in month page.
        // hideExtraDays={true}
        // If hideArrows=false and hideExtraDays=false do not switch month when tapping on greyed out day
        // disableMonthChange={true}
        // If firstDay=1 week starts from Monday.
        firstDay={1}
        // Hide day names.
        // hideDayNames={true}
        // Show week numbers to the left.
        // showWeekNumbers={true}
        // Handler for press on arrow icon
        // onPressArrowLeft={subtractMonth => subtractMonth()}
        // onPressArrowRight={addMonth => addMonth()}
        // Disable all touch events for disabled days.
        // disableAllTouchEventsForDisabledDays={true}
        // Replace default month and year title with custom one.
        // renderHeader={(date) => (/* Return JSX */)}
        // Enable the option to swipe between months.
        enableSwipeMonths={true}
        // Custom marking for days (e.g., for scheduled jobs)
        markedDates={markedDates} // Example marked dates

        // Basic styling to resemble Google Calendar's look (can be expanded)
        theme={{
          todayTextColor: '#00adf5',
          selectedDayBackgroundColor: '#00adf5',
          selectedDayTextColor: '#ffffff',
          arrowColor: '#00adf5',
          // textMonthFontWeight: 'bold',
          // textDayFontSize: 16,
          // textMonthFontSize: 16,
          // textDayHeaderFontSize: 16,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 5,
  },
});

export default MySchedule;
