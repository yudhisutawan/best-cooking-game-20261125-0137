// Chrono-Kitchen: Epoch Eats — every pixel the game draws: the three-era kitchen,
// the order board, ingredients, the chef, plates, the timer and the screens.
import { DAYS, INGREDIENTS, PROCESSES, STATIONS, VIEW, ZONES, processedName, ticketChip } from './config.js';
import { approachPoint } from './world.js';

const FONT = "'Trebuchet MS', 'Segoe UI', sans-serif";

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align, weight) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 'bold'} ${size}px ${FONT}`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

/** Draw one ingredient's icon at (x, y) with radius r. */
export function drawIngredientIcon(ctx, id, x, y, r) {
  const ingredient = INGREDIENTS[id];
  if (!ingredient) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = ingredient.color;
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  if (id === 'steak') {
    roundRect(ctx, -r, -r * 0.7, r * 2, r * 1.4, r * 0.5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f8c8c0';
    roundRect(ctx, -r * 0.55, -r * 0.25, r * 1.1, r * 0.5, r * 0.25);
    ctx.fill();
  } else if (id === 'mushroom') {
    ctx.beginPath();
    ctx.arc(0, -r * 0.2, r, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffe9c9';
    ctx.fillRect(-r * 0.3, -r * 0.2, r * 0.6, r * 0.8);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-r * 0.45, -r * 0.55, r * 0.18, 0, Math.PI * 2);
    ctx.arc(r * 0.4, -r * 0.7, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'onion') {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#e9d5f5';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(r * 0.3, -r * 1.3, 0, -r * 1.25);
    ctx.strokeStyle = '#7cb342';
    ctx.stroke();
  } else if (id === 'dough') {
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#d9b380';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.1, r * 0.12, 0, Math.PI * 2);
    ctx.arc(r * 0.35, r * 0.15, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'tomato') {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#2e7d32';
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.7);
      ctx.lineTo(Math.cos(a) * r * 0.5, -r * 0.7 + Math.sin(a) * r * 0.5);
      ctx.lineTo(Math.cos(a + 0.6) * r * 0.5, -r * 0.7 + Math.sin(a + 0.6) * r * 0.5);
      ctx.closePath();
      ctx.fill();
    }
  } else if (id === 'cheese') {
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.6);
    ctx.lineTo(r, r * 0.6);
    ctx.lineTo(r * 0.4, -r * 0.7);
    ctx.lineTo(-r * 0.6, -r * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#d4a017';
    ctx.beginPath();
    ctx.arc(0, r * 0.2, r * 0.16, 0, Math.PI * 2);
    ctx.arc(r * 0.45, r * 0.35, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'rice') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.2, r, r * 0.6, 0, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#b0c4de';
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * r * 0.3, -r * 0.1 - Math.abs(i) * -r * 0.08);
      ctx.lineTo(i * r * 0.3 + r * 0.12, -r * 0.45);
      ctx.stroke();
    }
  } else if (id === 'spice') {
    ctx.fillStyle = '#e1b5f5';
    for (let i = 0; i < 4; i += 1) {
      const a = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a - 0.25) * r * 0.4, Math.sin(a - 0.25) * r * 0.4);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.lineTo(Math.cos(a + 0.25) * r * 0.4, Math.sin(a + 0.25) * r * 0.4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'egg') {
    ctx.fillStyle = '#fffdf5';
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.arc(0, r * 0.1, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** A processed item's icon: the ingredient icon with a process badge. */
function drawProcessedIcon(ctx, processedId, x, y, r) {
  const [id, process] = processedId.split(':');
  drawIngredientIcon(ctx, id, x, y, r);
  const badge = { sear: '🔥', age: '⏳', chop: '🔪', boil: '🫧', glaze: '✨', freeze: '❄️' }[process] || '';
  if (badge) {
    ctx.font = `${Math.round(r * 0.9)}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badge, x + r * 0.75, y - r * 0.75);
  }
}

