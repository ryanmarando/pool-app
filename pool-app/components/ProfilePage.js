import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useAuth } from "../AuthContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig";

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [userData, setUserData] = useState(null);
  const db = getFirestore(auth.app);

  useEffect(() => {
    if (!user) {
      navigation.navigate("SignIn");
    } else {
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [user, navigation, db]);

  if (!user) {
    return null; // Render nothing if the user is not authenticated
  }

  return (
    <View style={styles.container}>
      {userData ? (
        <>
          <Text>Hi, {userData.firstName}</Text>
          <Text>Welcome, {userData.email}</Text>
        </>
      ) : (
        <Text>Loading user data...</Text>
      )}
      <Button title="Sign Out" onPress={signOut} />
      <View>
        <Text>Your events:</Text>
        <Text>Your teams:</Text>
      </View>
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
