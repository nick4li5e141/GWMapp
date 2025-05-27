import { Box, Button, Heading } from '@gluestack-ui/themed';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';

interface ImagePickerResponse {
  uri: string;
  width: number;
  height: number;
  type: string;
}

export default function Upload(): JSX.Element {
  const upload = async (): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });

      if (!result.canceled) {
        console.log(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  return (
    <Box style={{ marginLeft: 40, alignItems: 'center' }}>
      <Heading style={{ marginBottom: 32, marginTop: 48, color: '#64748b', fontSize: 24 }}>Upload Image</Heading>
      <Button 
        style={{ marginTop: 32 }}
        onPress={upload}
      >
        Click to Upload
      </Button>
    </Box>
  );
} 