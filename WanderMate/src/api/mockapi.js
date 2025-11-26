import axios from 'axios';

const BASE_URL = 'https://6926adf126e7e41498fb2320.mockapi.io/api';

export const fetchPlaces = async (query = '') => {
  try {
    const res = await axios.get(`${BASE_URL}/places`);
    const data = res.data;
    if (query) {
      return data.filter(place => 
        place.name.toLowerCase().includes(query.toLowerCase()) ||
        place.type?.toLowerCase().includes(query.toLowerCase()) ||
        place.description?.toLowerCase().includes(query.toLowerCase())
      );
    }
    return data;
  } catch (err) {
    console.error('Error fetching places:', err);
    return [];
  }
};

export const getPlaces = fetchPlaces; // Alias for backward compatibility
