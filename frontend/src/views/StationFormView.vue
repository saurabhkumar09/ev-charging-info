<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStationStore } from '../stores/stations';

const router = useRouter();
const route = useRoute();
const stationStore = useStationStore();

const isEditing = computed(() => route.params.id !== undefined);

const formData = ref({
  name: '',
  location: {
    type: 'Point',
    coordinates: [0.0, 0.0]
  },
  status: 'Active',
  powerOutput: 0.0,
  connectorType: ''
});

// Add separate refs for latitude and longitude
const latitude = ref(0.0);
const longitude = ref(0.0);

// Update coordinates when latitude or longitude changes
watch([latitude, longitude], ([newLat, newLng]) => {
  formData.value.location.coordinates = [parseFloat(newLng), parseFloat(newLat)];
});

// Update latitude and longitude when coordinates change
watch(() => formData.value.location.coordinates, (newCoords) => {
  if (Array.isArray(newCoords) && newCoords.length === 2) {
    latitude.value = parseFloat(newCoords[1]);
    longitude.value = parseFloat(newCoords[0]);
  }
}, { immediate: true });

const error = ref('');
const loading = ref(false);

const connectorTypes = [
  'Type 1 (J1772)',
  'Type 2 (Mennekes)',
  'CCS (Combo 1)',
  'CCS (Combo 2)',
  'CHAdeMO',
  'Tesla Supercharger',
  'GB/T'
];

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Fault', label: 'Fault' }
];

onMounted(async () => {
  if (isEditing.value) {
    try {
      loading.value = true;
      const station = await stationStore.fetchStation(route.params.id);
      formData.value = {
        ...station,
        location: {
          type: 'Point',
          coordinates: [
            parseFloat(station.location.coordinates[0]) || 0.0,
            parseFloat(station.location.coordinates[1]) || 0.0
          ]
        }
      };
    } catch (err) {
      error.value = 'Failed to load station details';
    } finally {
      loading.value = false;
    }
  }
});

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = '';

    // Parse and validate coordinates
    const parsedLongitude = parseFloat(longitude.value);
    const parsedLatitude = parseFloat(latitude.value);

    // Enhanced validation
    if (isNaN(parsedLongitude) || isNaN(parsedLatitude)) {
      error.value = 'Coordinates must be valid numbers';
      return;
    }

    // Validate coordinate ranges
    if (parsedLongitude < -180 || parsedLongitude > 180) {
      error.value = 'Longitude must be between -180 and 180';
      return;
    }

    if (parsedLatitude < -90 || parsedLatitude > 90) {
      error.value = 'Latitude must be between -90 and 90';
      return;
    }

    // Validate power output
    const powerOutput = parseFloat(formData.value.powerOutput);
    if (isNaN(powerOutput) || powerOutput <= 0) {
      error.value = 'Please enter a valid power output';
      return;
    }

    // Create a properly formatted data object
    const stationData = {
      name: formData.value.name.trim(),
      location: {
        longitude: parsedLongitude,
        latitude: parsedLatitude
      },
      status: formData.value.status,
      powerOutput: powerOutput,
      connectorType: formData.value.connectorType
    };

    // Log the final data being sent
    console.log('Form sending station data:', JSON.stringify(stationData, null, 2));

    if (isEditing.value) {
      await stationStore.updateStation(route.params.id, stationData);
    } else {
      await stationStore.createStation(stationData);
    }
    router.push('/stations');
  } catch (err) {
    console.error('Form submission error:', err);
    error.value = err.response?.data?.message || 'Failed to save station';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="form-container">
    <div class="form-box">
      <h1>{{ isEditing ? 'Edit Station' : 'Add New Station' }}</h1>

      <form @submit.prevent="handleSubmit" class="station-form">
        <div class="form-group">
          <label for="name">Station Name</label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            required
            placeholder="Enter station name"
          />
        </div>

        <div class="form-group">
          <label for="latitude">Latitude</label>
          <input
            type="number"
            id="latitude"
            v-model.number="latitude"
            required
            step="0.000001"
            min="-90"
            max="90"
            placeholder="Enter latitude (-90 to 90)"
          />
        </div>

        <div class="form-group">
          <label for="longitude">Longitude</label>
          <input
            type="number"
            id="longitude"
            v-model.number="longitude"
            required
            step="0.000001"
            min="-180"
            max="180"
            placeholder="Enter longitude (-180 to 180)"
          />
        </div>

        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" v-model="formData.status" required>
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="powerOutput">Power Output (kW)</label>
          <input
            type="number"
            id="powerOutput"
            v-model.number="formData.powerOutput"
            required
            min="0"
            step="0.1"
            placeholder="Enter power output in kW"
          />
        </div>

        <div class="form-group">
          <label for="connectorType">Connector Type</label>
          <select id="connectorType" v-model="formData.connectorType" required>
            <option value="">Select connector type</option>
            <option v-for="type in connectorTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-button" :disabled="loading">
            {{ loading ? 'Saving...' : (isEditing ? 'Update Station' : 'Add Station') }}
          </button>
          <button type="button" class="cancel-button" @click="router.push('/stations')">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  min-height: calc(100vh - 80px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  background-color: var(--background-color);
}

.form-box {
  background: var(--card-background);
  padding: 2.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
}

h1 {
  color: var(--text-color);
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2rem;
}

.station-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

label {
  color: var(--text-color);
  font-weight: 500;
  font-size: 0.95rem;
}

input, select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 1rem;
  background-color: white;
  transition: all 0.3s ease;
}

input:focus, select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.error-message {
  grid-column: 1 / -1;
  background-color: #fde8e8;
  color: #c81e1e;
  padding: 1rem;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.submit-button, .cancel-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  flex: 1;
}

.submit-button {
  background-color: var(--secondary-color);
  color: white;
}

.submit-button:hover {
  background-color: #27ae60;
}

.submit-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #95a5a6;
  color: white;
}

.cancel-button:hover {
  background-color: #7f8c8d;
}

@media (max-width: 768px) {
  .form-container {
    padding: 1rem;
  }

  .form-box {
    padding: 1.5rem;
    margin: 1rem auto;
  }

  .station-form {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-button, .cancel-button {
    width: 100%;
  }
}
</style> 