# @manufosela/board-layer

A Lit 3 web component providing a multi-layer canvas game board for creating layered game graphics. Perfect for separating background, sprites, effects, and UI into independent render layers.

## Installation

```bash
npm install @manufosela/board-layer
```

## Usage

```html
<script type="module">
  import '@manufosela/board-layer';
</script>

<board-layer
  width="800"
  height="600"
  grid-size="32"
  show-grid
></board-layer>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `width` | Number | 800 | Board width in pixels |
| `height` | Number | 600 | Board height in pixels |
| `gridSize` | Number | 0 | Grid cell size (0 to disable) |
| `showGrid` | Boolean | false | Show grid overlay |
| `layers` | Array | [] | Layer configurations |
| `debug` | Boolean | false | Show debug panel |
| `autoClear` | Boolean | false | Auto-clear layers before render |

## Layer Configuration

```javascript
const layers = [
  {
    name: 'background',   // Unique identifier
    zIndex: 0,            // Stacking order
    visible: true,        // Visibility state
    opacity: 1,           // Opacity (0-1)
    blendMode: 'normal'   // CSS mix-blend-mode
  },
  { name: 'sprites', zIndex: 10 },
  { name: 'effects', zIndex: 20, opacity: 0.8 },
  { name: 'ui', zIndex: 30 }
];

const board = document.querySelector('board-layer');
board.layers = layers;
```

## Methods

### Layer Management

#### `addLayer(config)`
Adds a new layer to the board.

```javascript
const layer = board.addLayer({
  name: 'particles',
  zIndex: 15,
  opacity: 0.9
});
```

#### `removeLayer(name)`
Removes a layer by name.

```javascript
board.removeLayer('particles');
```

#### `getLayer(name)`
Gets a layer by name.

```javascript
const layer = board.getLayer('sprites');
console.log(layer.ctx); // Canvas 2D context
```

#### `getLayerByIndex(index)`
Gets a layer by z-order index.

```javascript
const bottomLayer = board.getLayerByIndex(0);
const topLayer = board.getLayerByIndex(board.getLayerCount() - 1);
```

#### `getContext(name)`
Gets the 2D rendering context for a layer.

```javascript
const ctx = board.getContext('sprites');
ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 50, 50);
```

#### `getLayerNames()`
Gets all layer names.

```javascript
const names = board.getLayerNames();
// ['background', 'sprites', 'effects', 'ui']
```

#### `getLayerCount()`
Gets the number of layers.

```javascript
const count = board.getLayerCount();
```

### Layer Modification

#### `setLayerVisibility(name, visible)`
Sets layer visibility.

```javascript
board.setLayerVisibility('effects', false);
```

#### `setLayerOpacity(name, opacity)`
Sets layer opacity (0-1).

```javascript
board.setLayerOpacity('effects', 0.5);
```

#### `setLayerBlendMode(name, blendMode)`
Sets layer blend mode.

```javascript
board.setLayerBlendMode('effects', 'screen');
// Available: normal, multiply, screen, overlay, darken, lighten, etc.
```

#### `setLayerZIndex(name, zIndex)`
Sets layer z-index.

```javascript
board.setLayerZIndex('ui', 100);
```

### Drawing Operations

#### `clearLayer(name)`
Clears a specific layer.

```javascript
board.clearLayer('effects');
```

#### `clear()`
Clears all layers.

```javascript
board.clear();
```

#### `renderToLayer(name, callback)`
Renders to a layer using a callback.

```javascript
board.renderToLayer('sprites', (ctx, width, height) => {
  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, width, height);
});
```

#### `drawRect(layerName, x, y, width, height, color)`
Draws a filled rectangle.

```javascript
board.drawRect('sprites', 100, 100, 50, 50, '#4a90d9');
```

#### `drawCircle(layerName, x, y, radius, color)`
Draws a filled circle.

```javascript
board.drawCircle('effects', 200, 150, 30, 'rgba(255, 0, 0, 0.5)');
```

#### `drawImage(layerName, image, x, y, width?, height?)`
Draws an image.

```javascript
const img = new Image();
img.src = 'sprite.png';
img.onload = () => {
  board.drawImage('sprites', img, 50, 50);
  // Or with size:
  board.drawImage('sprites', img, 50, 50, 64, 64);
};
```

### Grid Operations

#### `gridToPixel(gridX, gridY)`
Converts grid coordinates to pixels.

```javascript
const { x, y } = board.gridToPixel(3, 5);
// With gridSize=32: x=96, y=160
```

#### `pixelToGrid(pixelX, pixelY)`
Converts pixel coordinates to grid.

```javascript
const { x, y } = board.pixelToGrid(100, 200);
// With gridSize=32: x=3, y=6
```

#### `getGridDimensions()`
Gets grid dimensions.

```javascript
const { cols, rows } = board.getGridDimensions();
```

## Events

### `layer-add`
Fired when a layer is added.

```javascript
board.addEventListener('layer-add', (e) => {
  console.log('Added layer:', e.detail.name);
  console.log('Total layers:', e.detail.totalLayers);
});
```

### `layer-remove`
Fired when a layer is removed.

```javascript
board.addEventListener('layer-remove', (e) => {
  console.log('Removed layer:', e.detail.name);
});
```

### `layer-change`
Fired when layer properties change.

```javascript
board.addEventListener('layer-change', (e) => {
  console.log('Layer:', e.detail.name);
  console.log('Property:', e.detail.property);
  console.log('Value:', e.detail.value);
});
```

### `render`
Fired after render cycle.

```javascript
board.addEventListener('render', (e) => {
  console.log('Rendered with', e.detail.layerCount, 'layers');
});
```

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--board-layer-bg` | #1a1a2e | Background color |
| `--board-layer-border` | 2px solid #4a90d9 | Border style |
| `--board-layer-border-radius` | 8px | Border radius |
| `--board-layer-grid-color` | rgba(255,255,255,0.1) | Grid line color |
| `--board-layer-image-rendering` | pixelated | Image rendering mode |

