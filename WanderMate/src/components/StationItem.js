import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { spacing, fontSize } from '../theme/theme';

export default function StationItem({ route, destination, time, type }) {
  const theme = useTheme();
  const { colors } = theme;
  const icon = type === 'bus' ? 'bus' : 'train';
  const iconColor = colors.primary;

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color={iconColor} />
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

const createStyles = (colors) => StyleSheet.create({
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
