// BottomNavigationBar.js
import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const BottomNavigationBar = () => {
  const navigation = useNavigation();

  const navigateToProfile = () => {
    navigation.navigate("Profile");
  };

  const navigateToHome = () => {
    navigation.navigate("Home");
  };

  const navigateToFullMap = () => {
    navigation.navigate("FullMap");
  };

  const navigateToFindTeam = () => {
    navigation.navigate("FindTeam");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={navigateToHome}>
        <Ionicons name="home-outline" size={24} color="gray" />
        <Text style={styles.label}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={navigateToFullMap}>
        <Ionicons name="navigate-outline" size={24} color="gray" />
        <Text style={styles.label}>Find Matches</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={navigateToFindTeam}>
        <Ionicons name="search-outline" size={24} color="gray" />
        <Text style={styles.label}>Find Teams</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={navigateToProfile}>
        <Ionicons name="person-outline" size={24} color="gray" />
        <Text style={styles.label}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    padding: 10,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderColor: "gray",
  },
  button: {
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    color: "gray",
  },
});

export default BottomNavigationBar;
