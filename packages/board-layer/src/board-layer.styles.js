import { css } from 'lit';

/**
 * Styles for the BoardLayer component
 * @type {import('lit').CSSResult}
 */
export const styles = css`
  :host {
    display: block;
    position: relative;
    overflow: hidden;
    background: var(--board-layer-bg, #1a1a2e);
    border: var(--board-layer-border, 2px solid #4a90d9);
    border-radius: var(--board-layer-border-radius, 8px);
  }

  .board-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .layer {
    position: absolute;
    top: 0;
    left: 0;
    image-rendering: var(--board-layer-image-rendering, pixelated);
  }

  .layer.hidden {
    display: none;
  }

  .grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  /* Debug info panel */
  .debug-panel {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 10px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 10px;
    z-index: 1000;
    pointer-events: none;
  }

  .debug-panel p {
    margin: 3px 0;
  }

  .debug-panel .layer-info {
    padding-left: 10px;
    border-left: 2px solid #4a90d9;
    margin: 5px 0;
  }

  /* CSS Custom Properties */
  :host {
    --board-layer-bg: #1a1a2e;
    --board-layer-border: 2px solid #4a90d9;
    --board-layer-border-radius: 8px;
    --board-layer-grid-color: rgba(255, 255, 255, 0.1);
    --board-layer-image-rendering: pixelated;
  }
`;
