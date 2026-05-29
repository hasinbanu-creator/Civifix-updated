import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import VerifyLoginScreen from "../screens/Auth/VerifyLoginScreen";
import VerifyRegisterScreen from "../screens/Auth/VerifyRegisterScreen";

const Stack = createNativeStackNavigator();

export const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#F9FAFB" },
        animationEnabled: true,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen
        name="VerifyLogin"
        component={VerifyLoginScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="VerifyRegister"
        component={VerifyRegisterScreen}
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
