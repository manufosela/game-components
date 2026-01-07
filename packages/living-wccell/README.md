# @manufosela/living-wccell

A Lit 3 web component implementing a cellular automaton cell for Conway's Game of Life and other cellular automaton rules.

## Installation

```bash
npm install @manufosela/living-wccell
```

## Usage

```html
<script type="module">
  import '@manufosela/living-wccell';
</script>

<living-wccell x="5" y="10" alive></living-wccell>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `alive` | Boolean | false | Whether the cell is alive |
| `x` | Number | 0 | X coordinate in the grid |
| `y` | Number | 0 | Y coordinate in the grid |
| `generation` | Number | 0 | Current generation number |
| `age` | Number | 0 | How many generations the cell has been alive |
| `rules` | Object | Conway | Cellular automaton rules { birth: [], survival: [] } |
| `neighborCount` | Number | 0 | Number of alive neighbors |
| `showGeneration` | Boolean | false | Show age indicator on cell |
| `cellId` | String | '' | Unique identifier for the cell |

## Methods

### `toggle()`
Toggles the cell between alive and dead.

```javascript
const cell = document.querySelector('living-wccell');
cell.toggle();
```

### `setAlive(alive)`
Sets the cell state.

```javascript
cell.setAlive(true); // Make alive
cell.setAlive(false); // Make dead
```

### `calculateNextState(aliveNeighbors)`
Calculates the next state based on neighbor count. Does not apply the state.

```javascript
const willBeAlive = cell.calculateNextState(3);
```

### `applyNextState()`
Applies the previously calculated state. Call after all cells have calculated.

```javascript
// Calculate all cells first
cells.forEach(cell => {
  const neighbors = getNeighborCount(cell.x, cell.y);
  cell.calculateNextState(neighbors);
});

// Then apply all at once
cells.forEach(cell => cell.applyNextState());
```

### `updateGeneration(gen)`
Updates the generation counter.

### `reset()`
Resets the cell to initial dead state.

### `getState()`
Returns the current state object.

```javascript
const state = cell.getState();
// { alive: true, age: 3, generation: 10, x: 5, y: 7 }
```

### `setRules(birth, survival)`
Sets custom cellular automaton rules.

```javascript
// HighLife rules (B36/S23)
cell.setRules([3, 6], [2, 3]);
```

## Events

### `state-change`
Fired when the cell's alive state changes.

```javascript
cell.addEventListener('state-change', (e) => {
  console.log('Cell is now:', e.detail.alive ? 'alive' : 'dead');
  console.log('Position:', e.detail.x, e.detail.y);
  console.log('Age:', e.detail.age);
});
```

### `cell-click`
Fired when the cell is clicked.

```javascript
cell.addEventListener('cell-click', (e) => {
  console.log('Clicked cell at:', e.detail.x, e.detail.y);
});
```

### `generation-update`
Fired when the generation number changes.

```javascript
cell.addEventListener('generation-update', (e) => {
  console.log('Generation:', e.detail.generation);
});
```

## Cellular Automaton Rules

The component includes several preset rules:

```javascript
import { CellularRules } from '@manufosela/living-wccell';

// Available presets:
CellularRules.CONWAY           // B3/S23 - Classic Game of Life
CellularRules.HIGHLIFE         // B36/S23 - Has replicator pattern
CellularRules.DAY_AND_NIGHT    // B3678/S34678 - Symmetric rules
CellularRules.SEEDS            // B2/S - Explosive patterns
CellularRules.LIFE_WITHOUT_DEATH // B3/S012345678 - Cells never die
CellularRules.MAZE             // B3/S12345 - Creates maze-like patterns
CellularRules.REPLICATOR       // B1357/S1357 - Replicating patterns
CellularRules.TWO_BY_TWO       // B36/S125 - 2x2 block patterns

// Apply to cell
cell.rules = CellularRules.HIGHLIFE;
```

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--living-wccell-size` | 20px | Cell size |
| `--living-wccell-border-width` | 1px | Border width |
| `--living-wccell-border-color` | #333 | Border color |
| `--living-wccell-border-radius` | 0 | Border radius |
| `--living-wccell-dead-color` | #1a1a2e | Dead cell color |
| `--living-wccell-alive-color` | #4a90d9 | Alive cell color |
| `--living-wccell-glow-size` | 5px | Glow effect size |
| `--living-wccell-glow-color` | rgba(74,144,217,0.5) | Glow color |
| `--living-wccell-transition-duration` | 0.15s | Animation duration |
| `--living-wccell-hover-scale` | 1.1 | Hover scale effect |
| `--living-wccell-focus-color` | #4a90d9 | Focus outline color |
| `--living-wccell-age1-color` | #7ab8ff | Age 1 color |
| `--living-wccell-age2-color` | #4a90d9 | Age 2 color |
| `--living-wccell-age3-color` | #2d5a8a | Age 3 color |
| `--living-wccell-age-old-color` | #1a3555 | Old cell color |

## CSS Parts

- `cell` - The cell element

## Example: Complete Game of Life Grid

```javascript
const GRID_WIDTH = 50;
const GRID_HEIGHT = 50;
const cells = [];

// Create grid
for (let y = 0; y < GRID_HEIGHT; y++) {
  cells[y] = [];
  for (let x = 0; x < GRID_WIDTH; x++) {
    const cell = document.createElement('living-wccell');
    cell.x = x;
    cell.y = y;
    cells[y][x] = cell;
    grid.appendChild(cell);
  }
}

// Get neighbor count with wrapping
function getNeighborCount(x, y) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = (x + dx + GRID_WIDTH) % GRID_WIDTH;
      const ny = (y + dy + GRID_HEIGHT) % GRID_HEIGHT;
      if (cells[ny][nx].alive) count++;
    }
  }
  return count;
}

// Advance one generation
function step() {
  // Calculate next states
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const neighbors = getNeighborCount(x, y);
      cells[y][x].calculateNextState(neighbors);
    }
  }

  // Apply next states
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      cells[y][x].applyNextState();
    }
  }
}

// Run simulation
setInterval(step, 100);
```

## Conway's Game of Life Rules

The default rules (B3/S23) are:

1. **Birth**: A dead cell with exactly 3 alive neighbors becomes alive
2. **Survival**: An alive cell with 2 or 3 alive neighbors survives
3. **Death by isolation**: An alive cell with fewer than 2 neighbors dies
4. **Death by overcrowding**: An alive cell with more than 3 neighbors dies

## Accessibility

The component includes:
- `tabindex="0"` for keyboard navigation
- `role="gridcell"` for screen readers
- `aria-label` describing position and state
- `aria-pressed` attribute reflecting alive state
- Keyboard support (Enter/Space to toggle)

## Development

```bash
# Install dependencies
npm install

# Run demo
npm run dev

# Run tests
npm test
```

## License

MIT
