import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api';

export const useStationStore = defineStore('stations', () => {
  const stations = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchStations = async () => {
    try {
      loading.value = true;
      const response = await api.get('/stations');
      stations.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch stations';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchStation = async (id) => {
    try {
      loading.value = true;
      const response = await api.get(`/stations/${id}`);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch station';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createStation = async (stationData) => {
    try {
      loading.value = true;

      // Log incoming data to store
      console.log('Store received data:', JSON.stringify(stationData, null, 2));

      // Validate location structure
      if (!stationData.location || !stationData.location.longitude || !stationData.location.latitude) {
        throw new Error('Invalid location data structure');
      }

      // Ensure coordinates are numbers and not null
      const longitude = parseFloat(stationData.location.longitude);
      const latitude = parseFloat(stationData.location.latitude);

      if (isNaN(longitude) || isNaN(latitude)) {
        throw new Error('Invalid coordinate values');
      }

      // Validate coordinate ranges
      if (longitude < -180 || longitude > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      if (latitude < -90 || latitude > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }

      // Format the data according to the backend schema
      const formattedData = {
        name: stationData.name,
        location: {
          longitude: longitude,
          latitude: latitude
        },
        status: stationData.status,
        powerOutput: parseFloat(stationData.powerOutput),
        connectorType: stationData.connectorType
      };

      // Log formatted data being sent
      console.log('Store sending formatted data:', JSON.stringify(formattedData, null, 2));

      const response = await api.post('/stations', formattedData);
      stations.value.push(response.data);
      return response.data;
    } catch (err) {
      console.error('Error creating station in store:', err.response?.data || err.message);
      error.value = err.response?.data?.message || err.message || 'Failed to create station';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateStation = async (id, stationData) => {
    try {
      loading.value = true;
      
      // Log incoming data
      console.log('Received update data:', JSON.stringify(stationData, null, 2));

      // Ensure coordinates are valid numbers
      const longitude = parseFloat(stationData.location.longitude);
      const latitude = parseFloat(stationData.location.latitude);

      if (isNaN(longitude) || isNaN(latitude)) {
        throw new Error('Invalid coordinates: must be valid numbers');
      }

      // Format the data according to the backend schema
      const formattedData = {
        name: stationData.name,
        location: {
          longitude: longitude,
          latitude: latitude
        },
        status: stationData.status,
        powerOutput: Number(stationData.powerOutput),
        connectorType: stationData.connectorType
      };

      // Log formatted data
      console.log('Formatted update data being sent to backend:', JSON.stringify(formattedData, null, 2));

      const response = await api.put(`/stations/${id}`, formattedData);
      const index = stations.value.findIndex(s => s._id === id);
      if (index !== -1) {
        stations.value[index] = response.data;
      }
      return response.data;
    } catch (err) {
      console.error('Error updating station:', err.response?.data);
      error.value = err.response?.data?.message || 'Failed to update station';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteStation = async (id) => {
    try {
      loading.value = true;
      await api.delete(`/stations/${id}`);
      stations.value = stations.value.filter(s => s._id !== id);
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete station';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    stations,
    loading,
    error,
    fetchStations,
    fetchStation,
    createStation,
    updateStation,
    deleteStation
  };
}); 