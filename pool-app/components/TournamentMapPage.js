import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Button,
  Modal,
  TextInput,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import axios from "axios";

const TournamentMapPage = () => {
  const [location, setLocation] = useState(null);
  const [tournamentLocations, setTournamentLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTournament, setNewTournament] = useState({
    title: "",
    description: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setLoading(false); // Set loading to false when location is obtained
    })();
  }, []);

  useEffect(() => {
    // Fetch tournament locations from Firestore when component mounts
    fetchTournamentLocations();
  }, []);

  const fetchTournamentLocations = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, "tournamentLocations")
      );
      const locations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTournamentLocations(locations);
      console.log("loaded places");
    } catch (error) {
      console.error("Error fetching tournament locations:", error);
    }
  };

  const handleAddTournament = async () => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${newTournament.location}&AIzaSyAikQ-XwdscIumcQZH4tj5lNLGl7aI3AZc`
      );

      const { results } = response.data;
      if (results.length > 0) {
        const { lat, lng } = results[0].geometry.location;
        const id = Math.floor(Math.random() * 1000000);
        const locationData = {
          id: id,
          title: newTournament.title,
          description: newTournament.description,
          latitude: lat,
          longitude: lng,
        };

        // Create a reference to a new document with the generated ID
        const locationRef = doc(db, "tournamentLocations", id.toString());

        // Set the document data, merging with existing data if the document already exists
        await setDoc(locationRef, locationData, { merge: true });

        console.log("Location added successfully");
        setModalVisible(false);
        fetchTournamentLocations();
        setNewTournament({
          title: "",
          description: "",
          location: "", // Add Location property to newTournament state
        });
      } else {
        console.error("Location not found");
      }
    } catch (error) {
      console.error("Error adding tournament location:", error);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        // Show activity indicator while loading
        <View>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>
            Loading pool places near you...
          </Text>
        </View>
      ) : (
        location && (
          <>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="Your Location"
              />
              {tournamentLocations.map((loc) => (
                <Marker
                  key={loc.id}
                  coordinate={{
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                  }}
                  title={loc.title}
                  description={loc.description}
                />
              ))}
            </MapView>
            <Button
              title="Add Tournament Location"
              onPress={() => setModalVisible(true)}
            />
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalView}>
                <TextInput
                  style={styles.input}
                  placeholder="Title"
                  placeholderTextColor="#333" // Darker placeholder color
                  value={newTournament.title}
                  onChangeText={(text) =>
                    setNewTournament({ ...newTournament, title: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Description"
                  placeholderTextColor="#333" // Darker placeholder color
                  value={newTournament.description}
                  onChangeText={(text) =>
                    setNewTournament({ ...newTournament, description: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Location"
                  placeholderTextColor="#333" // Darker placeholder color
                  value={newTournament.location}
                  onChangeText={(text) =>
                    setNewTournament({ ...newTournament, location: text })
                  }
                />
                <Button title="Add Location" onPress={handleAddTournament} />
                <Button title="Cancel" onPress={() => setModalVisible(false)} />
              </View>
            </Modal>
          </>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    flex: 1,
    width: "100%",
  },
  loadingText: {
    marginTop: 20,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
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
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    width: "100%",
    paddingLeft: 8,
  },
});

export default TournamentMapPage;
