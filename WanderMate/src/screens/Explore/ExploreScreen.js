import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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

export default function ExploreScreen({ navigation }) {
  const theme = useTheme();
  const { colors } = theme;
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPlaces(1);
  }, []);

  const loadPlaces = async (pageNum) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const queries = ['museum', 'park', 'landmark', 'temple', 'beach', 'restaurant', 'hotel', 'attraction'];
      const results = await Promise.all(
        queries.map(query => fetchPlaces(query))
      );

      // Merge and remove duplicates by id
      const allPlaces = results.flat();
      const uniquePlaces = Array.from(
        new Map(allPlaces.map(place => [place.id, place])).values()
      );

      // Simulate pagination: 10 items per page
      const itemsPerPage = 10;
      const startIndex = (pageNum - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedPlaces = uniquePlaces.slice(startIndex, endIndex);

      if (pageNum === 1) {
        setPlaces(paginatedPlaces);
      } else {
        setPlaces(prev => [...prev, ...paginatedPlaces]);
      }

      // Check if there are more items
      setHasMore(endIndex < uniquePlaces.length);
    } catch (error) {
      console.error('Error loading places:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPlaces(nextPage);
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
    
    if (typeof distance === 'string') {
      return distance;
    }
    
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
    const capitalizedType = item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'Place';
    
    return (
      <PlaceCard
        image={item.image || `https://picsum.photos/600/400?random=${Math.random()}`}
        title={item.name}
        subtitle={`${capitalizedType}${distanceText ? ' • ' + distanceText : ''}`}
        status={status}
        onPress={() => handlePlacePress(item)}
      />
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Explore</Text>
      <Text style={styles.headerSubtitle}>Discover new places around you</Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.endText}>You've reached the end! 🎉</Text>
        </View>
      );
    }

    return (
      <View style={styles.footerContainer}>
        {loadingMore ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
          >
            <Text style={styles.loadMoreText}>Load More</Text>
            <Feather name="chevron-down" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Feather name="map" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No places found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadPlaces(1)}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading places...</Text>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={renderHeader}
          data={places}
          renderItem={renderPlace}
          keyExtractor={(item, index) => item.id?.toString() || `place-${index}`}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={places.length > 0 ? renderFooter : null}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
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
  listContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
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
  footerContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: 8,
    gap: spacing.xs,
  },
  loadMoreText: {
    color: colors.textLight,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  endText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
