import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View, Text, Image, Modal } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Dialog,
  Portal,
} from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import HeroImage from "../billiards-logo.png";
import { getAuth } from "firebase/auth";
import ErrorDialogPortal from "../components/ErrorDialogPortal";

const HomeScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const user = auth.currentUser;
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);
  const errorTitle = "Error";

  useFocusEffect(
    useCallback(() => {
      const user = auth.currentUser;
      console.log("updated user");
    }, [])
  );

  const handlePressCreateTournament = () => {
    if (!user || user == null) {
      setError("Please login to post your own tournament");
      showDialog();
      return;
    }
    navigation.navigate("FullMap", { showModal: true });
  };

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
              <Paragraph style={styles.cardParagraph}>
                Browse the map of pool places!
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => navigation.navigate("FullMap")}
              >
                View Map
              </Button>
            </Card.Actions>
          </Card>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Find a Player</Title>
              <Paragraph style={styles.cardParagraph}>
                See groups of people looking for an extra person!
              </Paragraph>
            </Card.Content>
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
              <Title style={styles.cardTitle}>Post Your Own Tournament</Title>
              <Paragraph style={styles.cardParagraph}>
                Post your own tournament for pool players to see.
              </Paragraph>
            </Card.Content>

            <Card.Actions>
              <Button mode="contained" onPress={handlePressCreateTournament}>
                Create
              </Button>
            </Card.Actions>
          </Card>
        </View>
      </ScrollView>
      <ErrorDialogPortal
        title={errorTitle}
        visible={visible}
        error={error}
        hideDialog={hideDialog}
      />
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
    textAlign: "right",
    color: "white", // Adjust text color for better contrast
    maxWidth: "90%",
    marginLeft: 10,
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

export default React.memo(HomeScreen);
