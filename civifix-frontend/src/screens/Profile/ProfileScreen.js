import React, { useState, useContext } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { Card, GradientBackground } from "../../components";
import { COLORS, GRADIENTS, SPACING, FONT_SIZES, SHADOWS } from "../../constants/theme";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";

export const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Logout",
        onPress: async () => {
          setLoading(true);
          await signOut();
          setLoading(false);
        },
        style: "destructive",
      },
    ]);
  };

  const menuItems = [
    {
      id: 1,
      title: "Personal Information",
      icon: "account-edit-outline",
      onPress: () => {},
      color: COLORS.primary,
    },
    {
      id: 2,
      title: "My Complaints",
      icon: "clipboard-text-outline",
      onPress: () => navigation.getParent()?.navigate("Complaints"),
      color: COLORS.accent,
    },
    {
      id: 3,
      title: "Notifications",
      icon: "bell-outline",
      onPress: () => {},
      color: COLORS.secondary,
    },
    {
      id: 4,
      title: "Settings",
      icon: "cog-outline",
      onPress: () => {},
      color: COLORS.primary,
    },
    {
      id: 5,
      title: "Help & Support",
      icon: "help-circle-outline",
      onPress: () => {},
      color: COLORS.accent,
    },
    {
      id: 6,
      title: "About CiviFix",
      icon: "information-outline",
      onPress: () => {},
      color: COLORS.secondary,
    },
  ];

  return (
    <GradientBackground colors={GRADIENTS.softGradient}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: SPACING.lg,
          paddingBottom: SPACING.xxl,
          width: "100%",
          maxWidth: 520,
          alignSelf: "center",
        }}
      >
        <View>
          <LinearGradient
            colors={GRADIENTS.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 8,
              padding: SPACING.xl,
              marginBottom: SPACING.xl,
              ...SHADOWS.lg,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  backgroundColor: "rgba(255,255,255,0.22)",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: SPACING.lg,
                }}
              >
                <Icon name="account" size={42} color={COLORS.card} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: FONT_SIZES.xl,
                    fontWeight: "700",
                    color: COLORS.card,
                    marginBottom: SPACING.xs,
                  }}
                >
                  {user?.name || "Citizen"}
                </Text>
                <Text
                  style={{
                    fontSize: FONT_SIZES.sm,
                    color: COLORS.card,
                    opacity: 0.9,
                    marginBottom: SPACING.xs,
                  }}
                >
                  {user?.mobile_number || user?.mobile || "Not provided"}
                </Text>
                <Text
                  style={{
                    fontSize: FONT_SIZES.sm,
                    color: COLORS.card,
                    opacity: 0.85,
                  }}
                >
                  {user?.email || "Not provided"}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <Text
            style={{
              fontSize: FONT_SIZES.lg,
              fontWeight: "700",
              color: COLORS.textDark,
              marginBottom: SPACING.md,
            }}
          >
            Account
          </Text>

          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <Card
                variant="default"
                style={{
                  marginBottom: SPACING.md,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: SPACING.lg,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: item.color + "15",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: SPACING.lg,
                    }}
                  >
                    <Icon name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text
                    style={{
                      fontSize: FONT_SIZES.base,
                      fontWeight: "600",
                      color: COLORS.textDark,
                      flex: 1,
                    }}
                  >
                    {item.title}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={COLORS.textGray} />
              </Card>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={handleLogout}
            disabled={loading}
            activeOpacity={0.7}
            style={{ marginTop: SPACING.xl }}
          >
            <Card
              variant="default"
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: SPACING.lg,
                borderWidth: 1,
                borderColor: COLORS.error,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: COLORS.error + "15",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: SPACING.lg,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={COLORS.error} />
                  ) : (
                    <Icon name="logout" size={20} color={COLORS.error} />
                  )}
                </View>
                <Text
                  style={{
                    fontSize: FONT_SIZES.base,
                    fontWeight: "600",
                    color: COLORS.error,
                    flex: 1,
                  }}
                >
                  Logout
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={20}
                color={COLORS.textGray}
              />
            </Card>
          </TouchableOpacity>

          <View
            style={{
              alignItems: "center",
              marginTop: SPACING.xxl,
              paddingBottom: SPACING.lg,
            }}
          >
            <Text
              style={{
                color: COLORS.textLight,
                fontSize: FONT_SIZES.xs,
              }}
            >
              CiviFix v1.0.0
            </Text>
            <Text
              style={{
                color: COLORS.textGray,
                fontSize: FONT_SIZES.xs,
                marginTop: SPACING.xs,
              }}
            >
              © 6 CiviFix. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
};

export default ProfileScreen;
