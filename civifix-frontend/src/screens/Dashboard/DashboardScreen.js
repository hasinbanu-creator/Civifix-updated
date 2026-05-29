import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../../context/AuthContext";
import { Screen } from "../../components";
import { COLORS, FONT_SIZES, GRADIENTS, SHADOWS, SPACING } from "../../constants/theme";
import authService from "../../services/authService";

const getComplaintItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.complaints)) return payload.complaints;
  return [];
};

const SAMPLE_RECENT = [
  {
    _id: "sample-road",
    complaint_id: "#CIV-2024-001",
    complaint_type: "ROAD_DAMAGE",
    description: "Road not repaired",
    status: "WORKING",
  },
  {
    _id: "sample-waste",
    complaint_id: "#CIV-2024-002",
    complaint_type: "GARBAGE",
    description: "Waste not collected",
    status: "CLOSED",
  },
  {
    _id: "sample-light",
    complaint_id: "#CIV-2024-003",
    complaint_type: "STREETLIGHT",
    description: "Street light not working",
    status: "OPEN",
  },
];

const STATUS_STYLES = {
  OPEN: { label: "Pending", color: COLORS.accent, bg: "#FEF3C7" },
  WORKING: { label: "In Progress", color: COLORS.primary, bg: "#DBEAFE" },
  APPROVAL: { label: "Review", color: COLORS.secondary, bg: "#CCFBF1" },
  CLOSED: { label: "Resolved", color: COLORS.success, bg: "#D1FAE5" },
  REJECTED: { label: "Rejected", color: COLORS.error, bg: "#FFE4E6" },
};

const TYPE_META = {
  ROAD_DAMAGE: { icon: "road-variant", color: COLORS.error, title: "Road not repaired" },
  POTHOLE: { icon: "road-variant", color: COLORS.error, title: "Road not repaired" },
  GARBAGE: { icon: "trash-can-outline", color: COLORS.secondary, title: "Waste not collected" },
  STREETLIGHT: { icon: "lightbulb-on-outline", color: COLORS.primary, title: "Street light not working" },
  WATER_SUPPLY: { icon: "water-outline", color: COLORS.primary, title: "Water supply issue" },
  DRAINAGE: { icon: "pipe-disconnected", color: COLORS.secondary, title: "Drainage issue" },
  SANITATION: { icon: "broom", color: COLORS.secondary, title: "Sanitation issue" },
  TREE_CUTTING: { icon: "tree-outline", color: COLORS.success, title: "Tree issue" },
  CONSTRUCTION: { icon: "hammer-wrench", color: COLORS.accent, title: "Construction issue" },
  OTHER: { icon: "alert-outline", color: COLORS.error, title: "Civic issue" },
};

