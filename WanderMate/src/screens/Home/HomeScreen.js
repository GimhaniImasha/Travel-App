import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  searchPlaces,
  setSelectedPlace,
} from '../../redux/slices/placesSlice';
import { colors, spacing, fontSize } from '../../theme/theme';

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const { searchResults, status } = useSelector((state) => state.places);
  const { user } = useSelector((state) => state.auth);
  
  const loading = status === 'loading';

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search term');
      return;
    }

    try {
      const resultAction = await dispatch(searchPlaces(searchQuery));
      
      if (searchPlaces.rejected.match(resultAction)) {
        Alert.alert('Search Failed', resultAction.payload || 'Failed to search places');
      }
    } catch (error) {
      Alert.alert('Search Failed', error.message || 'An error occurred');
    }
  };

  const handlePlacePress = (place) => {
    dispatch(setSelectedPlace(place));
    navigation.navigate('Details');
  };

  const renderPlace = ({ item }) => (
    <TouchableOpacity
      style={styles.placeCard}
      onPress={() => handlePlacePress(item)}
    >
      <Text style={styles.placeName}>{item.name || 'Unknown Place'}</Text>
      <Text style={styles.placeType}>{item.type || 'N/A'}</Text>
      {item.description && (
        <Text style={styles.placeDesc} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.firstName || 'Traveler'}!</Text>
        <Text style={styles.subtitle}>Where would you like to go?</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for stations, stops..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : searchResults?.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderPlace}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Search for places to get started!</Text>
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
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: fontSize.md,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: fontSize.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  listContainer: {
    padding: spacing.md,
  },
  placeCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
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
    marginBottom: spacing.xs,
  },
  placeDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
