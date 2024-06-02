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
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import axios from "axios";
import { Linking } from "react-native";

const TournamentMapPage = () => {
  const [location, setLocation] = useState(null);
  const [tournamentLocations, setTournamentLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locLoading, setLocLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [locationModalVisible, setlocationModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [newTournament, setNewTournament] = useState({
    title: "",
    description: "",
    location: "",
    time: "",
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
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    // Fetch tournament locations from Firestore when component mounts
    fetchTournamentLocations();
  }, []);

  const handleMarkerPress = (location) => {
    setSelectedLocation(location);
    setlocationModalVisible(true);
  };

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
      console.log("Loaded tournament locations");
    } catch (error) {
      console.error("Error fetching tournament locations:", error);
    }
  };

  const handleAddTournament = async () => {
    if (
      !newTournament.title ||
      !newTournament.description ||
      !newTournament.location ||
      !newTournament.time
    ) {
      setErrorMessage("All fields are required");
      setTimeout(() => setErrorMessage(""), 5000); // Clear success message after 5 seconds
      return;
    }
    setLocLoading(true);
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${newTournament.location}&key=AIzaSyAikQ-XwdscIumcQZH4tj5lNLGl7aI3AZc`
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
          location: newTournament.location,
          time: newTournament.time,
        };

        // Create a reference to a new document with the generated ID
        const locationRef = doc(db, "tournamentLocations", id.toString());

        // Set the document data, merging with existing data if the document already exists
        await setDoc(locationRef, locationData, { merge: true });
        setSuccessMessage("Location added successfully");
        setTimeout(() => {
          setSuccessMessage("");
          setModalVisible(false);
        }, 2000);
        fetchTournamentLocations();
        setNewTournament({
          title: "",
          description: "",
          location: "",
          time: "",
        });
      } else {
        console.error("Location not found");
      }
    } catch (error) {
      console.error("Error adding tournament location:", error);
      setErrorMessage("Error adding tournament location");
    } finally {
      setLocLoading(false);
    }
  };

  const openMapsApp = (latitude, longitude) => {
    const location = `${latitude},${longitude}`;
    const appleMapsUrl = `http://maps.apple.com/?daddr=${location}&dirflg=d`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location}`;
    const wazeUrl = `https://waze.com/ul?ll=${location}&navigate=yes`;

    Linking.canOpenURL(appleMapsUrl).then((supported) => {
      if (supported) {
        Linking.openURL(appleMapsUrl);
      } else {
        Linking.canOpenURL(googleMapsUrl).then((supported) => {
          if (supported) {
            Linking.openURL(googleMapsUrl);
          } else {
            Linking.openURL(wazeUrl);
          }
        });
      }
    });
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
              showsUserLocation={true} // Display user's location
              userLocationAnnotationTitle="Your Location"
              onMapReady={() => {
                setTimeout(() => {
                  setMapReady(true); // initially this state is false
                }, 1000);
              }}
            >
              {tournamentLocations.map((loc) => (
                <Marker
                  key={loc.id}
                  coordinate={{
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                  }}
                  onPress={() => handleMarkerPress(loc)}
                >
                  <Callout>
                    <View style={styles.callout}>
                      <Text style={styles.title}>{loc.title}</Text>
                      <Text style={styles.description}>{loc.description}</Text>
                      <Text style={styles.location}>{loc.time}</Text>
                      <Text style={styles.location}>{loc.location}</Text>
                    </View>
                  </Callout>
                </Marker>
              ))}
            </MapView>
            <Button
              title="Add Tournament Location"
              onPress={() => {
                setModalVisible(true);
                setSuccessMessage("");
                setErrorMessage("");
              }}
            />
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalView}>
                <Text style={styles.modalTextViewHeader}>
                  Add your pool place:
                </Text>
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
                  placeholder="Time"
                  placeholderTextColor="#333" // Darker placeholder color
                  value={newTournament.time}
                  onChangeText={(text) =>
                    setNewTournament({ ...newTournament, time: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Address"
                  placeholderTextColor="#333" // Darker placeholder color
                  value={newTournament.location}
                  onChangeText={(text) =>
                    setNewTournament({ ...newTournament, location: text })
                  }
                />
                {locLoading ? (
                  <ActivityIndicator size="small" color="#007bff" /> // Show loading indicator when loading
                ) : (
                  <>
                    <Button
                      title="Add Your Team"
                      onPress={handleAddTournament}
                    />
                    <Button
                      title="Cancel"
                      onPress={() => setModalVisible(false)}
                    />
                  </>
                )}
                {errorMessage && (
                  <Text style={styles.errorMessage}>Error: {errorMessage}</Text>
                )}
                {successMessage && (
                  <Text style={styles.successMessage}>
                    Success: {successMessage}
                  </Text>
                )}
              </View>
            </Modal>
            {selectedLocation && (
              <Modal
                animationType="slide"
                transparent={true}
                visible={locationModalVisible}
                onRequestClose={() => {
                  setlocationModalVisible(!locationModalVisible);
                }}
              >
                <View style={styles.modalView}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                      {selectedLocation.title}
                    </Text>
                    <Text style={styles.modalDescription}>
                      {selectedLocation.description}
                    </Text>
                    <Text style={styles.modalDescription}>
                      {selectedLocation.location}
                    </Text>
                    <Button
                      title="Get directions"
                      onPress={() =>
                        openMapsApp(
                          selectedLocation.latitude,
                          selectedLocation.longitude
                        )
                      }
                    ></Button>
                    <Text style={styles.modalDescription}>
                      {selectedLocation.time}
                    </Text>
                    <View>
                      <Text>5 people are going.</Text>
                      <Button title="Want to go?"></Button>
                    </View>
                    <Button
                      title="Close"
                      mode="contained"
                      onPress={() =>
                        setlocationModalVisible(!locationModalVisible)
                      }
                    ></Button>
                  </View>
                </View>
              </Modal>
            )}
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
  callout: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  title: {
    fontWeight: "bold",
  },
  location: {
    color: "gray",
  },
  errorModalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  errorModalText: {
    fontSize: 18,
    color: "red",
    marginBottom: 15,
  },
  errorMessage: {
    color: "red",
    marginTop: 10,
  },
  successMessage: {
    color: "green",
    marginTop: 10,
  },
});

export default TournamentMapPage;
