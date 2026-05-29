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

export const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    mobile_number: "",
    email: "",
    address: "",
    district: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { signUp, error: authError } = useContext(AuthContext);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.mobile_number.trim()) newErrors.mobile_number = "Mobile number is required";
    if (formData.mobile_number && !/^\d{10}$/.test(formData.mobile_number.replace(/\D/g, ""))) {
      newErrors.mobile_number = "Enter a valid 10-digit mobile number";
    }
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }
    if (formData.address.trim().length < 5) newErrors.address = "Address must be at least 5 characters";
    if (formData.district.trim().length < 2) newErrors.district = "District is required";
    if (!agreedToTerms) {
      newErrors.terms = "You must agree to Terms & Conditions";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await signUp({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile_number: formData.mobile_number.replace(/\D/g, ""),
        address: formData.address.trim(),
        district: formData.district.trim(),
      });
      navigation.navigate("VerifyRegister", {
        email: formData.email.trim().toLowerCase(),
      });
    } catch (error) {
      console.error("Register error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <GradientBackground colors={GRADIENTS.softGradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: SPACING.lg,
            width: "100%",
            maxWidth: 430,
            alignSelf: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: COLORS.card,
              marginBottom: SPACING.xl,
              ...SHADOWS.sm,
            }}
          >
            <Icon name="arrow-left" size={20} color={COLORS.textDark} />
          </TouchableOpacity>

          <View style={{ marginBottom: SPACING.xl }}>
            <Text
              style={{
                fontSize: FONT_SIZES.xxl,
                fontWeight: "700",
                color: COLORS.textDark,
                marginBottom: SPACING.sm,
              }}
            >
              Create Account
            </Text>
            <Text
              style={{
                fontSize: FONT_SIZES.base,
                color: COLORS.textLight,
              }}
            >
              Register as a citizen and verify your email.
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
              label="Full Name"
              placeholder="Enter your name"
              value={formData.name}
              onChangeText={(value) => updateField("name", value)}
              error={errors.name}
              icon="account"
            />

            <TextField
              label="Mobile Number"
              placeholder="10-digit mobile number"
              value={formData.mobile_number}
              onChangeText={(value) => updateField("mobile_number", value)}
              keyboardType="phone-pad"
              error={errors.mobile_number}
              icon="phone"
            />

            <TextField
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => updateField("email", value)}
              keyboardType="email-address"
              error={errors.email}
              icon="email"
            />

            <TextField
              label="Address"
              placeholder="House/street or locality"
              value={formData.address}
              onChangeText={(value) => updateField("address", value)}
              error={errors.address}
              icon="map-marker"
              multiline
              numberOfLines={2}
            />

            <TextField
              label="District"
              placeholder="Example: Chennai"
              value={formData.district}
              onChangeText={(value) => updateField("district", value)}
              error={errors.district}
              icon="city"
              style={{ marginBottom: SPACING.md }}
            />

            <TouchableOpacity
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: SPACING.lg,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: agreedToTerms ? COLORS.primary : COLORS.border,
                  backgroundColor: agreedToTerms ? COLORS.primary : "transparent",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: SPACING.md,
                }}
              >
                {agreedToTerms && (
                  <Icon name="check" size={14} color={COLORS.card} />
                )}
              </View>
              <Text style={{ color: COLORS.textDark, flex: 1 }}>
                I agree to the{" "}
                <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
                  Terms & Conditions
                </Text>
              </Text>
            </TouchableOpacity>

            {errors.terms && (
              <Text
                style={{
                  color: COLORS.error,
                  fontSize: FONT_SIZES.xs,
                  marginBottom: SPACING.md,
                }}
              >
                {errors.terms}
              </Text>
            )}

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
              title="REGISTER"
              onPress={handleRegister}
              loading={loading}
              variant="primary"
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: SPACING.lg,
              }}
            >
              <Text style={{ color: COLORS.textGray, fontSize: FONT_SIZES.sm }}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text
                  style={{
                    color: COLORS.primary,
                    fontSize: FONT_SIZES.sm,
                    fontWeight: "700",
                  }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

export default RegisterScreen;
