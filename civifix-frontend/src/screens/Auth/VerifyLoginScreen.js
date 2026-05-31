import React, { useState, useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PRIMARY       = "#2563EB";
const PRIMARY_LIGHT = "#EFF6FF";
const ERROR         = "#DC2626";
const GRAY_50       = "#F9FAFB";
const GRAY_100      = "#F3F4F6";
const GRAY_200      = "#E5E7EB";
const GRAY_400      = "#9CA3AF";
const GRAY_600      = "#4B5563";
const GRAY_800      = "#1F2937";

const OTP_LENGTH = 6;

export const VerifyLoginScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [otp, setOtp]             = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [timer, setTimer]         = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  const { signIn, verifyLogin, error: authError } = useContext(AuthContext);
  const inputRefs = useRef([]);

  /* ── countdown ── */
  useEffect(() => {
    const id = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) { setCanResend(true); clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const timerLabel = `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")}`;

  /* ── OTP helpers ── */
  const handleOtpChange = (val, idx) => {
    if (val.length === OTP_LENGTH && /^\d+$/.test(val)) {
      const arr = val.split("");
      setOtp(arr);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      return;
    }
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    setError("");
    if (digit && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const otpValue  = otp.join("");
  const isComplete = otpValue.length === OTP_LENGTH;

  /* ── verify ── */
  const handleVerify = async () => {
    if (!isComplete) { setError("Please enter all 6 digits"); return; }
    setLoading(true);
    setError("");
    try {
      await verifyLogin(email, otpValue);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── resend ── */
  const handleResend = async () => {
    setResending(true);
    try {
      await signIn(email);
      setTimer(120);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(""));
      setError("");
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to resend OTP");
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(b.length) + c);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.flex}
    >
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      {/* ── HEADER — mirrors LoginScreen hero colour ── */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Verify OTP</Text>
          <Text style={styles.headerSub}>Secure login to CiviFix</Text>
        </View>
        {/* lock icon on right — signals security */}
        <View style={styles.lockBadge}>
          <Icon name="shield-check-outline" size={18} color="#fff" />
        </View>
      </View>

      {/* ── PROGRESS — single thin accent bar ── */}
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>

      <View style={styles.body}>

        {/* ── EMAIL PILL — same as VerifyRegister ── */}
        <View style={styles.emailCard}>
          <View style={styles.emailIconWrap}>
            <Icon name="email-fast-outline" size={28} color={PRIMARY} />
          </View>
          <View style={styles.emailTextWrap}>
            <Text style={styles.emailLabel}>OTP sent to</Text>
            <Text style={styles.emailValue}>{maskedEmail}</Text>
          </View>
        </View>

        {/* ── MAIN CARD ── */}
        <View style={styles.card}>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Icon name="shield-key-outline" size={16} color={PRIMARY} />
            </View>
            <Text style={styles.sectionTitle}>Enter 6-digit OTP</Text>
          </View>

          {/* OTP BOXES */}
          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(r) => (inputRefs.current[idx] = r)}
                style={[
                  styles.otpBox,
                  digit && styles.otpBoxFilled,
                  (error || authError) && styles.otpBoxError,
                  !digit && idx === otp.findIndex((d) => d === "") && styles.otpBoxActive,
                ]}
                value={digit}
                onChangeText={(val) => handleOtpChange(val, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                selectTextOnFocus
                caretHidden
              />
            ))}
          </View>

          {/* error or timer */}
          {error || authError ? (
            <View style={styles.errorRow}>
              <Icon name="alert-circle-outline" size={14} color={ERROR} />
              <Text style={styles.errorText}>{error || authError}</Text>
            </View>
          ) : (
            <View style={styles.timerRow}>
              {canResend ? (
                <TouchableOpacity
                  onPress={handleResend}
                  style={styles.resendBtn}
                  disabled={resending}
                >
                  {resending
                    ? <ActivityIndicator size="small" color={PRIMARY} />
                    : <Icon name="refresh" size={15} color={PRIMARY} />
                  }
                  <Text style={styles.resendText}>
                    {resending ? "Sending…" : "Resend OTP"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>
                  Resend in <Text style={styles.timerValue}>{timerLabel}</Text>
                </Text>
              )}
            </View>
          )}

          {/* CTA */}
          <TouchableOpacity
            style={[styles.ctaBtn, (!isComplete || loading) && styles.ctaBtnDisabled]}
            onPress={handleVerify}
            disabled={!isComplete || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.ctaBtnText}>VERIFY & LOGIN</Text>
                <Icon name="login" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.hint}>
            Didn't get the email? Check your spam folder.
          </Text>
        </View>

        {/* bottom link */}
        <View style={styles.signinRow}>
          <Text style={styles.signinText}>Wrong email? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.signinLink}>Go back & change</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: GRAY_50 },

  /* ── HEADER ── */
  headerBar: {
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 52 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },
  headerCenter: { flex: 1 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  headerSub:   { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 1 },
  lockBadge: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },

  /* ── PROGRESS ── */
  progressTrack: {
    height: 3, backgroundColor: GRAY_200,
    marginHorizontal: 20, marginTop: 20,
    borderRadius: 4, overflow: "hidden",
  },
  progressFill: {
    width: "100%", height: "100%",
    backgroundColor: PRIMARY, borderRadius: 4,
  },

  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  /* ── EMAIL PILL ── */
  emailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  emailIconWrap: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  emailTextWrap: { flex: 1 },
  emailLabel: { fontSize: 11, color: GRAY_400, fontWeight: "600", letterSpacing: 0.4 },
  emailValue: { fontSize: 14, color: GRAY_800, fontWeight: "700", marginTop: 2 },

  /* ── CARD ── */
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row", alignItems: "center",
    gap: 8, marginBottom: 20,
  },
  sectionIconWrap: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center", justifyContent: "center",
  },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: GRAY_800, letterSpacing: 0.2 },

  /* ── OTP BOXES ── */
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 0.85,
    borderWidth: 1.5,
    borderColor: GRAY_200,
    borderRadius: 12,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: GRAY_800,
    backgroundColor: GRAY_50,
  },
  otpBoxFilled: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY_LIGHT,
    color: PRIMARY,
  },
  otpBoxActive: {
    borderColor: PRIMARY,
    backgroundColor: "#fff",
  },
  otpBoxError: {
    borderColor: ERROR,
    backgroundColor: "#FEF2F2",
    color: ERROR,
  },

  /* ── ERROR / TIMER ── */
  errorRow: {
    flexDirection: "row", alignItems: "center",
    gap: 6, marginBottom: 16, justifyContent: "center",
  },
  errorText: { color: ERROR, fontSize: 12 },

  timerRow: {
    alignItems: "center",
    marginBottom: 16,
  },
  timerText: { color: GRAY_400, fontSize: 13 },
  timerValue: { color: PRIMARY, fontWeight: "700" },

  resendBtn: {
    flexDirection: "row", alignItems: "center",
    gap: 6, paddingVertical: 6, paddingHorizontal: 16,
    backgroundColor: PRIMARY_LIGHT, borderRadius: 20,
    minWidth: 120, justifyContent: "center",
  },
  resendText: { color: PRIMARY, fontSize: 13, fontWeight: "700" },

  /* ── CTA ── */
  ctaBtn: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    backgroundColor: PRIMARY,
    borderRadius: 14, paddingVertical: 15,
    marginBottom: 14,
  },
  ctaBtnDisabled: { opacity: 0.45 },
  ctaBtnText: { color: "#fff", fontSize: 14, fontWeight: "800", letterSpacing: 0.8 },

  hint: {
    textAlign: "center", fontSize: 11,
    color: GRAY_400, lineHeight: 16,
  },

  /* ── BOTTOM LINK ── */
  signinRow: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", marginTop: 20,
  },
  signinText: { color: GRAY_400, fontSize: 13 },
  signinLink: { color: PRIMARY, fontSize: 13, fontWeight: "800" },
});

export default VerifyLoginScreen;