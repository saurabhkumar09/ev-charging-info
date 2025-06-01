<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStationStore } from '../stores/stations';

const router = useRouter();
const stationStore = useStationStore();

const showFilters = ref(false);
const filters = ref({
  status: '',
  powerOutput: '',
  connectorType: ''
});

const loading = ref(false);
const error = ref('');

// Fetch stations on component mount
onMounted(async () => {
  try {
    loading.value = true;
    await stationStore.fetchStations();
  } catch (err) {
    error.value = 'Failed to load stations';
    console.error('Error loading stations:', err);
  } finally {
    loading.value = false;
  }
});

// Computed property for filtered stations
const filteredStations = computed(() => {
  let filtered = [...stationStore.stations];
  
  if (filters.value.status) {
    filtered = filtered.filter(station => station.status === filters.value.status);
  }
  
  if (filters.value.powerOutput) {
    filtered = filtered.filter(station => station.powerOutput === parseFloat(filters.value.powerOutput));
  }
  
  if (filters.value.connectorType) {
    filtered = filtered.filter(station => station.connectorType === filters.value.connectorType);
  }
  
  return filtered;
});

// Get unique values for filters
const uniqueStatuses = computed(() => {
  return [...new Set(stationStore.stations.map(station => station.status))];
});

const uniquePowerOutputs = computed(() => {
  return [...new Set(stationStore.stations.map(station => station.powerOutput))].sort((a, b) => a - b);
});

const uniqueConnectorTypes = computed(() => {
  return [...new Set(stationStore.stations.map(station => station.connectorType))];
});

const handleDelete = async (id) => {
  if (confirm('Are you sure you want to delete this station?')) {
    try {
      loading.value = true;
      await stationStore.deleteStation(id);
    } catch (err) {
      error.value = 'Failed to delete station';
      console.error('Error deleting station:', err);
    } finally {
      loading.value = false;
    }
  }
};

const clearFilters = () => {
  filters.value = {
    status: '',
    powerOutput: '',
    connectorType: ''
  };
};
</script>

<template>
  <div class="stations-container">
    <div class="stations-header">
      <h1>Charging Stations</h1>
      <div class="header-actions">
        <button class="filter-button" @click="showFilters = !showFilters">
          {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
        </button>
        <router-link to="/stations/new" class="add-button">Add New Station</router-link>
      </div>
    </div>

    <!-- Filters Section -->
    <div v-if="showFilters" class="filters-section">
      <div class="filter-group">
        <label for="status">Status:</label>
        <select id="status" v-model="filters.status">
          <option value="">All</option>
          <option v-for="status in uniqueStatuses" :key="status" :value="status">
            {{ status.charAt(0).toUpperCase() + status.slice(1) }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="powerOutput">Power Output (kW):</label>
        <select id="powerOutput" v-model="filters.powerOutput">
          <option value="">All</option>
          <option v-for="power in uniquePowerOutputs" :key="power" :value="power">
            {{ power }} kW
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="connectorType">Connector Type:</label>
        <select id="connectorType" v-model="filters.connectorType">
          <option value="">All</option>
          <option v-for="type in uniqueConnectorTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>

      <button class="clear-button" @click="clearFilters">Clear Filters</button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      Loading stations...
    </div>

    <!-- Stations Grid -->
    <div v-else-if="filteredStations.length > 0" class="stations-grid">
      <div v-for="station in filteredStations" :key="station._id" class="station-card">
        <h3>{{ station.name }}</h3>
        <div class="station-details">
          <p><strong>Status:</strong> {{ station.status.charAt(0).toUpperCase() + station.status.slice(1) }}</p>
          <p><strong>Power Output:</strong> {{ station.powerOutput }} kW</p>
          <p><strong>Connector Type:</strong> {{ station.connectorType }}</p>
          <p><strong>Location:</strong> {{ station.location.coordinates[1].toFixed(4) }}, {{ station.location.coordinates[0].toFixed(4) }}</p>
        </div>
        <div class="station-actions">
          <router-link :to="`/stations/${station._id}/edit`" class="edit-button">Edit</router-link>
          <button @click="handleDelete(station._id)" class="delete-button">Delete</button>
        </div>
      </div>
    </div>

    <!-- No Stations Found -->
    <div v-else class="no-stations">
      No stations found
    </div>
  </div>
</template>

<style scoped>
.stations-container {
  min-height: calc(100vh - 80px);
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.stations-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-button, .add-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-button {
  background-color: var(--primary-color);
  color: white;
}

.filter-button:hover {
  background-color: #2980b9;
}

.add-button {
  background-color: var(--secondary-color);
  color: white;
}

.add-button:hover {
  background-color: #27ae60;
}

.filters-section {
  background-color: var(--card-background);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  box-shadow: var(--box-shadow);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: var(--text-color);
}

.filter-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 1rem;
  background-color: white;
  transition: all 0.3s ease;
}

.filter-group select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.clear-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--danger-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  align-self: flex-end;
}

.clear-button:hover {
  background-color: #c0392b;
}

.stations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
}

.station-card {
  background: var(--card-background);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.station-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.station-card h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.25rem;
}

.station-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.station-details p {
  margin: 0;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.station-details strong {
  color: #666;
  min-width: 120px;
}

.station-actions {
  display: flex;
  gap: 1rem;
  margin-top: auto;
}

.edit-button, .delete-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  flex: 1;
  text-align: center;
  transition: all 0.3s ease;
}

.edit-button {
  background-color: var(--primary-color);
  color: white;
}

.edit-button:hover {
  background-color: #2980b9;
}

.delete-button {
  background-color: var(--danger-color);
  color: white;
}

.delete-button:hover {
  background-color: #c0392b;
}

.error-message {
  background-color: #fde8e8;
  color: #c81e1e;
  padding: 1rem;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.no-stations {
  text-align: center;
  padding: 3rem;
  color: #666;
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

@media (max-width: 768px) {
  .stations-container {
    padding: 1rem;
  }

  .stations-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
  }

  .filter-button, .add-button {
    width: 100%;
    justify-content: center;
  }

  .filters-section {
    grid-template-columns: 1fr;
  }

  .stations-grid {
    grid-template-columns: 1fr;
  }

  .station-actions {
    flex-direction: column;
  }
}
</style> 