function drawStation(ctx, world, station, hovered) {
  const { x, y, w, h } = station;
  const zone = ZONES.find((z) => station.x >= z.x && station.x < z.x + z.w);
  ctx.save();
  roundRect(ctx, x, y, w, h, 10);
  ctx.fillStyle = station.kind === 'plating' ? '#3d2b1f' : '#4a3626';
  ctx.fill();
  ctx.lineWidth = hovered ? 3 : 1.5;
  ctx.strokeStyle = hovered ? '#ffd54f' : 'rgba(255,255,255,0.25)';
  ctx.stroke();
  // Zone tint strip on top.
  if (zone) {
    ctx.fillStyle = zone.color;
    ctx.fillRect(x + 6, y + 4, w - 12, 5);
  }
  if (station.kind === 'crate') {
    drawIngredientIcon(ctx, station.ingredient, x + w / 2, y + h / 2 - 6, 15);
    text(ctx, INGREDIENTS[station.ingredient].chip, x + w / 2, y + h - 10, 10, '#ffe9c9', 'center');
  } else if (station.kind === 'machine') {
    const slot = world.machines[station.id];
    const proc = PROCESSES[station.process];
    const icon = { sear: '🔥', chop: '🔪', boil: '🍲', glaze: '✨', freeze: '❄️' }[station.process] || '•';
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, x + w / 2, y + 22);
    text(ctx, station.hint, x + w / 2, y + h - 10, 11, '#ffe9c9', 'center');
    if (slot) {
      if (slot.done) {
        drawProcessedIcon(ctx, `${slot.item}:${slot.process}`, x + w / 2, y + 24, 13);
        text(ctx, 'READY', x + w / 2, y + h - 24, 9, '#2ecc71', 'center');
      } else if (slot.burnt) {
        text(ctx, 'BURNT!', x + w / 2, y + 24, 12, '#e74c3c', 'center');
      } else {
        const frac = Math.min(1, slot.progress / proc.seconds);
        ctx.strokeStyle = '#ffd54f';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + 24, 14, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
        ctx.stroke();
        drawIngredientIcon(ctx, slot.item, x + w / 2, y + 24, 10);
      }
    }
  } else if (station.kind === 'rack') {
    text(ctx, '🕰️ AGING RACK', x + w / 2, y + 14, 11, '#ffe9c9', 'center');
    world.rackItems.forEach((entry, i) => {
      const cx = x + 34 + i * 62;
      const cy = y + 38;
      drawIngredientIcon(ctx, entry.item, cx, cy, 12);
      if (entry.done) {
        text(ctx, 'AGED ✓', cx, y + h - 10, 9, '#2ecc71', 'center');
      } else {
        const frac = Math.min(1, entry.progress / PROCESSES.age.seconds);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(cx - 16, y + h - 14, 32, 5);
        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(cx - 16, y + h - 14, 32 * frac, 5);
      }
    });
    if (world.rackItems.length === 0) text(ctx, '(age steak & cheese here)', x + w / 2, y + 40, 10, '#bcaaa4', 'center');
  } else if (station.kind === 'trash') {
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🗑️', x + w / 2, y + 26);
    text(ctx, 'Compost', x + w / 2, y + h - 10, 11, '#ffe9c9', 'center');
  } else if (station.kind === 'plating') {
    // The plate itself.
    ctx.fillStyle = '#f5f5f5';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2 + 4, 92, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#bdbdbd';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (world.plate.dish) {
      const recipe = world.orders.find((o) => o.recipe.id === world.plate.dish)?.recipe
        || { name: 'Dish' };
      world.plate.items.forEach((item, i) => {
        drawProcessedIcon(ctx, item, x + w / 2 - 60 + i * 40, y + h / 2 + 2, 13);
      });
      text(ctx, `${recipe.name} — READY!`, x + w / 2, y + 13, 12, '#2ecc71', 'center');
    } else if (world.plate.items.length > 0) {
      world.plate.items.forEach((item, i) => {
        drawProcessedIcon(ctx, item, x + w / 2 - 60 + i * 40, y + h / 2 + 2, 13);
      });
      const claimOrder = world.orders.find((o) => o.recipe.id === world.plate.claim);
      text(ctx, claimOrder ? `For: ${claimOrder.recipe.name}` : 'Assembling…', x + w / 2, y + 13, 11, '#ffe9c9', 'center');
    } else {
      text(ctx, 'Plating Counter — build dishes here', x + w / 2, y + h / 2, 12, '#bcaaa4', 'center');
    }
  } else if (station.kind === 'pass') {
    ctx.fillStyle = '#7b1fa2';
    roundRect(ctx, x + 8, y + 8, w - 16, h - 16, 8);
    ctx.fill();
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍽️', x + w / 2, y + 26);
    text(ctx, 'SERVING PASS', x + w / 2, y + h - 12, 12, '#ffffff', 'center');
  }
  ctx.restore();
}

