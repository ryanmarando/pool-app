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
  TouchableOpacity,
} from "react-native";
import { Dialog, Portal, Paragraph } from "react-native-paper";
import HeroImage from "../billiards-logo.png";
import { useState, useEffect, useContext } from "react";
import { doc, setDoc, collection, getDocs, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import ErrorDialogPortal from "../components/ErrorDialogPortal";
import axios from "axios";
import { MapContext } from "./MapContext";

const FindTeamsPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [poolTeams, setPoolTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [filterSkillLevel, setFilterSkillLevel] = useState('');
  const [newTeam, setNewTeam] = useState({
    name: "",
    skillLevel: "",
    availability: "",
    location: "",
    latitude: "",
    longitude: "",
  });
  const auth = getAuth();
  const user = auth.currentUser;
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);
  const [errorTitle, setErrorTitle] = useState("Error");
  const navigation = useNavigation();
  const [sortAscending, setSortAscending] = useState(true);
  const { location } = useContext(MapContext);
  const [originalTeams, setOriginalTeams] = useState(poolTeams);
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    // Fetch tournament locations from Firestore when component mounts
    fetchPoolTeams();
  }, []);

  const filterTeamsBySkillLevel = (skillLevel) => {
    if (!skillLevel || isNaN(skillLevel)) {
      setFilteredTeams(poolTeams); // Reset to full list when no filter or invalid input
      return;
    }
  
    const skillLevelNum = parseInt(skillLevel, 10);
  
    // Sort by proximity to entered skill level
    const filtered = filteredTeams
      .filter((team) => team.skillLevel) // Ensure team has a skill level
      .sort((a, b) => {
        const diffA = Math.abs(a.skillLevel - skillLevelNum);
        const diffB = Math.abs(b.skillLevel - skillLevelNum);
        return diffA - diffB; // Sort by closest skill level
      });
  
    setFilteredTeams(filtered);
  };

  const haversineDistance = (coords1, coords2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers
  
    const dLat = toRad(coords2.latitude - coords1.latitude);
    const dLon = toRad(coords2.longitude - coords1.longitude);
  
    const lat1 = toRad(coords1.latitude);
    const lat2 = toRad(coords2.latitude);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  const sortTeamsByDistance = () => {
    if (!location || loading) {
      return;
    }
  
    const sortedTeams = [...filteredTeams].sort((a, b) => {
      const isValidA = a.latitude && a.longitude;
      const isValidB = b.latitude && b.longitude;
    
      const distanceA = haversineDistance(location.coords, a);
      const distanceB = haversineDistance(location.coords, b);
    
  
      return distanceA - distanceB; // Sort based on distance
    });
  
    setFilteredTeams(sortedTeams);
  };

    // Function to reset to the original team order (unsort)
  const unsortTeams = () => {
  setFilteredTeams(originalTeams);
};
  
  const successMessagePopUp = () => {
    if (!user) {
      setErrorTitle("Error");
      setShowSignIn(true);
      setError("Please sign in to join a team!" );
      showDialog();
      return
    }
    setErrorTitle("Success");
    setError(
      "The poster has be notified of your interest and may be in contact if they see fit."
    );
    showDialog();
  };

  const fetchPoolTeams = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "poolTeams"));
      const teams = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPoolTeams(teams);
      setFilteredTeams(teams);
      setLoading(false);
      console.log("Loaded pool teams");
    } catch (error) {
      setLoading(false);
      console.error("Error fetching pool teams:", error);
    }
  };

  const appendToUserDataBaseArray = async (newValue) => {
    try {
      // Fetch the current userTeamData from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userTeamData = userSnap.data();

      // Check if the `id` field exists and is an array
      if (Array.isArray(userTeamData?.PoolTeamsId)) {
        // Append the new value to the array
        const updatedArray = [...userTeamData.PoolTeamsId, newValue];

        // Update the Firestore document with the modified data
        await setDoc(userRef, { PoolTeamsId: updatedArray }, { merge: true });
        console.log("Array updated successfully.");
      } else {
        id = { PoolTeamsId: [newValue] };
        await setDoc(doc(db, "users", user.uid), id, { merge: true });
      }
    } catch (error) {
      console.error("Error appending to array:", error);
      console.error("Error adding team post:", error);
    }
  };

  const handleAddPoolTeams = async () => {
    if (!newTeam.name || !newTeam.skillLevel || !newTeam.availability || !newTeam.location) {
      setErrorMessage("All fields are required");
      setTimeout(() => setErrorMessage(""), 5000); // Clear success message after 5 seconds
      return;
    }

    setLoading(true);
    try {
      const encodedAddress = encodeURIComponent(newTeam.location);
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=AIzaSyDlTelzP2AlMephGGLm4BEWgInbEwlkrBM`
      );
      const { results } = response.data;
      const { lat, lng } = results[0].geometry.location;
      const id = Math.floor(Math.random() * 1000000);
      if (results.length > 0) {
      const teamData = {
        id: id,
        name: newTeam.name,
        skillLevel: newTeam.skillLevel,
        availability: newTeam.availability,
        location: newTeam.location,
        latitude: lat,
        longitude: lng,
      };
      const teamRef = doc(db, "poolTeams", id.toString());

      await setDoc(teamRef, teamData, { merge: true });
      await appendToUserDataBaseArray(teamData.id);
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
        location: "",
      });
      } else {
        console.error("Location not found", error);
        setErrorMessage("Location not found");
        setTimeout(() => setErrorMessage(""), 5000);
      }
    } catch (error) {
      console.error("Error adding team post:", error);
      setErrorMessage("Error adding team post");
    } finally {
      setLoading(false); // Set loading to false after the request completes
    }
  };

  const handlePostTeamButton = () => {
    if (!user) {
      setError("Please login to post your own team.");
      showDialog();
    } else {
      setModalVisible(true);
      setSuccessMessage("");
      setErrorMessage("");
    }
  };

  const renderTeamItem = ({ item }) => (
    <View style={styles.teamItem}>
      <Text style={styles.teamName}>{item.name}</Text>
      <Text style={styles.skillLevel}>
        Skill Level Wanted: {item.skillLevel}
      </Text>
      <Text style={styles.availability}>Availability: {item.availability}</Text>
      <Text style={styles.availability}>{item.location}</Text>
      <TouchableOpacity>
        <Text style={styles.joinButton} onPress={successMessagePopUp}>
          Join Team
        </Text>
      </TouchableOpacity>
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
      <View style={[{alignItems: "center", marginTop: 10}]}>
      <TextInput
       style={[styles.input, { alignItems: "center" }]} 
         placeholder="Enter Skill Level"
         placeholderTextColor="#333"
          value={filterSkillLevel}
          onChangeText={(text) => {
          setFilterSkillLevel(text);
        filterTeamsBySkillLevel(text); // Trigger filter on input change
            }}
  keyboardType="numeric" // Ensure numeric input
/>
</View>
<View style={styles.buttonView}>
<Button title="Sort by Distance" onPress={sortTeamsByDistance} />
</View>
<View style={[styles.buttonView, {marginTop: 10}]}>
    <Button title="Unsort" onPress={unsortTeams} />
  </View>
{filteredTeams.length > 0 ? (
  <FlatList
  style={styles.flatListView}
  data={filteredTeams}
  renderItem={renderTeamItem}
  keyExtractor={(item) => item.id.toString()}
  refreshing={loading}
  onRefresh={fetchPoolTeams}
/>
) : (
  <FlatList
    style={styles.flatListView}
    data={poolTeams}
    renderItem={renderTeamItem}
    keyExtractor={(item) => item.id.toString()}
    refreshing={loading}
    onRefresh={fetchPoolTeams}
  />
)}
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
            keyboardType="numeric"
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
          <TextInput
            style={styles.input}
            placeholder="City"
            placeholderTextColor="#333" // Darker placeholder color
            value={newTeam.location}
            onChangeText={(text) =>
              setNewTeam({ ...newTeam, location: text })
            }
          />
          {loading ? (
            <ActivityIndicator size="small" color="#007bff" /> // Show loading indicator when loading
          ) : (
            <>
              <Button title="Add Your Team" onPress={handleAddPoolTeams} />
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
        <Button title="Post Your Own Team" onPress={handlePostTeamButton} />
      </View>
      <ErrorDialogPortal
        title={errorTitle}
        visible={visible}
        error={error}
        hideDialog={hideDialog}
        showSignIn={showSignIn}
      />
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
    width: "90%",
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
