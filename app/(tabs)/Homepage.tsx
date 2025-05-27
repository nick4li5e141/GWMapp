import React, { ReactElement } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';

interface Styles {
  container: {
    paddingTop: number;
  };
  tinyLogo: {
    width: number;
    height: number;
  };
  logo: {
    width: number;
    height: number;
  };
}

const styles = StyleSheet.create<Styles>({
  container: {
    paddingTop: 50,
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  logo: {
    width: 66,
    height: 58,
  },
});

export default function Homepage(): ReactElement {
  return (
    <View>
      <TextInput
        placeholder="Enter the Name"
      />
      <Image
        style={styles.tinyLogo}
        source={{
          uri: 'https://reactnative.dev/img/tiny_logo.png',
        }}
      />
    </View>
  );
} 