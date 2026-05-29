import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, GRADIENTS, SHADOWS, SPACING } from "../constants/theme";

export const Button = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  size = "md",
  fullWidth = true,
  style,
  textStyle,
}) => {
  const variantStyles = {
    primary: {
      bg: COLORS.primary,
      text: COLORS.card,
      gradient: GRADIENTS.actionGradient,
    },
    secondary: {
      bg: COLORS.secondary,
      text: COLORS.card,
    },
    accent: {
      bg: COLORS.accent,
      text: COLORS.card,
    },
    outline: {
      bg: COLORS.card,
      text: COLORS.primary,
      borderColor: COLORS.primary,
      borderWidth: 2,
    },
    ghost: {
      bg: "transparent",
      text: COLORS.primary,
    },
  };

  const sizeStyles = {
    sm: { height: 36, paddingHorizontal: SPACING.lg },
    md: { height: 48, paddingHorizontal: SPACING.xl },
    lg: { height: 56, paddingHorizontal: SPACING.xxl },
  };

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const content = loading ? (
    <ActivityIndicator color={variantStyle.text} size="small" />
  ) : (
    <Text
      style={[
        {
          color: variantStyle.text,
          fontSize: 14,
          fontWeight: "700",
          letterSpacing: 0,
        },
        textStyle,
      ]}
    >
      {title}
    </Text>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        {
          backgroundColor: variantStyle.gradient ? "transparent" : variantStyle.bg,
          borderColor: variantStyle.borderColor,
          borderWidth: variantStyle.borderWidth || 0,
          borderRadius: 8,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          width: fullWidth ? "100%" : "auto",
          opacity: disabled ? 0.5 : 1,
          overflow: "hidden",
          ...sizeStyle,
          ...(variant === "primary" ? SHADOWS.md : {}),
        },
        style,
      ]}
    >
      {variantStyle.gradient ? (
        <LinearGradient
          colors={variantStyle.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </TouchableOpacity>
  );
};

export default Button;
