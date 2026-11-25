// Chrono-Kitchen: Epoch Eats — data: canvas size, ingredients, processes, recipes,
// days (levels), stations and their layout. One job: the game's facts, no logic.
export const VIEW = { width: 1280, height: 720 };
export const STEP = 1 / 60;
export const HAND_MAX = 3;
export const SHIFT_SECONDS = 150;
export const MAX_STRIKES = 3;

// Ingredient: id, display name, era zone, draw colour, short label for chips.
export const INGREDIENTS = {
  steak: { name: 'Mammoth Steak', era: 'past', color: '#c0392b', chip: 'Steak' },
  mushroom: { name: 'Ember Mushroom', era: 'past', color: '#e67e22', chip: 'Shroom' },
  onion: { name: 'Cave Onion', era: 'past', color: '#b07cc6', chip: 'Onion' },
  dough: { name: 'Stone-Mill Dough', era: 'present', color: '#f5deb3', chip: 'Dough' },
  tomato: { name: 'Sun Tomato', era: 'present', color: '#e74c3c', chip: 'Tomato' },
  cheese: { name: 'Alpine Cheese', era: 'present', color: '#f1c40f', chip: 'Cheese' },
  rice: { name: 'Chrono Rice', era: 'future', color: '#e8f6ff', chip: 'Rice' },
  spice: { name: 'Nanite Spice', era: 'future', color: '#9b59b6', chip: 'Spice' },
  egg: { name: 'Plasma Egg', era: 'future', color: '#f9e79f', chip: 'Egg' },
};

// Process: station that runs it, seconds on the station, grace before it burns.
export const PROCESSES = {
  sear: { station: 'hearth', seconds: 3.5, grace: 4, verb: 'Searing', past: 'Seared' },
  age: { station: 'rack', seconds: 5, grace: 99, verb: 'Aging', past: 'Aged' },
  chop: { station: 'board', seconds: 2, grace: 99, verb: 'Chopping', past: 'Chopped' },
  boil: { station: 'pot', seconds: 3.5, grace: 4, verb: 'Boiling', past: 'Boiled' },
  glaze: { station: 'oven', seconds: 3, grace: 4, verb: 'Glazing', past: 'Glazed' },
  freeze: { station: 'freezer', seconds: 3, grace: 99, verb: 'Freezing', past: 'Frosted' },
};

// Which raw ingredient can take which process (processed id is `${id}:${process}`).
export const INGREDIENT_PROCESSES = {
  steak: ['sear', 'age'],
  mushroom: ['chop', 'sear'],
  onion: ['chop'],
  dough: ['glaze', 'freeze'],
  tomato: ['chop', 'boil'],
  cheese: ['chop', 'age'],
  rice: ['boil', 'freeze'],
  spice: ['glaze'],
  egg: ['boil', 'freeze'],
};

/** Human name of a processed item, e.g. "Seared Mammoth Steak". */
export function processedName(processedId) {
  const [id, process] = processedId.split(':');
  const ingredient = INGREDIENTS[id];
  const proc = PROCESSES[process];
  if (!ingredient || !proc) return processedId;
  return `${proc.past} ${ingredient.name}`;
}

/** Short chip label for order tickets, e.g. "Sear Steak" — fits beside its neighbours. */
export function ticketChip(processedId) {
  const [id, process] = processedId.split(':');
  const ingredient = INGREDIENTS[id];
  const proc = PROCESSES[process];
  if (!ingredient || !proc) return processedId;
  const short = { sear: 'Sear', age: 'Aged', chop: 'Chop', boil: 'Boil', glaze: 'Glaz', freeze: 'Fros' }[process] || proc.past;
  return `${short} ${ingredient.chip}`;
}

