import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { COLORS, FONT_SIZES, SPACING } from "../../constants/theme";

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────

const STATUS = {
  OPEN:     { label: "Pending",     color: "#D97706", bg: "#FEF3C7", icon: "clock-outline"          },
  WORKING:  { label: "In Progress", color: "#0052CC", bg: "#DBEAFE", icon: "progress-wrench"         },
  APPROVAL: { label: "In Review",   color: "#0891B2", bg: "#CFFAFE", icon: "eye-check-outline"       },
  CLOSED:   { label: "Resolved",    color: "#059669", bg: "#D1FAE5", icon: "check-circle-outline"    },
  REJECTED: { label: "Rejected",    color: "#DC2626", bg: "#FFE4E6", icon: "close-circle-outline"    },
};

// ─── TYPE CONFIG ──────────────────────────────────────────────────────────────

const TYPE_META = {
  ROAD_DAMAGE:  { icon: "road-variant",         color: "#DC2626" },
  POTHOLE:      { icon: "road-variant",         color: "#DC2626" },
  GARBAGE:      { icon: "trash-can-outline",    color: "#0891B2" },
  STREETLIGHT:  { icon: "lightbulb-on-outline", color: "#D97706" },
  WATER_SUPPLY: { icon: "water-outline",        color: "#0052CC" },
  DRAINAGE:     { icon: "pipe-disconnected",    color: "#0891B2" },
  SANITATION:   { icon: "broom",                color: "#0891B2" },
  TREE_CUTTING: { icon: "tree-outline",         color: "#059669" },
  CONSTRUCTION: { icon: "hammer-wrench",        color: "#D97706" },
  OTHER:        { icon: "alert-circle-outline", color: "#6B7280" },
};

const formatType = (type = "") =>
  type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return null; }
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export const ComplaintCard = ({ complaint, onPress }) => {
  const type      = complaint?.complaint_type || "OTHER";
  const typeMeta  = TYPE_META[type] || TYPE_META.OTHER;
  const status    = STATUS[complaint?.status] || STATUS.OPEN;
  const title     = formatType(complaint?.complaint_type || complaint?.title || "Complaint");
  const desc      = complaint?.description || complaint?.address || "No description provided";
  const id        = complaint?.complaint_id || complaint?._id || "";
  const date      = formatDate(complaint?.created_at || complaint?.createdAt);
  const ward      = complaint?.ward_name || complaint?.ward || null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.78}
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        marginBottom: SPACING.md,
        shadowColor: "#0052CC",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
        overflow: "hidden",
      }}
    >
      {/* Colored left accent bar */}
      <View style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: 4, backgroundColor: typeMeta.color, borderRadius: 4,
      }} />

      <View style={{ paddingLeft: 16, paddingRight: SPACING.md, paddingVertical: SPACING.md }}>

        {/* Top row: icon + title + status pill */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
          <View style={{
            width: 32, height: 32, borderRadius: 8,
            backgroundColor: `${typeMeta.color}14`,
            alignItems: "center", justifyContent: "center",
            marginRight: 10,
          }}>
            <Icon name={typeMeta.icon} size={17} color={typeMeta.color} />
          </View>

          <Text numberOfLines={1} style={{
            flex: 1,
            fontSize: FONT_SIZES.sm,
            fontWeight: "800",
            color: "#1E293B",
          }}>
            {title}
          </Text>

          <View style={{
            flexDirection: "row", alignItems: "center",
            backgroundColor: status.bg,
            borderRadius: 999,
            paddingHorizontal: 8, paddingVertical: 3,
            marginLeft: 8,
          }}>
            <Icon name={status.icon} size={10} color={status.color} style={{ marginRight: 3 }} />
            <Text style={{ color: status.color, fontSize: 10, fontWeight: "800" }}>
              {status.label}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text numberOfLines={2} style={{
          fontSize: FONT_SIZES.xs,
          color: "#64748B",
          lineHeight: 17,
          marginBottom: 8,
          paddingLeft: 42, // align under title
        }}>
          {desc}
        </Text>

        {/* Bottom row: ID + ward + date */}
        <View style={{
          flexDirection: "row", alignItems: "center",
          paddingLeft: 42,
          gap: 10,
        }}>
          {!!id && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon name="pound" size={10} color="#94A3B8" />
              <Text style={{ color: "#94A3B8", fontSize: 10, fontWeight: "700", marginLeft: 1 }}>
                {id}
              </Text>
            </View>
          )}
          {!!ward && (
            <>
              <Text style={{ color: "#CBD5E1", fontSize: 10 }}>·</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="map-marker-outline" size={10} color="#94A3B8" />
                <Text style={{ color: "#94A3B8", fontSize: 10, marginLeft: 2 }}>{ward}</Text>
              </View>
            </>
          )}
          {!!date && (
            <>
              <Text style={{ color: "#CBD5E1", fontSize: 10 }}>·</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="calendar-outline" size={10} color="#94A3B8" />
                <Text style={{ color: "#94A3B8", fontSize: 10, marginLeft: 2 }}>{date}</Text>
              </View>
            </>
          )}
          <View style={{ flex: 1 }} />
          <Icon name="chevron-right" size={14} color="#CBD5E1" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ComplaintCard;