# Chrono-Kitchen: Epoch Eats

[![Competition](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/yudhisutawan/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/yudhisutawan/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

A complete, original cooking game for make.fun's **best-cooking-game-20261125-0137**
bounty ($250, top 10 share the prize). It runs offline in a desktop browser from
static files — no network requests, keyboard + mouse.

## The game

**Chrono-Kitchen: Epoch Eats** — cook in *The Time-Folding Diner of Chronos-4*,
a diner that exists in three eras at once. Orders arrive on the board; you route
the chef through the **Past** (stone hearth, mammoth steak), the **Present**
(chopping board, copper pot) and the **Future** (glaze oven, chrono-freezer),
chop / sear / boil / glaze / freeze / **age** each ingredient, build the dish on
the plating counter and serve it at the pass before the customer's patience runs
out.

- **The time twist:** steak and cheese *age* on the Aging Rack — some recipes
  only accept them aged. Ingredients also burn if left on the fire too long.
- **Pressure that grows:** 10 days (eras) with more recipes, faster orders and
  shorter patience; **Time Surges** drain patience twice as fast, and a
  **Paradox Thief** floats in to steal finished plates unless you click it away.
- **Depth:** 9 ingredients × 6 processes, 20 recipes, combos and tips, 3 strikes
  end the shift, per-day earnings targets.
- **Feel:** every station answers at once (progress rings, READY flashes, floating
  +$ popups), WebAudio sound effects synthesized at run time (M mutes), and the
  whole kitchen reads at a glance: order board, counters, timer, serving pass.

## Play

```sh
node serve.ts        # then open http://localhost:8080
```

Move with **WASD / arrows** or **click** (click a station to walk to it and use
it). **E / Space** uses the station in reach. Screenshots are staged by the
game itself: `?shot=start|play|rush|end&seed=7` plays the real rules forward
with an autopilot, so every frame is a real render of the game's own code.

## Layout

- `main.ts` — the hand-in program (Node 22, stdlib only): copies `game/` and
  `screenshots/` to `/output` and writes `dossier.json` with the vendored library.
- `game/index.html` + `game/src/` — the game, split one job per file:
  `config.js` (ingredients, recipes, days, layout), `world.js` (orders, stations,
  thief, scoring, autopilot), `render.js` (all canvas drawing), `input.js`,
  `audio.js`, `random.js`, `shots.js` (screenshot scenes), `main.js` (loop).
- `vendor/makefun-game.ts` — the kit's library, copied unchanged.
- `screenshots/` — 4 real renders: cover `1-play.jpg` (mid-assembly), `2-start.jpg`,
  `3-rush.jpg` (plate ready during a Time Surge), `4-end.jpg` (day clear).
- `LICENSE` — MIT.
