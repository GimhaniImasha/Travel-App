import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { spacing, fontSize } from '../theme/theme';

export default function PlaceCard({ image, title, subtitle, status, onPress }) {
  const theme = useTheme();
  const { colors } = theme;
  const imageUrl = image && image.includes('http') 
    ? image 
    : 'https://via.placeholder.com/400x300?text=No+Image';

  console.log('PlaceCard rendering:', title, 'Image URL:', imageUrl);

  const styles = createStyles(colors);

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
            {status && (
              <View style={[styles.badge, status === 'Popular' ? styles.badgePopular : styles.badgeFeatured]}>
                <Text style={styles.badgeText}>{status}</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  cardWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 8,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.border,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePopular: {
    backgroundColor: colors.primary,
  },
  badgeFeatured: {
    backgroundColor: colors.secondary,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textLight,
  },
});
