import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Button, Card, GradientBackground } from "../../components";
import { COLORS, FONT_SIZES, GRADIENTS, SPACING } from "../../constants/theme";
import authService from "../../services/authService";
import { getErrorMessage } from "../../services/api";

const DetailRow = ({ label, value }) => (
  <View style={{ marginBottom: SPACING.md }}>
    <Text style={{ color: COLORS.textGray, fontSize: FONT_SIZES.xs, fontWeight: "700" }}>
      {label}
    </Text>
    <Text style={{ color: COLORS.textDark, fontSize: FONT_SIZES.base, marginTop: 2 }}>
      {value || "Not available"}
    </Text>
  </View>
);

export const ComplaintDetailScreen = ({ route, navigation }) => {
  const initialComplaint = route.params?.complaint;
  const [complaint, setComplaint] = useState(initialComplaint);
  const [loading, setLoading] = useState(Boolean(initialComplaint?._id));
  const [error, setError] = useState("");

  const complaintId = initialComplaint?._id;

  useEffect(() => {
    const load = async () => {
      if (!complaintId) {
        setLoading(false);
        return;
      }
      try {
        setError("");
        const data = await authService.getComplaint(complaintId);
        setComplaint(data);
      } catch (err) {
        setError(getErrorMessage(err, "Unable to load complaint details"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [complaintId]);

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
        <Button
          title="Back"
          variant="ghost"
          fullWidth={false}
          onPress={() => navigation.goBack()}
          style={{ alignSelf: "flex-start", marginBottom: SPACING.md, paddingHorizontal: 0 }}
        />

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : error ? (
          <Card>
            <Text style={{ color: COLORS.error, marginBottom: SPACING.md }}>{error}</Text>
            <Button title="Back to Complaints" onPress={() => navigation.navigate("ComplaintsHome")} />
          </Card>
        ) : (
          <>
            <Card variant="primary" style={{ marginBottom: SPACING.lg }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACING.md }}>
                <Icon name="clipboard-alert-outline" size={24} color={COLORS.card} />
                <Text
                  style={{
                    color: COLORS.card,
                    fontSize: FONT_SIZES.xl,
                    fontWeight: "700",
                    marginLeft: SPACING.sm,
                    textTransform: "capitalize",
                  }}
                >
                  {(complaint?.complaint_type || "Complaint").replace(/_/g, " ").toLowerCase()}
                </Text>
              </View>
              <Text style={{ color: COLORS.card, opacity: 0.85 }}>
                {complaint?.complaint_id || complaint?._id}
              </Text>
            </Card>

            <Card variant="elevated" style={{ marginBottom: SPACING.lg }}>
              <DetailRow label="Status" value={complaint?.status} />
              <DetailRow label="Priority" value={complaint?.priority} />
              <DetailRow label="Description" value={complaint?.description} />
              <DetailRow label="Address" value={complaint?.address} />
              <DetailRow
                label="Coordinates"
                value={
                  complaint?.latitude && complaint?.longitude
                    ? `${complaint.latitude}, ${complaint.longitude}`
                    : null
                }
              />
              <DetailRow label="Citizen Note" value={complaint?.citizen_note} />
              <DetailRow label="Worker Note" value={complaint?.worker_note} />
              <DetailRow label="Inspector Note" value={complaint?.inspector_note} />
              <DetailRow label="Rejection Reason" value={complaint?.rejection_reason} />
            </Card>

            <Text
              style={{
                color: COLORS.textDark,
                fontSize: FONT_SIZES.lg,
                fontWeight: "700",
                marginBottom: SPACING.md,
              }}
            >
              History
            </Text>
            {complaint?.history?.length ? (
              complaint.history.map((item) => (
                <Card key={item._id} style={{ marginBottom: SPACING.md }}>
                  <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                    <View
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: COLORS.success + "20",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: SPACING.md,
                      }}
                    >
                      <Icon name="check" size={16} color={COLORS.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: COLORS.textDark, fontWeight: "700" }}>{item.action}</Text>
                      <Text style={{ color: COLORS.textLight, marginTop: SPACING.xs }}>
                        {item.remarks || `${item.old_status || "New"} -> ${item.new_status || complaint?.status}`}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))
            ) : (
              <Card>
                <Text style={{ color: COLORS.textLight }}>No history entries yet.</Text>
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </GradientBackground>
  );
};

export default ComplaintDetailScreen;
