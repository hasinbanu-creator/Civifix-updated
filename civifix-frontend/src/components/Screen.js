import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING } from "../constants/theme";

export const Screen = ({
  children,
  scroll = true,
  centered = true,
  maxWidth = 520,
  backgroundColor = COLORS.background,
  contentStyle,
  style,
}) => {
  const content = (
    <View
      style={[
        {
          width: "100%",
          maxWidth,
          alignSelf: centered ? "center" : "stretch",
          paddingHorizontal: SPACING.lg,
        },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor }, style]}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: SPACING.xxl }}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};

export default Screen;
