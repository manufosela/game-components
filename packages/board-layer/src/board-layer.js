import { LitElement, html } from 'lit';
import { styles } from './board-layer.styles.js';

/**
 * @typedef {Object} LayerConfig
 * @property {string} name - Layer name/identifier
 * @property {number} [zIndex=0] - Layer z-index for stacking
 * @property {boolean} [visible=true] - Whether layer is visible
 * @property {number} [opacity=1] - Layer opacity (0-1)
 * @property {string} [blendMode='normal'] - Canvas composite operation
 */

/**
 * @typedef {Object} Layer
 * @property {string} name - Layer name
 * @property {HTMLCanvasElement} canvas - Canvas element
 * @property {CanvasRenderingContext2D} ctx - 2D rendering context
 * @property {number} zIndex - Z-index for stacking
 * @property {boolean} visible - Visibility state
 * @property {number} opacity - Opacity value
 * @property {string} blendMode - Blend mode
 */

/**
 * BoardLayer - Multi-layer canvas game board component
 *
 * Provides a layered canvas system for game graphics, allowing separate
 * layers for background, sprites, effects, UI, etc.
 *
 * @element board-layer
 * @fires layer-add - Fired when a layer is added
 * @fires layer-remove - Fired when a layer is removed
 * @fires render - Fired after render cycle completes
 * @fires layer-change - Fired when layer properties change
 *
 * @csspart container - The board container
 * @csspart layer - Individual canvas layers
 *
 * @cssprop --board-layer-bg - Background color
 * @cssprop --board-layer-border - Border style
 * @cssprop --board-layer-grid-color - Grid overlay color
 */
export class BoardLayer extends LitElement {
  static styles = styles;

  static properties = {
    /** Board width in pixels */
    width: { type: Number, reflect: true },
    /** Board height in pixels */
    height: { type: Number, reflect: true },
    /** Grid cell size (0 to disable grid) */
    gridSize: { type: Number, attribute: 'grid-size' },
    /** Show grid overlay */
    showGrid: { type: Boolean, attribute: 'show-grid' },
    /** Layer configurations */
    layers: { type: Array },
    /** Enable debug panel */
    debug: { type: Boolean, reflect: true },
    /** Auto-clear layers before render */
    autoClear: { type: Boolean, attribute: 'auto-clear' }
  };

  constructor() {
    super();
    /** @type {number} */
    this.width = 800;
    /** @type {number} */
    this.height = 600;
    /** @type {number} */
    this.gridSize = 0;
    /** @type {boolean} */
    this.showGrid = false;
    /** @type {LayerConfig[]} */
    this.layers = [];
    /** @type {boolean} */
    this.debug = false;
    /** @type {boolean} */
    this.autoClear = false;

    /** @private @type {Map<string, Layer>} */
    this._layerMap = new Map();
    /** @private */
    this._gridCanvas = null;
    /** @private */
    this._gridCtx = null;
    /** @private */
    this._renderCallbacks = [];
  }

  firstUpdated() {
    this._initializeLayers();
    if (this.showGrid && this.gridSize > 0) {
      this._drawGrid();
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('layers')) {
      this._syncLayers();
    }
    if (changedProperties.has('width') || changedProperties.has('height')) {
      this._resizeLayers();
    }
    if (changedProperties.has('showGrid') || changedProperties.has('gridSize')) {
      if (this.showGrid && this.gridSize > 0) {
        this._drawGrid();
      }
    }
  }

  /** @private */
  _initializeLayers() {
    // Initialize grid canvas
    this._gridCanvas = this.shadowRoot.querySelector('.grid-overlay');
    if (this._gridCanvas) {
      this._gridCanvas.width = this.width;
      this._gridCanvas.height = this.height;
      this._gridCtx = this._gridCanvas.getContext('2d');
    }

    // Create initial layers
    this._syncLayers();
  }

