import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

const ProfilePage = () => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.profileImage}
        source={{ uri: "https://example.com/profile-image.jpg" }}
      />
      <Text style={styles.name}>John Doe</Text>
      <Text style={styles.email}>john.doe@example.com</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Age:</Text>
        <Text style={styles.infoText}>30</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Location:</Text>
        <Text style={styles.infoText}>New York, USA</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Interests:</Text>
        <Text style={styles.infoText}>Billiards, Music, Travel</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "top",
    backgroundColor: "#fff",
    backgroundColor: "#00a9ff",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: "bold",
    marginRight: 10,
  },
  infoText: {
    fontSize: 16,
  },
});

export default ProfilePage;