function drawOrderTicket(ctx, order, x, y, w, h) {
  const frac = Math.max(0, order.patience / order.maxPatience);
  const urgent = frac < 0.35;
  ctx.save();
  roundRect(ctx, x, y, w, h, 8);
  ctx.fillStyle = urgent ? '#5d1a12' : '#fff8e1';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = urgent ? '#e74c3c' : '#d7a86e';
  ctx.stroke();
  text(ctx, order.recipe.name, x + 10, y + 14, 14, urgent ? '#ffd9d0' : '#4a2c14', 'left');
  text(ctx, `$${order.recipe.price}`, x + w - 10, y + 14, 14, urgent ? '#ffd9d0' : '#4a2c14', 'right');
  text(ctx, `${Math.ceil(order.patience)}s`, x + w - 10, y + 32, 10, urgent ? '#ffd9d0' : '#8d6e63', 'right');
  order.recipe.needs.forEach((need, i) => {
    const cx = x + 24 + i * 62;
    drawProcessedIcon(ctx, need, cx, y + 44, 13);
    text(ctx, ticketChip(need), cx, y + 63, 8, urgent ? '#ffd9d0' : '#6d4c41', 'center');
  });
  // Patience bar.
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  roundRect(ctx, x + 10, y + h - 9, w - 20, 6, 3);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#2ecc71' : frac > 0.25 ? '#f39c12' : '#e74c3c';
  roundRect(ctx, x + 10, y + h - 9, (w - 20) * frac, 6, 3);
  ctx.fill();
  ctx.restore();
}

