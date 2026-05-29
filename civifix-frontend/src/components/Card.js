import React from "react";
import { View } from "react-native";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../constants/theme";

export const Card = ({
  children,
  style,
  onPress,
  variant = "default",
  padding = SPACING.lg,
}) => {
  const variantStyles = {
    default: {
      backgroundColor: COLORS.card,
      borderColor: COLORS.border,
      borderWidth: 1,
    },
    elevated: {
      backgroundColor: COLORS.card,
      borderColor: "transparent",
    },
    primary: {
      backgroundColor: COLORS.primary,
      borderColor: "transparent",
    },
    secondary: {
      backgroundColor: COLORS.secondary,
      borderColor: "transparent",
    },
  };

  const variantStyle = variantStyles[variant];

  return (
    <View
      style={[
        {
          borderRadius: BORDER_RADIUS.lg,
          padding,
          ...variantStyle,
          ...(variant === "elevated" ? SHADOWS.md : {}),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default Card;
