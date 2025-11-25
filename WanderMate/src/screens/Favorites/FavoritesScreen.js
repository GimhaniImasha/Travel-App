import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { removeFavorite } from '../../redux/slices/favouritesSlice';
import { setSelectedPlace } from '../../redux/slices/placesSlice';
import { colors, spacing, fontSize } from '../../theme/theme';

export default function FavoritesScreen({ navigation }) {
  const dispatch = useDispatch();
  const { items: favourites } = useSelector((state) => state.favourites);

  const handleRemove = (id) => {
    Alert.alert(
      'Remove Favourite',
      'Are you sure you want to remove this place from favourites?',
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
    dispatch(setSelectedPlace(place));
    navigation.navigate('Home', { screen: 'Details' });
  };

  const renderFavourite = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => handlePlacePress(item)}
      >
        <Text style={styles.placeName}>{item.name || 'Unknown Place'}</Text>
        <Text style={styles.placeType}>{item.type || 'N/A'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemove(item.id)}
      >
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favourites</Text>
        <Text style={styles.headerSubtitle}>
          {favourites.length} {favourites.length === 1 ? 'place' : 'places'} saved
        </Text>
      </View>

      {favourites.length > 0 ? (
        <FlatList
          data={favourites}
          renderItem={renderFavourite}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No favourites yet</Text>
          <Text style={styles.emptySubtext}>
            Add places to your favourites from the Home screen
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  listContainer: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardContent: {
    padding: spacing.md,
  },
  placeName: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  placeType: {
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  removeButton: {
    backgroundColor: colors.error,
    padding: spacing.sm,
    alignItems: 'center',
  },
  removeText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: fontSize.sm,
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
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
