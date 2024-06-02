// FindTeamsPage.js
import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Button,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import HeroImage from "../billiards-logo.png";
import { useState, useEffect } from "react";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const teamsData = [
  { id: 1, name: "Team A", players: ["Player 1", "Player 2"] },
  { id: 2, name: "Team B", players: ["Player 3", "Player 4"] },
  // Add more teams as needed
];

const FindTeamsPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [poolTeams, setPoolTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    skillLevel: "",
    availability: "",
  });

  useEffect(() => {
    // Fetch tournament locations from Firestore when component mounts
    fetchPoolTeams();
  }, []);

  const fetchPoolTeams = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "poolTeams"));
      const teams = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPoolTeams(teams);
      console.log("Loaded pool teams");
    } catch (error) {
      console.error("Error fetching pool teams:", error);
    }
  };

  const handleAddTournament = async () => {
    if (!newTeam.name || !newTeam.skillLevel || !newTeam.availability) {
      setErrorMessage("All fields are required");
      setTimeout(() => setErrorMessage(""), 5000); // Clear success message after 5 seconds
      return;
    }

    setLoading(true);
    try {
      const id = Math.floor(Math.random() * 1000000);
      const teamData = {
        id: id,
        name: newTeam.name,
        skillLevel: newTeam.skillLevel,
        availability: newTeam.availability,
      };

      const teamRef = doc(db, "poolTeams", id.toString());

      // Set the document data, merging with existing data if the document already exists
      await setDoc(teamRef, teamData, { merge: true });
      console.log("added");
      setSuccessMessage("Post added successfully");
      setTimeout(() => {
        setSuccessMessage("");
        setModalVisible(false);
      }, 2000);
      console.log("done");
      fetchPoolTeams();
      setNewTeam({
        name: "",
        skillLevel: "",
        availability: "",
      });
    } catch (error) {
      console.error("Error adding team post:", error);
      setErrorMessage("Error adding team post");
    } finally {
      setLoading(false); // Set loading to false after the request completes
    }
  };

  const renderTeamItem = ({ item }) => (
    <View style={styles.teamItem}>
      <Text style={styles.teamName}>{item.name}</Text>
      <Text style={styles.skillLevel}>
        Skill Level Wanted: {item.skillLevel}
      </Text>
      <Text style={styles.availability}>Availability: {item.availability}</Text>
      <Text style={styles.joinButton}>Join Team</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.heroSection}>
        <Image
          style={styles.heroImage}
          source={HeroImage} // Replace with a relevant billiards image URL
        />
        <Text style={styles.heroText}>Find a team!</Text>
      </View>
      <FlatList
        style={styles.flatListView}
        data={poolTeams}
        renderItem={renderTeamItem}
        keyExtractor={(item) => item.id.toString()}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTextViewHeader}>Add your pool team:</Text>
          <TextInput
            style={styles.input}
            placeholder="Team Name"
            placeholderTextColor="#333" // Darker placeholder color
            value={newTeam.name}
            onChangeText={(text) => setNewTeam({ ...newTeam, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Skill Level Wanted"
            placeholderTextColor="#333" // Darker placeholder color
            value={newTeam.skillLevel}
            onChangeText={(text) =>
              setNewTeam({ ...newTeam, skillLevel: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Availability"
            placeholderTextColor="#333" // Darker placeholder color
            value={newTeam.availability}
            onChangeText={(text) =>
              setNewTeam({ ...newTeam, availability: text })
            }
          />
          {loading ? (
            <ActivityIndicator size="small" color="#007bff" /> // Show loading indicator when loading
          ) : (
            <>
              <Button title="Add Your Team" onPress={handleAddTournament} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </>
          )}
          {errorMessage && (
            <Text style={styles.errorMessage}>Error: {errorMessage}</Text>
          )}
          {successMessage && (
            <Text style={styles.successMessage}>Success: {successMessage}</Text>
          )}
        </View>
      </Modal>
      <View style={styles.buttonView}>
        <Button
          mode="contained"
          title="Post Your Own Team"
          onPress={() => {
            setModalVisible(true);
            setSuccessMessage("");
            setErrorMessage("");
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00a9ff", // Background color of the entire page
  },
  flatListView: {
    padding: 15,
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
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
    width: "100%",
    justifyContent: "center",
  },
  heroImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },
  heroText: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "white", // Adjust text color for better contrast
  },
  modalView: {
    margin: 20,
    marginTop: 70,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    paddingBottom: 15,
    paddingTop: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    width: 300,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalTextViewHeader: {
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    width: "100%",
    paddingLeft: 8,
  },
  errorMessage: {
    color: "red",
    marginTop: 10,
  },
  successMessage: {
    color: "green",
    marginTop: 10,
  },
  buttonView: {
    backgroundColor: "lightgrey",
  },
});

export default FindTeamsPage;
