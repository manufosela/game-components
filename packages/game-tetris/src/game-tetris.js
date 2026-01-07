import { LitElement, html } from 'lit';
import { styles } from './game-tetris.styles.js';

/**
 * Tetromino shapes and their rotations
 * Each shape is a 4x4 grid represented as a 2D array
 */
const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#00f0f0' // Cyan
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#f0f000' // Yellow
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#a000f0' // Purple
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: '#00f000' // Green
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: '#f00000' // Red
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#0000f0' // Blue
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#f0a000' // Orange
  }
};

const TETROMINO_KEYS = Object.keys(TETROMINOES);

/**
 * GameTetris - Complete Tetris game web component
 *
 * @element game-tetris
 * @fires game-start - Fired when game starts
 * @fires game-over - Fired when game ends
 * @fires line-clear - Fired when lines are cleared
 * @fires score-update - Fired when score changes
 * @fires level-up - Fired when level increases
 * @fires piece-lock - Fired when a piece locks into place
 *
 * @csspart container - Main game container
 * @csspart board - Game board canvas
 * @csspart panel - Side panel
 * @csspart overlay - Game overlay (pause/game over)
 *
 * @cssprop --game-tetris-bg - Background color
 * @cssprop --game-tetris-board-bg - Board background
 * @cssprop --game-tetris-score-color - Score text color
 */
export class GameTetris extends LitElement {
  static styles = styles;

  static properties = {
    /** Board width in cells */
    width: { type: Number },
    /** Board height in cells */
    height: { type: Number },
    /** Game speed in milliseconds (decreases with level) */
    speed: { type: Number },
    /** Current score */
    score: { type: Number, reflect: true },
    /** Current level */
    level: { type: Number, reflect: true },
    /** Lines cleared */
    lines: { type: Number },
    /** Whether game is paused */
    paused: { type: Boolean, reflect: true },
    /** Whether game is over */
    gameOver: { type: Boolean, attribute: 'game-over' },
    /** Whether game has started */
    gameStarted: { type: Boolean, attribute: 'game-started' },
    /** Cell size in pixels */
    cellSize: { type: Number, attribute: 'cell-size' },
    /** Show ghost piece */
    showGhost: { type: Boolean, attribute: 'show-ghost' },
    /** Show grid lines */
    showGrid: { type: Boolean, attribute: 'show-grid' }
  };

