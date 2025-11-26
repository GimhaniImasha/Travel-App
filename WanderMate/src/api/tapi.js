import axios from 'axios';

// Create axios instance with base configuration
const tapiClient = axios.create({
  baseURL: 'https://transportapi.com/v3',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get API credentials from environment
const getApiCredentials = () => {
  // For Expo, we'll read from app.json extra config via a different method
  // Using hardcoded values for now (replace with your actual values)
  const appId = 'f3f35872';
  const appKey = '62dfbc29c608b27e5fe31ddbdb475122';
  
  return { app_id: appId, app_key: appKey };
};

/**
 * Search for places by query string
 * @param {string} query - Search query (e.g., "museum", "park", "landmark")
 * @returns {Promise<Array>} - Array of place objects
 * @throws {Error} - If the request fails
 */
export async function placesSearch(query) {
  const url = `https://transportapi.com/v3/uk/places.json?query=${encodeURIComponent(query)}&app_id=f3f35872&app_key=62dfbc29c608b27e5fe31ddbdb475122`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch places");
  
  const data = await response.json();
  return data.member || [];
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Find places by type near a specific location
 * @param {number} lat - Latitude of the location
 * @param {number} lon - Longitude of the location
 * @param {string} type - Type of place (e.g., "bus_stop", "train_station", "tube_station")
 * @param {number} [maxDistance=5] - Maximum distance in kilometers (default: 5km)
 * @returns {Promise<Object>} - API response with filtered places data
 * @throws {Error} - If the request fails
 */
export const placesByTypeNear = async (lat, lon, type, maxDistance = 5) => {
  try {
    const credentials = getApiCredentials();
    
    // Try direct API call with type, lat, lon parameters
    try {
      const response = await tapiClient.get('/places.json', {
        params: {
          type,
          lat,
          lon,
          ...credentials,
        },
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (apiError) {
      // If API doesn't support lat/lon filtering, fallback to client-side filtering
      console.log('Direct lat/lon query not supported, using fallback method');
      
      // Use a generic search for the type and filter client-side
      const searchResponse = await tapiClient.get('/places.json', {
        params: {
          type,
          ...credentials,
        },
      });
      
      // Filter results by distance
      let places = searchResponse.data?.member || [];
      
      if (Array.isArray(places) && places.length > 0) {
        places = places.filter((place) => {
          if (place.latitude && place.longitude) {
            const distance = calculateDistance(
              lat,
              lon,
              parseFloat(place.latitude),
              parseFloat(place.longitude)
            );
            return distance <= maxDistance;
          }
          return false;
        });
        
        // Sort by distance (closest first)
        places.sort((a, b) => {
          const distA = calculateDistance(
            lat,
            lon,
            parseFloat(a.latitude),
            parseFloat(a.longitude)
          );
          const distB = calculateDistance(
            lat,
            lon,
            parseFloat(b.latitude),
            parseFloat(b.longitude)
          );
          return distA - distB;
        });
      }
      
      return {
        success: true,
        data: {
          ...searchResponse.data,
          member: places,
        },
      };
    }
  } catch (error) {
    console.error('placesByTypeNear error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch nearby places',
    };
  }
};

/**
 * Get live bus departure information for a specific bus stop
 * @param {string} atcoCode - ATCO code of the bus stop (e.g., "490000251S")
 * @returns {Promise<Object>} - API response with live bus departure data
 * @throws {Error} - If the request fails
 */
export const getBusStopLive = async (atcoCode) => {
  try {
    const credentials = getApiCredentials();
    const response = await tapiClient.get(`/uk/bus/stop/${atcoCode}/live.json`, {
      params: credentials,
    });
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('getBusStopLive error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch bus stop live data',
    };
  }
};

/**
 * Get live train departure information for a specific train station
 * @param {string} stationCode - Station CRS code (e.g., "VIC" for Victoria, "PAD" for Paddington)
 * @returns {Promise<Object>} - API response with live train departure data
 * @throws {Error} - If the request fails
 */
export const getTrainStationLive = async (stationCode) => {
  try {
    const credentials = getApiCredentials();
    const response = await tapiClient.get(`/uk/train/station/${stationCode}/live.json`, {
      params: credentials,
    });
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('getTrainStationLive error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch train station live data',
    };
  }
};

// Export the axios client for advanced usage if needed
export default tapiClient;
