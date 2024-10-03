import { TouchableOpacity, Text, StyleSheet, Linking } from "react-native";

const openLink = (url) => {
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    })
    .catch((err) => console.error("An error occurred", err));
};

export { openLink };