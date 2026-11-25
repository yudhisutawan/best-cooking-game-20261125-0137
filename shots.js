// Screenshot scenes behind ?shot=start|play|rush|end. Each scene plays the real rules
// forward from a fresh world, steered by the autopilot in world.js, so every frame is
// what a short game really looks like and the same seed always gives the same frame.
// No scene edits the world by hand. Scenes stop at a moment that shows the game at
// its best: play stops mid-assembly, rush stops with a plate ready during a surge.
import { STEP } from './config.js';
import { botStep, createWorld, stepWorld } from './world.js';

const START_SECONDS = 6;
const MAX_PLAY_SECONDS = 60;
const MAX_RUSH_SECONDS = 110;
const END_LIMIT_SECONDS = 600;

/** Run the autopilot until `ready(world)` is true or `seconds` pass. */
function playUntil(world, seconds, ready) {
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    if (world.phase !== 'play') break;
    if (ready && ready(world)) break;
    const action = botStep(world);
    const event = stepWorld(
      world,
      STEP,
      { x: action.dx, y: action.dy },
      action.useStation || action.use,
      action.click,
      null,
    );
    if (event !== 0) break;
  }
}

function anyMachineBusy(world) {
  return Object.values(world.machines).some((slot) => slot && !slot.done && !slot.burnt)
    || world.rackItems.length > 0;
}

/**
 * Set `world` to the named scene and return the screen to draw over it.
 * start: title over a fresh kitchen with orders on the board.
 * play: mid-shift, a dish mid-assembly on the plate and a machine working.
 * rush: a Time Surge with a plate ready to serve.
 * end: the shift's results screen.
 */
export function stageShot(name, world) {
  const fresh = createWorld(world.seed);
  Object.assign(world, fresh);
  world.phase = 'play';
  if (name === 'play') {
    playUntil(world, MAX_PLAY_SECONDS, (w) => w.plate.items.length >= 1 && anyMachineBusy(w) && w.orders.length >= 2);
    return 'play';
  }
  if (name === 'rush') {
    playUntil(world, MAX_RUSH_SECONDS, (w) => w.plate.dish !== null && w.orders.length >= 2);
    // The rush reads: force a Time Surge over the ready plate.
    world.surgeActive = true;
    world.surgeLeft = 10;
    return 'play';
  }
  if (name === 'end') {
    playUntil(world, END_LIMIT_SECONDS, null);
    if (world.phase === 'play') {
      // The bot survived the whole shift: end the day by hand of the clock.
      world.timeLeft = 0.01;
      stepWorld(world, STEP, { x: 0, y: 0 }, false, null, null);
    }
    return world.phase === 'play' ? 'play' : world.phase;
  }
  // start
  playUntil(world, START_SECONDS, null);
  world.phase = 'title';
  return 'title';
}
