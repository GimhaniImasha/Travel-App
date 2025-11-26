import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { placesSearch } from '../../api/tapi';
import PlaceCard from '../../components/PlaceCard';
import { colors, spacing, fontSize } from '../../theme/theme';

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    loadRecommendedPlaces();
  }, []);

  const loadRecommendedPlaces = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queries = ['museum', 'park', 'landmark'];
      const results = await Promise.all(
        queries.map(query => placesSearch(query))
      );
      
      const allPlaces = results.flat();
      const uniquePlaces = removeDuplicatesByName(allPlaces);
      
      setPlaces(uniquePlaces);
      setIsSearchActive(false);
    } catch (err) {
      setError(err.message || 'Failed to load recommended places');
    } finally {
      setLoading(false);
    }
  };

  const removeDuplicatesByName = (placesArray) => {
    const seen = new Set();
    return placesArray.filter(place => {
      const name = place.name?.toLowerCase();
      if (!name || seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setIsSearchActive(true);

    try {
      const results = await placesSearch(searchQuery);
      setPlaces(results);
    } catch (err) {
      setError(err.message || 'Search failed');
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlacePress = (place) => {
    navigation.navigate('Details', { place });
  };

  const renderPlace = ({ item }) => {
    const status = item.type === 'poi' ? 'Popular' : 'Featured';
    
    return (
      <PlaceCard
        image={`https://picsum.photos/600/400?random=${Math.random()}`}
        title={item.name}
        subtitle={item.type || 'Unknown'}
        status={status}
        onPress={() => handlePlacePress(item)}
      />
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Feather name="map-pin" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyText}>
          {isSearchActive ? 'No places found' : 'Search for places to explore'}
        </Text>
        {isSearchActive && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={loadRecommendedPlaces}
          >
            <Text style={styles.resetButtonText}>View Recommendations</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="alert-circle" size={64} color={colors.error} />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={isSearchActive ? handleSearch : loadRecommendedPlaces}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Feather name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search museums, parks, landmarks..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                if (isSearchActive) {
                  loadRecommendedPlaces();
                }
              }}
            >
              <Feather name="x-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={loading || !searchQuery.trim()}
        >
          <Feather name="arrow-right" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      {!isSearchActive && places.length > 0 && (
        <Text style={styles.sectionTitle}>Recommended Places</Text>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {isSearchActive ? 'Searching...' : 'Loading recommendations...'}
          </Text>
        </View>
      ) : error ? (
        renderErrorState()
      ) : places.length > 0 ? (
        <FlatList
          data={places}
          renderItem={renderPlace}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    padding: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
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
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  resetButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  resetButtonText: {
    color: colors.textLight,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.textLight,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
});

