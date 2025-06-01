<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useStationStore } from '../stores/stations';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const stationStore = useStationStore();
const mapContainer = ref(null);
let map = null;
let markers = [];

onMounted(async () => {
  await stationStore.fetchStations();
  
  // Initialize map
  map = L.map(mapContainer.value).setView([0, 0], 2);
  
  // Add tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Add markers for each station
  stationStore.stations.forEach(station => {
    const marker = L.marker([
      station.location.coordinates[1],
      station.location.coordinates[0]
    ]).addTo(map);

    // Add popup with station details
    marker.bindPopup(`
      <div class="station-popup">
        <h3>${station.name}</h3>
        <p><strong>Status:</strong> ${station.status}</p>
        <p><strong>Power Output:</strong> ${station.powerOutput} kW</p>
        <p><strong>Connector Type:</strong> ${station.connectorType}</p>
      </div>
    `);

    markers.push(marker);
  });

  // Fit map bounds to show all markers
  if (markers.length > 0) {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<template>
  <div class="map-container">
    <div ref="mapContainer" class="map"></div>
  </div>
</template>

<style scoped>
.map-container {
  height: calc(100vh - 200px);
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.map {
  height: 100%;
  width: 100%;
}

:deep(.station-popup) {
  padding: 0.5rem;
}

:deep(.station-popup h3) {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

:deep(.station-popup p) {
  margin: 0.25rem 0;
  color: #34495e;
}
</style> 