import { css } from 'lit';

/**
 * Styles for the LivingWccell component
 * @type {import('lit').CSSResult}
 */
export const styles = css`
  :host {
    display: inline-block;
    box-sizing: border-box;
    cursor: pointer;
    user-select: none;
    transition: transform var(--living-wccell-transition-duration, 0.1s) ease;
  }

  :host(:hover) {
    transform: scale(var(--living-wccell-hover-scale, 1.1));
  }

  :host(:focus) {
    outline: 2px solid var(--living-wccell-focus-color, #4a90d9);
    outline-offset: 2px;
  }

  .cell {
    width: var(--living-wccell-size, 20px);
    height: var(--living-wccell-size, 20px);
    border: var(--living-wccell-border-width, 1px) solid var(--living-wccell-border-color, #333);
    border-radius: var(--living-wccell-border-radius, 0);
    transition: background-color var(--living-wccell-transition-duration, 0.15s) ease,
                box-shadow var(--living-wccell-transition-duration, 0.15s) ease;
  }

  .cell.dead {
    background-color: var(--living-wccell-dead-color, #1a1a2e);
  }

  .cell.alive {
    background-color: var(--living-wccell-alive-color, #4a90d9);
    box-shadow: 0 0 var(--living-wccell-glow-size, 5px) var(--living-wccell-glow-color, rgba(74, 144, 217, 0.5));
  }

  /* Age-based coloring */
  .cell.alive.age-1 {
    background-color: var(--living-wccell-age1-color, #7ab8ff);
  }

  .cell.alive.age-2 {
    background-color: var(--living-wccell-age2-color, #4a90d9);
  }

  .cell.alive.age-3 {
    background-color: var(--living-wccell-age3-color, #2d5a8a);
  }

  .cell.alive.age-old {
    background-color: var(--living-wccell-age-old-color, #1a3555);
  }

  /* Generation indicator */
  .generation-indicator {
    position: absolute;
    font-size: 8px;
    color: var(--living-wccell-indicator-color, rgba(255, 255, 255, 0.7));
    pointer-events: none;
    bottom: 2px;
    right: 2px;
  }

  /* Custom properties documentation */
  :host {
    --living-wccell-size: 20px;
    --living-wccell-border-width: 1px;
    --living-wccell-border-color: #333;
    --living-wccell-border-radius: 0;
    --living-wccell-dead-color: #1a1a2e;
    --living-wccell-alive-color: #4a90d9;
    --living-wccell-glow-size: 5px;
    --living-wccell-glow-color: rgba(74, 144, 217, 0.5);
    --living-wccell-transition-duration: 0.15s;
    --living-wccell-hover-scale: 1.1;
    --living-wccell-focus-color: #4a90d9;
    --living-wccell-indicator-color: rgba(255, 255, 255, 0.7);
    --living-wccell-age1-color: #7ab8ff;
    --living-wccell-age2-color: #4a90d9;
    --living-wccell-age3-color: #2d5a8a;
    --living-wccell-age-old-color: #1a3555;
  }
`;