function drawChef(ctx, world) {
  const { x, y, facing } = world.player;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.25, 1.25);
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 20, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body / apron.
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, -13, -6, 26, 26, 8);
  ctx.fill();
  ctx.fillStyle = '#e74c3c';
  roundRect(ctx, -13, 6, 26, 10, 4);
  ctx.fill();
  // Head + chef hat.
  ctx.fillStyle = '#ffdbac';
  ctx.beginPath();
  ctx.arc(0, -14, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-6, -24, 7, 0, Math.PI * 2);
  ctx.arc(0, -28, 8, 0, Math.PI * 2);
  ctx.arc(6, -24, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-11, -26, 22, 5);
  // Eyes.
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(-4 * facing + (facing < 0 ? 0 : 0), -14, 1.6, 0, Math.PI * 2);
  ctx.arc(4, -14, 1.6, 0, Math.PI * 2);
  ctx.fill();
  // Carried items float above.
  world.player.hands.forEach((item, i) => {
    const cx = -26 + i * 26;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.arc(cx, -40, 14, 0, Math.PI * 2);
    ctx.fill();
    if (item.startsWith('dish:')) {
      ctx.fillStyle = '#f5f5f5';
      ctx.beginPath();
      ctx.ellipse(cx, -40, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.arc(cx, -42, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.includes(':')) {
      drawProcessedIcon(ctx, item, cx, -40, 10);
    } else {
      drawIngredientIcon(ctx, item, cx, -40, 10);
    }
  });
  ctx.restore();
}

function drawThief(ctx, world) {
  const thief = world.thief;
  if (!thief.active) return;
  const bob = Math.sin(Date.now() / 200) * 4;
  ctx.save();
  ctx.translate(thief.x, thief.y + bob);
  ctx.fillStyle = 'rgba(155,89,182,0.9)';
  ctx.beginPath();
  ctx.arc(0, 0, 20, Math.PI, 0);
  ctx.lineTo(20, 18);
  ctx.lineTo(10, 10);
  ctx.lineTo(0, 18);
  ctx.lineTo(-10, 10);
  ctx.lineTo(-20, 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-7, -4, 4, 0, Math.PI * 2);
  ctx.arc(7, -4, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(-7, -4, 1.8, 0, Math.PI * 2);
  ctx.arc(7, -4, 1.8, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, 'PARADOX THIEF — click to banish!', 0, -34, 11, '#e1b5f5', 'center');
  ctx.restore();
}

function drawHud(ctx, world) {
  const day = DAYS[world.day - 1];
  ctx.save();
  ctx.fillStyle = '#241a12';
  ctx.fillRect(0, 0, VIEW.width, 56);
  text(ctx, '⏳ CHRONO-KITCHEN', 16, 20, 20, '#ffd54f');
  text(ctx, 'Epoch Eats — The Time-Folding Diner of Chronos-4', 16, 42, 11, '#d7ccc8');
  text(ctx, day.name, 430, 20, 15, '#ffffff', 'center');
  text(ctx, `Target $${day.target}  •  Today $${world.dayScore}  •  Total $${world.score}`, 430, 42, 11, '#d7ccc8', 'center');
  // Shift timer bar.
  const frac = Math.max(0, world.timeLeft / 150);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  roundRect(ctx, 640, 16, 220, 14, 7);
  ctx.fill();
  ctx.fillStyle = frac > 0.3 ? '#2ecc71' : '#e74c3c';
  roundRect(ctx, 640, 16, 220 * frac, 14, 7);
  ctx.fill();
  text(ctx, `⏱ ${Math.ceil(world.timeLeft)}s shift`, 750, 40, 12, '#ffffff', 'center');
  text(ctx, `💰 $${world.coins}`, 900, 22, 16, '#ffd54f');
  text(ctx, `Served ${world.served}  •  Failed ${world.failed}`, 900, 42, 11, '#d7ccc8');
  const strikes = '✖'.repeat(world.strikes) + '○'.repeat(3 - world.strikes);
  text(ctx, `Strikes ${strikes}`, 1080, 22, 14, '#e74c3c');
  text(ctx, world.combo >= 2 ? `🔥 Combo x${world.combo}` : 'Mute: M', 1080, 42, 11, '#d7ccc8');
  ctx.restore();
}

function drawOrderBoard(ctx, world) {
  ctx.save();
  ctx.fillStyle = '#3e2723';
  ctx.fillRect(0, 56, VIEW.width, 92);
  text(ctx, 'ORDER BOARD', 16, 76, 13, '#ffd54f');
  text(ctx, 'Serve before patience runs out!', 16, 96, 10, '#d7ccc8');
  text(ctx, world.surgeActive ? '⚡ TIME SURGE! Patience 2×' : '', 16, 136, 11, '#ff8a65');
  const w = 250;
  world.orders.forEach((order, i) => {
    drawOrderTicket(ctx, order, 200 + i * (w + 12), 62, w, 80);
  });
  if (world.orders.length === 0) text(ctx, 'No orders — take a breath, chef!', 220, 102, 14, '#d7ccc8');
  ctx.restore();
}

function drawKitchen(ctx, world, hoveredStation) {
  // Floor + era tints.
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(0, 148, VIEW.width, 516);
  for (const zone of ZONES) {
    ctx.fillStyle = zone.tint;
    ctx.fillRect(zone.x, 148, zone.w, 516);
    text(ctx, zone.name, zone.x + zone.w / 2, 240, 13, 'rgba(255,255,255,0.55)', 'center');
  }
  // Floor tiles (checker) and zone rugs, so the kitchen reads as a place, not a grid.
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 1;
  for (let x = 0; x < VIEW.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 148);
    ctx.lineTo(x, 664);
    ctx.stroke();
  }
  for (let y = 148; y <= 664; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW.width, y);
    ctx.stroke();
  }
  for (let gx = 0; gx < 20; gx += 1) {
    for (let gy = 0; gy < 8; gy += 1) {
      if ((gx + gy) % 2 === 0) continue;
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(gx * 64, 224 + gy * 64, 64, 64);
    }
  }
  // Rugs in front of each era's stations.
  for (const zone of ZONES) {
    ctx.fillStyle = zone.tint;
    roundRect(ctx, zone.x + 60, 300, zone.w - 120, 130, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // Hanging lamps over the floor.
  for (const lx of [220, 640, 1060]) {
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, 224);
    ctx.lineTo(lx, 246);
    ctx.stroke();
    const glow = ctx.createRadialGradient(lx, 254, 4, lx, 254, 46);
    glow.addColorStop(0, 'rgba(255,213,79,0.5)');
    glow.addColorStop(1, 'rgba(255,213,79,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(lx, 254, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(lx, 252, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  // Barrels and a herb pot at the floor's edges.
  for (const [bx, by, color] of [[40, 560, '#7a4a21'], [1220, 560, '#7a4a21'], [40, 300, '#4a7a21']]) {
    ctx.fillStyle = color;
    roundRect(ctx, bx - 16, by - 18, 32, 36, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx - 16, by - 6);
    ctx.lineTo(bx + 16, by - 6);
    ctx.moveTo(bx - 16, by + 6);
    ctx.lineTo(bx + 16, by + 6);
    ctx.stroke();
  }
  // Counters.
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(0, 148, VIEW.width, 76);
  ctx.fillRect(0, 592, VIEW.width, 72);
  for (const station of STATIONS) {
    drawStation(ctx, world, station, hoveredStation === station);
  }
  drawThief(ctx, world);
  drawChef(ctx, world);
  // Floaters.
  for (const floater of world.floaters) {
    ctx.globalAlpha = Math.max(0, 1 - floater.t / 1.6);
    text(ctx, floater.text, floater.x, floater.y - floater.t * 30, 15, floater.color, 'center');
  }
  ctx.globalAlpha = 1;
  // Message banner.
  if (world.messageT > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    roundRect(ctx, 340, 250, 600, 40, 10);
    ctx.fill();
    text(ctx, world.message, 640, 270, 16, '#ffd54f', 'center');
  }
}

function drawHandsBar(ctx, world) {
  ctx.save();
  ctx.fillStyle = '#241a12';
  ctx.fillRect(0, 664, VIEW.width, 56);
  text(ctx, 'Hands:', 16, 692, 13, '#d7ccc8');
  if (world.player.hands.length === 0) {
    text(ctx, '(empty — grab an ingredient from a crate)', 84, 692, 12, '#8d6e63');
  }
  world.player.hands.forEach((item, i) => {
    const cx = 110 + i * 150;
    if (item.startsWith('dish:')) {
      const recipe = (world.orders.find((o) => `dish:${o.recipe.id}` === item) || {}).recipe;
      text(ctx, `🍽️ ${recipe ? recipe.name : 'Finished dish'}`, cx, 692, 13, '#2ecc71');
    } else if (item.includes(':')) {
      drawProcessedIcon(ctx, item, cx, 692, 11);
      text(ctx, processedName(item), cx + 18, 692, 12, '#ffffff');
    } else {
      drawIngredientIcon(ctx, item, cx, 692, 11);
      text(ctx, INGREDIENTS[item].name, cx + 18, 692, 12, '#ffffff');
    }
  });
  text(ctx, 'Move: WASD / Arrows / Click  •  Use: E / Space / Click station  •  M: mute', 640, 692, 12, '#d7ccc8', 'center');
  text(ctx, 'Age steak & cheese on the rack — some recipes need them aged!', 1264, 692, 11, '#bcaaa4', 'right');
  ctx.restore();
}

function overlay(ctx, title, lines, accent) {
  ctx.save();
  ctx.fillStyle = 'rgba(20,12,8,0.82)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#2d1f16';
  roundRect(ctx, 340, 150, 600, 420, 16);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, title, 640, 200, 34, accent, 'center');
  lines.forEach((line, i) => {
    text(ctx, line.text, 640, 250 + i * 32, line.size || 16, line.color || '#ffffff', 'center');
  });
  text(ctx, 'Press Enter or click to continue', 640, 530, 14, '#bcaaa4', 'center');
  ctx.restore();
}

/** Draw the whole game for a screen: title | play | dayclear | over | win. */
export function drawWorld(ctx, world, screen, hoveredStation) {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  drawHud(ctx, world);
  drawOrderBoard(ctx, world);
  drawKitchen(ctx, world, screen === 'play' ? hoveredStation : null);
  drawHandsBar(ctx, world);
  if (screen === 'title') {
    overlay(ctx, 'CHRONO-KITCHEN', [
      { text: 'Epoch Eats — cook across Past, Present & Future', size: 18, color: '#ffd54f' },
      { text: 'Grab ingredients, chop / sear / boil / glaze / freeze / age them,', size: 15 },
      { text: 'build each order on the plating counter, serve at the pass.', size: 15 },
      { text: 'Watch the timer, mind the Time Surge, banish the Paradox Thief!', size: 15 },
      { text: '10 days. One diner outside time. How many can you feed?', size: 15, color: '#d7ccc8' },
      { text: 'Click or press Enter to start Day 1', size: 16, color: '#2ecc71' },
    ], '#ffd54f');
  } else if (screen === 'dayclear') {
    const day = DAYS[world.day - 2] || DAYS[0];
    overlay(ctx, `${day.name} — CLEAR!`, [
      { text: `Score $${world.score}  •  Coins $${world.coins}`, size: 18, color: '#ffd54f' },
      { text: `Served ${world.served} dishes  •  Best combo x${world.bestCombo}`, size: 15 },
      { text: `Next: ${DAYS[world.day - 1].name}`, size: 16, color: '#2ecc71' },
    ], '#2ecc71');
  } else if (screen === 'over') {
    overlay(ctx, 'SHIFT OVER', [
      { text: `The diner closes its time-doors for today.`, size: 16, color: '#d7ccc8' },
      { text: `Score $${world.score}  •  Served ${world.served}  •  Failed ${world.failed}`, size: 18, color: '#ffd54f' },
      { text: `Best combo x${world.bestCombo}  •  Reached ${DAYS[world.day - 1].name}`, size: 15 },
      { text: 'Press R to try the shift again', size: 16, color: '#2ecc71' },
    ], '#e74c3c');
  } else if (screen === 'win') {
    overlay(ctx, '🏆 THE CHRONO FEAST!', [
      { text: 'Ten days, ten eras — every table fed, every paradox served.', size: 16, color: '#ffd54f' },
      { text: `Final score $${world.score}  •  Coins $${world.coins}`, size: 18 },
      { text: `Served ${world.served} dishes  •  Best combo x${world.bestCombo}`, size: 15 },
      { text: 'Chronos-4 declares you Chef of All Time.', size: 15, color: '#d7ccc8' },
      { text: 'Press R to play again', size: 16, color: '#2ecc71' },
    ], '#ffd54f');
  }
}

/** Expose the approach point for the hover highlight. */
export { approachPoint };
