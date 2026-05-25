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
fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
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
      }).addTo(map);

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