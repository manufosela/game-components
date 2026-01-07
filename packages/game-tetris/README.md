# @manufosela/game-tetris

A complete Tetris game implementation as a Lit 3 web component with full keyboard controls, scoring, levels, and customizable theming.

## Installation

```bash
npm install @manufosela/game-tetris
```

## Usage

```html
<script type="module">
  import '@manufosela/game-tetris';
</script>

<game-tetris></game-tetris>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `width` | Number | 10 | Board width in cells |
| `height` | Number | 20 | Board height in cells |
| `speed` | Number | 1000 | Base game speed in milliseconds |
| `score` | Number | 0 | Current score (read-only) |
| `level` | Number | 1 | Current level (read-only) |
| `lines` | Number | 0 | Total lines cleared (read-only) |
| `paused` | Boolean | false | Whether game is paused |
| `gameOver` | Boolean | false | Whether game has ended |
| `gameStarted` | Boolean | false | Whether game has started |
| `cellSize` | Number | 25 | Size of each cell in pixels |
| `showGhost` | Boolean | true | Show ghost piece preview |
| `showGrid` | Boolean | true | Show grid lines |

## Methods

### `startGame()`
Starts a new game, resetting score and level.

```javascript
const tetris = document.querySelector('game-tetris');
tetris.startGame();
```

### `togglePause()`
Pauses or resumes the game.

```javascript
tetris.togglePause();
```

### `reset()`
Resets the game to initial state without starting.

```javascript
tetris.reset();
```

## Events

### `game-start`
Fired when a new game starts.

```javascript
tetris.addEventListener('game-start', (e) => {
  console.log('Level:', e.detail.level);
  console.log('Speed:', e.detail.speed);
});
```

### `game-over`
Fired when the game ends.

```javascript
tetris.addEventListener('game-over', (e) => {
  console.log('Final Score:', e.detail.score);
  console.log('Level Reached:', e.detail.level);
  console.log('Lines Cleared:', e.detail.lines);
});
```

### `line-clear`
Fired when one or more lines are cleared.

```javascript
tetris.addEventListener('line-clear', (e) => {
  console.log('Lines cleared:', e.detail.lines);
  console.log('Total lines:', e.detail.totalLines);
  console.log('Score:', e.detail.score);
});
```

### `score-update`
Fired when the score changes.

```javascript
tetris.addEventListener('score-update', (e) => {
  console.log('New score:', e.detail.score);
  console.log('Points added:', e.detail.pointsAdded);
});
```

### `level-up`
Fired when the level increases.

```javascript
tetris.addEventListener('level-up', (e) => {
  console.log('New level:', e.detail.level);
  console.log('New speed:', e.detail.speed);
});
```

### `piece-lock`
Fired when a piece locks into place.

```javascript
tetris.addEventListener('piece-lock', (e) => {
  console.log('Piece:', e.detail.piece);
  console.log('Position:', e.detail.x, e.detail.y);
});
```

## Keyboard Controls

| Key | Action |
|-----|--------|
| `Left Arrow` / `A` | Move piece left |
| `Right Arrow` / `D` | Move piece right |
| `Down Arrow` / `S` | Soft drop (move down faster) |
| `Up Arrow` / `W` / `X` | Rotate piece clockwise |
| `Space` | Hard drop (instant drop) |
| `P` / `Escape` | Pause/Resume game |
| `Enter` / `Space` | Start game (when not playing) |

## Scoring System

| Action | Points |
|--------|--------|
| Soft drop | 1 point per cell |
| Hard drop | 2 points per cell |
| Single line | 100 x level |
| Double | 300 x level |
| Triple | 500 x level |
| Tetris (4 lines) | 800 x level |

## Level System

- Level increases every 10 lines cleared
- Each level increases speed by 80ms (minimum 100ms)
- Higher levels = higher score multipliers

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--game-tetris-font-family` | monospace | Font family |
| `--game-tetris-bg` | #1a1a2e | Container background |
| `--game-tetris-gap` | 20px | Gap between board and panel |
| `--game-tetris-padding` | 20px | Container padding |
| `--game-tetris-border-radius` | 12px | Container border radius |
| `--game-tetris-shadow` | 0 10px 40px... | Container shadow |
| `--game-tetris-board-border` | 3px solid #4a90d9 | Board border |
| `--game-tetris-board-bg` | #0f0f1a | Board background |
| `--game-tetris-panel-bg` | #16213e | Side panel background |
| `--game-tetris-label-color` | #4a90d9 | Label text color |
| `--game-tetris-score-color` | #fff | Score text color |
| `--game-tetris-overlay-title-color` | #4a90d9 | Overlay title color |
| `--game-tetris-button-bg` | #4a90d9 | Button background |
| `--game-tetris-button-hover-bg` | #357abd | Button hover background |

## CSS Parts

- `container` - Main game container
- `board` - Game board canvas
- `panel` - Side information panel
- `overlay` - Game overlay (start/pause/game over)

## Theming Example

```css
/* Neon theme */
game-tetris {
  --game-tetris-bg: #0a0a0a;
  --game-tetris-board-bg: #000;
  --game-tetris-board-border: 3px solid #0ff;
  --game-tetris-label-color: #0ff;
  --game-tetris-score-color: #0f0;
  --game-tetris-button-bg: #0ff;
}

/* Retro theme */
game-tetris {
  --game-tetris-bg: #2d2d2d;
  --game-tetris-board-border: 3px solid #ff6b35;
  --game-tetris-label-color: #ff6b35;
  --game-tetris-score-color: #ffd700;
}
```

## Tetromino Pieces

The game includes all 7 standard Tetris pieces:

- **I** (Cyan) - 4-block line
- **O** (Yellow) - 2x2 square
- **T** (Purple) - T-shape
- **S** (Green) - S-shape
- **Z** (Red) - Z-shape
- **J** (Blue) - J-shape
- **L** (Orange) - L-shape

## Features

- Full keyboard controls
- Ghost piece preview (shows where piece will land)
- Next piece preview
- Score tracking with multipliers
- Level progression with increasing speed
- Wall kick rotation system
- Pause functionality
- Responsive design
- Customizable themes via CSS custom properties
- Event-driven architecture for game state

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
