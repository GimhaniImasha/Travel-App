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
import { Feather } from '@expo/vector-icons';
import { addFavorite, removeFavorite } from '../../redux/slices/favouritesSlice';
import StationItem from '../../components/StationItem';
import { colors, spacing, fontSize } from '../../theme/theme';

export default function DetailsScreen({ route, navigation }) {
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
      const favoritePlace = {
        id: place.id || `${place.name}-${place.latitude}-${place.longitude}`,
        name: place.name,
        type: place.type,
        description: place.description,
        image: place.image,
        latitude: place.latitude,
        longitude: place.longitude,
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

  const getImageSource = () => {
    if (place.image && place.image.includes('http')) {
      return { uri: place.image };
    }
    return { uri: 'https://via.placeholder.com/800x450?text=No+Image' };
  };

  return (
    <ScrollView style={styles.container}>
      {/* Banner Image */}
      <View style={styles.imageContainer}>
        <Image
          source={getImageSource()}
          style={styles.bannerImage}
          resizeMode="cover"
          onError={(e) => console.log('Banner image error:', place.image, e.nativeEvent.error)}
        />
        <TouchableOpacity
          style={styles.favouriteButton}
          onPress={toggleFavourite}
        >
          <Feather
            name={isFavourite ? 'heart' : 'heart'}
            size={24}
            color={isFavourite ? colors.error : colors.textLight}
            fill={isFavourite ? colors.error : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Place Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{place.name}</Text>
        
        <View style={styles.infoRow}>
          <Feather name="tag" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>Type: {place.type || 'Unknown'}</Text>
        </View>

        {place.description && (
          <View style={styles.infoRow}>
            <Feather name="file-text" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{place.description}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Feather name="map-pin" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            Coordinates: {place.latitude || 'N/A'}, {place.longitude || 'N/A'}
          </Text>
        </View>

        {/* Weather Section */}
        {weather && (weather.temperature || weather.description) && (
          <View style={styles.weatherCard}>
            <View style={styles.sectionHeader}>
              <Feather name="cloud" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Weather</Text>
            </View>
            <View style={styles.weatherContent}>
              {weather.temperature && (
                <Text style={styles.weatherText}>
                  🌡️ {weather.temperature}°C
                </Text>
              )}
              {weather.description && (
                <Text style={styles.weatherDescription}>{weather.description}</Text>
              )}
            </View>
          </View>
        )}

        {/* Show Nearby Transport Button */}
        {(nearbyBusStops.length > 0 || nearbyTrainStations.length > 0) && (
          <TouchableOpacity
            style={styles.transportButton}
            onPress={handleShowNearbyTransport}
          >
            <Feather name="navigation" size={20} color={colors.textLight} />
            <Text style={styles.transportButtonText}>
              {showTransport ? 'Hide Nearby Transport' : 'Show Nearby Transport'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Transport Results */}
        {showTransport && (
          <>
            {/* Nearby Bus Stops */}
            {nearbyBusStops.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="navigation" size={24} color={colors.primary} />
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
                <View style={styles.sectionHeader}>
                  <Feather name="navigation-2" size={24} color={colors.primary} />
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
            <View style={styles.sectionHeader}>
              <Feather name="home" size={24} color={colors.primary} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  imageContainer: {
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: 250,
    backgroundColor: colors.border,
  },
  favouriteButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  transportButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  transportButtonText: {
    color: colors.textLight,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.lg,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  stopContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
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
  weatherCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weatherContent: {
    marginTop: spacing.md,
  },
  weatherText: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  weatherDescription: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  hotelCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
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
