const slides = [...document.querySelectorAll('.slide')];
const slideIds = new Set(slides.map((slide) => slide.id));
const videos = [...document.querySelectorAll('video')];
const fullscreenButton = document.querySelector('#fullscreen-button');
let currentSlide = 'home';
const warmedVideos = new WeakSet();

function warmVideoForSlide(id) {
  const video = id === 'home' || id === 'koan-one' || id === 'film-one'
    ? videos[0]
    : id === 'moment-one' || id === 'film-two'
      ? videos[1]
      : null;
  if (!video || warmedVideos.has(video)) return;
  warmedVideos.add(video);
  video.preload = 'auto';
  video.load();
}

function showSlide(id, { updateHistory = false, moveFocus = false } = {}) {
  if (!slideIds.has(id)) return;
  videos.forEach((video) => video.pause());
  slides.forEach((slide) => {
    const active = slide.id === id;
    slide.hidden = !active;
    slide.classList.toggle('is-active', active);
  });
  currentSlide = id;
  warmVideoForSlide(id);
  window.scrollTo(0, 0);
  if (updateHistory) history.pushState({ slide: id }, '', `#${id}`);
  if (moveFocus) {
    const heading = document.querySelector(`#${id} h1, #${id} h2`);
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }
}

document.querySelectorAll('[data-slide-link]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.hash.slice(1);
    if (!slideIds.has(id)) return;
    event.preventDefault();
    showSlide(id, { updateHistory: true, moveFocus: true });
  });
});

window.addEventListener('popstate', () => showSlide(location.hash.slice(1) || 'home'));
window.addEventListener('hashchange', () => showSlide(location.hash.slice(1) || 'home'));

document.addEventListener('keydown', (event) => {
  const target = event.target;
  if (target instanceof HTMLElement && target.closest('video, button, a, input, textarea, select')) return;
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
  const position = slides.findIndex((slide) => slide.id === currentSlide);
  const next = position + (event.key === 'ArrowRight' ? 1 : -1);
  if (next < 0 || next >= slides.length) return;
  event.preventDefault();
  showSlide(slides[next].id, { updateHistory: true, moveFocus: true });
});

fullscreenButton.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    fullscreenButton.textContent = 'Use F11 for full screen';
    fullscreenButton.disabled = true;
  }
});

document.addEventListener('fullscreenchange', () => {
  const isFullscreen = Boolean(document.fullscreenElement);
  fullscreenButton.innerHTML = isFullscreen ? 'Exit full screen <span aria-hidden="true">↙</span>' : 'Full screen <span aria-hidden="true">↗</span>';
  fullscreenButton.setAttribute('aria-label', isFullscreen ? 'Exit full screen' : 'Enter full screen');
});

videos.forEach((video) => {
  video.addEventListener('play', () => videos.forEach((other) => { if (other !== video) other.pause(); }));
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) videos.forEach((video) => video.pause());
});

showSlide(slideIds.has(location.hash.slice(1)) ? location.hash.slice(1) : 'home');