  /** @private */
  _syncLayers() {
    const container = this.shadowRoot.querySelector('.board-container');
    if (!container) return;

    // Get current layer names
    const currentNames = new Set(this._layerMap.keys());
    const newNames = new Set(this.layers.map(l => l.name));

    // Remove layers that are no longer in config
    for (const name of currentNames) {
      if (!newNames.has(name)) {
        this._removeLayerByName(name);
      }
    }

    // Add or update layers from config
    for (const config of this.layers) {
      if (!this._layerMap.has(config.name)) {
        this._createLayer(config);
      } else {
        this._updateLayerConfig(config);
      }
    }

    // Sort layers by z-index
    this._sortLayers();
  }

  /** @private */
  _createLayer(config) {
    const canvas = document.createElement('canvas');
    canvas.className = 'layer';
    canvas.dataset.name = config.name;
    canvas.width = this.width;
    canvas.height = this.height;

    const ctx = canvas.getContext('2d');

    const layer = {
      name: config.name,
      canvas,
      ctx,
      zIndex: config.zIndex || 0,
      visible: config.visible !== false,
      opacity: config.opacity ?? 1,
      blendMode: config.blendMode || 'source-over'
    };

    // Apply styles
    canvas.style.zIndex = layer.zIndex;
    canvas.style.opacity = layer.opacity;
    canvas.style.mixBlendMode = layer.blendMode;

    if (!layer.visible) {
      canvas.classList.add('hidden');
    }

    this._layerMap.set(config.name, layer);

    const container = this.shadowRoot.querySelector('.board-container');
    container.insertBefore(canvas, this._gridCanvas);

    this._dispatchEvent('layer-add', {
      name: config.name,
      layer,
      totalLayers: this._layerMap.size
    });
  }

  /** @private */
  _updateLayerConfig(config) {
    const layer = this._layerMap.get(config.name);
    if (!layer) return;

    layer.zIndex = config.zIndex || 0;
    layer.visible = config.visible !== false;
    layer.opacity = config.opacity ?? 1;
    layer.blendMode = config.blendMode || 'source-over';

    layer.canvas.style.zIndex = layer.zIndex;
    layer.canvas.style.opacity = layer.opacity;
    layer.canvas.style.mixBlendMode = layer.blendMode;

    if (layer.visible) {
      layer.canvas.classList.remove('hidden');
    } else {
      layer.canvas.classList.add('hidden');
    }
  }

  /** @private */
  _removeLayerByName(name) {
    const layer = this._layerMap.get(name);
    if (!layer) return;

    layer.canvas.remove();
    this._layerMap.delete(name);

    this._dispatchEvent('layer-remove', {
      name,
      totalLayers: this._layerMap.size
    });
  }

  /** @private */
  _sortLayers() {
    const container = this.shadowRoot.querySelector('.board-container');
    if (!container) return;

    const sortedLayers = Array.from(this._layerMap.values())
      .sort((a, b) => a.zIndex - b.zIndex);

    for (const layer of sortedLayers) {
      container.insertBefore(layer.canvas, this._gridCanvas);
    }
  }

  /** @private */
  _resizeLayers() {
    for (const layer of this._layerMap.values()) {
      layer.canvas.width = this.width;
      layer.canvas.height = this.height;
    }

    if (this._gridCanvas) {
      this._gridCanvas.width = this.width;
      this._gridCanvas.height = this.height;
      if (this.showGrid && this.gridSize > 0) {
        this._drawGrid();
      }
    }
  }

