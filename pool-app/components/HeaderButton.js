// components/HeaderButton.js
import React, { useState } from "react";
import { View, TouchableOpacity, Modal, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import { FontAwesome6 } from "@expo/vector-icons";

const HeaderButton = ({ toggleShowTournaments, toggleShowFavorites }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={toggleMenu} style={styles.iconButton}>
        <Ionicons name="list-circle-sharp" size={60} color="#00a9ff" />
      </TouchableOpacity>
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={toggleMenu}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={toggleMenu}>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={toggleShowFavorites}
            >
              <Icon name={"star"} size={30} color={"#FFD700"} />
              <Text style={styles.menuItemText}>Show Favorites</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={toggleShowTournaments}
            >
              <FontAwesome6
                name="magnifying-glass-location"
                size={24}
                color="black"
                style={{ marginTop: 12 }}
              />
              <Text style={styles.menuItemText}>
                Show Tournaments Within 50 miles
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    marginTop: 45,
    zIndex: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
  },
  iconButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    top: 0,
  },
  menuContainer: {
    width: "80%",
    backgroundColor: "#3a3f44",
    borderRadius: 10,
    padding: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "center",
    padding: 10,
  },
  menuItemText: {
    marginTop: 2,
    marginLeft: 8,
    fontSize: 20,
    textAlign: "center",
    color: "white",
  },
});

export default HeaderButton;
