import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { Button, TextField } from "../../components";
import { COLORS, FONT_SIZES, SPACING, SHADOWS } from "../../constants/theme";
import authService from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const DEFAULT_DISTRICT_ID = "6a156a1258884d22663b2a06";

const COMPLAINT_TYPES = [
  { value: "GARBAGE",      label: "Garbage / Waste",       icon: "trash-can-outline",    color: "#0891B2" },
  { value: "ROAD_DAMAGE",  label: "Road Damage",           icon: "road-variant",          color: "#DC2626" },
  { value: "POTHOLE",      label: "Pothole",               icon: "road-variant",          color: "#DC2626" },
  { value: "STREETLIGHT",  label: "Street Light",          icon: "lightbulb-on-outline",  color: "#D97706" },
  { value: "WATER_SUPPLY", label: "Water Supply",          icon: "water-outline",         color: "#0052CC" },
  { value: "DRAINAGE",     label: "Drainage Issue",        icon: "pipe-disconnected",     color: "#0891B2" },
  { value: "SANITATION",   label: "Sanitation",            icon: "broom",                 color: "#059669" },
  { value: "TREE_CUTTING", label: "Tree / Fallen Branch",  icon: "tree-outline",          color: "#059669" },
  { value: "CONSTRUCTION", label: "Construction Block",    icon: "hammer-wrench",         color: "#D97706" },
  { value: "OTHER",        label: "Other Issue",           icon: "alert-circle-outline",  color: "#6B7280" },
];

const PRIORITIES = [
  { value: "LOW",    label: "Low",    color: "#059669", bg: "#D1FAE5" },
  { value: "MEDIUM", label: "Medium", color: "#D97706", bg: "#FEF3C7" },
  { value: "HIGH",   label: "High",   color: "#DC2626", bg: "#FFE4E6" },
];

// ─── DROPDOWN COMPONENT ───────────────────────────────────────────────────────

const Dropdown = ({ label, placeholder, value, items, onSelect, error, renderItem, keyExtractor, loading: dropLoading }) => {
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => (i.value ?? i._id ?? i) === value);

  return (
    <View style={{ marginBottom: SPACING.md }}>
      <Text style={{ fontSize: FONT_SIZES.xs, fontWeight: "700", color: COLORS.textDark, marginBottom: 6 }}>
        {label}
      </Text>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.78}
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: COLORS.surface ?? "#F8FAFC",
          borderRadius: 10,
          borderWidth: 1.5,
          borderColor: error ? COLORS.error : open ? COLORS.primary : "#E2E8F0",
          paddingHorizontal: SPACING.md,
          paddingVertical: 12,
          minHeight: 48,
        }}
      >
        {dropLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 8 }} />
        ) : selected?.icon ? (
          <Icon name={selected.icon} size={18} color={selected.color ?? COLORS.primary} style={{ marginRight: 8 }} />
        ) : (
          <View style={{ width: 18, marginRight: 8 }} />
        )}
        <Text style={{
          flex: 1,
          fontSize: FONT_SIZES.sm,
          color: selected ? COLORS.textDark : COLORS.textLight,
          fontWeight: selected ? "600" : "400",
        }}>
          {selected ? (selected.label ?? selected.ward_name ?? selected) : placeholder}
        </Text>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={18} color={COLORS.textLight} />
      </TouchableOpacity>
      {!!error && (
        <Text style={{ color: COLORS.error, fontSize: FONT_SIZES.xs, marginTop: 4 }}>{error}</Text>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.38)" }}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            backgroundColor: COLORS.card,
            borderTopLeftRadius: 20, borderTopRightRadius: 20,
            paddingTop: 12, paddingBottom: Platform.OS === "ios" ? 34 : 20,
            maxHeight: "65%",
          }}>
            {/* Handle */}
            <View style={{
              width: 36, height: 4, borderRadius: 2,
              backgroundColor: "#E2E8F0", alignSelf: "center", marginBottom: 12,
            }} />
            <Text style={{
              fontSize: FONT_SIZES.sm, fontWeight: "800", color: COLORS.textDark,
              paddingHorizontal: SPACING.lg, marginBottom: 8,
            }}>
              {label}
            </Text>
            <FlatList
              data={items}
              keyExtractor={keyExtractor ?? ((item, i) => item._id ?? item.value ?? String(i))}
              renderItem={({ item }) => {
                const isSelected = (item.value ?? item._id ?? item) === value;
                return renderItem
                  ? renderItem({ item, isSelected, onSelect: (v) => { onSelect(v); setOpen(false); } })
                  : (
                    <TouchableOpacity
                      onPress={() => { onSelect(item.value ?? item._id ?? item); setOpen(false); }}
                      style={{
                        flexDirection: "row", alignItems: "center",
                        paddingHorizontal: SPACING.lg, paddingVertical: 13,
                        backgroundColor: isSelected ? `${COLORS.primary}08` : "transparent",
                      }}
                    >
                      {item.icon && (
                        <View style={{
                          width: 32, height: 32, borderRadius: 8,
                          backgroundColor: `${item.color ?? COLORS.primary}14`,
                          alignItems: "center", justifyContent: "center", marginRight: 12,
                        }}>
                          <Icon name={item.icon} size={17} color={item.color ?? COLORS.primary} />
                        </View>
                      )}
                      <Text style={{
                        flex: 1, fontSize: FONT_SIZES.sm,
                        color: COLORS.textDark, fontWeight: isSelected ? "700" : "500",
                      }}>
                        {item.label ?? item.ward_name ?? item}
                      </Text>
                      {isSelected && <Icon name="check" size={18} color={COLORS.primary} />}
                    </TouchableOpacity>
                  );
              }}
              ItemSeparatorComponent={() => (
                <View style={{ height: 0.5, backgroundColor: "#F1F5F9", marginHorizontal: SPACING.lg }} />
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ─── SECTION HEADER ──────────────────────────────────────────────────────────

const SectionHeader = ({ icon, title, subtitle }) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACING.md }}>
    <View style={{
      width: 32, height: 32, borderRadius: 8,
      backgroundColor: `${COLORS.primary}12`,
      alignItems: "center", justifyContent: "center", marginRight: 10,
    }}>
      <Icon name={icon} size={17} color={COLORS.primary} />
    </View>
    <View>
      <Text style={{ fontSize: FONT_SIZES.sm, fontWeight: "800", color: COLORS.textDark }}>{title}</Text>
      {!!subtitle && <Text style={{ fontSize: 11, color: COLORS.textLight, marginTop: 1 }}>{subtitle}</Text>}
    </View>
  </View>
);

