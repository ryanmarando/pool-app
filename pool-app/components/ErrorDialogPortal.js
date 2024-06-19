import React from "react";
import { Dialog, Portal, Paragraph } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { Button } from "react-native";

const ErrorDialogPortal = ({ title, error, visible, hideDialog }) => {
  const navigation = useNavigation();

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Paragraph>{error}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button title="Ok" onPress={hideDialog}>
            OK
          </Button>
          <Button
            title="Sign In"
            onPress={() => {
              hideDialog();
              navigation.navigate("Profile");
            }}
          >
            Sign In
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ErrorDialogPortal;
