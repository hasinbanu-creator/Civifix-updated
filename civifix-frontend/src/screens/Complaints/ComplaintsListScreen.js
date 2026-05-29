import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Card, GradientBackground } from "../../components";
import { COLORS, FONT_SIZES, GRADIENTS, SPACING } from "../../constants/theme";
import authService from "../../services/authService";
import { getErrorMessage } from "../../services/api";
import ComplaintCard from "./ComplaintCard";

const extractComplaints = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.complaints)) return payload.complaints;
  return [];
};

export const ComplaintsListScreen = ({ navigation }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadComplaints = useCallback(async () => {
    try {
      setError("");
      const payload = await authService.getComplaints({ limit: 25 });
      setComplaints(extractComplaints(payload));
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load complaints"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadComplaints);
    return unsubscribe;
  }, [loadComplaints, navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    loadComplaints();
  };

  return (
    <GradientBackground colors={GRADIENTS.softGradient}>
      <ScrollView
        contentContainerStyle={{
          padding: SPACING.lg,
          paddingBottom: SPACING.xxl,
          width: "100%",
          maxWidth: 520,
          alignSelf: "center",
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <LinearGradient
          colors={GRADIENTS.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: SPACING.xl,
            padding: SPACING.lg,
            borderRadius: 8,
          }}
        >
          <View>
            <Text style={{ fontSize: FONT_SIZES.xl, fontWeight: "700", color: COLORS.card }}>
              My Complaints
            </Text>
            <Text style={{ color: COLORS.card, opacity: 0.85, marginTop: SPACING.xs }}>
              Track requests from open to closed
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("CreateComplaint")}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.22)",
            }}
          >
            <Icon name="plus" size={24} color={COLORS.card} />
          </TouchableOpacity>
        </LinearGradient>

        {error ? (
          <Card style={{ marginBottom: SPACING.md }}>
            <Text style={{ color: COLORS.error, marginBottom: SPACING.md }}>{error}</Text>
            <Button title="Retry" onPress={loadComplaints} size="sm" />
          </Card>
        ) : null}

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : complaints.length > 0 ? (
          complaints.map((complaint) => (
            <ComplaintCard
              key={complaint._id || complaint.complaint_id}
              complaint={complaint}
              onPress={() => navigation.navigate("ComplaintDetail", { complaint })}
            />
          ))
        ) : (
          <Card variant="elevated" style={{ alignItems: "center" }}>
            <Icon name="clipboard-text-outline" size={40} color={COLORS.textGray} />
            <Text
              style={{
                color: COLORS.textDark,
                fontSize: FONT_SIZES.base,
                fontWeight: "700",
                marginTop: SPACING.md,
              }}
            >
              No complaints yet
            </Text>
            <Text
              style={{
                color: COLORS.textLight,
                fontSize: FONT_SIZES.sm,
                textAlign: "center",
                marginVertical: SPACING.md,
              }}
            >
              Raise your first civic issue and follow its status here.
            </Text>
            <Button title="Raise Complaint" onPress={() => navigation.navigate("CreateComplaint")} />
          </Card>
        )}
      </ScrollView>
    </GradientBackground>
  );
};

export default ComplaintsListScreen;
