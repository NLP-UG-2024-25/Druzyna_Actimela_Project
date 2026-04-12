const img = document.getElementById('map-img');

let audio;
function initAudio() {
  audio = new Audio('earthquake_sound.mp3');
}

function playSound() {
  if (!audio) initAudio();
  audio.currentTime = 0;
  audio.play();
}


img.addEventListener('click', () => {
  playSound();
  const light = document.body.dataset.theme === 'light';
  img.style.transition = '';
  img.style.filter = 'sepia(1) hue-rotate(-50deg) saturate(5)';

  setTimeout(() => {
    img.style.transition = 'filter 5s ease';
    img.style.filter = light ? 'brightness(0.3)' : '';
  }, 300);
});

let currentSlide = 1;

function autoSlide() {
  currentSlide++;

  if (currentSlide > 5) {
    currentSlide = 1;
  }

  document.getElementById('slide' + currentSlide).checked = true;
}

setInterval(autoSlide, 4000);

const themeBtn = document.getElementById('theme-toggle');
const saved = localStorage.getItem('theme') || 'dark';
document.body.dataset.theme = saved;
themeBtn.textContent = saved === 'light' ? '🌙' : '☀️';

themeBtn.addEventListener('click', () => {
  const next = document.body.dataset.theme === 'light' ? 'dark' : 'light';
  document.body.dataset.theme = next;
  themeBtn.textContent = next === 'light' ? '🌙' : '☀️';
  localStorage.setItem('theme', next);
});