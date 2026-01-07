# @manufosela/convgame-object

A Lit 3 web component providing a game object wrapper with physics properties, collision detection, and boundary handling for canvas-based games.

## Installation

```bash
npm install @manufosela/convgame-object
```

## Usage

```html
<script type="module">
  import '@manufosela/convgame-object';
</script>

<convgame-object
  x="100"
  y="100"
  width="50"
  height="50"
  velocity-x="5"
  velocity-y="3"
  mass="1"
  friction="0.98"
></convgame-object>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `x` | Number | 0 | X position of the object |
| `y` | Number | 0 | Y position of the object |
| `width` | Number | 50 | Width of the object |
| `height` | Number | 50 | Height of the object |
| `velocityX` | Number | 0 | X velocity (pixels per frame) |
| `velocityY` | Number | 0 | Y velocity (pixels per frame) |
| `mass` | Number | 1 | Mass for physics calculations |
| `friction` | Number | 0.98 | Friction coefficient (0-1, where 1 is no friction) |
| `restitution` | Number | 0.8 | Bounciness/elasticity (0-1) |
| `isStatic` | Boolean | false | Whether object is affected by physics |
| `debug` | Boolean | false | Enable debug visualization |
| `bounds` | Object | null | Boundary limits { minX, maxX, minY, maxY } |
| `renderFn` | Function | null | Custom canvas render function |

## Methods

### `update(deltaTime = 1)`
Updates the object's physics state. Call this each frame.

```javascript
const obj = document.querySelector('convgame-object');
function gameLoop() {
  obj.update();
  requestAnimationFrame(gameLoop);
}
gameLoop();
```

### `collidesWith(other)`
Checks AABB collision with another ConvgameObject.

```javascript
if (obj1.collidesWith(obj2)) {
  console.log('Collision detected!');
}
```

### `applyForce(forceX, forceY)`
Applies a force to the object (F = ma).

```javascript
obj.applyForce(10, -5); // Push right and up
```

### `applyImpulse(impulseX, impulseY)`
Applies an immediate velocity change.

```javascript
obj.applyImpulse(100, 0); // Instant push right
```

### `resolveCollision(other)`
Resolves elastic collision between two objects.

```javascript
if (obj1.collidesWith(obj2)) {
  obj1.resolveCollision(obj2);
}
```

### `setPosition(x, y)`
Sets the object's position.

### `setVelocity(vx, vy)`
Sets the object's velocity.

### `stop()`
Stops all motion.

### `distanceTo(other)`
Returns distance to another object.

### `angleTo(other)`
Returns angle to another object in radians.

### `getBoundingBox()`
Returns the bounding box { x, y, width, height }.

### `getCenter()`
Returns the center point { x, y }.

## Events

### `collision`
Fired when collision is detected.

```javascript
obj.addEventListener('collision', (e) => {
  console.log('Collided with:', e.detail.other);
  console.log('This box:', e.detail.thisBox);
  console.log('Other box:', e.detail.otherBox);
});
```

### `boundary-hit`
Fired when object hits a boundary.

```javascript
obj.addEventListener('boundary-hit', (e) => {
  console.log('Hit boundary:', e.detail.boundary); // 'left', 'right', 'top', 'bottom'
});
```

### `position-change`
Fired when position changes during update.

```javascript
obj.addEventListener('position-change', (e) => {
  console.log('New position:', e.detail.x, e.detail.y);
  console.log('Previous:', e.detail.previousX, e.detail.previousY);
});
```

## Custom Rendering

You can provide a custom render function to draw the object:

```javascript
const obj = document.querySelector('convgame-object');

obj.renderFn = (ctx, width, height) => {
  // Draw a circle
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
  ctx.fillStyle = '#4a90d9';
  ctx.fill();
};
```

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--convgame-object-debug-color` | red | Debug outline color |
| `--convgame-object-debug-bg` | rgba(255,0,0,0.1) | Debug background color |
| `--convgame-object-velocity-color` | blue | Velocity indicator color |
| `--convgame-object-border-radius` | 0 | Border radius |

## CSS Parts

- `container` - The main container element
- `canvas` - The canvas element

## Example: Complete Game Loop

```javascript
const container = document.getElementById('gameContainer');
const objects = Array.from(container.querySelectorAll('convgame-object'));

// Set bounds for all objects
const bounds = {
  minX: 0,
  maxX: container.offsetWidth,
  minY: 0,
  maxY: container.offsetHeight
};
objects.forEach(obj => obj.bounds = bounds);

// Game loop
function gameLoop() {
  // Update physics
  objects.forEach(obj => obj.update());

  // Check collisions
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      if (objects[i].collidesWith(objects[j])) {
        objects[i].resolveCollision(objects[j]);
      }
    }
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
```

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
