const img = document.getElementById('map-img');
let audio;
let earthquakeData = null;

// Inicjalizacja dźwięku
function initAudio() {
  audio = new Audio('earthquake_sound.mp3');
}

function playSound() {
  if (!audio) initAudio();
  audio.currentTime = 0;
  audio.play();
}

// Funkcja pobierająca dane GeoJSON z pliku lokalnego
async function loadEarthquakeData() {
  try {
    const response = await fetch('earthquakes.json');
    const data = await response.json();
    // Zapisujemy tablicę "features" z pliku JSON do zmiennej globalnej
    earthquakeData = data.features;
    console.log("Dane załadowane pomyślnie. Liczba wpisów:", earthquakeData.length);
  } catch (error) {
    console.error("Błąd podczas ładowania pliku JSON:", error);
  }
}

// Funkcja wyświetlająca dane losowego trzęsienia ziemi na stronie
function displayRandomEarthquake() {
  if (!earthquakeData || earthquakeData.length === 0) {
    console.warn("Brak danych do wyświetlenia.");
    return;
  }

  // Losujemy jeden indeks z tablicy trzęsień ziemi
  const randomIndex = Math.floor(Math.random() * earthquakeData.length);
  const earthquake = earthquakeData[randomIndex];

  // Pobieramy parametry z obiektu GeoJSON
  const magnitude = earthquake.properties.mag;
  const location = earthquake.properties.place;
  const timestamp = earthquake.properties.time;
  const depth = earthquake.geometry.coordinates[2]; // Trzecia wartość w coordinates to głębokość

  // Formatowanie daty ze standardu Unix (milisekundy) do czytelnego formatu
  const dateObject = new Date(timestamp);
  const formattedDate = dateObject.toLocaleString('pl-PL', { timeZone: 'UTC' }) + ' UTC';

  // Aktualizacja elementów w dokumencie HTML
  document.getElementById('eq-magnitude').textContent = magnitude.toFixed(1);
  document.getElementById('eq-location').textContent = location;
  document.getElementById('eq-date').textContent = formattedDate;
  document.getElementById('eq-depth').textContent = `${depth} km`;
  document.getElementById('eq-distance').textContent = "Calculated soon..."; // Przykładowa statyczna wartość
}

// Obsługa kliknięcia w mapę
img.addEventListener('click', () => {
  playSound();
  
  // Efekt wizualny trzęsienia mapy
  const light = document.body.dataset.theme === 'light';
  img.style.transition = '';
  img.style.filter = 'sepia(1) hue-rotate(-50deg) saturate(5)';

  setTimeout(() => {
    img.style.transition = 'filter 5s ease';
    img.style.filter = light ? 'brightness(0.3)' : '';
  }, 300);

  // Wyświetlamy losowe trzęsienie ziemi z wczytanego pliku JSON
  displayRandomEarthquake();
});

// --- Kod odpowiedzialny za automatyczny slider ---
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

// --- Kod odpowiedzialny za zmianę motywu (Dark/Light Mode) ---
const themeBtn = document.getElementById('theme-toggle');
const saved = localStorage.getItem('theme') || 'dark';
document.body.dataset.theme = saved;
if (themeBtn) themeBtn.textContent = saved === 'light' ? '🌙' : '☀️';

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const next = document.body.dataset.theme === 'light' ? 'dark' : 'light';
    document.body.dataset.theme = next;
    themeBtn.textContent = next === 'light' ? '🌙' : '☀️';
    localStorage.setItem('theme', next);
  });
}

// Uruchomienie pobierania danych zaraz po wczytaniu skryptu
loadEarthquakeData();