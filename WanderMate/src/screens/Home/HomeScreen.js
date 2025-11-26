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
import { fetchPlaces } from '../../api/mockapi';
import PlaceCard from '../../components/PlaceCard';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, fontSize } from '../../theme/theme';

export default function HomeScreen({ navigation }) {
  const theme = useTheme();
  const { colors } = theme;
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  useEffect(() => {
    loadRecommendedPlaces();
  }, []);

  const loadRecommendedPlaces = async () => {
    setLoading(true);
    setIsSearchMode(false);
    
    try {
      const queries = ['museum', 'park', 'landmark'];
      const results = await Promise.all(
        queries.map(query => fetchPlaces(query))
      );
      
      // Merge and remove duplicates by id
      const allPlaces = results.flat();
      const uniquePlaces = Array.from(
        new Map(allPlaces.map(place => [place.id, place])).values()
      );
      
      setPlaces(uniquePlaces);
    } catch (error) {
      console.error('Error loading recommended places:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadRecommendedPlaces();
      return;
    }

    setLoading(true);
    setIsSearchMode(true);

    try {
      const results = await fetchPlaces(searchQuery);
      setPlaces(results);
    } catch (error) {
      console.error('Error searching places:', error);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlacePress = (place) => {
    navigation.navigate('Details', { place });
  };

  const getDistanceToNearestBusStop = (place) => {
    const busStops = parseJSON(place.nearbyBusStops);
    if (busStops && busStops.length > 0) {
      return busStops[0].distance;
    }
    return null;
  };

  const parseJSON = (jsonString) => {
    if (!jsonString) return [];
    if (typeof jsonString === 'object') return jsonString;
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  };

  const formatDistance = (distance) => {
    if (!distance) return null;
    
    // If distance is already a string (e.g., "300m", "1.5km"), return it
    if (typeof distance === 'string') {
      return distance;
    }
    
    // If distance is a number, format it
    if (distance < 1000) return `${Math.round(distance)}m`;
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const isPopularType = (type) => {
    const popularTypes = ['park', 'temple', 'landmark'];
    return popularTypes.includes(type?.toLowerCase());
  };

  const renderPlace = ({ item }) => {
    const status = isPopularType(item.type) ? 'Popular' : 'Featured';
    const distance = getDistanceToNearestBusStop(item);
    const distanceText = distance ? `🚌 ${formatDistance(distance)}` : null;
    
    return (
      <PlaceCard
        image={item.image || `https://picsum.photos/600/400?random=${Math.random()}`}
        title={item.name}
        subtitle={`${item.type || 'Place'}${distanceText ? ' • ' + distanceText : ''}`}
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
          {isSearchMode ? 'No places found matching your search' : 'No places available'}
        </Text>
        {isSearchMode && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setSearchQuery('');
              loadRecommendedPlaces();
            }}
          >
            <Text style={styles.resetButtonText}>View Recommendations</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Feather name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search places..."
            placeholderTextColor={colors.textSecondary}
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
                loadRecommendedPlaces();
              }}
            >
              <Feather name="x-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={loading}
        >
          <Feather name="arrow-right" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      {!isSearchMode && places.length > 0 && (
        <Text style={styles.sectionTitle}>Recommended Places</Text>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {isSearchMode ? 'Searching...' : 'Loading recommendations...'}
          </Text>
        </View>
      ) : places.length > 0 ? (
        <FlatList
          data={places}
          renderItem={renderPlace}
          keyExtractor={(item, index) => item.id?.toString() || `place-${index}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
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