## CSS Parts

- `container` - The board container
- `layer` - Individual canvas layers

## Example: Game with Multiple Layers

```javascript
const board = document.querySelector('board-layer');

// Setup layers
board.layers = [
  { name: 'background', zIndex: 0 },
  { name: 'tiles', zIndex: 5 },
  { name: 'sprites', zIndex: 10 },
  { name: 'effects', zIndex: 20, opacity: 0.8 },
  { name: 'ui', zIndex: 100 }
];

// Draw static background once
board.renderToLayer('background', (ctx, w, h) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
});

// Game loop - only update dynamic layers
function gameLoop() {
  // Clear only sprite layer
  board.clearLayer('sprites');

  // Draw sprites
  sprites.forEach(sprite => {
    board.drawRect('sprites', sprite.x, sprite.y, 32, 32, sprite.color);
  });

  // Clear and draw effects
  board.clearLayer('effects');
  particles.forEach(p => {
    board.drawCircle('effects', p.x, p.y, p.size, p.color);
  });

  requestAnimationFrame(gameLoop);
}

gameLoop();
```

## Example: Tile-Based Game

```javascript
const board = document.querySelector('board-layer');
board.gridSize = 32;
board.showGrid = true;

board.addLayer({ name: 'terrain', zIndex: 0 });
board.addLayer({ name: 'objects', zIndex: 10 });
board.addLayer({ name: 'player', zIndex: 20 });

// Draw tile at grid position
function drawTile(layer, gridX, gridY, color) {
  const { x, y } = board.gridToPixel(gridX, gridY);
  board.drawRect(layer, x, y, board.gridSize, board.gridSize, color);
}

// Draw terrain
for (let y = 0; y < 10; y++) {
  for (let x = 0; x < 15; x++) {
    const color = (x + y) % 2 === 0 ? '#2d5a2d' : '#3d6a3d';
    drawTile('terrain', x, y, color);
  }
}

// Draw player at grid position
drawTile('player', 5, 5, '#4a90d9');
```

## Blend Modes

Available blend modes for layers:

- `normal` - Default
- `multiply` - Darken
- `screen` - Lighten
- `overlay` - Contrast
- `darken` - Minimum
- `lighten` - Maximum
- `color-dodge` - Brighten
- `color-burn` - Darken with contrast
- `hard-light` - Strong contrast
- `soft-light` - Subtle contrast
- `difference` - Invert
- `exclusion` - Soft invert
- `hue` - Hue transfer
- `saturation` - Saturation transfer
- `color` - Color transfer
- `luminosity` - Brightness transfer

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
