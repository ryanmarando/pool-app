// SignUpPage.js
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
import { db } from "../firebaseConfig";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import app from "../firebaseConfig"; // Import your firebaseConfig

const SignUpPage = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const auth = getAuth(app); // Initialize Firebase Auth
  const db = getFirestore(app); // Initialize Firestore

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const handleSignUp = async () => {
    if (!firstName || !lastName) {
      setError("First and last name are required");
      showDialog();
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      showDialog();
      return;
    }
    try {
      console.log("Attempting to sign up...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User credential:", userCredential);
      if (!userCredential || !userCredential.user) {
        throw new Error("User registration failed: User not created");
      }
      const user = userCredential.user;

      // Write user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
      })
        .then(() => {
          console.log("User data written to Firestore successfully");
          navigation.navigate("Profile");
        })
        .catch((error) => {
          console.error("Error writing user data to Firestore:", error);
          setError("Error writing user data to Firestore");
          showDialog();
        });
    } catch (err) {
      console.error("Error during sign up:", err);
      setError("An error occurred during sign-up");
      showDialog();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        label="First Name"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
      />
      <TextInput
        label="Last Name"
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
      />
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
      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button mode="contained" onPress={handleSignUp} style={styles.button}>
        Sign Up
      </Button>
      <Button
        mode="text"
        onPress={() => navigation.navigate("SignIn")}
        style={styles.button}
      >
        Already have an account? Sign In
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

export default SignUpPage;
