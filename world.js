// Chrono-Kitchen: Epoch Eats — the game world: orders, stations, the chef, the
// Time Surge, the Paradox Thief, days and scoring. Pure logic, no drawing.
import {
  DAYS, HAND_MAX, INGREDIENT_PROCESSES, INGREDIENTS, INTERACT_RANGE, MAX_STRIKES,
  PLAYER, PROCESSES, RECIPES, SHIFT_SECONDS, STATIONS,
} from './config.js';
import { makeRandom, randomPick } from './random.js';

export const EVENT_DAY_CLEAR = 1;
export const EVENT_OVER = 2;
export const EVENT_WIN = 4;

export function stationById(id) {
  return STATIONS.find((station) => station.id === id);
}

/** Where the chef stands to use a station: just outside its counter edge. */
export function approachPoint(station) {
  const cx = station.x + station.w / 2;
  if (station.y < 300) return { x: cx, y: station.y + station.h + 26 };
  return { x: cx, y: station.y - 26 };
}

function distance(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

export function createWorld(seed = 1) {
  const world = {
    seed,
    random: makeRandom(seed),
    day: 1,
    score: 0,
    dayScore: 0,
    coins: 0,
    served: 0,
    failed: 0,
    strikes: 0,
    combo: 0,
    bestCombo: 0,
    timeLeft: SHIFT_SECONDS,
    spawnTimer: 4,
    surgeTimer: 0,
    surgeLeft: 0,
    surgeActive: false,
    thief: { active: false, x: 0, y: 0, timer: 40, stealIn: 14 },
    orders: [],
    orderSeq: 0,
    player: { x: PLAYER.startX, y: PLAYER.startY, hands: [], facing: 1 },
    machines: {}, // stationId -> { item, process, progress, done, burnt }
    rackItems: [], // { item, process, progress, done }
    plate: { items: [], dish: null, claim: null }, // claim = recipe id the plate is being built for
    floaters: [], // { x, y, text, color, t }
    clickTarget: null,
    pickCooldown: 0,
    phase: 'title', // title | play | dayclear | over | win
    message: '',
    messageT: 0,
  };
  resetDay(world);
  return world;
}

/** Fresh orders/stations/timer for the current day, keeping score and coins. */
export function resetDay(world) {
  world.orders = [];
  world.machines = {};
  world.rackItems = [];
  world.plate = { items: [], dish: null, claim: null };
  world.timeLeft = SHIFT_SECONDS;
  world.spawnTimer = 3;
  world.surgeLeft = 0;
  world.surgeActive = false;
  world.dayScore = 0;
  const day = DAYS[world.day - 1];
  world.surgeTimer = day.surgeEvery > 0 ? day.surgeEvery : 9999;
  world.thief = { active: false, x: 0, y: 0, timer: 34, stealIn: 14 };
  world.player.x = PLAYER.startX;
  world.player.y = PLAYER.startY;
  world.player.hands = [];
  world.clickTarget = null;
  spawnOrder(world);
  spawnOrder(world);
}

function dayConfig(world) {
  return DAYS[world.day - 1];
}

function unlockedRecipes(world) {
  return RECIPES.slice(0, dayConfig(world).recipes);
}

function spawnOrder(world) {
  const cap = world.day <= 3 ? 3 : 4;
  if (world.orders.length >= cap) return;
  const recipe = randomPick(world.random, unlockedRecipes(world));
  const patience = dayConfig(world).patience * (0.9 + world.random() * 0.2);
  world.orders.push({
    id: ++world.orderSeq,
    recipe,
    patience,
    maxPatience: patience,
  });
}

export function addFloater(world, x, y, text, color) {
  world.floaters.push({ x, y, text, color: color || '#ffffff', t: 0 });
  if (world.floaters.length > 12) world.floaters.shift();
}

function showMessage(world, text, seconds) {
  world.message = text;
  world.messageT = seconds;
}

/** The station whose approach point is nearest the chef, within reach. */
export function nearestStation(world) {
  let best = null;
  let bestDistance = Infinity;
  for (const station of STATIONS) {
    const point = approachPoint(station);
    const d = distance(world.player.x, world.player.y, point.x, point.y);
    if (d < bestDistance) {
      bestDistance = d;
      best = station;
    }
  }
  return bestDistance <= INTERACT_RANGE + 24 ? best : null;
}

/** Station whose rectangle contains a point (for clicks). */
export function stationAtPoint(x, y) {
  return STATIONS.find((s) => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) || null;
}

function processedIdFor(rawId, process) {
  return `${rawId}:${process}`;
}

function handsHave(world, item) {
  return world.player.hands.includes(item);
}

function takeFromHands(world, item) {
  const index = world.player.hands.indexOf(item);
  if (index >= 0) world.player.hands.splice(index, 1);
}

/** Processed items already secured: on the plate, in hand, or cooking/aging. */
function securedCounts(world) {
  const counts = {};
  const add = (item) => { counts[item] = (counts[item] || 0) + 1; };
  for (const item of [...world.plate.items, ...world.player.hands]) add(item);
  for (const slot of Object.values(world.machines)) {
    if (slot && !slot.burnt) add(processedIdFor(slot.item, slot.process));
  }
  for (const entry of world.rackItems) {
    // Aging items count as secured: they can only leave the rack as the aged item.
    add(processedIdFor(entry.item, 'age'));
  }
  return counts;
}

/** Index of a hand item the orders no longer need (raw with no needed process, or a
 *  processed spare the plate and the stations already cover), or -1. */
function excessHandIndex(world) {
  const secured = securedCounts(world);
  for (let i = 0; i < world.player.hands.length; i += 1) {
    const item = world.player.hands[i];
    if (item.startsWith('dish:')) continue;
    if (!item.includes(':')) {
      if (!neededProcessFor(world, item)) return i;
      continue;
    }
    let needed = false;
    for (const order of world.orders) {
      if (!order.recipe.needs.includes(item)) continue;
      const wanted = order.recipe.needs.filter((n) => n === item).length;
      if ((secured[item] || 0) - 1 < wanted) {
        needed = true;
        break;
      }
    }
    if (!needed) return i;
  }
  return -1;
}

/** Which processed item a raw ingredient in hand still needs for an open order. */
function neededProcessFor(world, rawId) {
  const processes = INGREDIENT_PROCESSES[rawId] || [];
  const secured = securedCounts(world);
  for (const order of world.orders) {
    for (const need of order.recipe.needs) {
      const [needId, needProcess] = need.split(':');
      if (needId === rawId && processes.includes(needProcess)) {
        const wanted = order.recipe.needs.filter((i) => i === need).length;
        if ((secured[need] || 0) < wanted) return needProcess;
      }
    }
  }
  return null;
}

/** Use the station the chef stands at. Returns true when something happened. */
export function useStation(world, station, audio) {
  const player = world.player;
  const beep = (name) => audio && audio.play(name);
  if (station.kind === 'crate') {
    if (world.pickCooldown > 0) return false;
    if (player.hands.length >= HAND_MAX) {
      showMessage(world, 'Hands full!', 1);
      return false;
    }
    player.hands.push(station.ingredient);
    world.pickCooldown = 0.35;
    beep('pickup');
    return true;
  }
  if (station.kind === 'trash') {
    if (player.hands.length === 0) return false;
    // Compost the last excess item when there is one, else the top item.
    const secured = securedCounts(world);
    let lastExcess = -1;
    for (let i = 0; i < player.hands.length; i += 1) {
      const item = player.hands[i];
      if (item.startsWith('dish:')) continue;
      let excess = false;
      if (!item.includes(':')) {
        excess = !neededProcessFor(world, item);
      } else {
        excess = true;
        for (const order of world.orders) {
          if (!order.recipe.needs.includes(item)) continue;
          const wanted = order.recipe.needs.filter((n) => n === item).length;
          if ((secured[item] || 0) - 1 < wanted) {
            excess = false;
            break;
          }
        }
      }
      if (excess) lastExcess = i;
    }
    if (lastExcess >= 0) player.hands.splice(lastExcess, 1);
    else player.hands.pop();
    beep('fail');
    return true;
  }
  if (station.kind === 'machine') {
    const slot = world.machines[station.id];
    if (slot && slot.burnt) {
      delete world.machines[station.id];
      addFloater(world, station.x + station.w / 2, station.y - 8, 'Burnt — tossed!', '#e74c3c');
      beep('fail');
      return true;
    }
    if (slot && slot.done) {
      if (player.hands.length >= HAND_MAX) {
        showMessage(world, 'Hands full!', 1);
        return false;
      }
      player.hands.push(processedIdFor(slot.item, slot.process));
      delete world.machines[station.id];
      beep('ding');
      return true;
    }
    if (slot) return false; // still working
    // Start a process: find a raw ingredient in hand this machine can run.
    for (let i = 0; i < player.hands.length; i += 1) {
      const rawId = player.hands[i];
      if (rawId.includes(':')) continue;
      const process = neededProcessFor(world, rawId) || (INGREDIENT_PROCESSES[rawId] || []).find((p) => PROCESSES[p].station === station.id);
      if (process && PROCESSES[process].station === station.id) {
        player.hands.splice(i, 1);
        world.machines[station.id] = { item: rawId, process, progress: 0, done: false, burnt: false };
        beep('sizzle');
        return true;
      }
    }
    showMessage(world, `Nothing to ${station.hint.toLowerCase()} here`, 1);
    return false;
  }
  if (station.kind === 'rack') {
    const doneIndex = world.rackItems.findIndex((entry) => entry.done);
    if (doneIndex >= 0) {
      if (player.hands.length >= HAND_MAX) {
        showMessage(world, 'Hands full!', 1);
        return false;
      }
      const entry = world.rackItems.splice(doneIndex, 1)[0];
      player.hands.push(processedIdFor(entry.item, 'age'));
      beep('ding');
      return true;
    }
    if (world.rackItems.length >= 3) {
      showMessage(world, 'Rack is full', 1);
      return false;
    }
    for (let i = 0; i < player.hands.length; i += 1) {
      const rawId = player.hands[i];
      if (!rawId.includes(':') && (INGREDIENT_PROCESSES[rawId] || []).includes('age')) {
        player.hands.splice(i, 1);
        world.rackItems.push({ item: rawId, process: 'age', progress: 0, done: false });
        beep('sizzle');
        return true;
      }
    }
    showMessage(world, 'Nothing here ages', 1);
    return false;
  }
  if (station.kind === 'plating') {
    // Pick up a ready dish first.
    if (world.plate.dish) {
      if (player.hands.length >= HAND_MAX) {
        showMessage(world, 'Hands full!', 1);
        return false;
      }
      player.hands.push(`dish:${world.plate.dish}`);
      world.plate = { items: [], dish: null, claim: null };
      beep('pickup');
      return true;
    }
    // Put a processed item on the plate. The first item claims the plate for the
    // oldest order that needs it; later items must belong to that same order.
    // An item that does not fit is skipped, not a dead end: another hand item may.
    let rejected = false;
    for (let i = 0; i < player.hands.length; i += 1) {
      const item = player.hands[i];
      if (!item.includes(':') || item.startsWith('dish:')) continue;
      if (world.plate.items.length >= 4) {
        showMessage(world, 'Plate is full', 1);
        return false;
      }
      let claim = world.plate.claim;
      if (!claim) {
        const order = world.orders.find((o) => o.recipe.needs.includes(item));
        if (!order) {
          rejected = true;
          continue;
        }
        claim = order.recipe.id;
      }
      const claimOrder = world.orders.find((o) => o.recipe.id === claim);
      if (!claimOrder || !claimOrder.recipe.needs.includes(item)) {
        rejected = true;
        continue;
      }
      const wanted = claimOrder.recipe.needs.filter((n) => n === item).length;
      const onPlate = world.plate.items.filter((n) => n === item).length;
      if (onPlate >= wanted) {
        rejected = true;
        continue;
      }
      player.hands.splice(i, 1);
      world.plate.items.push(item);
      world.plate.claim = claim;
      beep('chop');
      checkPlateComplete(world, audio);
      return true;
    }
    if (rejected) showMessage(world, 'That does not go on this plate', 1);
    // Empty hands: take the last plate item back.
    if (world.plate.items.length > 0 && player.hands.length < HAND_MAX) {
      player.hands.push(world.plate.items.pop());
      if (world.plate.items.length === 0) world.plate.claim = null;
      beep('pickup');
      return true;
    }
    return false;
  }
  if (station.kind === 'pass') {
    const dishIndex = player.hands.findIndex((item) => item.startsWith('dish:'));
    if (dishIndex < 0) {
      showMessage(world, 'Bring a finished plate here', 1);
      return false;
    }
    const dish = player.hands.splice(dishIndex, 1)[0];
    const recipeId = dish.slice(5);
    const orderIndex = world.orders.findIndex((order) => order.recipe.id === recipeId);
    if (orderIndex < 0) {
      addFloater(world, station.x + station.w / 2, station.y - 8, 'Too late — order gone', '#e74c3c');
      world.failed += 1;
      beep('fail');
      return true;
    }
    const order = world.orders.splice(orderIndex, 1)[0];
    const patienceBonus = Math.round((order.patience / order.maxPatience) * 10);
    const tip = world.combo >= 2 ? 5 : 0;
    const earned = order.recipe.price + patienceBonus + tip;
    world.coins += earned;
    world.score += earned;
    world.dayScore += earned;
    world.served += 1;
    world.combo += 1;
    world.bestCombo = Math.max(world.bestCombo, world.combo);
    addFloater(world, station.x + station.w / 2, station.y - 8, `+$${earned}${tip ? ' (combo!)' : ''}`, '#2ecc71');
    beep('coin');
    return true;
  }
  return false;
}

/** When the plate's items exactly match its claimed order, it becomes a ready dish. */
function checkPlateComplete(world, audio) {
  const plate = world.plate;
  if (plate.dish || plate.items.length === 0 || !plate.claim) return;
  const order = world.orders.find((o) => o.recipe.id === plate.claim);
  if (!order) return;
  const sorted = [...plate.items].sort().join('|');
  if ([...order.recipe.needs].sort().join('|') === sorted) {
    plate.dish = order.recipe.id;
    addFloater(world, 640, 590, `${order.recipe.name} — ready!`, '#2ecc71');
    if (audio) audio.play('serve');
  }
}

/** Click handling: banish the thief, or walk to a station / floor point. */
export function handleClick(world, x, y, audio) {
  const thief = world.thief;
  if (thief.active && distance(x, y, thief.x, thief.y) < 48) {
    thief.active = false;
    thief.timer = 34 + world.random() * 20;
    addFloater(world, thief.x, thief.y - 16, 'Paradox banished!', '#9b59b6');
    if (audio) audio.play('banish');
    return;
  }
  const station = stationAtPoint(x, y);
  if (station) {
    world.clickTarget = { ...approachPoint(station), useOnArrive: station };
    return;
  }
  world.clickTarget = { x: Math.max(24, Math.min(1256, x)), y: Math.max(232, Math.min(588, y)) };
}

function stepMachines(world, dt, audio) {
  for (const id of Object.keys(world.machines)) {
    const slot = world.machines[id];
    if (slot.done || slot.burnt) continue;
    slot.progress += dt;
    const proc = PROCESSES[slot.process];
    if (slot.progress >= proc.seconds && !slot.done) {
      slot.done = true;
      const station = stationById(id);
      addFloater(world, station.x + station.w / 2, station.y - 8, `${proc.past}!`, '#f1c40f');
      if (audio) audio.play('ding');
    } else if (proc.grace < 99 && slot.progress >= proc.seconds + proc.grace) {
      slot.burnt = true;
      const station = stationById(id);
      addFloater(world, station.x + station.w / 2, station.y - 8, 'Burnt!', '#e74c3c');
      if (audio) audio.play('fail');
    }
  }
  for (const entry of world.rackItems) {
    if (entry.done) continue;
    entry.progress += dt;
    if (entry.progress >= PROCESSES.age.seconds) {
      entry.done = true;
      addFloater(world, 116, 592, 'Aged!', '#f1c40f');
      if (audio) audio.play('ding');
    }
  }
}

function stepThief(world, dt, audio) {
  const thief = world.thief;
  if (!thief.active) {
    thief.timer -= dt;
    if (thief.timer <= 0 && world.plate.dish) {
      thief.active = true;
      thief.x = 1240;
      thief.y = 340;
      thief.stealIn = 14;
      showMessage(world, 'A Paradox Thief is after your plate — click it!', 3);
      if (audio) audio.play('surge');
    }
    return;
  }
  const target = { x: 640, y: 592 };
  const dx = target.x - thief.x;
  const dy = target.y - thief.y;
  const d = Math.hypot(dx, dy) || 1;
  const speed = 46;
  thief.x += (dx / d) * speed * dt;
  thief.y += (dy / d) * speed * dt;
  thief.stealIn -= dt;
  if (d < 70 || thief.stealIn <= 0) {
    if (world.plate.dish) {
      world.plate = { items: [], dish: null, claim: null };
      addFloater(world, 640, 580, 'Plate stolen by the Thief!', '#9b59b6');
      if (audio) audio.play('fail');
    }
    thief.active = false;
    thief.timer = 34 + world.random() * 20;
  }
}

/** Advance the world one step. move = {x, y}; use = use-key pressed; click = point or null. */
export function stepWorld(world, dt, move, use, click, audio) {
  if (world.phase !== 'play') return 0;
  world.pickCooldown = Math.max(0, world.pickCooldown - dt);
  if (world.messageT > 0) world.messageT -= dt;
  for (const floater of world.floaters) floater.t += dt;
  world.floaters = world.floaters.filter((f) => f.t < 1.6);

  if (click) handleClick(world, click.x, click.y, audio);

  const player = world.player;
  let mx = move.x;
  let my = move.y;
  if ((mx === 0 && my === 0) && world.clickTarget) {
    const dx = world.clickTarget.x - player.x;
    const dy = world.clickTarget.y - player.y;
    const d = Math.hypot(dx, dy);
    if (d < 6) {
      const target = world.clickTarget;
      world.clickTarget = null;
      if (target.useOnArrive) useStation(world, target.useOnArrive, audio);
    } else {
      mx = dx / d;
      my = dy / d;
    }
  } else if (mx !== 0 || my !== 0) {
    world.clickTarget = null;
  }
  if (mx !== 0 || my !== 0) {
    const len = Math.hypot(mx, my) || 1;
    player.x = Math.max(24, Math.min(1256, player.x + (mx / len) * PLAYER.speed * dt));
    player.y = Math.max(232, Math.min(588, player.y + (my / len) * PLAYER.speed * dt));
    player.facing = mx < 0 ? -1 : mx > 0 ? 1 : player.facing;
  }
  if (use) {
    // `use` is a station object when the autopilot names its target, or `true`
    // for the human player, who uses the nearest station in reach.
    const station = use && typeof use === 'object' ? use : nearestStation(world);
    if (station) useStation(world, station, audio);
  }

  stepMachines(world, dt, audio);
  stepThief(world, dt, audio);

  // Orders: patience drains, faster during a Time Surge.
  const drain = world.surgeActive ? 2 : 1;
  for (let i = world.orders.length - 1; i >= 0; i -= 1) {
    const order = world.orders[i];
    order.patience -= dt * drain;
    if (order.patience <= 0) {
      world.orders.splice(i, 1);
      world.failed += 1;
      world.strikes += 1;
      world.combo = 0;
      addFloater(world, 640, 150, `Order failed: ${order.recipe.name}`, '#e74c3c');
      // A plate claimed for the failed order is cleared with it.
      if (world.plate.claim === order.recipe.id && !world.plate.dish) {
        world.plate = { items: [], dish: null, claim: null };
      }
      if (audio) audio.play('fail');
      if (world.strikes >= MAX_STRIKES) {
        world.phase = 'over';
        return EVENT_OVER;
      }
    }
  }

  // Spawning, surge, shift timer.
  world.spawnTimer -= dt;
  if (world.spawnTimer <= 0) {
    spawnOrder(world);
    world.spawnTimer = dayConfig(world).spawnEvery * (0.85 + world.random() * 0.3);
  }
  if (!world.surgeActive) {
    world.surgeTimer -= dt;
    if (world.surgeTimer <= 0) {
      world.surgeActive = true;
      world.surgeLeft = 12;
      showMessage(world, 'TIME SURGE — patience drains twice as fast!', 3);
      if (audio) audio.play('surge');
    }
  } else {
    world.surgeLeft -= dt;
    if (world.surgeLeft <= 0) {
      world.surgeActive = false;
      world.surgeTimer = dayConfig(world).surgeEvery;
    }
  }
  world.timeLeft -= dt;
  if (world.timeLeft <= 0) {
    if (world.dayScore >= dayConfig(world).target) {
      const bonus = 20 + world.day * 5;
      world.coins += bonus;
      if (world.day >= DAYS.length) {
        world.phase = 'win';
        return EVENT_WIN;
      }
      world.day += 1;
      world.phase = 'dayclear';
      return EVENT_DAY_CLEAR;
    }
    world.phase = 'over';
    return EVENT_OVER;
  }
  return 0;
}

// --- Autopilot: plays the real rules so screenshots stage real gameplay. ---

/** Which station (by id) runs a process. */
function stationForProcess(process) {
  return STATIONS.find((s) => s.kind === 'machine' && s.process === process)
    || (process === 'age' ? stationById('rack') : null);
}

/** First processed item the oldest order still needs (plate + hands + cooking counted). */
function nextMissingNeed(world) {
  const secured = securedCounts(world);
  for (const order of world.orders) {
    for (const need of order.recipe.needs) {
      const wanted = order.recipe.needs.filter((n) => n === need).length;
      if ((secured[need] || 0) < wanted) return { order, need };
    }
  }
  return null;
}

/** Idle in the middle of the floor, pressing nothing: waiting at a station would
 *  keep "using" it (the plating counter hands food back to empty hands). */
function botWait(world) {
  const dx = 640 - world.player.x;
  const dy = 420 - world.player.y;
  const d = Math.hypot(dx, dy);
  return { dx: d === 0 ? 0 : dx / d, dy: d === 0 ? 0 : dy / d, use: false, useStation: null, click: null, action: 'wait' };
}

function botGoTo(world, station, action) {
  const point = approachPoint(station);
  const dx = point.x - world.player.x;
  const dy = point.y - world.player.y;
  const d = Math.hypot(dx, dy);
  const use = d <= INTERACT_RANGE + 10;
  return { dx: d === 0 ? 0 : dx / d, dy: d === 0 ? 0 : dy / d, use, useStation: use ? station : null, click: null, action };
}

/** One autopilot decision: move toward a target, use when in reach, click the thief. */
export function botStep(world) {
  const player = world.player;
  // Banish the thief first.
  if (world.thief.active) {
    return { dx: 0, dy: 0, use: false, useStation: null, click: { x: world.thief.x, y: world.thief.y } };
  }
  // Carry a finished dish to the pass.
  const dishIndex = player.hands.findIndex((item) => item.startsWith('dish:'));
  if (dishIndex >= 0) return botGoTo(world, stationById('pass'), 'serve dish');
  // Pick up a ready plate.
  if (world.plate.dish) return botGoTo(world, stationById('plating'), 'pick up dish');
  // Plate a processed item in hand that an open order still needs. The first item
  // claims the plate for one order; later items must belong to that same order.
  for (const item of player.hands) {
    if (!item.includes(':') || item.startsWith('dish:')) continue;
    for (const order of world.orders) {
      if (world.plate.claim && world.plate.claim !== order.recipe.id) continue;
      if (!order.recipe.needs.includes(item)) continue;
      const wanted = order.recipe.needs.filter((n) => n === item).length;
      const onPlate = world.plate.items.filter((i) => i === item).length;
      if (onPlate < wanted && world.plate.items.length < 4) {
        return botGoTo(world, stationById('plating'), 'plate item');
      }
    }
  }
  // Hands full: compost an excess item, to make room.
  if (player.hands.length >= HAND_MAX) {
    if (excessHandIndex(world) >= 0) return botGoTo(world, stationById('trash'), 'trash extra');
  }
  // Pick up a finished process.
  for (const id of Object.keys(world.machines)) {
    const slot = world.machines[id];
    if (slot && slot.done && player.hands.length < HAND_MAX) {
      return botGoTo(world, stationById(id), 'collect processed');
    }
  }
  const doneRack = world.rackItems.find((entry) => entry.done);
  if (doneRack && player.hands.length < HAND_MAX) {
    return botGoTo(world, stationById('rack'), 'collect aged');
  }
  // Clear a burnt machine.
  for (const id of Object.keys(world.machines)) {
    if (world.machines[id] && world.machines[id].burnt) {
      return botGoTo(world, stationById(id), 'clear burnt');
    }
  }
  const missing = nextMissingNeed(world);
  if (!missing) {
    // Nothing to do: wait in the middle of the floor.
    return botWait(world);
  }
  const [needId, needProcess] = missing.need.split(':');
  // A processed item in hand goes on the plate.
  if (handsHave(world, missing.need)) return botGoTo(world, stationById('plating'), 'plate item');
  // A raw ingredient in hand goes to its station.
  if (handsHave(world, needId)) {
    return botGoTo(world, stationForProcess(needProcess), `process ${needId}`);
  }
  // Hands full of useful stuff: wait in the middle of the floor instead of composting it.
  if (player.hands.length >= HAND_MAX) {
    if (excessHandIndex(world) >= 0) return botGoTo(world, stationById('trash'), 'trash extra');
    return botWait(world);
  }
  // Fetch the raw ingredient from its crate.
  const crate = STATIONS.find((s) => s.kind === 'crate' && s.ingredient === needId);
  if (crate) return botGoTo(world, crate, `fetch ${needId}`);
  // Fallback: wait.
  return botWait(world);
}
