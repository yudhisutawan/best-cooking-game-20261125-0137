// Keyboard + mouse input for the chef: WASD/arrows to walk, E or Space to use a
// station, click a station to walk to it and use it, click the Paradox Thief to banish it.
export function createInput(canvas) {
  const keys = new Set();
  const input = {
    keys,
    click: null, // {x, y, fresh} in canvas coordinates, consumed by the game loop
    mouse: { x: 0, y: 0 },
    pressed: new Set(), // keys pressed since last frame, consumed by the game loop
  };

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault();
    if (!event.repeat) input.pressed.add(event.key.toLowerCase());
    keys.add(event.key.toLowerCase());
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());
  canvas.addEventListener('pointermove', (event) => {
    input.mouse = canvasPoint(event);
  });
  canvas.addEventListener('pointerdown', (event) => {
    const point = canvasPoint(event);
    input.mouse = point;
    input.click = { ...point, fresh: true };
  });
  return input;
}

/** Movement direction from held keys: {x, y} each -1, 0 or 1. */
export function moveDirection(input) {
  const left = input.keys.has('a') || input.keys.has('arrowleft');
  const right = input.keys.has('d') || input.keys.has('arrowright');
  const up = input.keys.has('w') || input.keys.has('arrowup');
  const down = input.keys.has('s') || input.keys.has('arrowdown');
  return { x: (right ? 1 : 0) - (left ? 1 : 0), y: (down ? 1 : 0) - (up ? 1 : 0) };
}

/** True when the use key (E or Space) was pressed since the last frame. */
export function usePressed(input) {
  return input.pressed.has('e') || input.pressed.has(' ');
}
