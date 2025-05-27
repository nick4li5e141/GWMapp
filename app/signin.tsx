import { MaterialIcons } from '@expo/vector-icons';
import { Button, Center, Container, Heading, Icon, Input, Pressable } from '@gluestack-ui/themed';
import auth from '@react-native-firebase/auth';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './_layout';

GoogleSignin.configure({
  webClientId: '741858069689-gj2e94lquffkmc5cjpt5bjiakv70vufl.apps.googleusercontent.com',
});

export default function Signin(): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [show, setShow] = useState<boolean>(false);
  const { signIn } = useAuth();

  const signin = async (): Promise<void> => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      signIn();
    } catch (err) {
      console.error(err);
      Alert.alert('Error!');
    }
  };

  const onGoogleButtonPress = async (): Promise<void> => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
      signIn();
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Google Sign-In Error');
    }
  };

  return (
    <Container ml={"10%"} alignItems={"center"}>
      <Center>
        <Heading mb={"20%"} mt={"30%"} color={"blueGray.700"} size="lg">Sign In</Heading>

        <Input
          mt={"0%"}
          variant="rounded"
          value={email}
          onChangeText={setEmail}
          placeholder="E-mail"
        />

        <Input
          w={{
            mt: "5%",
            base: "75%",
            md: "25%"
          }}
          type={show ? "text" : "password"}
          variant="rounded"
          value={password}
          onChangeText={setPassword}
          mt={"10%"}
          InputRightElement={
            <Pressable onPress={() => setShow(!show)}>
              <Icon
                as={<MaterialIcons name={show ? "visibility" : "visibility-off"} />}
                size={5}
                mr="2"
                color="muted.400"
              />
            </Pressable>
          }
          placeholder="Password"
        />

        <Button
          size="lg"
          mt={"20%"}
          fontSize={"4%"}
          colorScheme={"cyan"}
          onPress={signin}
        >
          Sign In
        </Button>

        <GoogleSigninButton
          style={{ marginTop: "10%" }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={onGoogleButtonPress}
        />
      </Center>
    </Container>
  );
} 