const FormCard = ({ children, style }) => (
  <View style={{
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    ...style,
  }}>
    {children}
  </View>
);

// ─── PRIORITY SELECTOR ────────────────────────────────────────────────────────

const PrioritySelector = ({ value, onChange }) => (
  <View style={{ flexDirection: "row", gap: SPACING.sm }}>
    {PRIORITIES.map((p) => {
      const selected = value === p.value;
      return (
        <TouchableOpacity
          key={p.value}
          onPress={() => onChange(p.value)}
          activeOpacity={0.78}
          style={{
            flex: 1, borderRadius: 10, paddingVertical: 10,
            alignItems: "center", justifyContent: "center",
            backgroundColor: selected ? p.bg : COLORS.surface ?? "#F8FAFC",
            borderWidth: 1.5,
            borderColor: selected ? p.color : "#E2E8F0",
          }}
        >
          <Icon
            name={p.value === "HIGH" ? "alert" : p.value === "MEDIUM" ? "minus" : "arrow-down"}
            size={15} color={selected ? p.color : COLORS.textLight}
          />
          <Text style={{
            fontSize: 11, fontWeight: "700", marginTop: 3,
            color: selected ? p.color : COLORS.textLight,
          }}>
            {p.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────

export const CreateComplaintScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    ward_id: "",
    complaint_type: "",
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
  const [wards, setWards] = useState([]);
  const [wardsLoading, setWardsLoading] = useState(true);

  // Fetch wards on mount
  useEffect(() => {
    fetchWards();
  }, []);

  const fetchWards = async () => {
    setWardsLoading(true);
    try {
      const districtId = user?.district_id ?? user?.district ?? DEFAULT_DISTRICT_ID;
      const res = await authService.getWardsByDistrict(districtId, { page: 1, is_active: true });
      // Expected shape: { data: [ward,...], total, page, limit }
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setWards(list);
    } catch (err) {
      console.error("Failed to fetch wards:", err);
      setWards([]);
    } finally {
      setWardsLoading(false);
    }
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.ward_id)          next.ward_id        = "Please select a ward";
    if (!form.complaint_type)   next.complaint_type = "Please select a complaint type";
    if (form.description.trim().length < 10)
                                next.description    = "Description must be at least 10 characters";
    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    if (form.latitude  && (isNaN(lat) || lat < -90  || lat > 90))   next.latitude  = "Must be between -90 and 90";
    if (form.longitude && (isNaN(lng) || lng < -180 || lng > 180)) next.longitude = "Must be between -180 and 180";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    setServerError("");
    try {
      const payload = {
        ward_id: form.ward_id,
        complaint_type: form.complaint_type,
        description: form.description.trim(),
        image_urls: [],
        priority: form.priority,
        ...(form.latitude  && { latitude:  Number(form.latitude)  }),
        ...(form.longitude && { longitude: Number(form.longitude) }),
        ...(form.address.trim()      && { address:      form.address.trim()      }),
        ...(form.citizen_note.trim() && { citizen_note: form.citizen_note.trim() }),
      };
      const created = await authService.createComplaint(payload);
      Alert.alert("Submitted!", "Your complaint has been raised successfully.", [
        { text: "View", onPress: () => navigation.replace("ComplaintDetail", { complaint: created }) },
        { text: "Done", onPress: () => navigation.goBack(), style: "cancel" },
      ]);
    } catch (err) {
      setServerError(getErrorMessage(err, "Unable to submit complaint. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // Ward items for dropdown
  const wardItems = wards.map((w) => ({
    ...w,
    value: w._id ?? w.ward_id,
    label: w.label ?? w.ward_name ?? w.name ?? w._id,
  }));

  const selectedType = COMPLAINT_TYPES.find((t) => t.value === form.complaint_type);

  return (
    <View style={{ flex: 1, backgroundColor: "#F0F4F8" }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>

        {/* ── Header ── */}
        <LinearGradient
          colors={["#0052CC", "#172B4D"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{
            paddingTop: Platform.OS === "ios" ? 56 : 40,
            paddingBottom: 24,
            paddingHorizontal: SPACING.lg,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.18)",
                alignItems: "center", justifyContent: "center", marginRight: SPACING.md,
              }}
            >
              <Icon name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontSize: FONT_SIZES.lg, fontWeight: "900" }}>
                Raise a Complaint
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: FONT_SIZES.xs, marginTop: 2 }}>
                Help us fix your community
              </Text>
            </View>
            <View style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.18)",
              alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="flask-outline" size={20} color="#fff" />
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: SPACING.lg,
            paddingBottom: SPACING.xxl + 20,
            maxWidth: 520,
            alignSelf: "center",
            width: "100%",
          }}
        >

          {/* ── Section 1: What's the issue ── */}
          <FormCard>
            <SectionHeader icon="alert-circle-outline" title="What's the issue?" subtitle="Select the type and describe it" />

            <Dropdown
              label="Complaint Type"
              placeholder="Select a category"
              value={form.complaint_type}
              items={COMPLAINT_TYPES}
              onSelect={(v) => updateField("complaint_type", v)}
              error={errors.complaint_type}
            />

            <TextField
              label="Description"
              placeholder="Describe the issue clearly (min 10 characters)"
              value={form.description}
              onChangeText={(v) => updateField("description", v)}
              error={errors.description}
              icon="text"
              multiline
              numberOfLines={4}
            />

            <Text style={{ fontSize: FONT_SIZES.xs, fontWeight: "700", color: COLORS.textDark, marginBottom: SPACING.sm }}>
              Priority
            </Text>
            <PrioritySelector value={form.priority} onChange={(v) => updateField("priority", v)} />
          </FormCard>

          {/* ── Section 2: Where is it ── */}
          <FormCard>
            <SectionHeader icon="map-marker-radius" title="Where is it?" subtitle="Ward, address & GPS coordinates" />

            <Dropdown
              label="Ward"
              placeholder={wardsLoading ? "Loading wards…" : "Select your ward"}
              value={form.ward_id}
              items={wardItems}
              loading={wardsLoading}
              onSelect={(v) => updateField("ward_id", v)}
              error={errors.ward_id}
              keyExtractor={(item) => item._id ?? item.ward_id ?? item.value}
              renderItem={({ item, isSelected, onSelect }) => (
                <TouchableOpacity
                  onPress={() => onSelect(item.value)}
                  style={{
                    flexDirection: "row", alignItems: "center",
                    paddingHorizontal: SPACING.lg, paddingVertical: 13,
                    backgroundColor: isSelected ? `${COLORS.primary}08` : "transparent",
                  }}
                >
                  <View style={{
                    width: 32, height: 32, borderRadius: 8,
                    backgroundColor: `${COLORS.primary}12`,
                    alignItems: "center", justifyContent: "center", marginRight: 12,
                  }}>
                    <Icon name="map-marker-outline" size={16} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: FONT_SIZES.sm, fontWeight: isSelected ? "700" : "500",
                      color: COLORS.textDark,
                    }}>
                      {item.label}
                    </Text>
                    {item.zone && (
                      <Text style={{ fontSize: 11, color: COLORS.textLight, marginTop: 1 }}>{item.zone}</Text>
                    )}
                  </View>
                  {isSelected && <Icon name="check" size={17} color={COLORS.primary} />}
                </TouchableOpacity>
              )}
            />
            {/* <TextField
              label="Ward ID"
              placeholder="e.g. Ward 1, Zone A"
              value={form.ward_id}
              onChangeText={(v) => updateField("ward_id", v)}
              icon="home-map-marker"
            /> */}

            <TextField
              label="Address / Landmark"
              placeholder="e.g. Near post office, Main Road"
              value={form.address}
              onChangeText={(v) => updateField("address", v)}
              icon="home-map-marker"
            />

            <View style={{ flexDirection: "row", gap: SPACING.sm }}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Latitude"
                  placeholder="13.0827"
                  value={form.latitude}
                  onChangeText={(v) => updateField("latitude", v)}
                  keyboardType="decimal-pad"
                  error={errors.latitude}
                  icon="crosshairs-gps"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Longitude"
                  placeholder="80.2707"
                  value={form.longitude}
                  onChangeText={(v) => updateField("longitude", v)}
                  keyboardType="decimal-pad"
                  error={errors.longitude}
                  icon="crosshairs-gps"
                />
              </View>
            </View>
          </FormCard>

          {/* ── Section 3: Additional info ── */}
          <FormCard>
            <SectionHeader icon="note-text-outline" title="Additional info" subtitle="Optional — any extra context" />
            <TextField
              label="Citizen Note"
              placeholder="Anything else we should know?"
              value={form.citizen_note}
              onChangeText={(v) => updateField("citizen_note", v)}
              icon="note-text-outline"
              multiline
              numberOfLines={2}
            />
          </FormCard>

          {/* ── Summary preview ── */}
          {(form.complaint_type || form.ward_id) && (
            <View style={{
              backgroundColor: `${COLORS.primary}08`,
              borderRadius: 12, padding: SPACING.md,
              borderWidth: 1, borderColor: `${COLORS.primary}18`,
              marginBottom: SPACING.md,
              flexDirection: "row", alignItems: "center", gap: 10,
            }}>
              {selectedType && (
                <View style={{
                  width: 36, height: 36, borderRadius: 9,
                  backgroundColor: `${selectedType.color}18`,
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name={selectedType.icon} size={19} color={selectedType.color} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontWeight: "600" }}>
                  Ready to submit
                </Text>
                <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.textDark, fontWeight: "700" }}>
                  {selectedType?.label ?? "—"}
                  {form.ward_id ? ` · ${wardItems.find((w) => w.value === form.ward_id)?.label ?? "Ward"}` : ""}
                </Text>
              </View>
              <View style={{
                backgroundColor: PRIORITIES.find((p) => p.value === form.priority)?.bg ?? "#FEF3C7",
                borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
              }}>
                <Text style={{
                  fontSize: 10, fontWeight: "800",
                  color: PRIORITIES.find((p) => p.value === form.priority)?.color ?? "#D97706",
                }}>
                  {form.priority}
                </Text>
              </View>
            </View>
          )}

          {/* ── Error ── */}
          {!!serverError && (
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: "#FFE4E6", borderRadius: 10,
              padding: SPACING.md, marginBottom: SPACING.md, gap: 8,
            }}>
              <Icon name="alert-circle-outline" size={18} color={COLORS.error} />
              <Text style={{ color: COLORS.error, fontSize: FONT_SIZES.xs, flex: 1, fontWeight: "600" }}>
                {serverError}
              </Text>
            </View>
          )}

          {/* ── Submit ── */}
          <TouchableOpacity
            onPress={submit}
            disabled={loading}
            activeOpacity={0.85}
            style={{ borderRadius: 12, overflow: "hidden", ...SHADOWS.lg }}
          >
            <LinearGradient
              colors={loading ? ["#94A3B8", "#94A3B8"] : ["#0052CC", "#172B4D"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 15, alignItems: "center", justifyContent: "center",
                flexDirection: "row", gap: 8,
              }}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Icon name="send-outline" size={18} color="#fff" />
              }
              <Text style={{ color: "#fff", fontSize: FONT_SIZES.sm, fontWeight: "900", letterSpacing: 0.5 }}>
                {loading ? "Submitting…" : "Submit Complaint"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CreateComplaintScreen;