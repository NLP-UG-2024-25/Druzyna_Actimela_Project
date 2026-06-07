/*
  CREATE MAP & FIX RENDER BUG
*/
const map = L.map('map').setView([20, 0], 2);
let userCoords = null;

// Poprawka wymuszająca na Leaflet ponowne przeliczenie rozmiaru kontenera
setTimeout(() => {
  map.invalidateSize();
}, 200);

/*
  MAP TILES
*/
L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; OpenStreetMap contributors'
  }
).addTo(map);


/*
  USER LOCATION
*/
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      userCoords = [lat, lng];

      /*
        USER MARKER
      */
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup("You are here")
        .openPopup();

      /*
        CENTER MAP ON USER
      */
      map.setView([lat, lng], 4);
    },
    (error) => {
      console.error("Geolocation error:", error);
    }
  );
}

/*
  FUNKCJA OBLICZAJĄCA ODLEGŁOŚĆ (Wzór Haversine'a)
*/
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Promień Ziemi w km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}


/*
  LOAD REAL EARTHQUAKES
  (USGS LIVE API)
*/
const markersLayer = L.layerGroup().addTo(map);
const datePicker = document.getElementById('date-picker');
const btnToday = document.getElementById('btn-today');
const btnYesterday = document.getElementById('btn-yesterday');

const DEFAULT_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

function loadEarthquakes(url) {
  // Clear previous data
  document.getElementById('eq-magnitude').textContent = "__";
  document.getElementById('eq-location').textContent = "__";
  document.getElementById('eq-date').textContent = "__";
  document.getElementById('eq-depth').textContent = "__";
  document.getElementById('eq-distance').textContent = "__";
  
  markersLayer.clearLayers();

  fetch(url)
    .then(response => response.json())
    .then(data => {
      data.features.forEach(quake => {
        const coords = quake.geometry.coordinates;
        const lng = coords[0];
        const lat = coords[1];
        const depth = coords[2];

        const magnitude = quake.properties.mag;
        const place = quake.properties.place;
        const time = new Date(quake.properties.time);

        /*
          EARTHQUAKE CIRCLE
        */
        const circle = L.circleMarker([lat, lng], {
          radius: magnitude ? magnitude * 2.5 : 5,
          color: "red",
          fillColor: "#f03",
          fillOpacity: 0.5
        }).addTo(markersLayer);

        circle.bindPopup(`
          <strong>${place}</strong><br>
          Magnitude: ${magnitude}<br>
          Depth: ${depth} km
        `);

        /*
          OBSŁUGA KLIKNIĘCIA W PUNKT NA MAPIE
        */
        circle.on('click', () => {
          document.getElementById('eq-magnitude').textContent = magnitude != null ? magnitude.toFixed(1) : "__";
          document.getElementById('eq-location').textContent = place || "__";
          document.getElementById('eq-date').textContent = time.toLocaleString('pl-PL');
          document.getElementById('eq-depth').textContent = `${depth} km`;

          const distField = document.getElementById('eq-distance');
          if (userCoords) {
            const distance = calculateDistance(userCoords[0], userCoords[1], lat, lng);
            distField.textContent = `${distance.toLocaleString('pl-PL')} km`;
          } else {
            distField.textContent = "Allow location access to calculate";
          }
        });
      });
    })
    .catch(error => {
      console.error("Earthquake API error:", error);
    });
}

function getCustomDateUrl(dateString) {
  const start = new Date(dateString);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];
  return `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startStr}&endtime=${endStr}`;
}

function getTodayString() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function updateActiveControl(selectedDate) {
  btnToday.classList.remove('active');
  btnYesterday.classList.remove('active');
  datePicker.classList.remove('active');

  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const yestStr = yest.getFullYear() + '-' + String(yest.getMonth() + 1).padStart(2, '0') + '-' + String(yest.getDate()).padStart(2, '0');

  if (selectedDate === getTodayString()) {
    btnToday.classList.add('active');
  } else if (selectedDate === yestStr) {
    btnYesterday.classList.add('active');
  } else {
    datePicker.classList.add('active');
  }
}

// Initial state
datePicker.value = getTodayString();
updateActiveControl(getTodayString());
loadEarthquakes(DEFAULT_URL);

btnToday.addEventListener('click', () => {
  const todayStr = getTodayString();
  datePicker.value = todayStr;
  updateActiveControl(todayStr);
  loadEarthquakes(DEFAULT_URL);
});

btnYesterday.addEventListener('click', () => {
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const yestStr = yest.getFullYear() + '-' + String(yest.getMonth() + 1).padStart(2, '0') + '-' + String(yest.getDate()).padStart(2, '0');
  datePicker.value = yestStr;
  updateActiveControl(yestStr);
  loadEarthquakes(getCustomDateUrl(yestStr));
});

datePicker.addEventListener('change', (e) => {
  const val = e.target.value;
  if(val) {
    updateActiveControl(val);
    if (val === getTodayString()) {
      loadEarthquakes(DEFAULT_URL);
    } else {
      loadEarthquakes(getCustomDateUrl(val));
    }
  } else {
    datePicker.value = getTodayString();
    updateActiveControl(getTodayString());
    loadEarthquakes(DEFAULT_URL);
  }
});


/*
  AUTOMATIC SLIDER
*/
let currentSlide = 1;
function autoSlide() {
  currentSlide++;
  if (currentSlide > 5) {
    currentSlide = 1;
  }
  const slideElement = document.getElementById('slide' + currentSlide);
  if (slideElement) slideElement.checked = true;
}
setInterval(autoSlide, 4000);


/*
  DARK / LIGHT MODE TOGGLE
*/
const themeBtn = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'dark';

document.body.dataset.theme = savedTheme;
if (themeBtn) themeBtn.textContent = savedTheme === 'light' ? '🌙' : '☀️';

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const nextTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
    document.body.dataset.theme = nextTheme;
    themeBtn.textContent = nextTheme === 'light' ? '🌙' : '☀️';
    localStorage.setItem('theme', nextTheme);
  });
}