import { Box, Heading, Pressable, Text, VStack } from '@gluestack-ui/themed';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

interface MediaItem {
  uri: string;
  type: 'photo' | 'video';
  name: string;
}

export default function Upload(): JSX.Element {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);

  const pickMedia = async (type: 'photo' | 'video'): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'photo' 
          ? ImagePicker.MediaTypeOptions.Images 
          : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });

      if (!result.canceled) {
        const newMedia: MediaItem = {
          uri: result.assets[0].uri,
          type: type,
          name: result.assets[0].uri.split('/').pop() || 'unnamed'
        };
        setSelectedMedia(prev => [...prev, newMedia]);
      }
    } catch (error) {
      console.error('Error picking media:', error);
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (selectedMedia.length === 0) {
      console.log('No media selected');
      return;
    }
    
    // Here you would implement your actual upload logic
    console.log('Uploading media:', selectedMedia);
    // After successful upload:
    setSelectedMedia([]);
  };

  return (
    <Box style={styles.container}>
      <Heading style={styles.title}>Upload Media</Heading>
      
      <VStack style={styles.buttonContainer}>
        <Pressable 
          style={styles.mediaButton}
          onPress={() => pickMedia('photo')}
        >
          <Text style={styles.buttonText}>Select Photos</Text>
        </Pressable>

        <Pressable 
          style={styles.mediaButton}
          onPress={() => pickMedia('video')}
        >
          <Text style={styles.buttonText}>Select Videos</Text>
        </Pressable>
      </VStack>

      {selectedMedia.length > 0 && (
        <Box style={styles.selectedMediaContainer}>
          <Text style={styles.selectedMediaTitle}>
            Selected Items ({selectedMedia.length})
          </Text>
          {selectedMedia.map((item, index) => (
            <Text key={index} style={styles.mediaItem}>
              • {item.name} ({item.type})
            </Text>
          ))}
        </Box>
      )}

      <Pressable 
        style={[
          styles.uploadButton,
          selectedMedia.length === 0 && styles.uploadButtonDisabled
        ]}
        onPress={handleUpload}
        disabled={selectedMedia.length === 0}
      >
        <Text style={styles.uploadButtonText}>Upload</Text>
      </Pressable>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    color: '#64748b',
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  mediaButton: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedMediaContainer: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  selectedMediaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 10,
  },
  mediaItem: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 