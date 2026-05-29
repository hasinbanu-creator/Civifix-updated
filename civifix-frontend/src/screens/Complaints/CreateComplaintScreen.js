import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Button, Card, GradientBackground, TextField } from "../../components";
import { COLORS, FONT_SIZES, GRADIENTS, SPACING, SHADOWS } from "../../constants/theme";
import authService from "../../services/authService";
import { getErrorMessage } from "../../services/api";

const COMPLAINT_TYPES = [
  "GARBAGE",
  "ROAD_DAMAGE",
  "POTHOLE",
  "STREETLIGHT",
  "WATER_SUPPLY",
  "DRAINAGE",
  "SANITATION",
  "TREE_CUTTING",
  "CONSTRUCTION",
  "OTHER",
];

export const CreateComplaintScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    ward_id: "",
    complaint_type: "GARBAGE",
    description: "",
    latitude: "",
    longitude: "",
    address: "",
    citizen_note: "",
    priority: "MEDIUM",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);

    if (!form.ward_id.trim()) nextErrors.ward_id = "Ward ID is required";
    if (!COMPLAINT_TYPES.includes(form.complaint_type.trim().toUpperCase())) {
      nextErrors.complaint_type = "Use a supported complaint type";
    }
    if (form.description.trim().length < 10) {
      nextErrors.description = "Description must be at least 10 characters";
    }
    if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      nextErrors.latitude = "Latitude must be between -90 and 90";
    }
    if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      nextErrors.longitude = "Longitude must be between -180 and 180";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    setServerError("");
    try {
      const created = await authService.createComplaint({
        ward_id: form.ward_id.trim(),
        complaint_type: form.complaint_type.trim().toUpperCase(),
        description: form.description.trim(),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        address: form.address.trim() || undefined,
        citizen_note: form.citizen_note.trim() || undefined,
        image_urls: [],
        priority: form.priority.trim().toUpperCase() || "MEDIUM",
      });
      Alert.alert("Complaint created", "Your complaint has been submitted.", [
        {
          text: "View",
          onPress: () => navigation.replace("ComplaintDetail", { complaint: created }),
        },
      ]);
    } catch (err) {
      setServerError(getErrorMessage(err, "Unable to create complaint"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground colors={GRADIENTS.softGradient}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: SPACING.lg,
            paddingBottom: SPACING.xxl,
            width: "100%",
            maxWidth: 520,
            alignSelf: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACING.xl }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: COLORS.card,
                alignItems: "center",
                justifyContent: "center",
                marginRight: SPACING.md,
                ...SHADOWS.sm,
              }}
            >
              <Icon name="arrow-left" size={20} color={COLORS.textDark} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: FONT_SIZES.xl, fontWeight: "700", color: COLORS.textDark }}>
                Raise a Complaint
              </Text>
              <Text style={{ color: COLORS.textLight, marginTop: SPACING.xs }}>
                Tell us what's happening
              </Text>
            </View>
          </View>

          <Card variant="elevated">
            <Text style={{ color: COLORS.textDark, fontWeight: "700", marginBottom: SPACING.sm }}>
              Category
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: SPACING.lg }}>
              {COMPLAINT_TYPES.slice(0, 6).map((type) => {
                const selected = form.complaint_type === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => updateField("complaint_type", type)}
                    style={{
                      borderRadius: 8,
                      paddingHorizontal: SPACING.md,
                      paddingVertical: SPACING.sm,
                      marginRight: SPACING.sm,
                      marginBottom: SPACING.sm,
                      backgroundColor: selected ? COLORS.primary : COLORS.surface,
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? COLORS.card : COLORS.textLight,
                        fontSize: FONT_SIZES.xs,
                        fontWeight: "700",
                      }}
                    >
                      {type.replace(/_/g, " ")}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextField
              label="Ward ID"
              placeholder="Paste the ward Mongo ID"
              value={form.ward_id}
              onChangeText={(value) => updateField("ward_id", value)}
              error={errors.ward_id}
              icon="map-marker-radius"
            />
            <TextField
              label="Description"
              placeholder="Describe the issue clearly"
              value={form.description}
              onChangeText={(value) => updateField("description", value)}
              error={errors.description}
              icon="text"
              multiline
              numberOfLines={4}
            />
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1, marginRight: SPACING.sm }}>
                <TextField
                  label="Latitude"
                  placeholder="13.0827"
                  value={form.latitude}
                  onChangeText={(value) => updateField("latitude", value)}
                  keyboardType="decimal-pad"
                  error={errors.latitude}
                  icon="crosshairs-gps"
                />
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <TextField
                  label="Longitude"
                  placeholder="80.2707"
                  value={form.longitude}
                  onChangeText={(value) => updateField("longitude", value)}
                  keyboardType="decimal-pad"
                  error={errors.longitude}
                  icon="crosshairs-gps"
                />
              </View>
            </View>
            <TextField
              label="Address"
              placeholder="Nearby landmark or street"
              value={form.address}
              onChangeText={(value) => updateField("address", value)}
              icon="home-map-marker"
            />
            <TextField
              label="Citizen Note"
              placeholder="Any extra context"
              value={form.citizen_note}
              onChangeText={(value) => updateField("citizen_note", value)}
              icon="note-text"
              multiline
              numberOfLines={2}
            />
            <Text style={{ color: COLORS.textDark, fontWeight: "700", marginBottom: SPACING.sm }}>
              Priority
            </Text>
            <View style={{ flexDirection: "row", marginBottom: SPACING.lg }}>
              {["LOW", "MEDIUM", "HIGH"].map((priority) => {
                const selected = form.priority === priority;
                return (
                  <TouchableOpacity
                    key={priority}
                    onPress={() => updateField("priority", priority)}
                    style={{
                      flex: 1,
                      borderRadius: 8,
                      paddingVertical: SPACING.sm,
                      alignItems: "center",
                      marginRight: priority === "HIGH" ? 0 : SPACING.sm,
                      backgroundColor: selected ? COLORS.primary : COLORS.surface,
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? COLORS.card : COLORS.textLight,
                        fontSize: FONT_SIZES.xs,
                        fontWeight: "700",
                      }}
                    >
                      {priority}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {serverError ? (
              <Text style={{ color: COLORS.error, marginBottom: SPACING.md }}>{serverError}</Text>
            ) : null}

            <Button title="SUBMIT COMPLAINT" onPress={submit} loading={loading} />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

export default CreateComplaintScreen;
