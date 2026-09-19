import React from "react";
import { View, ActivityIndicator, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../context/AppContext";
import { COLORS as C } from "../theme";
import { RelateMark } from "../components/UI";

import AuthScreen from "../screens/AuthScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import HomeScreen from "../screens/HomeScreen";
import PeopleScreen from "../screens/PeopleScreen";
import DecideScreen from "../screens/DecideScreen";
import YouScreen from "../screens/YouScreen";
import PersonSpaceScreen from "../screens/PersonSpaceScreen";
import ChatScreen from "../screens/ChatScreen";
import MessageLabScreen from "../screens/MessageLabScreen";
import PaywallScreen from "../screens/PaywallScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AskRelateButton({ navigation }) {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("Chat", { personId: null })}
      style={{
        position: "absolute", right: 18, bottom: 90, width: 54, height: 54, borderRadius: 27,
        backgroundColor: C.indigo, alignItems: "center", justifyContent: "center",
        shadowColor: C.indigo, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
      }}
    >
      <RelateMark size={22} />
    </TouchableOpacity>
  );
}

function MainTabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: C.indigo,
          tabBarInactiveTintColor: C.textSoft,
          tabBarStyle: { borderTopColor: C.line, height: 84, paddingTop: 6 },
          tabBarLabelStyle: { fontSize: 10.5, fontWeight: "600" },
          tabBarIcon: ({ color, size }) => {
            const icons = { Home: "home", People: "people", Decide: "git-branch", You: "person-circle" };
            return <Ionicons name={icons[route.name]} size={size ? size - 2 : 20} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="People" component={PeopleScreen} />
        <Tab.Screen name="Decide" component={DecideScreen} />
        <Tab.Screen name="You" component={YouScreen} />
      </Tab.Navigator>
    </View>
  );
}

function MainTabsWithFab({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <MainTabs />
      <AskRelateButton navigation={navigation} />
    </View>
  );
}

export default function RootNavigator() {
  const { booting, authed, state } = useApp();

  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.ivory }}>
        <ActivityIndicator size="large" color={C.indigo} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!authed ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : !state.onboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !state.isPremium ? (
          <Stack.Screen name="Paywall" component={PaywallScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabsWithFab} />
            <Stack.Screen name="PersonSpace" component={PersonSpaceScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ presentation: "modal" }} />
            <Stack.Screen name="MessageLab" component={MessageLabScreen} options={{ presentation: "modal" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
