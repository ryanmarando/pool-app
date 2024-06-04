import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Button,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  getDoc,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import axios from "axios";
import { Linking } from "react-native";
import { getAuth } from "firebase/auth";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";

const TournamentMapPage = () => {
  const [location, setLocation] = useState(null);
  const [tournamentLocations, setTournamentLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locLoading, setLocLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [locationModalVisible, setlocationModalVisible] = useState(false);
  const [tournamentListVisible, setTournamentListVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [countGoingButton, setCountGoingButton] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [newTournament, setNewTournament] = useState({
    title: "",
    description: "",
    location: "",
    time: "",
  });
  const auth = getAuth();
  const user = auth.currentUser;
  const mapRef = useRef(null);

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

  useFocusEffect(
    useCallback(() => {
      // Fetch user data when the screen is focused
      fetchTournamentLocations();
    }, [])
  );

  const handleMarkerPress = async (location) => {
    if (!user) {
      setCountGoingButton(false);
      setSelectedLocation(location);
      setlocationModalVisible(true);
      setIsFavorite(false);
      return;
    }
    setCountGoingButton(false);
    setSelectedLocation(location);
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userTeamData = userSnap.data();
    if (
      user &&
      userTeamData.FavoriteTournamentsId &&
      userTeamData.FavoriteTournamentsId.includes(location.id)
    ) {
      setIsFavorite(true);
    } else {
      setIsFavorite(false);
    }
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

  const appendToUserDataBaseArray = async (newValue) => {
    try {
      // Fetch the current userTeamData from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userTeamData = userSnap.data();

      // Check if the `id` field exists and is an array
      if (Array.isArray(userTeamData?.TournamentsId)) {
        // Append the new value to the array
        const updatedArray = [...userTeamData.TournamentsId, newValue];

        // Update the Firestore document with the modified data
        await setDoc(userRef, { TournamentsId: updatedArray }, { merge: true });
        console.log("Array updated successfully.");
      } else {
        id = { TournamentsId: [newValue] };
        await setDoc(doc(db, "users", user.uid), id, { merge: true });
      }
    } catch (error) {
      console.error("Error appending to array:", error);
      console.error("Error adding team post:", error);
    }
  };

  const toggleFavorite = async () => {
    setIsFavorite(!isFavorite);
    if (!isFavorite) {
      try {
        // Fetch the current userTeamData from Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userTeamData = userSnap.data();

        // Check if the `id` field exists and is an array
        if (Array.isArray(userTeamData?.FavoriteTournamentsId)) {
          console.log("updating exisiting");
          // Append the new value to the array
          const updatedArray = [
            ...userTeamData.FavoriteTournamentsId,
            selectedLocation.id,
          ];

          // Update the Firestore document with the modified data
          await setDoc(
            userRef,
            { FavoriteTournamentsId: updatedArray },
            { merge: true }
          );
          console.log("Array updated successfully.");
        } else {
          console.log("new field");
          id = { FavoriteTournamentsId: [selectedLocation.id] };
          await setDoc(doc(db, "users", user.uid), id, { merge: true });
        }
        console.log("Favorited ", selectedLocation.id);
      } catch {
        console.error("Error favoriting");
      }
    } else {
      try {
        const userRef = doc(db, "users", user.uid);
        // Only call arrayRemove if id is not null or undefined
        await updateDoc(userRef, {
          FavoriteTournamentsId: arrayRemove(selectedLocation.id),
        });

        console.log(`Deleted favorite with ID: ${selectedLocation.id}`);
      } catch (error) {
        console.error(
          `Error deleting team with ID: ${selectedLocation.id}`,
          error
        );
      }
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
          countGoing: 1,
        };

        // Create a reference to a new document with the generated ID
        const locationRef = doc(db, "tournamentLocations", id.toString());

        // Set the document data, merging with existing data if the document already exists
        await setDoc(locationRef, locationData, { merge: true });
        await appendToUserDataBaseArray(locationData.id);

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
        setErrorMessage("Location not found");
        setTimeout(() => setErrorMessage(""), 5000);
      }
    } catch (error) {
      console.error("Error adding tournament location:", error);
      setErrorMessage("Error adding tournament location");
      setTimeout(() => setErrorMessage(""), 5000);
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

  const renderTournamentItem = ({ item }) => {
    return (
      <View style={styles.tournamentItem}>
        <View>
          <Text style={styles.tournamentTime}>{item.time}</Text>
          <Text style={styles.tournamentTitle}>{item.title}</Text>
          <Text style={styles.tournamentDescription}>{item.description}</Text>
          <Text style={styles.tournamentDescription}>At {item.location}</Text>
        </View>
        <View style={styles.directionButtonContainer}>
          <Button
            title="Get directions"
            onPress={() => openMapsApp(item.latitude, item.longitude)}
          ></Button>
        </View>
      </View>
    );
  };

  const handleGoingToTournament = async () => {
    try {
      setCountGoingButton(true);
      // Create a reference to a new document with the generated ID
      const locationCountRef = doc(
        db,
        "tournamentLocations",
        selectedLocation.id.toString()
      );
      const userLocSnap = await getDoc(locationCountRef);
      const userLocData = userLocSnap.data();
      const newCount = userLocData.countGoing + 1;
      await setDoc(locationCountRef, { countGoing: newCount }, { merge: true });
      fetchTournamentLocations();
      console.log("Added a person going!");
    } catch {
      console.error("Error adding person to tournament");
    }
  };

  const CustomCallout = ({ location }) => (
    <View style={styles.callout}>
      <Text style={styles.title}>{location.title}</Text>
    </View>
  );

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
              ref={mapRef}
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
                  <View>
                    <Icon name="map-marker" size={30} color="red" />
                    <CustomCallout location={loc} />
                  </View>
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
            <View style={styles.buttonContainer}>
              <Button
                title="Show Tournaments"
                onPress={() => {
                  setTournamentListVisible(true);
                }}
              />
            </View>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}
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
                      title="Add Your Tournament"
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
                  setSelectedLocation(null);
                  setlocationModalVisible(!locationModalVisible);
                }}
              >
                <View style={styles.modalView}>
                  <TouchableOpacity
                    style={styles.favoriteIcon}
                    onPress={toggleFavorite}
                  >
                    <Icon
                      name={isFavorite ? "star" : "star-o"}
                      size={30}
                      color={isFavorite ? "#FFD700" : "#000"}
                    />
                  </TouchableOpacity>

                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                      {selectedLocation.title}
                    </Text>
                    <Text style={styles.modalDescription}>
                      {selectedLocation.description}
                    </Text>

                    <Text style={styles.modalLocation}>
                      {selectedLocation.location}
                    </Text>
                    <Text style={styles.modalLocation}>
                      On {selectedLocation.time}
                    </Text>
                    <View style={styles.getDirectionsButton}>
                      <Button
                        title="Get directions"
                        onPress={() =>
                          openMapsApp(
                            selectedLocation.latitude,
                            selectedLocation.longitude
                          )
                        }
                      ></Button>
                    </View>
                    <View>
                      {countGoingButton ? (
                        // Show loading indicator when loading
                        <Button title="See you there!"></Button>
                      ) : (
                        <View>
                          <Text>
                            {selectedLocation.countGoing} people are going!
                          </Text>
                          <Button
                            title="Want to go?"
                            onPress={handleGoingToTournament}
                          ></Button>
                        </View>
                      )}
                    </View>
                    <Button
                      title="Close"
                      color="red"
                      mode="contained"
                      onPress={() =>
                        setlocationModalVisible(!locationModalVisible)
                      }
                    ></Button>
                  </View>
                </View>
              </Modal>
            )}
            <Modal
              animationType="slide"
              transparent={true}
              visible={tournamentListVisible}
              onRequestClose={() => setTournamentListVisible(false)}
            >
              <View style={styles.modalView}>
                <Text style={styles.modalTextViewHeader}>Tournament List</Text>
                <FlatList
                  style={styles.flatListView}
                  data={tournamentLocations}
                  renderItem={renderTournamentItem}
                  keyExtractor={(item) => item.id.toString()}
                />
                <Button
                  title="Close"
                  onPress={() => setTournamentListVisible(false)}
                />
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
  buttonContainer: {
    position: "absolute",
    top: 50,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    width: 220,
  },
  modalView: {
    margin: 20,
    marginTop: 70,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    paddingBottom: 7,
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
    maxHeight: 600,
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
    fontSize: 15,
    marginBottom: 8,
    textAlign: "center",
  },
  modalLocation: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: "center",
  },
  getDirectionsButton: {
    paddingBottom: 15,
  },
  modalTextViewHeader: {
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 15,
  },
  favoriteIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
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
  flatListView: {
    width: "100%",
  },
  tournamentItem: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    width: "100%",
  },
  directionButtonContainer: {
    flex: 1,
    alignItems: "flex-end", // Align children to the right
    justifyContent: "center",
  },
  tournamentTime: {
    fontWeight: "bold",
    color: "#333",
  },
  tournamentTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  tournamentDescription: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 5,
  },
  tournamentCreatedBy: {
    fontStyle: "italic",
    color: "#555",
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
