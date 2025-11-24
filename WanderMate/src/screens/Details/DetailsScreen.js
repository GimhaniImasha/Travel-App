import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addFavourite, removeFavourite } from '../../redux/slices/favouritesSlice';
import { colors, spacing, fontSize } from '../../theme/theme';

export default function DetailsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { selectedPlace } = useSelector((state) => state.places);
  const { favourites } = useSelector((state) => state.favourites);

  if (!selectedPlace) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No place selected</Text>
      </View>
    );
  }

  const isFavourite = favourites.some((fav) => fav.id === selectedPlace.id);

  const toggleFavourite = () => {
    if (isFavourite) {
      dispatch(removeFavourite(selectedPlace.id));
      Alert.alert('Removed', 'Place removed from favourites');
    } else {
      dispatch(addFavourite(selectedPlace));
      Alert.alert('Added', 'Place added to favourites');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{selectedPlace.name || 'Unknown Place'}</Text>
        <TouchableOpacity
          style={[styles.favouriteButton, isFavourite && styles.favouriteActive]}
          onPress={toggleFavourite}
        >
          <Text style={styles.favouriteText}>
            {isFavourite ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{selectedPlace.type || 'N/A'}</Text>
        </View>

        {selectedPlace.description && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{selectedPlace.description}</Text>
          </View>
        )}

        {selectedPlace.latitude && selectedPlace.longitude && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Coordinates:</Text>
            <Text style={styles.value}>
              {selectedPlace.latitude}, {selectedPlace.longitude}
            </Text>
          </View>
        )}

        {selectedPlace.atco_code && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>ATCO Code:</Text>
            <Text style={styles.value}>{selectedPlace.atco_code}</Text>
          </View>
        )}

        {selectedPlace.station_code && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Station Code:</Text>
            <Text style={styles.value}>{selectedPlace.station_code}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.primary,
  },
  title: {
    flex: 1,
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  favouriteButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favouriteActive: {
    backgroundColor: colors.secondary,
  },
  favouriteText: {
    fontSize: fontSize.xxl,
    color: colors.warning,
  },
  content: {
    padding: spacing.lg,
  },
  infoRow: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: fontSize.lg,
    color: colors.text,
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
