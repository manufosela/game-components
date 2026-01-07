import { html, fixture, expect, oneEvent } from '@open-wc/testing';
import '../src/living-wccell.js';
import { CellularRules } from '../src/living-wccell.js';

describe('LivingWccell', () => {
  describe('Initialization', () => {
    it('should create element with default properties', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);

      expect(el.alive).to.equal(false);
      expect(el.x).to.equal(0);
      expect(el.y).to.equal(0);
      expect(el.generation).to.equal(0);
      expect(el.age).to.equal(0);
      expect(el.neighborCount).to.equal(0);
    });

    it('should accept custom properties', async () => {
      const el = await fixture(html`
        <living-wccell
          alive
          x="5"
          y="10"
          generation="3"
          cell-id="cell-5-10"
        ></living-wccell>
      `);

      expect(el.alive).to.equal(true);
      expect(el.x).to.equal(5);
      expect(el.y).to.equal(10);
      expect(el.generation).to.equal(3);
      expect(el.cellId).to.equal('cell-5-10');
    });

    it('should have default Conway rules', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);

      expect(el.rules.birth).to.deep.equal([3]);
      expect(el.rules.survival).to.deep.equal([2, 3]);
    });
  });

  describe('State Management', () => {
    it('should toggle state', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);

      expect(el.alive).to.equal(false);
      el.toggle();
      expect(el.alive).to.equal(true);
      el.toggle();
      expect(el.alive).to.equal(false);
    });

    it('should set alive state', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);

      el.setAlive(true);
      expect(el.alive).to.equal(true);
      expect(el.age).to.equal(1);

      el.setAlive(false);
      expect(el.alive).to.equal(false);
      expect(el.age).to.equal(0);
    });

    it('should reset cell', async () => {
      const el = await fixture(html`
        <living-wccell alive generation="5"></living-wccell>
      `);

      el.age = 3;
      el.neighborCount = 4;

      el.reset();

      expect(el.alive).to.equal(false);
      expect(el.age).to.equal(0);
      expect(el.generation).to.equal(0);
      expect(el.neighborCount).to.equal(0);
    });

    it('should return state information', async () => {
      const el = await fixture(html`
        <living-wccell alive x="3" y="7" generation="2"></living-wccell>
      `);
      el.age = 5;

      const state = el.getState();

      expect(state.alive).to.equal(true);
      expect(state.x).to.equal(3);
      expect(state.y).to.equal(7);
      expect(state.generation).to.equal(2);
      expect(state.age).to.equal(5);
    });
  });

  describe('Conway Rules', () => {
    it('should die with fewer than 2 neighbors (underpopulation)', async () => {
      const el = await fixture(html`<living-wccell alive></living-wccell>`);

      el.calculateNextState(1);
      el.applyNextState();

      expect(el.alive).to.equal(false);
    });

    it('should survive with 2 neighbors', async () => {
      const el = await fixture(html`<living-wccell alive></living-wccell>`);

      el.calculateNextState(2);
      el.applyNextState();

      expect(el.alive).to.equal(true);
    });

    it('should survive with 3 neighbors', async () => {
      const el = await fixture(html`<living-wccell alive></living-wccell>`);

      el.calculateNextState(3);
      el.applyNextState();

      expect(el.alive).to.equal(true);
    });

    it('should die with more than 3 neighbors (overpopulation)', async () => {
      const el = await fixture(html`<living-wccell alive></living-wccell>`);

      el.calculateNextState(4);
      el.applyNextState();

      expect(el.alive).to.equal(false);
    });

    it('should birth with exactly 3 neighbors', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);

      el.calculateNextState(3);
      el.applyNextState();

      expect(el.alive).to.equal(true);
    });

    it('should stay dead without exactly 3 neighbors', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);

      el.calculateNextState(2);
      el.applyNextState();

      expect(el.alive).to.equal(false);
    });
  });

  describe('Custom Rules', () => {
    it('should accept custom rules via setRules', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);

      el.setRules([2, 3], [1, 2]);

      expect(el.rules.birth).to.deep.equal([2, 3]);
      expect(el.rules.survival).to.deep.equal([1, 2]);
    });

    it('should apply HighLife rules correctly', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);
      el.rules = CellularRules.HIGHLIFE;

      // HighLife has B36/S23 - birth with 3 OR 6 neighbors
      el.calculateNextState(6);
      el.applyNextState();

      expect(el.alive).to.equal(true);
    });

    it('should apply Seeds rules correctly', async () => {
      const el = await fixture(html`<living-wccell alive></living-wccell>`);
      el.rules = CellularRules.SEEDS;

      // Seeds has B2/S - no survival rules, all alive cells die
      el.calculateNextState(2);
      el.applyNextState();

      expect(el.alive).to.equal(false);
    });
  });

  describe('Age Tracking', () => {
    it('should track age when cell stays alive', async () => {
      const el = await fixture(html`<living-wccell alive></living-wccell>`);
      el.age = 1;

      el.calculateNextState(2);
      el.applyNextState();

      expect(el.age).to.equal(2);
    });

    it('should reset age when cell dies', async () => {
      const el = await fixture(html`<living-wccell alive></living-wccell>`);
      el.age = 5;

      el.calculateNextState(0);
      el.applyNextState();

      expect(el.age).to.equal(0);
    });

    it('should start age at 1 when cell is born', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);

      el.calculateNextState(3);
      el.applyNextState();

      expect(el.age).to.equal(1);
    });
  });

  describe('Events', () => {
    it('should dispatch state-change event when toggled', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);

      setTimeout(() => el.toggle());
      const { detail } = await oneEvent(el, 'state-change');

      expect(detail.alive).to.equal(true);
      expect(detail.previousAlive).to.equal(false);
    });

    it('should dispatch cell-click event when clicked', async () => {
      const el = await fixture(html`<living-wccell x="5" y="3"></living-wccell>`);
      const cell = el.shadowRoot.querySelector('.cell');

      setTimeout(() => cell.click());
      const { detail } = await oneEvent(el, 'cell-click');

      expect(detail.x).to.equal(5);
      expect(detail.y).to.equal(3);
      expect(detail.alive).to.equal(true);
    });

    it('should dispatch generation-update event', async () => {
      const el = await fixture(html`<living-wccell alive></living-wccell>`);

      setTimeout(() => el.updateGeneration(5));
      const { detail } = await oneEvent(el, 'generation-update');

      expect(detail.generation).to.equal(5);
      expect(detail.previousGeneration).to.equal(0);
    });

    it('should dispatch state-change when applying next state', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);
      el.calculateNextState(3);

      setTimeout(() => el.applyNextState());
      const { detail } = await oneEvent(el, 'state-change');

      expect(detail.alive).to.equal(true);
    });
  });

  describe('Click Interaction', () => {
    it('should toggle on click', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);
      const cell = el.shadowRoot.querySelector('.cell');

      cell.click();
      expect(el.alive).to.equal(true);

      cell.click();
      expect(el.alive).to.equal(false);
    });

    it('should toggle on Enter key', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);
      const cell = el.shadowRoot.querySelector('.cell');

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      cell.dispatchEvent(event);

      expect(el.alive).to.equal(true);
    });

    it('should toggle on Space key', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);
      const cell = el.shadowRoot.querySelector('.cell');

      const event = new KeyboardEvent('keydown', { key: ' ' });
      cell.dispatchEvent(event);

      expect(el.alive).to.equal(true);
    });
  });

  describe('Accessibility', () => {
    it('should have tabindex', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);

      expect(el.getAttribute('tabindex')).to.equal('0');
    });

    it('should have role gridcell', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);

      expect(el.getAttribute('role')).to.equal('gridcell');
    });

    it('should have aria-label with position', async () => {
      const el = await fixture(html`<living-wccell x="3" y="5"></living-wccell>`);

      expect(el.getAttribute('aria-label')).to.contain('3');
      expect(el.getAttribute('aria-label')).to.contain('5');
    });

    it('should update aria-label when state changes', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);

      expect(el.getAttribute('aria-label')).to.contain('dead');

      el.alive = true;
      await el.updateComplete;

      expect(el.getAttribute('aria-label')).to.contain('alive');
    });

    it('should pass accessibility audit', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);

      await expect(el).to.be.accessible();
    });
  });

  describe('Visual State', () => {
    it('should have dead class when dead', async () => {
      const el = await fixture(html`<living-wccell></living-wccell>`);
      const cell = el.shadowRoot.querySelector('.cell');

      expect(cell.classList.contains('dead')).to.equal(true);
      expect(cell.classList.contains('alive')).to.equal(false);
    });

    it('should have alive class when alive', async () => {
      const el = await fixture(html`<living-wccell alive></living-wccell>`);
      const cell = el.shadowRoot.querySelector('.cell');

      expect(cell.classList.contains('alive')).to.equal(true);
      expect(cell.classList.contains('dead')).to.equal(false);
    });

    it('should show generation indicator when enabled', async () => {
      const el = await fixture(html`
        <living-wccell alive show-generation></living-wccell>
      `);
      el.age = 3;
      await el.updateComplete;

      const indicator = el.shadowRoot.querySelector('.generation-indicator');

      expect(indicator).to.exist;
      expect(indicator.textContent).to.equal('3');
    });
  });

  describe('CellularRules Presets', () => {
    it('should export Conway rules', () => {
      expect(CellularRules.CONWAY).to.deep.equal({
        birth: [3],
        survival: [2, 3]
      });
    });

    it('should export HighLife rules', () => {
      expect(CellularRules.HIGHLIFE).to.deep.equal({
        birth: [3, 6],
        survival: [2, 3]
      });
    });

    it('should export Day & Night rules', () => {
      expect(CellularRules.DAY_AND_NIGHT).to.deep.equal({
        birth: [3, 6, 7, 8],
        survival: [3, 4, 6, 7, 8]
      });
    });

    it('should export Seeds rules', () => {
      expect(CellularRules.SEEDS).to.deep.equal({
        birth: [2],
        survival: []
      });
    });
  });
});
