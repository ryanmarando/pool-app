// FindTeamsPage.js
import React from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";

const teamsData = [
  { id: 1, name: "Team A", players: ["Player 1", "Player 2"] },
  { id: 2, name: "Team B", players: ["Player 3", "Player 4"] },
  // Add more teams as needed
];

const FindTeamsPage = () => {
  const renderTeamItem = ({ item }) => (
    <View style={styles.teamItem}>
      <Text style={styles.teamName}>{item.name}</Text>
      <Text style={styles.players}>Players: {item.players.join(", ")}</Text>
      <Text style={styles.joinButton}>Join Team</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.heroSection}>
        <Image
          style={styles.heroImage}
          source={{ uri: "https://example.com/hero-image.jpg" }} // Replace with a relevant billiards image URL
        />
        <Text style={styles.heroText}>Find a team!</Text>
      </View>
      <FlatList
        data={teamsData}
        renderItem={renderTeamItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00a9ff", // Background color of the entire page
    padding: 10,
  },
  teamItem: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 10,
    borderRadius: 5,
    elevation: 2,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  players: {
    marginTop: 5,
  },
  joinButton: {
    marginTop: 10,
    color: "#007bff", // Change color as needed
    fontWeight: "bold",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  heroImage: {
    width: "100%",
    height: 25,
    borderRadius: 10,
  },
  heroText: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "white", // Adjust text color for better contrast
  },
});

export default FindTeamsPage;
