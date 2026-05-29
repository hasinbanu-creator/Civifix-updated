import React, { useState, useContext, useEffect } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../../context/AuthContext";
import { Button, TextField, GradientBackground, Card } from "../../components";
import { COLORS, GRADIENTS, SPACING, FONT_SIZES, SHADOWS } from "../../constants/theme";

export const VerifyRegisterScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const { verifyRegister, error: authError } = useContext(AuthContext);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await verifyRegister(email, otp);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setTimer(120);
    setCanResend(false);
    setOtp("");
  };

  return (
    <GradientBackground colors={GRADIENTS.softGradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: SPACING.lg,
          width: "100%",
          maxWidth: 430,
          alignSelf: "center",
        }}
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
            Verify Your Email
          </Text>
          <Text
            style={{
              fontSize: FONT_SIZES.base,
              color: COLORS.textLight,
            }}
          >
            We've sent an OTP to {email}
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
            label="Enter OTP"
            placeholder="6-digit OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            error={error || authError}
            icon="email-check"
          />

          <Button
            title="VERIFY & REGISTER"
            onPress={handleVerify}
            loading={loading}
            variant="primary"
            style={{ marginBottom: SPACING.lg }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: COLORS.textGray, fontSize: FONT_SIZES.sm }}>
              Resend OTP in{" "}
            </Text>
            <Text style={{ color: COLORS.primary, fontWeight: "700", fontSize: FONT_SIZES.sm }}>
              {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
            </Text>
          </View>

          {canResend && (
            <TouchableOpacity
              onPress={handleResend}
              style={{ marginTop: SPACING.lg }}
            >
              <Text
                style={{
                  color: COLORS.primary,
                  fontSize: FONT_SIZES.sm,
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                Didn't receive OTP? Resend
              </Text>
            </TouchableOpacity>
          )}
        </Card>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

export default VerifyRegisterScreen;
