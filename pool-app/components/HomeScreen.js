import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Text, Image, Modal } from "react-native";
import { Card, Title, Paragraph, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import HeroImage from "../billiards-logo.png";

const HomeScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.heroSection}>
          <Image
            style={styles.heroImage}
            source={HeroImage} // Replace with a relevant billiards image URL
          />
          <Text style={styles.heroText}>
            Welcome to the Ultimate Billiards Pool Hub
          </Text>
        </View>
        <View style={styles.contentSection}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Find Tournaments Near You</Title>
              <View>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate("FullMap")}
                >
                  See Map
                </Button>
              </View>
            </Card.Content>
          </Card>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Find a Team</Title>
              <Paragraph style={styles.cardParagraph}>
                See groups of people looking for an extra person!
              </Paragraph>
            </Card.Content>
            <Card.Cover
              style={styles.cardCover}
              source={{ uri: "https://example.com/matches-image.jpg" }}
            />
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => navigation.navigate("FindTeam")}
              >
                View More
              </Button>
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
              style={styles.cardCover}
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
              style={styles.cardCover}
              source={{ uri: "https://example.com/tournaments-image.jpg" }}
            />
            <Card.Actions>
              <Button mode="contained">Check Schedule</Button>
            </Card.Actions>
          </Card>
        </View>
      </ScrollView>
    </View>
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 25,
  },
  heroImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },
  heroText: {
    marginTop: 11,
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
  cardCover: {
    margin: 10,
  },
  map: {
    height: 400,
    marginTop: 15,
    borderRadius: 10,
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

export default HomeScreen;
