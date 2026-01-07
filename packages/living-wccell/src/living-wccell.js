import { LitElement, html } from 'lit';
import { styles } from './living-wccell.styles.js';

/**
 * @typedef {Object} CellRules
 * @property {number[]} birth - Number of neighbors required to birth a cell
 * @property {number[]} survival - Number of neighbors required to survive
 */

/**
 * @typedef {Object} Neighbor
 * @property {number} dx - Delta X (-1, 0, or 1)
 * @property {number} dy - Delta Y (-1, 0, or 1)
 */

/**
 * Default Conway's Game of Life rules (B3/S23)
 * @type {CellRules}
 */
const CONWAY_RULES = {
  birth: [3],
  survival: [2, 3]
};

/**
 * LivingWccell - A cellular automaton cell component
 *
 * Implements Conway's Game of Life rules by default, but supports custom rules.
 *
 * @element living-wccell
 * @fires state-change - Fired when cell state changes (alive/dead)
 * @fires cell-click - Fired when cell is clicked
 * @fires generation-update - Fired when generation updates
 *
 * @csspart cell - The cell element
 *
 * @cssprop --living-wccell-size - Cell size (default: 20px)
 * @cssprop --living-wccell-alive-color - Color when alive
 * @cssprop --living-wccell-dead-color - Color when dead
 * @cssprop --living-wccell-border-color - Border color
 */
export class LivingWccell extends LitElement {
  static styles = styles;

  static properties = {
    /** Whether the cell is alive */
    alive: { type: Boolean, reflect: true },
    /** X coordinate in the grid */
    x: { type: Number, reflect: true },
    /** Y coordinate in the grid */
    y: { type: Number, reflect: true },
    /** Current generation/age of the cell */
    generation: { type: Number, reflect: true },
    /** Total generations the cell has been alive */
    age: { type: Number },
    /** Cellular automaton rules */
    rules: { type: Object },
    /** Number of alive neighbors */
    neighborCount: { type: Number, attribute: 'neighbor-count' },
    /** Show generation indicator */
    showGeneration: { type: Boolean, attribute: 'show-generation' },
    /** Cell ID for grid management */
    cellId: { type: String, attribute: 'cell-id' }
  };

