import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import { fetchPlaces } from '../../api/mockapi';
import PlaceCard from '../../components/PlaceCard';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, fontSize } from '../../theme/theme';

export default function HomeScreen({ navigation }) {
  const theme = useTheme();
  const { colors } = theme;
  const { user } = useSelector((state) => state.auth);
  const firstName = user?.firstName || 'Traveler';
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  useEffect(() => {
    loadRecommendedPlaces();
  }, []);

  const loadRecommendedPlaces = async () => {
    setLoading(true);
    setIsSearchMode(false);
    
    try {
      const queries = ['museum', 'park', 'landmark', 'temple', 'beach'];
      const results = await Promise.all(
        queries.map(query => fetchPlaces(query))
      );
      
      // Merge and remove duplicates by id
      const allPlaces = results.flat();
      const uniquePlaces = Array.from(
        new Map(allPlaces.map(place => [place.id, place])).values()
      );
      
      // Try to filter specific IDs for popular places: 25, 23, 13, 12, 24
      const popularIds = ['25', '23', '13', '12', '24'];
      let popularFiltered = uniquePlaces.filter(place => 
        popularIds.includes(place.id?.toString())
      );
      
      // If we don't have enough specific IDs, just use first 5 places
      if (popularFiltered.length < 5) {
        popularFiltered = uniquePlaces.slice(0, 5);
      } else {
        // Sort by the order in popularIds array
        popularFiltered = popularIds
          .map(id => popularFiltered.find(place => place.id?.toString() === id))
          .filter(Boolean);
      }
      
      setPopularPlaces(popularFiltered);
      // Show next 5 different places for recommended
      const popularPlaceIds = new Set(popularFiltered.map(p => p.id));
      const recommendedPlaces = uniquePlaces.filter(p => !popularPlaceIds.has(p.id)).slice(0, 5);
      setPlaces(recommendedPlaces);
    } catch (error) {
      console.error('Error loading recommended places:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchWithQuery = async (query) => {
    setLoading(true);
    setIsSearchMode(true);

    try {
      const results = await fetchPlaces(query);
      setPlaces(results);
    } catch (error) {
      console.error('Error searching places:', error);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    if (!searchQuery || !searchQuery.trim()) {
      loadRecommendedPlaces();
      return;
    }
    handleSearchWithQuery(searchQuery);
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
            onPress={loadRecommendedPlaces}
          >
            <Text style={styles.resetButtonText}>View Recommendations</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const styles = createStyles(colors);

  const renderPopularPlace = (place) => {
    const screenWidth = Dimensions.get('window').width;
    const cardWidth = screenWidth * 0.65;
    const capitalizedType = place.type ? place.type.charAt(0).toUpperCase() + place.type.slice(1) : 'Place';
    
    return (
      <View key={place.id} style={styles.popularCardWrapper}>
        <TouchableOpacity
          style={[styles.popularCard, { width: cardWidth }]}
          onPress={() => handlePlacePress(place)}
          activeOpacity={0.8}
        >
          <ImageBackground
            source={{ uri: place.image }}
            style={styles.popularImage}
            imageStyle={{ borderRadius: 12 }}
          >
            <View style={styles.popularOverlay} />
            <View style={styles.popularContent}>
              <Text style={styles.popularTitle} numberOfLines={2}>{place.name}</Text>
              <Text style={styles.popularSubtitle}>{capitalizedType}</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      <ImageBackground
        source={require('../../../assets/HomeHeader.jpg')}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.headerContent}>
          <View style={styles.topRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.greetingText}>Hello {firstName}!</Text>
              <Text style={styles.subtitleText}>Where would you like to go?</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={styles.profileIconContainer}>
                <Feather name="user" size={24} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="rgba(255, 255, 255, 0.8)" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search destinations..."
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              keyboardType="default"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                loadRecommendedPlaces();
              }}>
                <Feather name="x" size={20} color="rgba(255, 255, 255, 0.8)" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ImageBackground>

      {/* Popular Places Horizontal Scroll */}
      {!isSearchMode && popularPlaces.length > 0 && (
        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Show all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularScroll}
          >
            {popularPlaces.map(place => renderPopularPlace(place))}
          </ScrollView>
        </View>
      )}

      {!isSearchMode && places.length > 0 && (
        <Text style={styles.sectionTitle}>Recommended Places</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {isSearchMode ? 'Searching...' : 'Loading recommendations...'}
          </Text>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={renderHeader}
          data={places}
          renderItem={renderPlace}
          keyExtractor={(item, index) => item.id?.toString() || `place-${index}`}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
  headerBackground: {
    width: '100%',
    paddingTop: spacing.xxl + spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitleText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  profileButton: {
    marginLeft: spacing.md,
  },
  profileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: '#FFFFFF',
    padding: 0,
  },
  popularSection: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  seeAllText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  popularScroll: {
    paddingHorizontal: spacing.md,
  },
  popularCardWrapper: {
    marginRight: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  popularImage: {
    height: 180,
    justifyContent: 'flex-end',
  },
  popularOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  popularContent: {
    padding: spacing.md,
  },
  popularTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  popularSubtitle: {
    fontSize: fontSize.sm,
    color: '#FFFFFF',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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

