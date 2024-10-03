import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  SectionList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../AuthContext";
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  arrayRemove,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import Icon from "react-native-vector-icons/FontAwesome";

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [userData, setUserData] = useState(null);
  const [poolTeams, setPoolTeams] = useState([]);
  const [postedTournaments, setPostedTournaments] = useState([]);
  const [favoriteTournaments, setFavoriteTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(true);

  const fetchUserData = async () => {
    setIsLoading(true);
    console.log("fetching user");
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        // Favorites
        if (
          data.FavoriteTournamentsId &&
          Array.isArray(data.FavoriteTournamentsId)
        ) {
          fetchFavoriteTournaments(data.FavoriteTournamentsId);
        } else {
          console.log("FavoriteTournamentsId is not an array or is undefined.");
          setIsLoading(false);
        }

        // Team Postings
        if (data.PoolTeamsId && Array.isArray(data.PoolTeamsId)) {
          fetchPoolTeams(data.PoolTeamsId);
        } else {
          console.log("PoolTeamsId is not an array or is undefined.");
          setIsLoading(false);
        }

        // Tournament Postings
        if (data.TournamentsId && Array.isArray(data.TournamentsId)) {
          fetchPostedTournaments(data.TournamentsId);
        } else {
          console.log("TournamentsId is not an array or is undefined.");
          setIsLoading(false);
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
              console.log(`Fetching posted document for ID: ${idStr}`);
              const tournamentDoc = await getDoc(
                doc(db, "tournamentLocations", idStr)
              );
              if (tournamentDoc.exists()) {
                return tournamentDoc.data();
              } else {
                console.log(`No posted document found for ID: ${idStr}`);
                const userRef = doc(db, "users", user.uid);
                // Only call arrayRemove if id is not null or undefined
                await updateDoc(userRef, {
                  TournamentsId: arrayRemove(id),
                });

                console.log(`Deleted posted with ID: ${id}`);
                return null;
              }
            } catch (error) {
              console.error(
                `Error fetching posted document for ID: ${idStr}`,
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

  const fetchFavoriteTournaments = async (tournamentIds) => {
    console.log("Fetching favorite tournament IDs:", tournamentIds);
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

  const toggleFavorite = async (id) => {
    try {
      setFavoriteTournaments((prevTournaments) =>
        prevTournaments.filter((tournament) => tournament.id !== id)
      );
      const userRef = doc(db, "users", user.uid);
      // Only call arrayRemove if id is not null or undefined
      await updateDoc(userRef, {
        FavoriteTournamentsId: arrayRemove(id),
      });

      console.log(`Deleted favorite with ID: ${id}`);
    } catch (error) {
      console.error(`Error deleting team with ID: ${id}`, error);
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

  const renderTeamItem = ({ item }) => (
    <View style={styles.teamItem}>
      {item ? (
        <>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{item.name}</Text>
            <Text>Skill Level: {item.skillLevel}</Text>
            <Text>Availability: {item.availability}</Text>
            <Text>{item.location}</Text>
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
        <ActivityIndicator
          color="#007bff"
          size="small"
          style={styles.loadingBar}
        />
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
            <ModalTimeConvertComponent selectedLocation={item} />
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

  const renderFavoriteTournamentItem = ({ item }) => (
    <View style={styles.teamItem}>
      {item ? (
        <>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{item.title}</Text>
            <Text>Description: {item.description}</Text>
            <ModalTimeConvertComponent selectedLocation={item} />
          </View>
          <View style={styles.deleteButtonContainer}>
            <TouchableOpacity
              style={styles.favoriteIcon}
              onPress={() => toggleFavorite(item.id)}
            >
              <Icon
                name={isFavorite ? "star" : "star-o"}
                size={30}
                color={isFavorite ? "#FFD700" : "#000"}
              />
            </TouchableOpacity>
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

  const sections = [
    {
      title: "User Data",
      data: [{ type: "userData" }],
    },
    {
      title: "Favorite Tournaments",
      data: favoriteTournaments,
    },
    {
      title: "Your Events/Tournaments",
      data: postedTournaments,
    },
    {
      title: "Your Team Posts",
      data: poolTeams,
    },
  ];

  const renderItem = ({ item, section }) => {
    if (section.title === "User Data") {
      return (
        <View style={styles.userData}>
          {userData ? (
            <>
              <Text style={styles.teamName}>Hi, {userData.firstName}</Text>
            </>
          ) : (
            <Text>Loading user data...</Text>
          )}
          <Button title="Sign Out" onPress={signOut} color={"red"} />
        </View>
      );
    } else if (section.title === "Your Team Posts") {
      return renderTeamItem({ item });
    } else if (section.title === "Your Events/Tournaments") {
      return renderPostedTournamentItem({ item });
    } else if (section.title === "Favorite Tournaments") {
      return renderFavoriteTournamentItem({ item });
    }
    return null;
  };

  const renderSectionHeader = ({ section }) => {
    if (section.title !== "User Data") {
      return (
        <View style={styles.userTeamData}>
          <Text>{section.title}:</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item, index) => index.toString()}
        refreshing={isLoading}
        onRefresh={fetchUserData}
        contentContainerStyle={styles.sectionListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: "#00a9ff",
  },
  sectionListContent: {
    paddingBottom: 20,
  },
  userData: {
    alignItems: "center",
    marginBottom: 20,
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
    marginLeft: 15,
    marginRight: 15,
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
  loadingBar: {
    zIndex: 50,
  },
});

export default ProfileScreen;
