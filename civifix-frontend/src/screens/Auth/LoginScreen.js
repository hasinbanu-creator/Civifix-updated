import React, { useState, useContext } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../../context/AuthContext";
import { Button, TextField, GradientBackground, Card } from "../../components";
import { COLORS, GRADIENTS, SPACING, FONT_SIZES, SHADOWS } from "../../constants/theme";

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { signIn, error: authError } = useContext(AuthContext);

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    if (email && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase());
      navigation.navigate("VerifyLogin", { email: email.trim().toLowerCase() });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground colors={GRADIENTS.softGradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              padding: SPACING.lg,
              width: "100%",
              maxWidth: 430,
              alignSelf: "center",
            }}
          >
            <View style={{ marginBottom: SPACING.xl }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 8,
                  backgroundColor: COLORS.card,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: SPACING.xl,
                  ...SHADOWS.md,
                }}
              >
                <Icon name="city-variant-outline" size={30} color={COLORS.primary} />
              </View>
              <Text
                style={{
                  fontSize: FONT_SIZES.xxl,
                  fontWeight: "700",
                  color: COLORS.textDark,
                  marginBottom: SPACING.sm,
                }}
              >
                Welcome Back
              </Text>
              <Text
                style={{
                  fontSize: FONT_SIZES.base,
                  color: COLORS.textLight,
                }}
              >
                Enter your email to receive a secure login OTP.
              </Text>
            </View>

            <Card
              variant="elevated"
              style={{
                padding: SPACING.xl,
                marginBottom: SPACING.lg,
              }}
            >
              <TextField
                label="Email"
                placeholder="Enter your registered email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                error={errors.email}
                icon="email"
                style={{ marginBottom: SPACING.md }}
              />

              {authError && (
                <Text
                  style={{
                    color: COLORS.error,
                    fontSize: FONT_SIZES.sm,
                    marginBottom: SPACING.lg,
                    textAlign: "center",
                  }}
                >
                  {authError}
                </Text>
              )}

              <Button
                title="SEND OTP"
                onPress={handleLogin}
                loading={loading}
                variant="primary"
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: SPACING.lg,
                }}
              >
                <Text
                  style={{
                    color: COLORS.textGray,
                    fontSize: FONT_SIZES.sm,
                  }}
                >
                  Don't have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontSize: FONT_SIZES.sm,
                      fontWeight: "700",
                    }}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

export default LoginScreen;
