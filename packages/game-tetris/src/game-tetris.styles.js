import { css } from 'lit';

/**
 * Styles for the GameTetris component
 * @type {import('lit').CSSResult}
 */
export const styles = css`
  :host {
    display: inline-block;
    font-family: var(--game-tetris-font-family, 'Press Start 2P', 'Courier New', monospace);
    user-select: none;
  }

  .game-container {
    display: flex;
    gap: var(--game-tetris-gap, 20px);
    background: var(--game-tetris-bg, #1a1a2e);
    padding: var(--game-tetris-padding, 20px);
    border-radius: var(--game-tetris-border-radius, 12px);
    box-shadow: var(--game-tetris-shadow, 0 10px 40px rgba(0, 0, 0, 0.5));
  }

  .game-board {
    position: relative;
  }

  canvas {
    display: block;
    border: var(--game-tetris-board-border, 3px solid #4a90d9);
    border-radius: var(--game-tetris-board-radius, 4px);
    background: var(--game-tetris-board-bg, #0f0f1a);
  }

  .side-panel {
    display: flex;
    flex-direction: column;
    gap: 15px;
    min-width: 150px;
  }

  .panel-section {
    background: var(--game-tetris-panel-bg, #16213e);
    padding: 15px;
    border-radius: 8px;
    border: 1px solid var(--game-tetris-panel-border, #333);
  }

  .panel-section h3 {
    margin: 0 0 10px 0;
    font-size: 10px;
    color: var(--game-tetris-label-color, #4a90d9);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .score-value {
    font-size: 18px;
    color: var(--game-tetris-score-color, #fff);
    font-weight: bold;
  }

  .next-piece canvas {
    display: block;
    background: var(--game-tetris-preview-bg, #0f0f1a);
    border: 1px solid var(--game-tetris-preview-border, #333);
    border-radius: 4px;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    z-index: 10;
  }

  .overlay h2 {
    color: var(--game-tetris-overlay-title-color, #4a90d9);
    font-size: 20px;
    margin: 0 0 20px 0;
    text-align: center;
  }

  .overlay p {
    color: var(--game-tetris-overlay-text-color, #aaa);
    font-size: 10px;
    margin: 5px 0;
    text-align: center;
  }

  .overlay .final-score {
    color: var(--game-tetris-final-score-color, #f39c12);
    font-size: 24px;
    margin: 15px 0;
  }

  .overlay button {
    margin-top: 20px;
    padding: 12px 24px;
    font-size: 12px;
    font-family: inherit;
    background: var(--game-tetris-button-bg, #4a90d9);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
  }

  .overlay button:hover {
    background: var(--game-tetris-button-hover-bg, #357abd);
  }

  .overlay button:active {
    transform: scale(0.95);
  }

  .controls-hint {
    font-size: 8px;
    color: var(--game-tetris-hint-color, #666);
    line-height: 1.8;
  }

  .controls-hint kbd {
    background: var(--game-tetris-kbd-bg, #0f0f1a);
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid var(--game-tetris-kbd-border, #333);
    font-family: inherit;
  }

  /* Level colors */
  .level-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .level-bar {
    flex: 1;
    height: 8px;
    background: var(--game-tetris-level-bar-bg, #0f0f1a);
    border-radius: 4px;
    overflow: hidden;
  }

  .level-progress {
    height: 100%;
    background: var(--game-tetris-level-progress, #4a90d9);
    transition: width 0.3s ease;
  }

  /* CSS Custom Properties */
  :host {
    --game-tetris-font-family: 'Courier New', monospace;
    --game-tetris-bg: #1a1a2e;
    --game-tetris-gap: 20px;
    --game-tetris-padding: 20px;
    --game-tetris-border-radius: 12px;
    --game-tetris-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    --game-tetris-board-border: 3px solid #4a90d9;
    --game-tetris-board-radius: 4px;
    --game-tetris-board-bg: #0f0f1a;
    --game-tetris-panel-bg: #16213e;
    --game-tetris-panel-border: #333;
    --game-tetris-label-color: #4a90d9;
    --game-tetris-score-color: #fff;
    --game-tetris-preview-bg: #0f0f1a;
    --game-tetris-preview-border: #333;
    --game-tetris-overlay-title-color: #4a90d9;
    --game-tetris-overlay-text-color: #aaa;
    --game-tetris-final-score-color: #f39c12;
    --game-tetris-button-bg: #4a90d9;
    --game-tetris-button-hover-bg: #357abd;
    --game-tetris-hint-color: #666;
    --game-tetris-kbd-bg: #0f0f1a;
    --game-tetris-kbd-border: #333;
    --game-tetris-level-bar-bg: #0f0f1a;
    --game-tetris-level-progress: #4a90d9;
  }
`;
