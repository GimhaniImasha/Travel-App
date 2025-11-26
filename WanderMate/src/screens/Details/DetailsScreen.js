import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Feather, Ionicons } from '@expo/vector-icons';
import { addFavorite, removeFavorite } from '../../redux/slices/favouritesSlice';
import StationItem from '../../components/StationItem';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, fontSize } from '../../theme/theme';

export default function DetailsScreen({ route, navigation }) {
  const theme = useTheme();
  const { colors } = theme;
  const dispatch = useDispatch();
  const place = route.params?.place;
  const { items: favourites } = useSelector((state) => state.favourites);

  const [showTransport, setShowTransport] = useState(false);

  if (!place) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-circle" size={48} color={colors.error} />
        <Text style={styles.errorText}>No place selected</Text>
      </View>
    );
  }

  const isFavourite = favourites.some(
    (fav) => fav.id === place.id || (fav.name === place.name && fav.latitude === place.latitude)
  );

  const toggleFavourite = () => {
    if (isFavourite) {
      const favoriteToRemove = favourites.find(
        (fav) => fav.id === place.id || (fav.name === place.name && fav.latitude === place.latitude)
      );
      if (favoriteToRemove) {
        dispatch(removeFavorite(favoriteToRemove.id));
      }
    } else {
      // Save the complete place object with all data
      const favoritePlace = {
        ...place,
        id: place.id || `${place.name}-${place.latitude}-${place.longitude}`,
      };
      dispatch(addFavorite(favoritePlace));
    }
  };

  const handleShowNearbyTransport = () => {
    setShowTransport(!showTransport);
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

  const nearbyBusStops = parseJSON(place.nearbyBusStops);
  const nearbyTrainStations = parseJSON(place.nearbyTrainStations);
  const nearbyHotels = parseJSON(place.nearbyHotels);
  const weather = parseJSON(place.weather);

  const formatDistance = (distance) => {
    if (!distance) return 'N/A';
    
    // If distance is already a string (e.g., "300m", "1.5km"), return it
    if (typeof distance === 'string') {
      return distance;
    }
    
    // If distance is a number, format it
    if (distance < 1000) return `${Math.round(distance)}m`;
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Feather key={i} name="star" size={14} color={colors.warning} style={{ marginRight: 2 }} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Feather key={i} name="star" size={14} color={colors.warning} style={{ marginRight: 2 }} />);
      } else {
        stars.push(<Feather key={i} name="star" size={14} color={colors.border} style={{ marginRight: 2 }} />);
      }
    }
    return stars;
  };

  const styles = createStyles(colors);

  const getImageSource = () => {
    if (place.image && place.image.includes('http')) {
      return { uri: place.image };
    }
    return { uri: 'https://via.placeholder.com/800x450?text=No+Image' };
  };

  return (
    <ScrollView style={styles.container}>
      {/* Banner Image with Overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={getImageSource()}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favouriteButton}
          onPress={toggleFavourite}
        >
          <Feather
            name={isFavourite ? "heart" : "heart"}
            size={28}
            color={isFavourite ? "#FF5252" : "#FFFFFF"}
            fill={isFavourite ? "#FF5252" : "none"}
            style={{ opacity: 1 }}
          />
        </TouchableOpacity>
        {/* Title on Image */}
        <View style={styles.titleOverlay}>
          <Text style={styles.titleOnImage}>{place.name}</Text>
          {place.rating && (
            <View style={styles.ratingOverlay}>
              <Feather name="star" size={16} color="#FFC107" fill="#FFC107" />
              <Text style={styles.ratingTextOverlay}>{place.rating} (13k reviews)</Text>
            </View>
          )}
        </View>
        {/* Curved White Container */}
        <View style={styles.curvedContainer} />
      </View>

      {/* Place Details */}
      <View style={styles.detailsContainer}>
        {/* Description Section */}
        {place.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.descriptionText}>{place.description}</Text>
            {place.price && (
              <Text style={styles.priceText}>Price</Text>
            )}
            {place.price && (
              <Text style={styles.priceAmount}>${place.price}</Text>
            )}
          </View>
        )}

        {/* Weather Section */}
        {weather && (weather.temperature || weather.description) && (
          <View style={styles.weatherCard}>
            <View style={styles.weatherHeader}>
              <View style={styles.weatherTitleRow}>
                <Feather name="cloud" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Weather</Text>
              </View>
              <View style={styles.weatherInfo}>
                {weather.temperature && (
                  <Text style={styles.weatherTemp}>{weather.temperature}°C</Text>
                )}
                {weather.description && (
                  <Text style={styles.weatherDesc}>{weather.description}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Nearby Transport - Always Show */}
        {(nearbyBusStops.length > 0 || nearbyTrainStations.length > 0) && (
          <>
            {/* Nearby Bus Stops */}
            {nearbyBusStops.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="bus" size={22} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Nearby Bus Stops</Text>
                </View>

                {nearbyBusStops.map((stop, index) => (
                  <View key={index} style={styles.stopContainer}>
                    <View style={styles.stopHeader}>
                      <Text style={styles.stopName}>{stop.name}</Text>
                      <Text style={styles.distance}>{formatDistance(stop.distance)}</Text>
                    </View>
                    
                    {stop.arrivals && stop.arrivals.length > 0 ? (
                      stop.arrivals.slice(0, 3).map((arrival, idx) => (
                        <StationItem
                          key={idx}
                          route={arrival.route || arrival.line || 'N/A'}
                          destination={arrival.destination || 'Unknown'}
                          time={arrival.time || 'N/A'}
                          type="bus"
                        />
                      ))
                    ) : (
                      <Text style={styles.noDataText}>No live arrivals available</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Nearby Train Stations */}
            {nearbyTrainStations.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="train" size={22} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Nearby Train Stations</Text>
                </View>

                {nearbyTrainStations.map((station, index) => (
                  <View key={index} style={styles.stopContainer}>
                    <View style={styles.stopHeader}>
                      <Text style={styles.stopName}>{station.name}</Text>
                      <Text style={styles.distance}>{formatDistance(station.distance)}</Text>
                    </View>
                    
                    {station.departures && station.departures.length > 0 ? (
                      station.departures.slice(0, 3).map((departure, idx) => (
                        <StationItem
                          key={idx}
                          route={departure.train || departure.operator || 'Train'}
                          destination={departure.destination || 'Unknown'}
                          time={`${departure.time || 'N/A'}${departure.platform ? ` - Platform ${departure.platform}` : ''}`}
                          type="train"
                        />
                      ))
                    ) : (
                      <Text style={styles.noDataText}>No live departures available</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Nearby Hotels Section */}
        {nearbyHotels.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Feather name="home" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Nearby Hotels</Text>
            </View>

            {nearbyHotels.map((hotel, index) => (
              <View key={index} style={styles.hotelCard}>
                <View style={styles.hotelHeader}>
                  <Text style={styles.hotelName}>{hotel.name}</Text>
                  <Text style={styles.hotelDistance}>{formatDistance(hotel.distance)}</Text>
                </View>
                {hotel.rating && (
                  <View style={styles.ratingContainer}>
                    {renderStars(hotel.rating)}
                    <Text style={styles.ratingText}>({hotel.rating})</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  imageContainer: {
    position: 'relative',
    height: 380,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  curvedContainer: {
    position: 'absolute',
    bottom: -1,
    width: '100%',
    height: 40,
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 60,
    left: spacing.lg,
    right: spacing.lg,
  },
  titleOnImage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: spacing.xs,
  },
  ratingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  ratingTextOverlay: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    marginLeft: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  backButton: {
    position: 'absolute',
    top: spacing.lg + 10,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favouriteButton: {
    position: 'absolute',
    top: spacing.lg + 10,
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  descriptionSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionLabel: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  priceText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  priceAmount: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: spacing.xs,
  },
  weatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  weatherInfo: {
    alignItems: 'flex-end',
  },
  weatherTemp: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  weatherDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.lg,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  section: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
  },
  stopContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  stopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stopName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  distance: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  noDataText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  hotelCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  hotelName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  hotelDistance: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
});