  /** @private */
  _drawGrid() {
    if (!this._gridCtx || this.gridSize <= 0) return;

    const ctx = this._gridCtx;
    ctx.clearRect(0, 0, this.width, this.height);

    const gridColor = getComputedStyle(this).getPropertyValue('--board-layer-grid-color') || 'rgba(255, 255, 255, 0.1)';
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= this.width; x += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, this.height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= this.height; y += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(this.width, y + 0.5);
      ctx.stroke();
    }
  }

  /**
   * Adds a new layer to the board
   * @param {LayerConfig} config - Layer configuration
   * @returns {Layer} The created layer
   */
  addLayer(config) {
    if (this._layerMap.has(config.name)) {
      console.warn(`Layer "${config.name}" already exists`);
      return this._layerMap.get(config.name);
    }

    this._createLayer(config);
    return this._layerMap.get(config.name);
  }

  /**
   * Removes a layer by name
   * @param {string} name - Layer name to remove
   * @returns {boolean} True if layer was removed
   */
  removeLayer(name) {
    if (!this._layerMap.has(name)) {
      return false;
    }

    this._removeLayerByName(name);
    return true;
  }

  /**
   * Gets a layer by name
   * @param {string} name - Layer name
   * @returns {Layer|null} The layer or null if not found
   */
  getLayer(name) {
    return this._layerMap.get(name) || null;
  }

  /**
   * Gets a layer by index (z-order)
   * @param {number} index - Layer index
   * @returns {Layer|null} The layer or null if not found
   */
  getLayerByIndex(index) {
    const sortedLayers = Array.from(this._layerMap.values())
      .sort((a, b) => a.zIndex - b.zIndex);
    return sortedLayers[index] || null;
  }

  /**
   * Gets the rendering context for a layer
   * @param {string} name - Layer name
   * @returns {CanvasRenderingContext2D|null} The context or null
   */
  getContext(name) {
    const layer = this._layerMap.get(name);
    return layer ? layer.ctx : null;
  }

  /**
   * Gets all layer names
   * @returns {string[]} Array of layer names
   */
  getLayerNames() {
    return Array.from(this._layerMap.keys());
  }

  /**
   * Gets the number of layers
   * @returns {number} Layer count
   */
  getLayerCount() {
    return this._layerMap.size;
  }

  /**
   * Clears a specific layer
   * @param {string} name - Layer name to clear
   */
  clearLayer(name) {
    const layer = this._layerMap.get(name);
    if (layer) {
      layer.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  /**
   * Clears all layers
   */
  clear() {
    for (const layer of this._layerMap.values()) {
      layer.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  /**
   * Sets layer visibility
   * @param {string} name - Layer name
   * @param {boolean} visible - Visibility state
   */
  setLayerVisibility(name, visible) {
    const layer = this._layerMap.get(name);
    if (!layer) return;

    layer.visible = visible;
    if (visible) {
      layer.canvas.classList.remove('hidden');
    } else {
      layer.canvas.classList.add('hidden');
    }

    this._dispatchEvent('layer-change', {
      name,
      property: 'visible',
      value: visible
    });
  }

  /**
   * Sets layer opacity
   * @param {string} name - Layer name
   * @param {number} opacity - Opacity value (0-1)
   */
  setLayerOpacity(name, opacity) {
    const layer = this._layerMap.get(name);
    if (!layer) return;

    layer.opacity = Math.max(0, Math.min(1, opacity));
    layer.canvas.style.opacity = layer.opacity;

    this._dispatchEvent('layer-change', {
      name,
      property: 'opacity',
      value: layer.opacity
    });
  }

  /**
   * Sets layer blend mode
   * @param {string} name - Layer name
   * @param {string} blendMode - CSS mix-blend-mode value
   */
  setLayerBlendMode(name, blendMode) {
    const layer = this._layerMap.get(name);
    if (!layer) return;

    layer.blendMode = blendMode;
    layer.canvas.style.mixBlendMode = blendMode;

    this._dispatchEvent('layer-change', {
      name,
      property: 'blendMode',
      value: blendMode
    });
  }

  /**
   * Sets layer z-index
   * @param {string} name - Layer name
   * @param {number} zIndex - New z-index value
   */
  setLayerZIndex(name, zIndex) {
    const layer = this._layerMap.get(name);
    if (!layer) return;

    layer.zIndex = zIndex;
    layer.canvas.style.zIndex = zIndex;
    this._sortLayers();

    this._dispatchEvent('layer-change', {
      name,
      property: 'zIndex',
      value: zIndex
    });
  }

  /**
   * Renders content to a layer using a callback
   * @param {string} name - Layer name
   * @param {Function} callback - Render callback (ctx, width, height)
   */
  renderToLayer(name, callback) {
    const layer = this._layerMap.get(name);
    if (!layer) return;

    if (this.autoClear) {
      layer.ctx.clearRect(0, 0, this.width, this.height);
    }

    callback(layer.ctx, this.width, this.height);
  }

  /**
   * Converts grid coordinates to pixel coordinates
   * @param {number} gridX - Grid X coordinate
   * @param {number} gridY - Grid Y coordinate
   * @returns {{ x: number, y: number }} Pixel coordinates
   */
  gridToPixel(gridX, gridY) {
    return {
      x: gridX * this.gridSize,
      y: gridY * this.gridSize
    };
  }

  /**
   * Converts pixel coordinates to grid coordinates
   * @param {number} pixelX - Pixel X coordinate
   * @param {number} pixelY - Pixel Y coordinate
   * @returns {{ x: number, y: number }} Grid coordinates
   */
  pixelToGrid(pixelX, pixelY) {
    return {
      x: Math.floor(pixelX / this.gridSize),
      y: Math.floor(pixelY / this.gridSize)
    };
  }

  /**
   * Gets the grid dimensions
   * @returns {{ cols: number, rows: number }} Grid dimensions
   */
  getGridDimensions() {
    if (this.gridSize <= 0) {
      return { cols: 0, rows: 0 };
    }
    return {
      cols: Math.floor(this.width / this.gridSize),
      rows: Math.floor(this.height / this.gridSize)
    };
  }

  /**
   * Draws a filled rectangle on a layer
   * @param {string} layerName - Layer name
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @param {string} color - Fill color
   */
  drawRect(layerName, x, y, width, height, color) {
    const ctx = this.getContext(layerName);
    if (!ctx) return;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  }

  /**
   * Draws a circle on a layer
   * @param {string} layerName - Layer name
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {number} radius - Circle radius
   * @param {string} color - Fill color
   */
  drawCircle(layerName, x, y, radius, color) {
    const ctx = this.getContext(layerName);
    if (!ctx) return;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draws an image on a layer
   * @param {string} layerName - Layer name
   * @param {HTMLImageElement|HTMLCanvasElement} image - Image to draw
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} [width] - Optional width (defaults to image width)
   * @param {number} [height] - Optional height (defaults to image height)
   */
  drawImage(layerName, image, x, y, width, height) {
    const ctx = this.getContext(layerName);
    if (!ctx) return;

    if (width !== undefined && height !== undefined) {
      ctx.drawImage(image, x, y, width, height);
    } else {
      ctx.drawImage(image, x, y);
    }
  }

  /**
   * Triggers a render cycle and dispatches render event
   */
  render() {
    this._dispatchEvent('render', {
      width: this.width,
      height: this.height,
      layerCount: this._layerMap.size,
      layers: this.getLayerNames()
    });

    return html`
      <div class="board-container" part="container">
        <canvas
          class="grid-overlay"
          width=${this.width}
          height=${this.height}
          style="z-index: 9999; display: ${this.showGrid ? 'block' : 'none'}"
        ></canvas>
        ${this.debug ? this._renderDebugPanel() : ''}
      </div>
    `;
  }

  /** @private */
  _renderDebugPanel() {
    const layers = Array.from(this._layerMap.values())
      .sort((a, b) => a.zIndex - b.zIndex);

    return html`
      <div class="debug-panel">
        <p><strong>Board:</strong> ${this.width}x${this.height}</p>
        <p><strong>Grid:</strong> ${this.gridSize > 0 ? `${this.gridSize}px` : 'disabled'}</p>
        <p><strong>Layers:</strong> ${this._layerMap.size}</p>
        ${layers.map(layer => html`
          <div class="layer-info">
            <p>${layer.name} (z:${layer.zIndex})</p>
            <p>opacity:${layer.opacity} ${layer.visible ? '' : '[hidden]'}</p>
          </div>
        `)}
      </div>
    `;
  }

  /** @private */
  _dispatchEvent(name, detail) {
    this.dispatchEvent(new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('board-layer', BoardLayer);