// Recipes: 20 across the 10 days. needs = processed item ids the plate must hold.
export const RECIPES = [
  { id: 'r01', name: 'Dawn Skewer', era: 'past', needs: ['steak:sear', 'mushroom:chop'], price: 18 },
  { id: 'r02', name: 'Ember Soup', era: 'past', needs: ['mushroom:sear', 'onion:chop'], price: 16 },
  { id: 'r03', name: 'Cave Onion Tart', era: 'past', needs: ['onion:chop', 'dough:glaze'], price: 20 },
  { id: 'r04', name: 'Aged Feast Plate', era: 'past', needs: ['steak:age', 'cheese:age'], price: 26 },
  { id: 'r05', name: 'Sun Bruschetta', era: 'present', needs: ['tomato:chop', 'dough:glaze'], price: 18 },
  { id: 'r06', name: 'Golden Melt', era: 'present', needs: ['cheese:chop', 'tomato:boil'], price: 22 },
  { id: 'r07', name: 'Alpine Pasta', era: 'present', needs: ['tomato:boil', 'cheese:chop', 'onion:chop'], price: 28 },
  { id: 'r08', name: 'Frosted Dough Ring', era: 'present', needs: ['dough:freeze', 'egg:boil'], price: 24 },
  { id: 'r09', name: 'Chrono Rice Bowl', era: 'future', needs: ['rice:boil', 'egg:boil'], price: 22 },
  { id: 'r10', name: 'Spiced Star Rice', era: 'future', needs: ['rice:boil', 'spice:glaze'], price: 26 },
  { id: 'r11', name: 'Plasma Omelette', era: 'future', needs: ['egg:boil', 'cheese:chop', 'mushroom:chop'], price: 30 },
  { id: 'r12', name: 'Frost Rice Pudding', era: 'future', needs: ['rice:freeze', 'egg:freeze'], price: 26 },
  { id: 'r13', name: 'Epoch Burger', era: 'past', needs: ['steak:sear', 'onion:chop', 'dough:glaze'], price: 34 },
  { id: 'r14', name: 'Time-Loop Stew', era: 'past', needs: ['steak:age', 'mushroom:sear', 'rice:boil'], price: 36 },
  { id: 'r15', name: 'Neon Noodle Cup', era: 'future', needs: ['rice:boil', 'tomato:boil', 'spice:glaze'], price: 32 },
  { id: 'r16', name: 'Paradox Platter', era: 'future', needs: ['steak:age', 'rice:freeze', 'spice:glaze'], price: 40 },
  { id: 'r17', name: 'Chrono Feast', era: 'future', needs: ['steak:sear', 'egg:boil', 'rice:boil', 'spice:glaze'], price: 48 },
  { id: 'r18', name: 'Ember Harvest Bowl', era: 'past', needs: ['mushroom:sear', 'tomato:boil', 'cheese:age'], price: 34 },
  { id: 'r19', name: 'Glacier Brunch', era: 'future', needs: ['egg:freeze', 'dough:freeze', 'cheese:chop'], price: 32 },
  { id: 'r20', name: 'The Chronos Banquet', era: 'future', needs: ['steak:age', 'egg:boil', 'rice:boil', 'tomato:boil'], price: 52 },
];

// Days (levels): 10 eras of the diner. recipes = how many of RECIPES are unlocked.
export const DAYS = [
  { name: 'Day 1 — Dawn of Fire', target: 100, spawnEvery: 16, patience: 70, recipes: 3, surgeEvery: 0 },
  { name: 'Day 2 — Smoke & Stone', target: 130, spawnEvery: 14, patience: 68, recipes: 5, surgeEvery: 0 },
  { name: 'Day 3 — The Copper Pot', target: 160, spawnEvery: 13, patience: 64, recipes: 7, surgeEvery: 70 },
  { name: 'Day 4 — Neon Noodles', target: 190, spawnEvery: 12, patience: 60, recipes: 9, surgeEvery: 65 },
  { name: 'Day 5 — The Aging Rack', target: 220, spawnEvery: 11, patience: 58, recipes: 11, surgeEvery: 60 },
  { name: 'Day 6 — Plasma Breakfast', target: 250, spawnEvery: 10, patience: 56, recipes: 13, surgeEvery: 55 },
  { name: 'Day 7 — Frost & Flame', target: 280, spawnEvery: 10, patience: 54, recipes: 15, surgeEvery: 50 },
  { name: 'Day 8 — The Paradox Menu', target: 310, spawnEvery: 9, patience: 52, recipes: 17, surgeEvery: 48 },
  { name: 'Day 9 — Echoes of the Feast', target: 340, spawnEvery: 9, patience: 50, recipes: 19, surgeEvery: 45 },
  { name: 'Day 10 — The Chrono Feast', target: 380, spawnEvery: 8, patience: 48, recipes: 20, surgeEvery: 42 },
];

