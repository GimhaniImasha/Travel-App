import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { removeFavorite } from '../../redux/slices/favouritesSlice';
import PlaceCard from '../../components/PlaceCard';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, fontSize } from '../../theme/theme';

export default function FavoritesScreen({ navigation }) {
  const theme = useTheme();
  const { colors } = theme;
  const dispatch = useDispatch();
  const { items: favourites } = useSelector((state) => state.favourites);

  const handleRemove = (id, name) => {
    Alert.alert(
      'Remove Favorite',
      `Remove "${name}" from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => dispatch(removeFavorite(id)),
        },
      ]
    );
  };

  const handlePlacePress = (place) => {
    navigation.navigate('Details', { place });
  };

  const isPopularType = (type) => {
    const popularTypes = ['park', 'temple', 'landmark'];
    return popularTypes.includes(type?.toLowerCase());
  };

  const renderRightActions = (item) => {
    return (
      <View style={styles.swipeAction}>
        <Feather name="trash-2" size={24} color={colors.textLight} />
        <Text style={styles.swipeActionText}>Delete</Text>
      </View>
    );
  };

  const renderFavourite = ({ item }) => {
    const status = isPopularType(item.type) ? 'Popular' : 'Featured';

    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item)}
        onSwipeableRightOpen={() => handleRemove(item.id, item.name)}
        rightThreshold={40}
        friction={2}
      >
        <View style={styles.cardWrapper}>
          <PlaceCard
            image={item.image}
            title={item.name}
            subtitle={item.type || 'Place'}
            status={status}
            onPress={() => handlePlacePress(item)}
          />
        </View>
      </Swipeable>
    );
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {favourites.length > 0 && (
        <View style={styles.infoBar}>
          <Feather name="heart" size={18} color={colors.error} />
          <Text style={styles.infoText}>
            {favourites.length} {favourites.length === 1 ? 'favorite' : 'favorites'} saved
          </Text>
        </View>
      )}

      {favourites.length > 0 ? (
        <FlatList
          data={favourites}
          renderItem={renderFavourite}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Feather name="heart" size={64} color={colors.border} />
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the heart icon on places to save them here
          </Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  listContainer: {
    padding: spacing.md,
  },
  cardWrapper: {
    backgroundColor: colors.background,
  },
  swipeAction: {
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: spacing.md,
    borderRadius: 12,
    marginLeft: spacing.sm,
  },
  swipeActionText: {
    color: colors.textLight,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
