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
  img.classList.remove('red-map', 'fade-back');
  img.classList.add('red-map');
  setTimeout(() => {
    img.classList.add('fade-back');
  }, 0);
});