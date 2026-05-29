import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Card } from "../../components";
import { COLORS, FONT_SIZES, SPACING } from "../../constants/theme";

const STATUS_COLORS = {
  OPEN: COLORS.warning,
  WORKING: COLORS.primary,
  APPROVAL: COLORS.accent,
  CLOSED: COLORS.success,
  REJECTED: COLORS.error,
};

export const ComplaintCard = ({ complaint, onPress }) => {
  const statusColor = STATUS_COLORS[complaint?.status] || COLORS.textLight;
  const title = complaint?.complaint_type?.replace(/_/g, " ") || "Complaint";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <Card variant="elevated" style={{ marginBottom: SPACING.md }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flex: 1, paddingRight: SPACING.md }}>
            <Text
              style={{
                fontSize: FONT_SIZES.base,
                fontWeight: "700",
                color: COLORS.textDark,
                marginBottom: SPACING.xs,
                textTransform: "capitalize",
              }}
            >
              {title.toLowerCase()}
            </Text>
            <Text
              numberOfLines={2}
              style={{
                fontSize: FONT_SIZES.sm,
                color: COLORS.textLight,
                marginBottom: SPACING.md,
              }}
            >
              {complaint?.description || complaint?.address || "No description"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
              <View
                style={{
                backgroundColor: `${statusColor}18`,
                  borderRadius: 4,
                  paddingHorizontal: SPACING.sm,
                  paddingVertical: 4,
                  marginRight: SPACING.sm,
                }}
              >
                <Text
                  style={{
                    color: statusColor,
                    fontSize: FONT_SIZES.xs,
                    fontWeight: "700",
                  }}
                >
                  {complaint?.status || "OPEN"}
                </Text>
              </View>
              <Text style={{ color: COLORS.textGray, fontSize: FONT_SIZES.xs }}>
                {complaint?.complaint_id || complaint?._id}
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={22} color={COLORS.textGray} />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default ComplaintCard;
