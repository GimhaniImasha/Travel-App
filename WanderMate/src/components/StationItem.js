import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, fontSize } from '../theme/theme';

export default function StationItem({ route, destination, time, type }) {
  const icon = type === 'bus' ? 'truck' : 'train';
  const iconColor = type === 'bus' ? colors.info : colors.success;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Feather name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.routeRow}>
          <Text style={styles.routeText}>{route}</Text>
          <Text style={styles.timeText}>{time}</Text>
        </View>
        <Text style={styles.destinationText} numberOfLines={1}>
          {destination}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  detailsContainer: {
    flex: 1,
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  routeText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  timeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  destinationText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