  constructor() {
    super();
    /** @type {boolean} */
    this.alive = false;
    /** @type {number} */
    this.x = 0;
    /** @type {number} */
    this.y = 0;
    /** @type {number} */
    this.generation = 0;
    /** @type {number} */
    this.age = 0;
    /** @type {CellRules} */
    this.rules = CONWAY_RULES;
    /** @type {number} */
    this.neighborCount = 0;
    /** @type {boolean} */
    this.showGeneration = false;
    /** @type {string} */
    this.cellId = '';

    /** @private */
    this._nextState = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'gridcell');
    this.setAttribute('aria-label', this._getAriaLabel());
  }

  updated(changedProperties) {
    if (changedProperties.has('alive') || changedProperties.has('x') || changedProperties.has('y')) {
      this.setAttribute('aria-label', this._getAriaLabel());
    }
  }

  /** @private */
  _getAriaLabel() {
    const state = this.alive ? 'alive' : 'dead';
    return `Cell at position ${this.x}, ${this.y} is ${state}`;
  }

  /**
   * Gets the age class for styling based on how long the cell has been alive
   * @returns {string}
   */
  _getAgeClass() {
    if (!this.alive) return '';
    if (this.age === 1) return 'age-1';
    if (this.age === 2) return 'age-2';
    if (this.age === 3) return 'age-3';
    return 'age-old';
  }

  /**
   * Toggles the cell state between alive and dead
   */
  toggle() {
    this.setAlive(!this.alive);
  }

  /**
   * Sets the cell state
   * @param {boolean} alive - Whether the cell should be alive
   */
  setAlive(alive) {
    const previousState = this.alive;
    this.alive = alive;

    if (alive && !previousState) {
      this.age = 1;
    } else if (!alive) {
      this.age = 0;
    }

    if (previousState !== alive) {
      this._dispatchStateChange();
    }
  }

  /**
   * Calculates the next state based on neighbor count and rules
   * Does not apply the state - call applyNextState() after all cells calculate
   * @param {number} aliveNeighbors - Number of alive neighbors
   * @returns {boolean} The calculated next state
   */
  calculateNextState(aliveNeighbors) {
    this.neighborCount = aliveNeighbors;

    if (this.alive) {
      // Cell is alive - check survival rules
      this._nextState = this.rules.survival.includes(aliveNeighbors);
    } else {
      // Cell is dead - check birth rules
      this._nextState = this.rules.birth.includes(aliveNeighbors);
    }

    return this._nextState;
  }

  /**
   * Applies the previously calculated next state
   * Should be called after all cells have calculated their next state
   */
  applyNextState() {
    if (this._nextState === null) return;

    const previousState = this.alive;
    this.alive = this._nextState;

    if (this.alive) {
      if (previousState) {
        this.age++;
      } else {
        this.age = 1;
      }
    } else {
      this.age = 0;
    }

    this._nextState = null;

    if (previousState !== this.alive) {
      this._dispatchStateChange();
    }
  }

  /**
   * Updates the cell generation
   * @param {number} gen - New generation number
   */
  updateGeneration(gen) {
    const previousGen = this.generation;
    this.generation = gen;

    if (previousGen !== gen) {
      this._dispatchEvent('generation-update', {
        generation: gen,
        previousGeneration: previousGen,
        x: this.x,
        y: this.y,
        alive: this.alive,
        age: this.age
      });
    }
  }

  /**
   * Resets the cell to dead state
   */
  reset() {
    this.alive = false;
    this.age = 0;
    this.generation = 0;
    this.neighborCount = 0;
    this._nextState = null;
  }

  /**
   * Gets cell coordinates
   * @returns {{ x: number, y: number }}
   */
  getPosition() {
    return { x: this.x, y: this.y };
  }

  /**
   * Gets cell state information
   * @returns {{ alive: boolean, age: number, generation: number, x: number, y: number }}
   */
  getState() {
    return {
      alive: this.alive,
      age: this.age,
      generation: this.generation,
      x: this.x,
      y: this.y
    };
  }

  /**
   * Sets custom rules for the cellular automaton
   * @param {number[]} birth - Array of neighbor counts that cause birth
   * @param {number[]} survival - Array of neighbor counts that allow survival
   */
  setRules(birth, survival) {
    this.rules = { birth, survival };
  }

  /** @private */
  _handleClick(e) {
    e.preventDefault();
    this.toggle();
    this._dispatchEvent('cell-click', {
      x: this.x,
      y: this.y,
      alive: this.alive,
      cellId: this.cellId
    });
  }

  /** @private */
  _handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.toggle();
      this._dispatchEvent('cell-click', {
        x: this.x,
        y: this.y,
        alive: this.alive,
        cellId: this.cellId
      });
    }
  }

  /** @private */
  _dispatchStateChange() {
    this._dispatchEvent('state-change', {
      alive: this.alive,
      previousAlive: !this.alive,
      x: this.x,
      y: this.y,
      age: this.age,
      generation: this.generation,
      cellId: this.cellId
    });
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
    const aliveClass = this.alive ? 'alive' : 'dead';
    const ageClass = this._getAgeClass();

    return html`
      <div
        class="cell ${aliveClass} ${ageClass}"
        part="cell"
        @click=${this._handleClick}
        @keydown=${this._handleKeyDown}
        aria-pressed=${this.alive}
      >
        ${this.showGeneration && this.alive ? html`
          <span class="generation-indicator">${this.age}</span>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('living-wccell', LivingWccell);

/**
 * Common cellular automaton rule presets
 */
export const CellularRules = {
  /** Conway's Game of Life - B3/S23 */
  CONWAY: { birth: [3], survival: [2, 3] },
  /** HighLife - B36/S23 */
  HIGHLIFE: { birth: [3, 6], survival: [2, 3] },
  /** Day & Night - B3678/S34678 */
  DAY_AND_NIGHT: { birth: [3, 6, 7, 8], survival: [3, 4, 6, 7, 8] },
  /** Seeds - B2/S */
  SEEDS: { birth: [2], survival: [] },
  /** Life without death - B3/S012345678 */
  LIFE_WITHOUT_DEATH: { birth: [3], survival: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
  /** Maze - B3/S12345 */
  MAZE: { birth: [3], survival: [1, 2, 3, 4, 5] },
  /** Replicator - B1357/S1357 */
  REPLICATOR: { birth: [1, 3, 5, 7], survival: [1, 3, 5, 7] },
  /** 2x2 - B36/S125 */
  TWO_BY_TWO: { birth: [3, 6], survival: [1, 2, 5] }
};
