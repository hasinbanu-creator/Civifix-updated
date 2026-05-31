import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { COLORS, SPACING, FONT_SIZES } from "../constants/theme";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

export const Header = ({
  title,
  subtitle,
  onBackPress,
  showBack = true,
  rightIcon,
  onRightPress,
  style,
}) => {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md,
          backgroundColor: COLORS.card,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        {showBack && (
          <TouchableOpacity
            onPress={onBackPress}
            style={{ marginRight: SPACING.lg }}
          >
            <Icon name="arrow-left" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        <View>
          <Text
            style={{
              fontSize: FONT_SIZES.lg,
              fontWeight: "700",
              color: COLORS.textDark,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontSize: FONT_SIZES.sm,
                color: COLORS.textLight,
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightIcon && (
        <TouchableOpacity onPress={onRightPress}>
          <Icon name={rightIcon} size={24} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Header;