export const DashboardScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { width } = useWindowDimensions();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const compact = width < 370;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await authService.getComplaints();
      setComplaints(getComplaintItems(data).slice(0, 3));
    } catch (error) {
      console.error("Failed to load complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const recentComplaints = useMemo(
    () => (complaints.length > 0 ? complaints : SAMPLE_RECENT),
    [complaints]
  );

  const quickActions = [
    {
      id: 1,
      title: "Raise\nComplaint",
      icon: "flask-outline",
      color: COLORS.secondary,
      onPress: () => navigation.navigate("CreateComplaint"),
    },
    {
      id: 2,
      title: "Track\nStatus",
      icon: "magnify",
      color: COLORS.primary,
      onPress: () => navigation.getParent()?.navigate("Complaints"),
    },
    {
      id: 3,
      title: "Nearby\nOffices",
      icon: "map-marker-outline",
      color: COLORS.primary,
      onPress: () => navigation.getParent()?.navigate("Complaints"),
    },
    {
      id: 4,
      title: "Notifications",
      icon: "bell-outline",
      color: COLORS.darkBg,
      onPress: () => navigation.getParent()?.navigate("Profile"),
    },
  ];

  const openComplaint = (complaint) => {
    if (complaint._id?.startsWith("sample-")) return;
    navigation.navigate("ComplaintDetail", { complaint });
  };

  return (
    <Screen
      scroll={false}
      backgroundColor={COLORS.background}
      maxWidth={430}
      contentStyle={{ flex: 1, paddingHorizontal: 0 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: SPACING.xxl + 18 }}
      >
        <LinearGradient
          colors={["#0052CC", "#172B4D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: SPACING.lg,
            paddingTop: SPACING.md,
            paddingBottom: 70,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(255,255,255,0.18)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: SPACING.sm,
                }}
              >
                <Icon name="city-variant-outline" size={21} color={COLORS.card} />
              </View>
              <View>
                <Text style={{ color: COLORS.card, fontSize: FONT_SIZES.xl, fontWeight: "800" }}>
                  Civifix
                </Text>
                <Text style={{ color: COLORS.card, fontSize: FONT_SIZES.xs, opacity: 0.92 }}>
                  Citizen Platform
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation.getParent()?.navigate("Profile")}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="bell-outline" size={22} color={COLORS.card} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: SPACING.lg, marginTop: -50 }}>
          <View
            style={{
              minHeight: compact ? 116 : 126,
              backgroundColor: COLORS.card,
              borderRadius: 12,
              padding: SPACING.lg,
              overflow: "hidden",
              ...SHADOWS.lg,
            }}
          >
            <Text style={{ color: COLORS.textLight, fontSize: FONT_SIZES.sm }}>
              Welcome back,
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: COLORS.textDark,
                fontSize: FONT_SIZES.lg,
                fontWeight: "800",
                marginTop: 2,
                maxWidth: "58%",
              }}
            >
              {user?.name || "Citizen"}
            </Text>
            <Text
              numberOfLines={2}
              style={{
                color: COLORS.textLight,
                fontSize: FONT_SIZES.xs,
                fontWeight: "600",
                marginTop: SPACING.md,
                maxWidth: "58%",
              }}
            >
              Let's build a better community
            </Text>

            <View
              style={{
                position: "absolute",
                right: 8,
                bottom: 4,
                width: 128,
                height: 82,
              }}
            >
              <Icon
                name="office-building-outline"
                size={58}
                color={COLORS.primary}
                style={{ position: "absolute", right: 55, bottom: 0, opacity: 0.88 }}
              />
              <Icon
                name="ferris-wheel"
                size={56}
                color={COLORS.primary}
                style={{ position: "absolute", right: 0, bottom: 0, opacity: 0.82 }}
              />
              <Icon
                name="bridge"
                size={70}
                color={COLORS.primary}
                style={{ position: "absolute", right: 22, bottom: -13, opacity: 0.12 }}
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: SPACING.xl,
              marginBottom: SPACING.md,
            }}
          >
            <Text style={{ color: COLORS.textDark, fontSize: FONT_SIZES.sm, fontWeight: "800" }}>
              Quick Actions
            </Text>
            <TouchableOpacity onPress={() => navigation.getParent()?.navigate("Complaints")}>
              <Text style={{ color: COLORS.primary, fontSize: FONT_SIZES.xs, fontWeight: "800" }}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                activeOpacity={0.82}
                onPress={action.onPress}
                style={{
                  width: "23.5%",
                  minHeight: 78,
                  borderRadius: 12,
                  backgroundColor: COLORS.card,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 4,
                  ...SHADOWS.md,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: `${action.color}12`,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 6,
                  }}
                >
                  <Icon name={action.icon} size={19} color={action.color} />
                </View>
                <Text
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                  style={{
                    color: COLORS.textDark,
                    fontSize: 9.5,
                    lineHeight: 12,
                    fontWeight: "800",
                    textAlign: "center",
                  }}
                >
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: SPACING.xl,
              marginBottom: SPACING.md,
            }}
          >
            <Text style={{ color: COLORS.textDark, fontSize: FONT_SIZES.sm, fontWeight: "800" }}>
              Recent Complaints
            </Text>
            <TouchableOpacity onPress={() => navigation.getParent()?.navigate("Complaints")}>
              <Text style={{ color: COLORS.primary, fontSize: FONT_SIZES.xs, fontWeight: "800" }}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: COLORS.card,
              borderRadius: 12,
              overflow: "hidden",
              ...SHADOWS.md,
            }}
          >
            {loading ? (
              <View style={{ padding: SPACING.xl }}>
                <ActivityIndicator color={COLORS.primary} />
              </View>
            ) : (
              recentComplaints.map((complaint, index) => {
                const type = complaint.complaint_type || "OTHER";
                const meta = TYPE_META[type] || TYPE_META.OTHER;
                const status = STATUS_STYLES[complaint.status] || STATUS_STYLES.OPEN;
                const title = complaint.description || meta.title;

                return (
                  <TouchableOpacity
                    key={complaint._id || complaint.complaint_id || index}
                    activeOpacity={complaint._id?.startsWith("sample-") ? 1 : 0.78}
                    onPress={() => openComplaint(complaint)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: SPACING.md,
                      paddingVertical: SPACING.md,
                      borderBottomWidth: index === recentComplaints.length - 1 ? 0 : 1,
                      borderBottomColor: COLORS.border,
                    }}
                  >
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        backgroundColor: `${meta.color}12`,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: SPACING.md,
                      }}
                    >
                      <Icon name={meta.icon} size={18} color={meta.color} />
                    </View>

                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        numberOfLines={1}
                        style={{
                          color: COLORS.textDark,
                          fontSize: FONT_SIZES.xs,
                          fontWeight: "800",
                        }}
                      >
                        {title}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{
                          color: COLORS.textLight,
                          fontSize: 10,
                          fontWeight: "700",
                          marginTop: 3,
                        }}
                      >
                        {complaint.complaint_id || "#CIV-NEW"}
                      </Text>
                    </View>

                    <View
                      style={{
                        backgroundColor: status.bg,
                        borderRadius: 999,
                        paddingHorizontal: SPACING.sm,
                        paddingVertical: 5,
                        marginLeft: SPACING.sm,
                      }}
                    >
                      <Text style={{ color: status.color, fontSize: 10, fontWeight: "800" }}>
                        {status.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

export default DashboardScreen;
