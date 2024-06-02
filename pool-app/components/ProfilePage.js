import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../AuthContext";
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [userData, setUserData] = useState(null);
  const [poolTeams, setPoolTeams] = useState([]);
  const [postedTournaments, setPostedTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserData = async () => {
    setIsLoading(true);
    console.log("fetching user");
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        if (data.PoolTeamsId && Array.isArray(data.PoolTeamsId)) {
          fetchPoolTeams(data.PoolTeamsId);
        } else {
          console.log("PoolTeamsId is not an array or is undefined.");
        }
        if (data.TournamentsId && Array.isArray(data.TournamentsId)) {
          fetchPostedTournaments(data.TournamentsId);
        } else {
          console.log("TournamentsId is not an array or is undefined.");
        }
      } else {
        console.log("No such document!");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoading(false);
    }
  };

  const fetchPoolTeams = async (poolTeamsIds) => {
    console.log("Fetching pool teams with IDs:", poolTeamsIds);
    try {
      const teams = await Promise.all(
        poolTeamsIds.map(async (id) => {
          if (id) {
            const idStr = String(id); // Ensure the ID is a string
            try {
              console.log(`Fetching team document for ID: ${idStr}`);
              const teamDoc = await getDoc(doc(db, "poolTeams", idStr));
              if (teamDoc.exists()) {
                return teamDoc.data();
              } else {
                console.log(`No team document found for ID: ${idStr}`);
                return null;
              }
            } catch (error) {
              console.error(
                `Error fetching team document for ID: ${idStr}`,
                error
              );
              return null;
            }
          } else {
            console.log("Encountered an undefined or invalid PoolTeamsId:", id);
            return null;
          }
        })
      );
      setPoolTeams(teams.filter((team) => team !== null));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching pool teams:", error);
    }
  };

  const fetchPostedTournaments = async (tournamentIds) => {
    console.log("Fetching tournament IDs:", tournamentIds);
    try {
      const tournaments = await Promise.all(
        tournamentIds.map(async (id) => {
          if (id) {
            const idStr = String(id); // Ensure the ID is a string
            try {
              console.log(`Fetching team document for ID: ${idStr}`);
              const tournamentDoc = await getDoc(
                doc(db, "tournamentLocations", idStr)
              );
              if (tournamentDoc.exists()) {
                return tournamentDoc.data();
              } else {
                console.log(`No team document found for ID: ${idStr}`);
                return null;
              }
            } catch (error) {
              console.error(
                `Error fetching team document for ID: ${idStr}`,
                error
              );
              return null;
            }
          } else {
            console.log(
              "Encountered an undefined or invalid tournamentId:",
              id
            );
            return null;
          }
        })
      );
      setPostedTournaments(
        tournaments.filter((tournament) => tournament !== null)
      );
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching posted tournaments:", error);
    }
  };

  useEffect(() => {
    if (!user) {
      navigation.navigate("SignIn");
    } else {
      fetchUserData();
    }
  }, [user, navigation]);

  const handleDeleteTeam = async (id) => {
    try {
      const idStr = String(id);
      // Delete team document
      await deleteDoc(doc(db, "poolTeams", idStr));

      // Remove team from local state
      setPoolTeams((prevTeams) => prevTeams.filter((team) => team.id !== id));

      // Remove team ID from user's array of PoolTeamsId
      const userRef = doc(db, "users", user.uid);
      if (id) {
        // Only call arrayRemove if id is not null or undefined
        await updateDoc(userRef, {
          PoolTeamsId: arrayRemove(id),
        });
      }

      console.log(`Deleted team with ID: ${id}`);
    } catch (error) {
      console.error(`Error deleting team with ID: ${id}`, error);
    }
  };

  const handleDeletePostedTournament = async (id) => {
    try {
      const idStr = String(id);
      // Delete team document
      await deleteDoc(doc(db, "tournamentLocations", idStr));

      // Remove team from local state
      setPostedTournaments((prevTournaments) =>
        prevTournaments.filter((tournament) => tournament.id !== id)
      );

      // Remove team ID from user's array of PoolTeamsId
      const userRef = doc(db, "users", user.uid);
      if (id) {
        // Only call arrayRemove if id is not null or undefined
        await updateDoc(userRef, {
          TournamentsId: arrayRemove(id),
        });
      }

      console.log(`Deleted team with ID: ${id}`);
    } catch (error) {
      console.error(`Error deleting team with ID: ${id}`, error);
    }
  };

  const renderTeamItem = ({ item }) => (
    <View style={styles.teamItem}>
      {item ? (
        <>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>Team Name: {item.name}</Text>
            <Text>Skill Level: {item.skillLevel}</Text>
            <Text>Availability: {item.availability}</Text>
          </View>
          <View style={styles.deleteButtonContainer}>
            <Button
              title="Delete"
              color="red"
              onPress={() => handleDeleteTeam(item.id)}
            />
          </View>
        </>
      ) : (
        <ActivityIndicator color="#007bff" size="small" />
      )}
    </View>
  );

  const renderPostedTournamentItem = ({ item }) => (
    <View style={styles.teamItem}>
      {item ? (
        <>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{item.title}</Text>
            <Text>Description: {item.description}</Text>
            <Text>{item.time}</Text>
            <Text>{item.location}</Text>
          </View>
          <View style={styles.deleteButtonContainer}>
            <Button
              title="Delete"
              color="red"
              onPress={() => handleDeletePostedTournament(item.id)}
            />
          </View>
        </>
      ) : (
        <ActivityIndicator color="#007bff" size="small" />
      )}
    </View>
  );

  if (!user) {
    return null; // Render nothing if the user is not authenticated
  }

  return (
    <View style={styles.container}>
      <View style={styles.userData}>
        {userData ? (
          <>
            <Text>Hi, {userData.firstName}</Text>
            <Text>Welcome, {userData.email}</Text>
          </>
        ) : (
          <Text>Loading user data...</Text>
        )}
      </View>
      <Button title="Sign Out" onPress={signOut} />
      <View style={styles.userTeamData}>
        <Text>Your Team Posts:</Text>
        <FlatList
          style={styles.flatListView}
          data={poolTeams}
          renderItem={renderTeamItem}
          keyExtractor={(item, index) => index.toString()}
          refreshing={isLoading} // Set the refreshing prop to isLoading
          onRefresh={fetchUserData}
        />
      </View>
      <View style={styles.userTeamData}>
        <Text>Your Events/Tournaments:</Text>
        <FlatList
          style={styles.flatListView}
          data={postedTournaments}
          renderItem={renderPostedTournamentItem}
          keyExtractor={(item, index) => index.toString()}
          refreshing={isLoading} // Set the refreshing prop to isLoading
          onRefresh={fetchUserData}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  userData: {
    alignItems: "center",
  },
  flatListView: {
    padding: 15,
    width: "100%",
  },
  userTeamData: {
    alignItems: "center",
    padding: 10,
    width: "100%",
  },
  teamItem: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 10,
    borderRadius: 5,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  deleteButtonContainer: {
    marginLeft: 10,
  },
});

export default ProfileScreen;
