import { LitElement, html } from 'lit';
import { styles } from './convgame-object.styles.js';

/**
 * @typedef {Object} Vector2D
 * @property {number} x - X component
 * @property {number} y - Y component
 */

/**
 * @typedef {Object} BoundingBox
 * @property {number} x - Left position
 * @property {number} y - Top position
 * @property {number} width - Width of the box
 * @property {number} height - Height of the box
 */

/**
 * ConvgameObject - A game object wrapper with physics properties
 *
 * @element convgame-object
 * @fires collision - Fired when this object collides with another
 * @fires boundary-hit - Fired when object hits a boundary
 * @fires position-change - Fired when position changes during update
 *
 * @csspart container - The main container element
 * @csspart canvas - The canvas element for rendering
 *
 * @cssprop --convgame-object-debug-color - Debug outline color
 * @cssprop --convgame-object-debug-bg - Debug background color
 * @cssprop --convgame-object-velocity-color - Velocity indicator color
 * @cssprop --convgame-object-border-radius - Border radius of the object
 */
export class ConvgameObject extends LitElement {
  static styles = styles;

  static properties = {
    /** X position of the object */
    x: { type: Number, reflect: true },
    /** Y position of the object */
    y: { type: Number, reflect: true },
    /** Width of the object */
    width: { type: Number, reflect: true },
    /** Height of the object */
    height: { type: Number, reflect: true },
    /** X velocity (pixels per frame) */
    velocityX: { type: Number, attribute: 'velocity-x' },
    /** Y velocity (pixels per frame) */
    velocityY: { type: Number, attribute: 'velocity-y' },
    /** Mass of the object for physics calculations */
    mass: { type: Number },
    /** Friction coefficient (0-1, where 1 is no friction) */
    friction: { type: Number },
    /** Bounciness/elasticity (0-1) */
    restitution: { type: Number },
    /** Whether the object is static (not affected by physics) */
    isStatic: { type: Boolean, attribute: 'is-static' },
    /** Enable debug visualization */
    debug: { type: Boolean, reflect: true },
    /** Boundary limits for the object { minX, maxX, minY, maxY } */
    bounds: { type: Object },
    /** Custom render function for the canvas */
    renderFn: { type: Object, attribute: false }
  };

  constructor() {
    super();
    /** @type {number} */
    this.x = 0;
    /** @type {number} */
    this.y = 0;
    /** @type {number} */
    this.width = 50;
    /** @type {number} */
    this.height = 50;
    /** @type {number} */
    this.velocityX = 0;
    /** @type {number} */
    this.velocityY = 0;
    /** @type {number} */
    this.mass = 1;
    /** @type {number} */
    this.friction = 0.98;
    /** @type {number} */
    this.restitution = 0.8;
    /** @type {boolean} */
    this.isStatic = false;
    /** @type {boolean} */
    this.debug = false;
    /** @type {BoundingBox|null} */
    this.bounds = null;
    /** @type {Function|null} */
    this.renderFn = null;

    /** @private */
    this._canvas = null;
    /** @private */
    this._ctx = null;
    /** @private */
    this._accelerationX = 0;
    /** @private */
    this._accelerationY = 0;
  }

  /**
   * Gets the canvas rendering context
   * @returns {CanvasRenderingContext2D|null}
   */
  get ctx() {
    return this._ctx;
  }

