// Chrono-Kitchen: Epoch Eats — entry point: the loop, screens, input wiring and
// the deterministic ?shot= scenes used for the entry's screenshots.
import { VIEW } from './config.js';
import { createInput, moveDirection, usePressed } from './input.js';
import { createAudio } from './audio.js';
import { EVENT_DAY_CLEAR, EVENT_OVER, EVENT_WIN, createWorld, nearestStation, resetDay, stepWorld } from './world.js';
import { drawWorld } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const statusLine = document.getElementById('status');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || '7');
const shotName = params.get('shot');
const audio = createAudio();
const input = createInput(canvas);
const world = createWorld(seed);

let screen = 'title';
let shotScreen = null;
if (shotName) {
  shotScreen = stageShot(shotName, world);
  screen = shotScreen;
  document.title = `Chrono-Kitchen — shot ${shotName}`;
}

function setStatus(text) {
  if (statusLine) statusLine.textContent = text;
}

function startDay() {
  world.phase = 'play';
  screen = 'play';
  setStatus('Cooking! Serve the orders before their patience runs out.');
}

function nextDay() {
  resetDay(world);
  world.phase = 'play';
  screen = 'play';
}

function restart() {
  const fresh = createWorld(seed);
  Object.assign(world, fresh);
  world.phase = 'title';
  screen = 'title';
}

canvas.addEventListener('pointerdown', () => audio.unlock());
window.addEventListener('keydown', (event) => {
  audio.unlock();
  if (event.key.toLowerCase() === 'm') audio.toggleMute();
  if (screen === 'title' && (event.key === 'Enter' || event.key === ' ')) startDay();
  else if (screen === 'dayclear' && event.key === 'Enter') nextDay();
  else if ((screen === 'over' || screen === 'win') && event.key.toLowerCase() === 'r') restart();
});
canvas.addEventListener('pointerdown', () => {
  if (screen === 'title') startDay();
  else if (screen === 'dayclear') nextDay();
});

let last = performance.now();
let accumulator = 0;
const FRAME = 1000 / 60;

function frame(now) {
  const elapsed = Math.min(100, now - last);
  last = now;
  accumulator += elapsed;

  if (screen === 'play' && !shotName) {
    while (accumulator >= FRAME) {
      accumulator -= FRAME;
      const move = moveDirection(input);
      const use = usePressed(input);
      const click = input.click && input.click.fresh ? { x: input.click.x, y: input.click.y } : null;
      if (input.click) input.click.fresh = false;
      const event = stepWorld(world, FRAME / 1000, move, use, click, audio);
      if (event === EVENT_DAY_CLEAR) screen = 'dayclear';
      else if (event === EVENT_OVER) screen = 'over';
      else if (event === EVENT_WIN) screen = 'win';
    }
    input.pressed.clear();
  }

  const hovered = screen === 'play' ? nearestStation(world) : null;
  const ctx = canvas.getContext('2d');
  drawWorld(ctx, world, screen, hovered);
  if (screen === 'play') {
    const day = world.day;
    setStatus(`Day ${day}: score $${world.score}, served ${world.served}, ${Math.ceil(world.timeLeft)} seconds left in the shift.`);
  }
  requestAnimationFrame(frame);
}

setStatus('Chrono-Kitchen: Epoch Eats. Press Enter or click to start cooking.');
requestAnimationFrame(frame);
