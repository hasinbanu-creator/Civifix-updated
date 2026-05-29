import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from "../constants/theme";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const ICON_ALIASES = {
  account: "account-outline",
  city: "city-variant-outline",
  email: "email-outline",
  "email-check": "email-check-outline",
  flag: "flag-outline",
  "home-map-marker": "home-map-marker",
  "lock-check": "lock-check-outline",
  "map-marker": "map-marker-outline",
  "map-marker-radius": "map-marker-radius-outline",
  "note-text": "note-text-outline",
  phone: "phone-outline",
  shape: "shape-outline",
  "shield-check": "shield-check-outline",
  text: "text-box-outline",
};

export const TextField = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  editable = true,
  multiline = false,
  numberOfLines = 1,
  icon,
  style,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = secureTextEntry && !isPasswordVisible;

  return (
    <View style={[{ marginBottom: SPACING.lg }, style]}>
      {label && (
        <Text
          style={{
            fontSize: FONT_SIZES.sm,
            fontWeight: "600",
            color: COLORS.textDark,
            marginBottom: SPACING.sm,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: multiline ? "flex-start" : "center",
          borderRadius: BORDER_RADIUS.md,
          backgroundColor: COLORS.card,
          borderWidth: 1,
          borderColor: error ? COLORS.error : COLORS.border,
          paddingHorizontal: SPACING.lg,
          paddingVertical: multiline ? SPACING.md : 0,
        }}
      >
        {icon && (
          <Icon
            name={ICON_ALIASES[icon] || icon}
            size={20}
            color={error ? COLORS.error : COLORS.textLight}
            style={{ marginRight: SPACING.md }}
          />
        )}
        <TextInput
          style={{
            flex: 1,
            paddingVertical: SPACING.md,
            fontSize: FONT_SIZES.base,
            color: COLORS.textDark,
            fontFamily: "System",
          }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textGray}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword}
          keyboardType={keyboardType}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Icon
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={20}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text
          style={{
            fontSize: FONT_SIZES.xs,
            color: COLORS.error,
            marginTop: SPACING.sm,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

export default TextField;