  /**
   * Gets the bounding box of this object
   * @returns {BoundingBox}
   */
  getBoundingBox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  /**
   * Gets the center point of the object
   * @returns {Vector2D}
   */
  getCenter() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  }

  firstUpdated() {
    this._canvas = this.shadowRoot.querySelector('canvas');
    if (this._canvas) {
      this._ctx = this._canvas.getContext('2d');
      this._updateCanvasSize();
      this._render();
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('width') || changedProperties.has('height')) {
      this._updateCanvasSize();
    }
    if (changedProperties.has('x') || changedProperties.has('y')) {
      this._updatePosition();
    }
    this._render();
  }

  /** @private */
  _updateCanvasSize() {
    if (this._canvas) {
      this._canvas.width = this.width;
      this._canvas.height = this.height;
    }
  }

  /** @private */
  _updatePosition() {
    this.style.left = `${this.x}px`;
    this.style.top = `${this.y}px`;
    this.style.width = `${this.width}px`;
    this.style.height = `${this.height}px`;
  }

  /** @private */
  _render() {
    if (!this._ctx) return;

    this._ctx.clearRect(0, 0, this.width, this.height);

    if (this.renderFn) {
      this.renderFn(this._ctx, this.width, this.height);
    } else {
      // Default rendering - simple rectangle
      this._ctx.fillStyle = 'var(--convgame-object-fill, #4a90d9)';
      this._ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  /**
   * Updates the object's physics state
   * Call this method each frame to apply physics
   * @param {number} [deltaTime=1] - Time delta multiplier
   */
  update(deltaTime = 1) {
    if (this.isStatic) return;

    const previousX = this.x;
    const previousY = this.y;

    // Apply acceleration to velocity
    this.velocityX += this._accelerationX * deltaTime;
    this.velocityY += this._accelerationY * deltaTime;

    // Apply friction
    this.velocityX *= this.friction;
    this.velocityY *= this.friction;

    // Update position
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;

    // Reset acceleration after applying
    this._accelerationX = 0;
    this._accelerationY = 0;

    // Check bounds
    if (this.bounds) {
      this._checkBounds();
    }

    // Dispatch position change event if moved
    if (this.x !== previousX || this.y !== previousY) {
      this._dispatchEvent('position-change', {
        x: this.x,
        y: this.y,
        previousX,
        previousY,
        velocityX: this.velocityX,
        velocityY: this.velocityY
      });
    }
  }

  /** @private */
  _checkBounds() {
    if (!this.bounds) return;

    const { minX = 0, maxX = Infinity, minY = 0, maxY = Infinity } = this.bounds;
    let hitBoundary = null;

    if (this.x < minX) {
      this.x = minX;
      this.velocityX = -this.velocityX * this.restitution;
      hitBoundary = 'left';
    } else if (this.x + this.width > maxX) {
      this.x = maxX - this.width;
      this.velocityX = -this.velocityX * this.restitution;
      hitBoundary = 'right';
    }

    if (this.y < minY) {
      this.y = minY;
      this.velocityY = -this.velocityY * this.restitution;
      hitBoundary = 'top';
    } else if (this.y + this.height > maxY) {
      this.y = maxY - this.height;
      this.velocityY = -this.velocityY * this.restitution;
      hitBoundary = 'bottom';
    }

    if (hitBoundary) {
      this._dispatchEvent('boundary-hit', {
        boundary: hitBoundary,
        x: this.x,
        y: this.y
      });
    }
  }

  /**
   * Checks if this object collides with another ConvgameObject
   * Uses AABB (Axis-Aligned Bounding Box) collision detection
   * @param {ConvgameObject} other - The other object to check collision with
   * @returns {boolean} True if collision detected
   */
  collidesWith(other) {
    if (!other) return false;

    const thisBox = this.getBoundingBox();
    const otherBox = other.getBoundingBox();

    const collides = (
      thisBox.x < otherBox.x + otherBox.width &&
      thisBox.x + thisBox.width > otherBox.x &&
      thisBox.y < otherBox.y + otherBox.height &&
      thisBox.y + thisBox.height > otherBox.y
    );

    if (collides) {
      this._dispatchEvent('collision', {
        other,
        thisBox,
        otherBox
      });
    }

    return collides;
  }

  /**
   * Applies a force to the object
   * @param {number} forceX - Force in X direction
   * @param {number} forceY - Force in Y direction
   */
  applyForce(forceX, forceY) {
    if (this.isStatic) return;

    // F = ma, so a = F/m
    this._accelerationX += forceX / this.mass;
    this._accelerationY += forceY / this.mass;
  }

  /**
   * Applies an impulse (immediate velocity change)
   * @param {number} impulseX - Impulse in X direction
   * @param {number} impulseY - Impulse in Y direction
   */
  applyImpulse(impulseX, impulseY) {
    if (this.isStatic) return;

    this.velocityX += impulseX / this.mass;
    this.velocityY += impulseY / this.mass;
  }

  /**
   * Sets the position of the object
   * @param {number} x - New X position
   * @param {number} y - New Y position
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Sets the velocity of the object
   * @param {number} vx - New X velocity
   * @param {number} vy - New Y velocity
   */
  setVelocity(vx, vy) {
    this.velocityX = vx;
    this.velocityY = vy;
  }

  /**
   * Stops the object (sets velocity to zero)
   */
  stop() {
    this.velocityX = 0;
    this.velocityY = 0;
    this._accelerationX = 0;
    this._accelerationY = 0;
  }

  /**
   * Calculates distance to another object
   * @param {ConvgameObject} other - The other object
   * @returns {number} Distance between centers
   */
  distanceTo(other) {
    const thisCenter = this.getCenter();
    const otherCenter = other.getCenter();

    const dx = otherCenter.x - thisCenter.x;
    const dy = otherCenter.y - thisCenter.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Gets the angle to another object in radians
   * @param {ConvgameObject} other - The other object
   * @returns {number} Angle in radians
   */
  angleTo(other) {
    const thisCenter = this.getCenter();
    const otherCenter = other.getCenter();

    return Math.atan2(
      otherCenter.y - thisCenter.y,
      otherCenter.x - thisCenter.x
    );
  }

  /**
   * Resolves collision between this object and another using elastic collision
   * @param {ConvgameObject} other - The other object
   */
  resolveCollision(other) {
    if (this.isStatic && other.isStatic) return;

    const thisCenter = this.getCenter();
    const otherCenter = other.getCenter();

    // Calculate collision normal
    const dx = otherCenter.x - thisCenter.x;
    const dy = otherCenter.y - thisCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const nx = dx / distance;
    const ny = dy / distance;

    // Relative velocity
    const dvx = this.velocityX - other.velocityX;
    const dvy = this.velocityY - other.velocityY;

    // Relative velocity along normal
    const dvn = dvx * nx + dvy * ny;

    // Don't resolve if velocities are separating
    if (dvn > 0) return;

    // Calculate restitution
    const restitution = Math.min(this.restitution, other.restitution);

    // Calculate impulse scalar
    const totalMass = this.isStatic ? other.mass : (other.isStatic ? this.mass : this.mass + other.mass);
    const impulse = -(1 + restitution) * dvn / totalMass;

    // Apply impulse
    if (!this.isStatic) {
      this.velocityX -= impulse * other.mass * nx;
      this.velocityY -= impulse * other.mass * ny;
    }

    if (!other.isStatic) {
      other.velocityX += impulse * this.mass * nx;
      other.velocityY += impulse * this.mass * ny;
    }
  }

  /** @private */
  _dispatchEvent(name, detail) {
    this.dispatchEvent(new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="game-object" part="container">
        <canvas part="canvas"></canvas>
        ${this.debug ? html`
          <div
            class="velocity-indicator"
            style="width: ${Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2) * 10}px;
                   transform: rotate(${Math.atan2(this.velocityY, this.velocityX)}rad);">
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('convgame-object', ConvgameObject);
