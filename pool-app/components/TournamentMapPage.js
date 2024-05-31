// TournamentMapPage.js
import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

const TournamentMapPage = () => {
  const [location, setLocation] = useState(null);
  const [tournamentLocations, setTournamentLocations] = useState([]);
  const [loading, setLoading] = useState(true);

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
    // Set up tournament locations
    setTournamentLocations([
      {
        id: 1,
        title: "Championship Tournament",
        description: "The annual championship tournament.",
        latitude: 34.052235,
        longitude: -118.243683,
      },
      {
        id: 2,
        title: "Regional Qualifier",
        description: "The regional qualifying event.",
        latitude: 40.712776,
        longitude: -74.005974,
      },
      {
        id: 3,
        title: "City League",
        description: "The city league tournament.",
        latitude: 37.774929,
        longitude: -122.419418,
      },
    ]);
  }, []);

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
});

export default TournamentMapPage;
