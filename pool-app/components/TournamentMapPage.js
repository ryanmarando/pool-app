import React, { useState, useCallback, useRef, useContext, useEffect } from "react";
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
  TouchableWithoutFeedback,
  ScrollView
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  getDoc,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import {
  Dialog,
  Portal,
  Paragraph,
  Checkbox,
  Provider,
} from "react-native-paper";
import { db } from "../firebaseConfig";
import axios from "axios";
import { Linking } from "react-native";
import { getAuth } from "firebase/auth";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { MapContext } from "./MapContext";
import { openLink } from "../functions/openLink";
import HeaderButton from "../components/HeaderButton";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Timestamp, deleteDoc } from 'firebase/firestore';

const TournamentMapPage = ({ route }) => {
  const [tournamentLocations, setTournamentLocations] = useState([]);
  const [locLoading, setLocLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [locationModalVisible, setlocationModalVisible] = useState(false);
  const [tournamentListVisible, setTournamentListVisible] = useState(false);
  const [favoriteTournamentListVisible, setFavoriteTournamentListVisible] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [isFiltered, setIsFiltered] = useState(true);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);
  const [weeklyChecked, setWeeklyChecked] = useState(false);
  const [oneTimeChecked, setOneTimeChecked] = useState(true);
  const [settingsModalVisible, setSettingsModalVisible] = useState(true);
  const [favoriteTournaments, setFavoriteTournaments] = useState([]);
  const [newTournament, setNewTournament] = useState({
    title: "",
    description: "",
    location: "",
    dateTime: null,
    weeklyChecked: weeklyChecked,
    oneTimeChecked: oneTimeChecked,
    faceBookLink: "",
  });
  const auth = getAuth();
  const user = auth.currentUser;
  const mapRef = useRef(null);
  const navigation = useNavigation();
  const { location, loading } = useContext(MapContext);
  const { showModal } = route.params || {};
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState({ date: true, time: true });

  useEffect(() => {
    deletePastEvents();
  }, []); // Empty dependency array to run once on component mount

  const deletePastEvents = async () => {
    const now = new Date(); // Current date and time
    const querySnapshot = await getDocs(collection(db, 'tournamentLocations'));
  
    querySnapshot.forEach(async (docSnapshot) => {
      const eventData = docSnapshot.data();
      const eventDateTime = eventData.dateTime?.toDate(); // Convert Firestore Timestamp to JS Date
      
      if (eventData.oneTimeChecked && eventDateTime < now) {
        // If event date and time is in the past, delete it
        await deleteDoc(doc(db, 'tournamentLocations', docSnapshot.id));
        console.log(`Deleted event: ${docSnapshot.id}`);
        fetchTournamentLocations();
      }
      else if (eventData.weeklyChecked && eventDateTime < now) {
        console.log("weekly update")
        const eventDateTime = eventData.dateTime?.toDate();
        const newDate = new Date(eventDateTime);
        newDate.setDate(newDate.getDate() + 7);
        // Save the date as a Firestore Timestamp
        const timestamp = Timestamp.fromDate(newDate);
        const updatedTournamentData = {
          dateTime: timestamp,
          // Add any other fields you want to update
      };
        const tournamentRef = doc(db, "tournamentLocations", String(eventData.id)); // Replace with your collection name
        await updateDoc(tournamentRef, updatedTournamentData);
        console.log("Updated weekly event")
        fetchTournamentLocations();
      }
    });
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker({ ...showPicker, date: false });
  
    // Update the date state
    setDate(currentDate);
  
    // Combine with the current time to create a new Date object
    const combinedDateTime = new Date(currentDate);
    combinedDateTime.setHours(time.getHours());
    combinedDateTime.setMinutes(time.getMinutes());
  
    // Save the combined date and time as a Firestore Timestamp
    const timestamp = Timestamp.fromDate(combinedDateTime);
    //console.log('Combined DateTime:', combinedDateTime, 'Timestamp:', timestamp); // Debugging log
    setNewTournament({ ...newTournament, dateTime: timestamp });
  };
  
  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowPicker({ ...showPicker, time: false });
  
    // Update the time state
    setTime(currentTime);
  
    // Combine with the current date to create a new Date object
    const combinedDateTime = new Date(date);
    combinedDateTime.setHours(currentTime.getHours());
    combinedDateTime.setMinutes(currentTime.getMinutes());
  
    // Save the combined date and time as a Firestore Timestamp
    const timestamp = Timestamp.fromDate(combinedDateTime);
    //console.log('Combined DateTime:', combinedDateTime, 'Timestamp:', timestamp); // Debugging log
    setNewTournament({ ...newTournament, dateTime: timestamp });
  };
  
  
  const handleShowDatePicker = () => {
    setShowPicker({ date: true, time: false });
  };

  const handleShowTimePicker = () => {
    setShowPicker({ date: false, time: true });
  };

  useFocusEffect(
    useCallback(() => {
      if (showModal) {
        setModalVisible(true);
      }
      // Fetch user data when the screen is focused
      fetchTournamentLocations();
    }, [showModal])
  );

  const handleMarkerPress = async (location) => {
    if (!user) {
      setSelectedLocation(location);
      setlocationModalVisible(true);
      setIsFavorite(false);
      return;
    }

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
    if (
      user &&
      userTeamData.GoingTournamentsId &&
      userTeamData.GoingTournamentsId.includes(location.id)
    ) {
    } else {
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
    if (!user) {
      setError("Please login to favorite this post.");
      showDialog();
      setlocationModalVisible(false);
      return;
    }
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
      !newTournament.location
    ) {
      setErrorMessage("More fields are required");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }
    else if (!newTournament.dateTime) {
      setErrorMessage("Please enter your date and time");
      setTimeout(() => setErrorMessage(""), 5000);
      return
    }
    if (!weeklyChecked && !oneTimeChecked) {
      setErrorMessage("Please choose if this is weekly or a one time event");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }
    setLocLoading(true);
    try {
      const encodedAddress = encodeURIComponent(newTournament.location);
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=AIzaSyDlTelzP2AlMephGGLm4BEWgInbEwlkrBM`
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
          dateTime: newTournament.dateTime,
          weeklyChecked: weeklyChecked,
          oneTimeChecked: oneTimeChecked,
          faceBookLink: newTournament.faceBookLink,
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
          faceBookLink: "",
        });
        setWeeklyChecked(false);
        setOneTimeChecked(true);
      } else {
        console.error("Location not found", error);
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

  const haversineDistance = (coords1, coords2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Earth's radius in km

    const dLat = toRad(coords2.latitude - coords1.latitude);
    const dLon = toRad(coords2.longitude - coords1.longitude);

    const lat1 = toRad(coords1.latitude);
    const lat2 = toRad(coords2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filterTournamentsByDistance = (
    tournaments,
    userLocation,
    maxDistance
  ) => {
    const filteredTournaments = tournaments.filter((tournament) => {
      const tournamentLocation = {
        latitude: tournament.latitude,
        longitude: tournament.longitude,
      };
      const distance = haversineDistance(userLocation, tournamentLocation);
      return distance <= maxDistance;
    });
    return filteredTournaments;
  };

  const handleFilterTournamentsByDistance = () => {
    if (location) {
      const filtered = filterTournamentsByDistance(
        tournamentLocations,
        location.coords,
        80 // Filter within 80 km
      );
      setFilteredTournaments(filtered);
      setIsFiltered(!isFiltered);
    }
  };

  const renderTournamentItem = ({ item }) => {
    const dateTime = item.dateTime?.toDate ? item.dateTime.toDate() : new Date(item.dateTime);

    return (
      <View style={styles.tournamentItem}>
        <View style={styles.tournamentInfo}>
          <Text style={styles.tournamentTime}>
          {dateTime instanceof Date && !isNaN(dateTime) ? (
                <Text style={styles.tournamentTime}>
                    {dateTime.toLocaleDateString()} at {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </Text>
            ) : (
                <Text style={styles.tournamentTime}>No end date</Text>
            )}
          </Text>
          <Text style={styles.tournamentTitle}>{item.title}</Text>
          <Text style={styles.tournamentDescription}>{item.description}</Text>
          <Text style={styles.tournamentDescription}>At {item.location}</Text>
        </View>
        <View style={styles.directionButtonContainer}>
          <Button
            title="Get Directions"
            onPress={() => openMapsApp(item.latitude, item.longitude)}
          />
          <View>
            {item.faceBookLink ? (
              <View>
                <Button
                  title="Facebook event"
                  onPress={() => openLink(item.faceBookLink)}
                ></Button>
              </View>
            ) : (
              <View></View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const CustomCallout = ({ location }) => (
    <View style={styles.callout}>
      <View style={styles.titleCallout}>
        <Text style={styles.title}>{location.title}</Text>
      </View>
      <Icon name="map-marker" size={30} color="red" />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>
            Loading pool places near you...
          </Text>
        </View>
      </View>
    ); // Render loading indicator while location is being fetched
  }

  // Check if location is available
  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Location not available</Text>
      </View>
    );
  }
  const { latitude, longitude } = location.coords;

  const toggleShowTournaments = async () => {
    setSettingsModalVisible(false);
    setTimeout(() => {
      handleFilterTournamentsByDistance();
      setTournamentListVisible(true);
    }, 500);
    setTimeout(() => {
      setSettingsModalVisible(true);
    }, 300);
  };

  const fetchFavoriteTournaments = async (tournamentIds) => {
    console.log("Fetching favorite tournament IDs:", tournamentIds);
    if (!tournamentIds) {
      return console.log("No favorites to report")
    }
    try {
      const tournaments = await Promise.all(
        tournamentIds.map(async (id) => {
          if (id) {
            const idStr = String(id); // Ensure the ID is a string
            try {
              console.log(`Fetching favorite document for ID: ${idStr}`);
              const tournamentDoc = await getDoc(
                doc(db, "tournamentLocations", idStr)
              );
              if (tournamentDoc.exists()) {
                return tournamentDoc.data();
              } else {
                console.log(`No favorite document found for ID: ${idStr}`);
                // Delete that out of the list if it got deleted
                const userRef = doc(db, "users", user.uid);
                // Only call arrayRemove if id is not null or undefined
                await updateDoc(userRef, {
                  FavoriteTournamentsId: arrayRemove(id),
                });

                console.log(`Deleted favorite with ID: ${id}`);
                return null;
              }
            } catch (error) {
              console.error(
                `Error fetching favorite document for ID: ${idStr}`,
                error
              );
              return null;
            }
          } else {
            console.log(
              "Encountered an undefined or invalid favtournamentId:",
              id
            );
            return null;
          }
        })
      );
      setFavoriteTournaments(
        tournaments.filter((tournament) => tournament !== null)
      );
    } catch (error) {
      console.error("Error fetching posted tournaments:", error);
    }
  };

  const toggleShowFavorites = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setSettingsModalVisible(false);
        await fetchFavoriteTournaments(data.FavoriteTournamentsId);
        setTimeout(() => {
          setFavoriteTournamentListVisible(true);
        }, 500);
        setTimeout(() => {
          setSettingsModalVisible(true);
        }, 300);
      }
    } catch {
      {
        setSettingsModalVisible(false);
        setError("Please login to show your favorite tournaments.");
        showDialog();
        setTimeout(() => {
          setSettingsModalVisible(true);
        }, 300);
        return;
      }
    }
  };

  const ModalTimeConvertComponent = ({ selectedLocation }) => {
    // Check if selectedLocation is defined and has dateTime
    const dateTime = selectedLocation?.dateTime 
        ? selectedLocation.dateTime.toDate() // Convert Firestore timestamp to Date
        : null;

    return (
        <View>
             {dateTime instanceof Date && !isNaN(dateTime) ? (
                <Text style={styles.tournamentTime}>
                    {dateTime.toLocaleDateString()} at {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </Text>
            ) : (
                <Text style={styles.tournamentTime}>No end date</Text>
            )}
        </View>
    );
};

  return (
    <View style={styles.container}>
      {settingsModalVisible ? (
        <HeaderButton
          toggleShowTournaments={toggleShowTournaments}
          toggleShowFavorites={toggleShowFavorites}
        />
      ) : (
        <View></View>
      )}
      {loading ? (
        // Show activity indicator while loading
        <View></View>
      ) : (
        location && (
          <>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude,
                longitude,
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
                    <CustomCallout location={loc} />
                  </View>
                </Marker>
              ))}
            </MapView>
            <Button
              title="Add Tournament Location"
              onPress={() => {
                if (!user) {
                  setError("Please login to post your own tournament.");
                  showDialog();
                  return;
                }
                setModalVisible(true);
                setSuccessMessage("");
                setErrorMessage("");
              }}
            />
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}
            >
              <View style={styles.modalView}>
                {errorMessage && (
                  <Text style={styles.errorMessage}>Error: {errorMessage}</Text>
                )}
                {successMessage && (
                  <Text style={styles.successMessage}>
                    Success: {successMessage}
                  </Text>
                )}
                
                <Text style={styles.modalTextViewHeader}>
                  Add your pool tournament:
                </Text>
                <ScrollView 
                style={styles.scrollContainer} 
                contentContainerStyle={styles.scrollContentContainer}
                >
                <TextInput
                  style={styles.input}
                  placeholder="Title*"
                  placeholderTextColor="lightgrey"
                  value={newTournament.title}
                  onChangeText={(text) =>
                    setNewTournament({ ...newTournament, title: text })
                  }
                />
                <TextInput
                  style={[styles.input, { padding: 10 }]}
                  placeholder="Description*"
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="lightgrey"
                  value={newTournament.description}
                  onChangeText={(text) =>
                    setNewTournament({ ...newTournament, description: text })
                  }
                />
            
            <View style={[styles.textContainer, { flexDirection: "row", alignItems: "center", flexWrap: 'wrap', marginVertical: 10 }]}>
    
    <Text style={{ padding: 10, textAlign: "center", color: "white" }}>
        Select Date:  {/* Show the actual selected date */}
    </Text>
    <DateTimePicker
        value={date}
        minimumDate={new Date()}
        mode="date"
        display="default"
        onChange={onChangeDate}
    />

    <View style={[styles.textContainer, { flexDirection: "row", alignItems: "center", marginBottom: 10 }]}>
        <Text style={{ padding: 10, textAlign: "center", color: "white" }}>
            Select Time: {/* Show the actual selected time */}
        </Text>
    </View>
    <DateTimePicker
        value={time}
        minimumDate={new Date()}
        mode="time"
        display="default"
        onChange={onChangeTime}
    />
</View>
     
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "white",
                      padding: 0.1,
                      marginRight: 6,
                    }}
                  >
                    <Checkbox
                      status={oneTimeChecked ? "checked" : "unchecked"}
                      onPress={() => {
                        setOneTimeChecked(!oneTimeChecked);
                        setWeeklyChecked(false);
                      }}
                    />
                  </View>
                  <Text
  style={[
    styles.label,
    {
      paddingRight: 6,
      color: "lightgrey",
      flexWrap: "wrap",     // Allow text to wrap
      width: 100,           // Adjust width to trigger wrapping
    },
  ]}
>
  One Time Event
</Text>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "white",
                      padding: 0.1,
                      marginRight: 6,
                    }}
                  >
                    <Checkbox
                      status={weeklyChecked ? "checked" : "unchecked"}
                      onPress={() => {
                        setWeeklyChecked(!weeklyChecked);
                        setOneTimeChecked(false);
                      }}
                    />
                  </View>
                  <Text
  style={[
    styles.label,
    {
      paddingRight: 6,
      color: "lightgrey",
      flexWrap: "wrap",     // Allow text to wrap
      width: 70,           // Adjust width to trigger wrapping
    },
  ]}
>Weekly Event
</Text>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Address*"
                  placeholderTextColor="lightgrey"
                  value={newTournament.location}
                  onChangeText={(text) =>
                    setNewTournament({ ...newTournament, location: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Facebook link (optional)"
                  placeholderTextColor="lightgrey"
                  value={newTournament.faceBookLink}
                  onChangeText={(text) =>
                    setNewTournament({ ...newTournament, faceBookLink: text })
                  }
                />
                </ScrollView>
                {locLoading ? (
                  <ActivityIndicator size="small" color="#007bff" />
                ) : (
                  <>
                    <Button
                      title="Add Your Tournament"
                      onPress={handleAddTournament}
                    />
                    <Button
                      title="Cancel"
                      color="red"
                      onPress={() => setModalVisible(false)}
                    />
                  </>
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

                    {selectedLocation.oneTimeChecked ? (
                      <View>
                        <ModalTimeConvertComponent selectedLocation={selectedLocation}/>
                      </View>
                    ) : (
                      <View>
                        <Text style={styles.modalLocation}>
                          Weekly, next event:
                        </Text>
                        <ModalTimeConvertComponent selectedLocation={selectedLocation}/>
                      </View>
                    )}

                    <View>
                      <Button
                        title="Get Directions"
                        onPress={() =>
                          openMapsApp(
                            selectedLocation.latitude,
                            selectedLocation.longitude
                          )
                        }
                      ></Button>
                    </View>
                    <View>
                      {selectedLocation.faceBookLink ? (
                        <View>
                          <Button
                            title="Facebook Event Page"
                            onPress={() =>
                              openLink(selectedLocation.faceBookLink)
                            }
                          ></Button>
                        </View>
                      ) : (
                        <View></View>
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
                <Text style={styles.modalTextViewHeader}>
                  Tournaments Near You
                </Text>
                <FlatList
                  style={styles.flatListView}
                  data={filteredTournaments}
                  renderItem={renderTournamentItem}
                  keyExtractor={(item) => item.id.toString()}
                />
                <Button
                  color="red"
                  title="Close"
                  onPress={() => setTournamentListVisible(false)}
                />
              </View>
            </Modal>
            <Modal
              animationType="slide"
              transparent={true}
              visible={favoriteTournamentListVisible}
              onRequestClose={() => setFavoriteTournamentListVisible(false)}
            >
              <View style={styles.modalView}>
                <Text style={styles.modalTextViewHeader}>Your Favorites</Text>
                <FlatList
                  style={styles.flatListView}
                  data={favoriteTournaments}
                  renderItem={renderTournamentItem}
                  keyExtractor={(item) => item.id.toString()}
                />
                <Text style={{ color: "white" }}>
                  Unfavorite in the profile tab
                </Text>
                <Button
                  color="red"
                  title="Close"
                  onPress={() => setFavoriteTournamentListVisible(false)}
                />
              </View>
            </Modal>
            <Portal>
              <Dialog visible={visible} onDismiss={hideDialog}>
                <Dialog.Title>Error</Dialog.Title>
                <Dialog.Content>
                  <Paragraph>{error}</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button title="Ok" onPress={hideDialog}>
                    OK
                  </Button>
                  <Button
                    title="Sign In"
                    mode="contained"
                    onPress={() => {
                      hideDialog();
                      navigation.navigate("Profile");
                    }}
                  ></Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
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
    marginRight: 50,
    backgroundColor: "#3a3f44",
    borderRadius: 10,
  },
  modalView: {
    margin: 20,
    marginTop: 70,
    backgroundColor: "#3a3f44",
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
    width: 250,
    padding: 10,
    backgroundColor: "#3a3f44",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "white",
  },
  modalDescription: {
    fontSize: 15,
    marginBottom: 8,
    textAlign: "center",
    color: "white",
  },
  modalLocation: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: "center",
    color: "white",
  },
  getDirectionsButton: {
    paddingBottom: 15,
  },
  modalTextViewHeader: {
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 15,
    color: "white",
  },
  favoriteIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  input: {
    height: 40,
    borderColor: "white",
    borderWidth: 1,
    marginBottom: 12,
    width: "100%",
    paddingLeft: 8,
    color: "white",
  },
  callout: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "bold",
    color: "black",
  },
  titleCallout: {
    backgroundColor: "#00a9ff",
    padding: 5,
    borderRadius: 10,
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
    backgroundColor: "#3a3f44",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    width: "100%",
  },
  tournamentInfo: {
    flex: 1,
    paddingRight: 10,
    color: "white",
  },
  directionButtonContainer: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    flexShrink: 0,
  },
  tournamentTime: {
    fontWeight: "bold",
    color: "white",
  },

  tournamentTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "white",
  },
  tournamentDescription: {
    fontSize: 14,

    marginBottom: 5,
    color: "white",
  },
  tournamentCreatedBy: {
    fontStyle: "italic",
    color: "white",
  },
  errorModalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
    backgroundColor: "#3a3f44",
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
    marginBottom: 10,
  },
  successMessage: {
    color: "green",
    marginBottom: 10,
  },
  containerDateTime: {
    paddingTop: 4,
    paddingBottom: 18,
  },
  buttonContainerDateTime: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  textContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    width: '100%',  // Full width of the modal
  },
  scrollContentContainer: {
    paddingBottom: 20,
    alignItems: 'stretch',  // Make sure the content stretches the full width
  },
  dateTimePickerContainer: {
    width: '100%',           // Ensures the container takes the full width
    alignItems: 'center',     // Centers the DateTimePickers horizontally
    justifyContent: 'center', // Optional: centers them vertically within the container
    marginVertical: 10,       // Adds space above and below the DateTimePickers
  },
});

export default React.memo(TournamentMapPage);
