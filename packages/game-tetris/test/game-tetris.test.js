import { html, fixture, expect, oneEvent, aTimeout } from '@open-wc/testing';
import '../src/game-tetris.js';

describe('GameTetris', () => {
  describe('Initialization', () => {
    it('should create element with default properties', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      expect(el.width).to.equal(10);
      expect(el.height).to.equal(20);
      expect(el.speed).to.equal(1000);
      expect(el.score).to.equal(0);
      expect(el.level).to.equal(1);
      expect(el.lines).to.equal(0);
      expect(el.paused).to.equal(false);
      expect(el.gameOver).to.equal(false);
      expect(el.gameStarted).to.equal(false);
      expect(el.cellSize).to.equal(25);
      expect(el.showGhost).to.equal(true);
      expect(el.showGrid).to.equal(true);
    });

    it('should accept custom properties', async () => {
      const el = await fixture(html`
        <game-tetris
          width="12"
          height="24"
          speed="500"
          cell-size="30"
        ></game-tetris>
      `);

      expect(el.width).to.equal(12);
      expect(el.height).to.equal(24);
      expect(el.speed).to.equal(500);
      expect(el.cellSize).to.equal(30);
    });

    it('should have canvas elements', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      const gameCanvas = el.shadowRoot.querySelector('#gameCanvas');
      const previewCanvas = el.shadowRoot.querySelector('#previewCanvas');

      expect(gameCanvas).to.exist;
      expect(previewCanvas).to.exist;
    });

    it('should show start overlay initially', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      const overlay = el.shadowRoot.querySelector('.overlay');

      expect(overlay).to.exist;
      expect(overlay.textContent).to.contain('TETRIS');
    });
  });

  describe('Game Start', () => {
    it('should start game when startGame is called', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      el.startGame();

      expect(el.gameStarted).to.equal(true);
      expect(el.gameOver).to.equal(false);
      expect(el.paused).to.equal(false);
    });

    it('should dispatch game-start event', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      setTimeout(() => el.startGame());
      const { detail } = await oneEvent(el, 'game-start');

      expect(detail.level).to.equal(1);
      expect(detail.speed).to.be.a('number');
    });

    it('should reset score and level on start', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      el.score = 1000;
      el.level = 5;
      el.lines = 50;

      el.startGame();

      expect(el.score).to.equal(0);
      expect(el.level).to.equal(1);
      expect(el.lines).to.equal(0);
    });

    it('should hide start overlay when game starts', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      el.startGame();
      await el.updateComplete;

      const overlay = el.shadowRoot.querySelector('.overlay');

      expect(overlay).to.be.null;
    });
  });

  describe('Pause Functionality', () => {
    it('should toggle pause state', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      el.startGame();
      expect(el.paused).to.equal(false);

      el.togglePause();
      expect(el.paused).to.equal(true);

      el.togglePause();
      expect(el.paused).to.equal(false);
    });

    it('should show pause overlay when paused', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      el.startGame();
      el.togglePause();
      await el.updateComplete;

      const overlay = el.shadowRoot.querySelector('.overlay');

      expect(overlay).to.exist;
      expect(overlay.textContent).to.contain('PAUSED');
    });

    it('should not pause if game not started', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      el.togglePause();

      expect(el.paused).to.equal(false);
    });

    it('should not pause if game is over', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      el.gameStarted = true;
      el.gameOver = true;

      el.togglePause();

      expect(el.paused).to.equal(false);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all game state', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      el.startGame();
      el.score = 5000;
      el.level = 3;
      el.lines = 25;

      el.reset();

      expect(el.score).to.equal(0);
      expect(el.level).to.equal(1);
      expect(el.lines).to.equal(0);
      expect(el.gameStarted).to.equal(false);
      expect(el.gameOver).to.equal(false);
      expect(el.paused).to.equal(false);
    });
  });

  describe('Score Display', () => {
    it('should display current score', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      el.score = 1234;
      await el.updateComplete;

      const scoreElement = el.shadowRoot.querySelector('.score-value');

      expect(scoreElement.textContent).to.equal('1234');
    });

    it('should display current level', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      el.level = 5;
      await el.updateComplete;

      const panels = el.shadowRoot.querySelectorAll('.panel-section');
      const levelPanel = panels[1];

      expect(levelPanel.textContent).to.contain('5');
    });

    it('should display lines cleared', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      el.lines = 42;
      await el.updateComplete;

      const panels = el.shadowRoot.querySelectorAll('.panel-section');
      const linesPanel = panels[2];

      expect(linesPanel.textContent).to.contain('42');
    });
  });

  describe('Game Over', () => {
    it('should show game over overlay', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      el.gameStarted = true;
      el.gameOver = true;
      el.score = 5000;
      await el.updateComplete;

      const overlay = el.shadowRoot.querySelector('.overlay');

      expect(overlay).to.exist;
      expect(overlay.textContent).to.contain('GAME OVER');
      expect(overlay.textContent).to.contain('5000');
    });
  });

  describe('Speed Calculation', () => {
    it('should calculate speed based on level', async () => {
      const el = await fixture(html`<game-tetris speed="1000"></game-tetris>`);

      // Level 1: 1000ms
      el.level = 1;
      expect(el._getCurrentSpeed()).to.equal(1000);

      // Level 2: 1000 - 80 = 920ms
      el.level = 2;
      expect(el._getCurrentSpeed()).to.equal(920);

      // Level 5: 1000 - 320 = 680ms
      el.level = 5;
      expect(el._getCurrentSpeed()).to.equal(680);
    });

    it('should have minimum speed of 100ms', async () => {
      const el = await fixture(html`<game-tetris speed="1000"></game-tetris>`);

      el.level = 20;

      expect(el._getCurrentSpeed()).to.be.at.least(100);
    });
  });

  describe('Canvas Rendering', () => {
    it('should have correct canvas dimensions', async () => {
      const el = await fixture(html`
        <game-tetris width="10" height="20" cell-size="25"></game-tetris>
      `);

      const canvas = el.shadowRoot.querySelector('#gameCanvas');

      expect(canvas.width).to.equal(250); // 10 * 25
      expect(canvas.height).to.equal(500); // 20 * 25
    });

    it('should have preview canvas', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      const previewCanvas = el.shadowRoot.querySelector('#previewCanvas');

      expect(previewCanvas).to.exist;
      expect(previewCanvas.width).to.equal(100);
      expect(previewCanvas.height).to.equal(100);
    });
  });

  describe('UI Elements', () => {
    it('should have start button in initial overlay', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      const button = el.shadowRoot.querySelector('.overlay button');

      expect(button).to.exist;
      expect(button.textContent).to.contain('START');
    });

    it('should have resume button in pause overlay', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      el.startGame();
      el.togglePause();
      await el.updateComplete;

      const button = el.shadowRoot.querySelector('.overlay button');

      expect(button).to.exist;
      expect(button.textContent).to.contain('RESUME');
    });

    it('should have play again button in game over overlay', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      el.gameStarted = true;
      el.gameOver = true;
      await el.updateComplete;

      const button = el.shadowRoot.querySelector('.overlay button');

      expect(button).to.exist;
      expect(button.textContent).to.contain('PLAY AGAIN');
    });

    it('should show controls hint', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      const hints = el.shadowRoot.querySelector('.controls-hint');

      expect(hints).to.exist;
      expect(hints.textContent).to.contain('Move');
      expect(hints.textContent).to.contain('Drop');
      expect(hints.textContent).to.contain('Pause');
    });
  });

  describe('Button Interactions', () => {
    it('should start game when start button is clicked', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      const button = el.shadowRoot.querySelector('.overlay button');
      button.click();

      expect(el.gameStarted).to.equal(true);
    });

    it('should resume game when resume button is clicked', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      el.startGame();
      el.togglePause();
      await el.updateComplete;

      const button = el.shadowRoot.querySelector('.overlay button');
      button.click();

      expect(el.paused).to.equal(false);
    });
  });

  describe('Ghost Piece', () => {
    it('should have showGhost property', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      expect(el.showGhost).to.equal(true);
    });

    it('should allow disabling ghost piece', async () => {
      const el = await fixture(html`<game-tetris .showGhost=${false}></game-tetris>`);

      expect(el.showGhost).to.equal(false);
    });
  });

  describe('Grid Display', () => {
    it('should have showGrid property', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      expect(el.showGrid).to.equal(true);
    });

    it('should allow disabling grid', async () => {
      const el = await fixture(html`<game-tetris .showGrid=${false}></game-tetris>`);

      expect(el.showGrid).to.equal(false);
    });
  });

  describe('Level Progress', () => {
    it('should show level progress bar', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      const progressBar = el.shadowRoot.querySelector('.level-progress');

      expect(progressBar).to.exist;
    });
  });

  describe('Event Cleanup', () => {
    it('should remove event listener on disconnect', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      el.startGame();

      // Should not throw
      el.remove();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible structure', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      // Has visible labels
      const labels = el.shadowRoot.querySelectorAll('h3');
      expect(labels.length).to.be.greaterThan(0);
    });

    it('should have keyboard controls documented', async () => {
      const el = await fixture(html`<game-tetris></game-tetris>`);

      const hints = el.shadowRoot.querySelector('.controls-hint');

      expect(hints.textContent).to.include('Move');
      expect(hints.textContent).to.include('Drop');
      expect(hints.textContent).to.include('Pause');
    });
  });
});
