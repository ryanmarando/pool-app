import { StyleSheet } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import BottomTabNavigator from "./components/BottomTabNavigator";
import ProfilePage from "./components/ProfilePage";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./components/HomeScreen";
import TournamentMapPage from "./components/TournamentMapPage";
import FindTeamsPage from "./components/FindTeamPage";

const Stack = createStackNavigator();

const App = () => {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            options={{
              headerShown: false,
            }}
            component={HomeScreen}
          />
          <Stack.Screen
            name="Profile"
            options={{ headerShown: false }}
            component={ProfilePage}
          />
          <Stack.Screen
            name="FullMap"
            options={{ headerShown: false }}
            component={TournamentMapPage}
          ></Stack.Screen>
          <Stack.Screen
            name="FindTeam"
            options={{ headerShown: false }}
            component={FindTeamsPage}
          ></Stack.Screen>
        </Stack.Navigator>
        <BottomTabNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({});

export default App;
