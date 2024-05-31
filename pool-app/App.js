import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Text, Image, Modal } from "react-native";
import {
  Appbar,
  Card,
  Title,
  Paragraph,
  Button,
  Provider as PaperProvider,
} from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

const tournamentLocations = [
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
];

const App = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const handleMarkerPress = (location) => {
    setSelectedLocation(location);
    setModalVisible(true);
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.heroSection}>
            <Image
              style={styles.heroImage}
              source={{ uri: "https://example.com/hero-image.jpg" }} // Replace with a relevant billiards image URL
            />
            <Text style={styles.heroText}>
              Welcome to the Ultimate Billiards Pool Hub
            </Text>
          </View>
          <View style={styles.contentSection}>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>
                  Find Tournaments Near You
                </Title>
                {location ? (
                  <MapView
                    style={styles.map}
                    region={{
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
                      title="You are here"
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
                        onPress={() => handleMarkerPress(loc)}
                      />
                    ))}
                  </MapView>
                ) : (
                  <Paragraph style={styles.cardParagraph}>
                    {errorMsg || "Loading your location..."}
                  </Paragraph>
                )}
              </Card.Content>
            </Card>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Latest Matches</Title>
                <Paragraph style={styles.cardParagraph}>
                  Stay updated with the latest billiards matches around the
                  globe.
                </Paragraph>
              </Card.Content>
              <Card.Cover
                source={{ uri: "https://example.com/matches-image.jpg" }}
              />
              <Card.Actions>
                <Button mode="contained">View More</Button>
              </Card.Actions>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Tips & Tricks</Title>
                <Paragraph style={styles.cardParagraph}>
                  Improve your game with expert tips and tricks from
                  professionals.
                </Paragraph>
              </Card.Content>
              <Card.Cover
                source={{ uri: "https://example.com/tips-image.jpg" }}
              />
              <Card.Actions>
                <Button mode="contained">Learn More</Button>
              </Card.Actions>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Upcoming Tournaments</Title>
                <Paragraph style={styles.cardParagraph}>
                  Don't miss out on the upcoming billiards tournaments. Get the
                  schedule here.
                </Paragraph>
              </Card.Content>
              <Card.Cover
                source={{ uri: "https://example.com/tournaments-image.jpg" }}
              />
              <Card.Actions>
                <Button mode="contained">Check Schedule</Button>
              </Card.Actions>
            </Card>
          </View>
        </ScrollView>
        {selectedLocation && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <View style={styles.modalView}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectedLocation.title}</Text>
                <Text style={styles.modalDescription}>
                  {selectedLocation.description}
                </Text>
                <Button
                  mode="contained"
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  Close
                </Button>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00a9ff", // Set background color here
  },
  scrollView: {
    padding: 16,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  heroImage: {
    width: "100%",
    height: 50,
    borderRadius: 10,
  },
  heroText: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "white", // Adjust text color for better contrast
  },
  contentSection: {
    flex: 1,
  },
  card: {
    marginBottom: 20,
    backgroundColor: "#3a3f44", // Optional: Change card background color for better theme consistency
  },
  cardTitle: {
    color: "white", // Ensure card title text is readable
  },
  cardParagraph: {
    color: "lightgray", // Ensure card paragraph text is readable
  },
  map: {
    height: 200,
    marginTop: 10,
  },
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
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
});

export default App;
