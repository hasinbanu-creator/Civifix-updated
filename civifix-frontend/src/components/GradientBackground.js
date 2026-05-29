import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const GradientBackground = ({
  children,
  colors = ["#2563EB", "#06B6D4"],
  style,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </LinearGradient>
  );
};

export default GradientBackground;
