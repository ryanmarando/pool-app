import React from "react";
import { StyleSheet } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import BottomTabNavigator from "./components/BottomTabNavigator";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { AuthProvider, useAuth } from "./AuthContext";
import HomeScreen from "./components/HomeScreen";
import TournamentMapPage from "./components/TournamentMapPage";
import FindTeamsPage from "./components/FindTeamPage";
import ProfileScreen from "./components/ProfilePage";
import SignInPage from "./components/SignInPage";
import SignUpPage from "./components/SignUpPage";
import { MapProvider } from "./components/MapContext";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator detachInactiveScreens={false}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false, ...TransitionPresets.SlideFromRightIOS }}
      />
      <Stack.Screen
        name="Profile"
        component={user ? ProfileScreen : SignInPage}
        options={{ headerShown: false, ...TransitionPresets.SlideFromRightIOS }}
      />
      <Stack.Screen
        name="FullMap"
        component={TournamentMapPage}
        options={{
          headerShown: false,
          ...TransitionPresets.SlideFromRightIOS,
          unmountOnBlur: false,
        }}
      />
      <Stack.Screen
        name="FindTeam"
        component={FindTeamsPage}
        options={{ headerShown: false, ...TransitionPresets.SlideFromRightIOS }}
      />
      <Stack.Screen
        name="SignIn"
        component={SignInPage}
        options={{ headerShown: false, ...TransitionPresets.SlideFromRightIOS }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpPage}
        options={{ headerShown: false, ...TransitionPresets.SlideFromRightIOS }}
      />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <PaperProvider>
        <MapProvider>
          <NavigationContainer>
            <AppNavigator />
            <BottomTabNavigator />
          </NavigationContainer>
        </MapProvider>
      </PaperProvider>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({});

export default App;