// Station layout. kind: crate | machine | rack | plating | pass | trash.
// A machine holds one item being processed; the rack holds up to 3 aging items.
export const STATIONS = [
  // Past zone, top row (crates + hearth)
  { id: 'crate-steak', kind: 'crate', ingredient: 'steak', label: 'Mammoth Steak', x: 16, y: 156, w: 96, h: 60 },
  { id: 'crate-mushroom', kind: 'crate', ingredient: 'mushroom', label: 'Ember Mushroom', x: 120, y: 156, w: 96, h: 60 },
  { id: 'crate-onion', kind: 'crate', ingredient: 'onion', label: 'Cave Onion', x: 224, y: 156, w: 96, h: 60 },
  { id: 'hearth', kind: 'machine', process: 'sear', label: 'Stone Hearth', hint: 'Sear', x: 328, y: 156, w: 96, h: 60 },
  // Present zone, top row
  { id: 'crate-dough', kind: 'crate', ingredient: 'dough', label: 'Stone-Mill Dough', x: 440, y: 156, w: 76, h: 60 },
  { id: 'crate-tomato', kind: 'crate', ingredient: 'tomato', label: 'Sun Tomato', x: 524, y: 156, w: 76, h: 60 },
  { id: 'crate-cheese', kind: 'crate', ingredient: 'cheese', label: 'Alpine Cheese', x: 608, y: 156, w: 76, h: 60 },
  { id: 'board', kind: 'machine', process: 'chop', label: 'Chopping Board', hint: 'Chop', x: 692, y: 156, w: 76, h: 60 },
  { id: 'pot', kind: 'machine', process: 'boil', label: 'Copper Pot', hint: 'Boil', x: 776, y: 156, w: 76, h: 60 },
  // Future zone, top row
  { id: 'crate-rice', kind: 'crate', ingredient: 'rice', label: 'Chrono Rice', x: 860, y: 156, w: 76, h: 60 },
  { id: 'crate-spice', kind: 'crate', ingredient: 'spice', label: 'Nanite Spice', x: 944, y: 156, w: 76, h: 60 },
  { id: 'crate-egg', kind: 'crate', ingredient: 'egg', label: 'Plasma Egg', x: 1028, y: 156, w: 76, h: 60 },
  { id: 'oven', kind: 'machine', process: 'glaze', label: 'Glaze Oven', hint: 'Glaze', x: 1112, y: 156, w: 76, h: 60 },
  { id: 'freezer', kind: 'machine', process: 'freeze', label: 'Chrono-Freezer', hint: 'Freeze', x: 1196, y: 156, w: 68, h: 60 },
  // Bottom row
  { id: 'rack', kind: 'rack', process: 'age', label: 'Aging Rack', hint: 'Age', x: 16, y: 600, w: 200, h: 64 },
  { id: 'trash', kind: 'trash', label: 'Compost Bin', hint: 'Trash', x: 232, y: 600, w: 84, h: 64 },
  { id: 'plating', kind: 'plating', label: 'Plating Counter', hint: 'Plate', x: 440, y: 600, w: 400, h: 64 },
  { id: 'pass', kind: 'pass', label: 'Serving Pass', hint: 'Serve', x: 1040, y: 600, w: 224, h: 64 },
];

export const PLAYER = { speed: 250, radius: 20, startX: 640, startY: 420 };
export const INTERACT_RANGE = 56;
export const ZONES = [
  { name: 'PAST', x: 8, w: 420, color: '#8a5a2b', tint: 'rgba(138,90,43,0.20)' },
  { name: 'PRESENT', x: 432, w: 420, color: '#2e7d6b', tint: 'rgba(46,125,107,0.20)' },
  { name: 'FUTURE', x: 852, w: 420, color: '#6c4fa1', tint: 'rgba(108,79,161,0.22)' },
];
