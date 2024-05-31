// SignInPage.js
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Dialog,
  Portal,
  Paragraph,
} from "react-native-paper";
import { useAuth } from "../AuthContext";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import app from "../firebaseConfig"; // Import your firebaseConfig

const SignInPage = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const { signIn } = useAuth();

  const showDialog = () => {
    setVisible(true);
  };
  const hideDialog = () => setVisible(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please provide both email and password");
      showDialog();
      return;
    }

    try {
      await signIn(email, password);
      console.log("After sign-in (success)");
    } catch (err) {
      setError(err.message);
      showDialog();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button mode="contained" onPress={handleSignIn} style={styles.button}>
        Sign In
      </Button>
      <Button
        mode="text"
        onPress={() => navigation.navigate("SignUp")}
        style={styles.button}
      >
        Don't have an account? Sign Up
      </Button>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Error</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{error}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  error: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
});

export default SignInPage;
