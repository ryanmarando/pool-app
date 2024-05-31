import React, { useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useAuth } from "../AuthContext";

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      navigation.navigate("SignIn");
    }
  }, [user, navigation]);

  if (!user) {
    return null; // Render nothing if the user is not authenticated
  }

  return (
    <View style={styles.container}>
      <Text>Welcome, {user.email}</Text>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfileScreen;