  constructor() {
    super();
    /** @type {number} */
    this.width = 10;
    /** @type {number} */
    this.height = 20;
    /** @type {number} */
    this.speed = 1000;
    /** @type {number} */
    this.score = 0;
    /** @type {number} */
    this.level = 1;
    /** @type {number} */
    this.lines = 0;
    /** @type {boolean} */
    this.paused = false;
    /** @type {boolean} */
    this.gameOver = false;
    /** @type {boolean} */
    this.gameStarted = false;
    /** @type {number} */
    this.cellSize = 25;
    /** @type {boolean} */
    this.showGhost = true;
    /** @type {boolean} */
    this.showGrid = true;

    /** @private */
    this._board = [];
    /** @private */
    this._currentPiece = null;
    /** @private */
    this._currentX = 0;
    /** @private */
    this._currentY = 0;
    /** @private */
    this._nextPiece = null;
    /** @private */
    this._gameLoop = null;
    /** @private */
    this._ctx = null;
    /** @private */
    this._previewCtx = null;
    /** @private */
    this._boundKeyHandler = this._handleKeyDown.bind(this);
    /** @private */
    this._linesForNextLevel = 10;
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._boundKeyHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._boundKeyHandler);
    this._stopGameLoop();
  }

  firstUpdated() {
    const canvas = this.shadowRoot.querySelector('#gameCanvas');
    const previewCanvas = this.shadowRoot.querySelector('#previewCanvas');

    if (canvas) {
      this._ctx = canvas.getContext('2d');
    }
    if (previewCanvas) {
      this._previewCtx = previewCanvas.getContext('2d');
    }

    this._initBoard();
    this._render();
  }

  /** @private */
  _initBoard() {
    this._board = [];
    for (let y = 0; y < this.height; y++) {
      this._board[y] = [];
      for (let x = 0; x < this.width; x++) {
        this._board[y][x] = null;
      }
    }
  }

  /**
   * Starts a new game
   */
  startGame() {
    this._initBoard();
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.gameOver = false;
    this.paused = false;
    this.gameStarted = true;
    this._linesForNextLevel = 10;

    this._nextPiece = this._getRandomPiece();
    this._spawnPiece();
    this._startGameLoop();

    this._dispatchEvent('game-start', {
      level: this.level,
      speed: this._getCurrentSpeed()
    });
  }

  /**
   * Pauses or unpauses the game
   */
  togglePause() {
    if (!this.gameStarted || this.gameOver) return;

    this.paused = !this.paused;

    if (this.paused) {
      this._stopGameLoop();
    } else {
      this._startGameLoop();
    }
  }

  /**
   * Resets the game to initial state
   */
  reset() {
    this._stopGameLoop();
    this._initBoard();
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.gameOver = false;
    this.paused = false;
    this.gameStarted = false;
    this._currentPiece = null;
    this._nextPiece = null;
    this._render();
    this._renderPreview();
  }

  /** @private */
  _getRandomPiece() {
    const key = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
    return {
      type: key,
      shape: TETROMINOES[key].shape.map(row => [...row]),
      color: TETROMINOES[key].color
    };
  }

  /** @private */
  _spawnPiece() {
    this._currentPiece = this._nextPiece;
    this._nextPiece = this._getRandomPiece();

    // Center the piece
    this._currentX = Math.floor((this.width - this._currentPiece.shape[0].length) / 2);
    this._currentY = 0;

    // Check if spawn position is valid (game over if not)
    if (!this._isValidPosition(this._currentPiece.shape, this._currentX, this._currentY)) {
      this._endGame();
    }

    this._renderPreview();
  }

  /** @private */
  _getCurrentSpeed() {
    // Speed increases with level (lower ms = faster)
    return Math.max(100, this.speed - (this.level - 1) * 80);
  }

  /** @private */
  _startGameLoop() {
    this._stopGameLoop();
    this._gameLoop = setInterval(() => {
      this._tick();
    }, this._getCurrentSpeed());
  }

  /** @private */
  _stopGameLoop() {
    if (this._gameLoop) {
      clearInterval(this._gameLoop);
      this._gameLoop = null;
    }
  }

  /** @private */
  _tick() {
    if (this.paused || this.gameOver) return;

    if (!this._moveDown()) {
      this._lockPiece();
      this._clearLines();
      this._spawnPiece();
    }

    this._render();
  }

  /** @private */
  _isValidPosition(shape, x, y) {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;

          // Check boundaries
          if (newX < 0 || newX >= this.width || newY >= this.height) {
            return false;
          }

          // Check collision with placed pieces (only if on board)
          if (newY >= 0 && this._board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /** @private */
  _moveDown() {
    if (this._isValidPosition(this._currentPiece.shape, this._currentX, this._currentY + 1)) {
      this._currentY++;
      return true;
    }
    return false;
  }

  /** @private */
  _moveLeft() {
    if (this._isValidPosition(this._currentPiece.shape, this._currentX - 1, this._currentY)) {
      this._currentX--;
      this._render();
    }
  }

  /** @private */
  _moveRight() {
    if (this._isValidPosition(this._currentPiece.shape, this._currentX + 1, this._currentY)) {
      this._currentX++;
      this._render();
    }
  }

  /** @private */
  _rotate() {
    const rotated = this._rotateMatrix(this._currentPiece.shape);

    // Try normal rotation
    if (this._isValidPosition(rotated, this._currentX, this._currentY)) {
      this._currentPiece.shape = rotated;
      this._render();
      return;
    }

    // Wall kick - try shifting left or right
    const kicks = [-1, 1, -2, 2];
    for (const kick of kicks) {
      if (this._isValidPosition(rotated, this._currentX + kick, this._currentY)) {
        this._currentPiece.shape = rotated;
        this._currentX += kick;
        this._render();
        return;
      }
    }
  }

  /** @private */
  _rotateMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = [];

    for (let col = 0; col < cols; col++) {
      rotated[col] = [];
      for (let row = rows - 1; row >= 0; row--) {
        rotated[col][rows - 1 - row] = matrix[row][col];
      }
    }

    return rotated;
  }

  /** @private */
  _hardDrop() {
    let dropDistance = 0;
    while (this._isValidPosition(this._currentPiece.shape, this._currentX, this._currentY + 1)) {
      this._currentY++;
      dropDistance++;
    }

    // Award points for hard drop
    this._addScore(dropDistance * 2);

    this._lockPiece();
    this._clearLines();
    this._spawnPiece();
    this._render();
  }

  /** @private */
  _getGhostY() {
    let ghostY = this._currentY;
    while (this._isValidPosition(this._currentPiece.shape, this._currentX, ghostY + 1)) {
      ghostY++;
    }
    return ghostY;
  }

  /** @private */
  _lockPiece() {
    for (let row = 0; row < this._currentPiece.shape.length; row++) {
      for (let col = 0; col < this._currentPiece.shape[row].length; col++) {
        if (this._currentPiece.shape[row][col]) {
          const y = this._currentY + row;
          const x = this._currentX + col;
          if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
            this._board[y][x] = this._currentPiece.color;
          }
        }
      }
    }

    this._dispatchEvent('piece-lock', {
      piece: this._currentPiece.type,
      x: this._currentX,
      y: this._currentY
    });
  }

  /** @private */
  _clearLines() {
    const linesToClear = [];

    for (let y = this.height - 1; y >= 0; y--) {
      if (this._board[y].every(cell => cell !== null)) {
        linesToClear.push(y);
      }
    }

    if (linesToClear.length === 0) return;

    // Remove lines
    for (const lineY of linesToClear) {
      this._board.splice(lineY, 1);
      this._board.unshift(Array(this.width).fill(null));
    }

    // Update score based on lines cleared
    const lineScores = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4 lines
    this._addScore(lineScores[linesToClear.length] * this.level);

    this.lines += linesToClear.length;

    this._dispatchEvent('line-clear', {
      lines: linesToClear.length,
      totalLines: this.lines,
      score: this.score
    });

    // Check for level up
    if (this.lines >= this._linesForNextLevel) {
      this._levelUp();
    }
  }

  /** @private */
  _addScore(points) {
    const previousScore = this.score;
    this.score += points;

    this._dispatchEvent('score-update', {
      score: this.score,
      previousScore,
      pointsAdded: points
    });
  }

  /** @private */
  _levelUp() {
    this.level++;
    this._linesForNextLevel += 10;

    // Restart game loop with new speed
    this._startGameLoop();

    this._dispatchEvent('level-up', {
      level: this.level,
      speed: this._getCurrentSpeed(),
      lines: this.lines
    });
  }

  /** @private */
  _endGame() {
    this.gameOver = true;
    this._stopGameLoop();

    this._dispatchEvent('game-over', {
      score: this.score,
      level: this.level,
      lines: this.lines
    });
  }

  /** @private */
  _handleKeyDown(e) {
    if (!this.gameStarted || this.gameOver) {
      if (e.key === 'Enter' || e.key === ' ') {
        this.startGame();
      }
      return;
    }

    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      this.togglePause();
      return;
    }

    if (this.paused) return;

    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        this._moveLeft();
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        this._moveRight();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        if (this._moveDown()) {
          this._addScore(1);
        }
        this._render();
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
      case 'x':
      case 'X':
        e.preventDefault();
        this._rotate();
        break;
      case ' ':
        e.preventDefault();
        this._hardDrop();
        break;
    }
  }

  /** @private */
  _render() {
    if (!this._ctx) return;

    const ctx = this._ctx;
    const cellSize = this.cellSize;
    const canvasWidth = this.width * cellSize;
    const canvasHeight = this.height * cellSize;

    // Clear canvas
    ctx.fillStyle = getComputedStyle(this).getPropertyValue('--game-tetris-board-bg') || '#0f0f1a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid
    if (this.showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= this.width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= this.height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(canvasWidth, y * cellSize);
        ctx.stroke();
      }
    }

    // Draw placed pieces
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this._board[y][x]) {
          this._drawCell(ctx, x, y, this._board[y][x]);
        }
      }
    }

    // Draw ghost piece
    if (this._currentPiece && this.showGhost) {
      const ghostY = this._getGhostY();
      if (ghostY !== this._currentY) {
        for (let row = 0; row < this._currentPiece.shape.length; row++) {
          for (let col = 0; col < this._currentPiece.shape[row].length; col++) {
            if (this._currentPiece.shape[row][col]) {
              const x = this._currentX + col;
              const y = ghostY + row;
              if (y >= 0) {
                this._drawCell(ctx, x, y, this._currentPiece.color, 0.2);
              }
            }
          }
        }
      }
    }

    // Draw current piece
    if (this._currentPiece) {
      for (let row = 0; row < this._currentPiece.shape.length; row++) {
        for (let col = 0; col < this._currentPiece.shape[row].length; col++) {
          if (this._currentPiece.shape[row][col]) {
            const x = this._currentX + col;
            const y = this._currentY + row;
            if (y >= 0) {
              this._drawCell(ctx, x, y, this._currentPiece.color);
            }
          }
        }
      }
    }
  }

  /** @private */
  _drawCell(ctx, x, y, color, opacity = 1) {
    const cellSize = this.cellSize;
    const padding = 1;

    ctx.globalAlpha = opacity;

    // Main cell
    ctx.fillStyle = color;
    ctx.fillRect(
      x * cellSize + padding,
      y * cellSize + padding,
      cellSize - padding * 2,
      cellSize - padding * 2
    );

    // Highlight (top-left)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(
      x * cellSize + padding,
      y * cellSize + padding,
      cellSize - padding * 2,
      3
    );
    ctx.fillRect(
      x * cellSize + padding,
      y * cellSize + padding,
      3,
      cellSize - padding * 2
    );

    // Shadow (bottom-right)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(
      x * cellSize + padding,
      y * cellSize + cellSize - padding - 3,
      cellSize - padding * 2,
      3
    );
    ctx.fillRect(
      x * cellSize + cellSize - padding - 3,
      y * cellSize + padding,
      3,
      cellSize - padding * 2
    );

    ctx.globalAlpha = 1;
  }

  /** @private */
  _renderPreview() {
    if (!this._previewCtx || !this._nextPiece) return;

    const ctx = this._previewCtx;
    const cellSize = 20;
    const canvasSize = 100;

    // Clear
    ctx.fillStyle = getComputedStyle(this).getPropertyValue('--game-tetris-preview-bg') || '#0f0f1a';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Center the piece
    const shape = this._nextPiece.shape;
    const offsetX = Math.floor((canvasSize - shape[0].length * cellSize) / 2);
    const offsetY = Math.floor((canvasSize - shape.length * cellSize) / 2);

    // Draw piece
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const x = offsetX + col * cellSize;
          const y = offsetY + row * cellSize;

          ctx.fillStyle = this._nextPiece.color;
          ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

          // Highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(x + 1, y + 1, cellSize - 2, 2);
          ctx.fillRect(x + 1, y + 1, 2, cellSize - 2);
        }
      }
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

  /** @private */
  _renderOverlay() {
    if (!this.gameStarted) {
      return html`
        <div class="overlay" part="overlay">
          <h2>TETRIS</h2>
          <p>Press ENTER or SPACE to start</p>
          <div class="controls-hint">
            <p><kbd>Left/Right</kbd> Move</p>
            <p><kbd>Up</kbd> Rotate</p>
            <p><kbd>Down</kbd> Soft drop</p>
            <p><kbd>Space</kbd> Hard drop</p>
            <p><kbd>P/Esc</kbd> Pause</p>
          </div>
          <button @click=${this.startGame}>START GAME</button>
        </div>
      `;
    }

    if (this.gameOver) {
      return html`
        <div class="overlay" part="overlay">
          <h2>GAME OVER</h2>
          <div class="final-score">${this.score}</div>
          <p>Level: ${this.level}</p>
          <p>Lines: ${this.lines}</p>
          <button @click=${this.startGame}>PLAY AGAIN</button>
        </div>
      `;
    }

    if (this.paused) {
      return html`
        <div class="overlay" part="overlay">
          <h2>PAUSED</h2>
          <p>Press P or ESC to resume</p>
          <button @click=${this.togglePause}>RESUME</button>
        </div>
      `;
    }

    return '';
  }

  render() {
    const canvasWidth = this.width * this.cellSize;
    const canvasHeight = this.height * this.cellSize;
    const linesProgress = ((this.lines % 10) / 10) * 100;

    return html`
      <div class="game-container" part="container">
        <div class="game-board">
          <canvas
            id="gameCanvas"
            part="board"
            width=${canvasWidth}
            height=${canvasHeight}
          ></canvas>
          ${this._renderOverlay()}
        </div>

        <div class="side-panel" part="panel">
          <div class="panel-section">
            <h3>Score</h3>
            <div class="score-value">${this.score}</div>
          </div>

          <div class="panel-section">
            <h3>Level</h3>
            <div class="score-value">${this.level}</div>
            <div class="level-indicator">
              <div class="level-bar">
                <div class="level-progress" style="width: ${linesProgress}%"></div>
              </div>
            </div>
          </div>

          <div class="panel-section">
            <h3>Lines</h3>
            <div class="score-value">${this.lines}</div>
          </div>

          <div class="panel-section next-piece">
            <h3>Next</h3>
            <canvas id="previewCanvas" width="100" height="100"></canvas>
          </div>

          <div class="panel-section controls-hint">
            <p><kbd>Arrows</kbd> Move</p>
            <p><kbd>Space</kbd> Drop</p>
            <p><kbd>P</kbd> Pause</p>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('game-tetris', GameTetris);
