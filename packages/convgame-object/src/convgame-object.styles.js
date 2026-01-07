import { css } from 'lit';

/**
 * Styles for the ConvgameObject component
 * @type {import('lit').CSSResult}
 */
export const styles = css`
  :host {
    display: block;
    position: absolute;
    box-sizing: border-box;
    pointer-events: none;
  }

  :host([debug]) {
    outline: 2px solid var(--convgame-object-debug-color, red);
    background-color: var(--convgame-object-debug-bg, rgba(255, 0, 0, 0.1));
  }

  .game-object {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .game-object canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  /* Velocity indicator for debug mode */
  .velocity-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: left center;
    height: 2px;
    background: var(--convgame-object-velocity-color, blue);
    pointer-events: none;
  }

  /* Custom properties for theming */
  :host {
    --convgame-object-debug-color: red;
    --convgame-object-debug-bg: rgba(255, 0, 0, 0.1);
    --convgame-object-velocity-color: blue;
    --convgame-object-border-radius: 0;
  }
`;
