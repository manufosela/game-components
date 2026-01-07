import { html, fixture, expect, oneEvent } from '@open-wc/testing';
import '../src/board-layer.js';

describe('BoardLayer', () => {
  describe('Initialization', () => {
    it('should create element with default properties', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      expect(el.width).to.equal(800);
      expect(el.height).to.equal(600);
      expect(el.gridSize).to.equal(0);
      expect(el.showGrid).to.equal(false);
      expect(el.layers).to.deep.equal([]);
      expect(el.debug).to.equal(false);
      expect(el.autoClear).to.equal(false);
    });

    it('should accept custom properties', async () => {
      const el = await fixture(html`
        <board-layer
          width="1024"
          height="768"
          grid-size="32"
          show-grid
          debug
          auto-clear
        ></board-layer>
      `);

      expect(el.width).to.equal(1024);
      expect(el.height).to.equal(768);
      expect(el.gridSize).to.equal(32);
      expect(el.showGrid).to.equal(true);
      expect(el.debug).to.equal(true);
      expect(el.autoClear).to.equal(true);
    });

    it('should have board container', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      const container = el.shadowRoot.querySelector('.board-container');

      expect(container).to.exist;
    });
  });

  describe('Layer Management', () => {
    it('should add a layer', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      const layer = el.addLayer({ name: 'background', zIndex: 0 });

      expect(layer).to.exist;
      expect(layer.name).to.equal('background');
      expect(el.getLayerCount()).to.equal(1);
    });

    it('should dispatch layer-add event', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      setTimeout(() => el.addLayer({ name: 'test' }));
      const { detail } = await oneEvent(el, 'layer-add');

      expect(detail.name).to.equal('test');
      expect(detail.totalLayers).to.equal(1);
    });

    it('should remove a layer', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'test' });
      expect(el.getLayerCount()).to.equal(1);

      const removed = el.removeLayer('test');

      expect(removed).to.equal(true);
      expect(el.getLayerCount()).to.equal(0);
    });

    it('should dispatch layer-remove event', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'test' });

      setTimeout(() => el.removeLayer('test'));
      const { detail } = await oneEvent(el, 'layer-remove');

      expect(detail.name).to.equal('test');
    });

    it('should return false when removing non-existent layer', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      const removed = el.removeLayer('nonexistent');

      expect(removed).to.equal(false);
    });

    it('should get layer by name', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'sprites', zIndex: 10 });

      const layer = el.getLayer('sprites');

      expect(layer).to.exist;
      expect(layer.name).to.equal('sprites');
      expect(layer.zIndex).to.equal(10);
    });

    it('should return null for non-existent layer', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      const layer = el.getLayer('nonexistent');

      expect(layer).to.be.null;
    });

    it('should get layer by index', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'background', zIndex: 0 });
      el.addLayer({ name: 'sprites', zIndex: 10 });
      el.addLayer({ name: 'ui', zIndex: 20 });

      const first = el.getLayerByIndex(0);
      const last = el.getLayerByIndex(2);

      expect(first.name).to.equal('background');
      expect(last.name).to.equal('ui');
    });

    it('should get layer names', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'layer1' });
      el.addLayer({ name: 'layer2' });

      const names = el.getLayerNames();

      expect(names).to.include('layer1');
      expect(names).to.include('layer2');
    });

    it('should not duplicate layers with same name', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'test' });
      el.addLayer({ name: 'test' });

      expect(el.getLayerCount()).to.equal(1);
    });
  });

  describe('Layer Configuration', () => {
    it('should create layers from initial config', async () => {
      const layers = [
        { name: 'background', zIndex: 0 },
        { name: 'sprites', zIndex: 10 }
      ];

      const el = await fixture(html`
        <board-layer .layers=${layers}></board-layer>
      `);

      expect(el.getLayerCount()).to.equal(2);
      expect(el.getLayer('background')).to.exist;
      expect(el.getLayer('sprites')).to.exist;
    });

    it('should respect layer z-index order', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'top', zIndex: 100 });
      el.addLayer({ name: 'bottom', zIndex: 0 });
      el.addLayer({ name: 'middle', zIndex: 50 });

      const first = el.getLayerByIndex(0);
      const second = el.getLayerByIndex(1);
      const third = el.getLayerByIndex(2);

      expect(first.name).to.equal('bottom');
      expect(second.name).to.equal('middle');
      expect(third.name).to.equal('top');
    });

    it('should apply layer opacity', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'test', opacity: 0.5 });

      const layer = el.getLayer('test');

      expect(layer.opacity).to.equal(0.5);
      expect(layer.canvas.style.opacity).to.equal('0.5');
    });

    it('should apply layer visibility', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'hidden', visible: false });

      const layer = el.getLayer('hidden');

      expect(layer.visible).to.equal(false);
      expect(layer.canvas.classList.contains('hidden')).to.equal(true);
    });
  });

  describe('Layer Modification', () => {
    it('should set layer visibility', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'test' });
      el.setLayerVisibility('test', false);

      const layer = el.getLayer('test');

      expect(layer.visible).to.equal(false);
    });

    it('should dispatch layer-change event on visibility change', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'test' });

      setTimeout(() => el.setLayerVisibility('test', false));
      const { detail } = await oneEvent(el, 'layer-change');

      expect(detail.property).to.equal('visible');
      expect(detail.value).to.equal(false);
    });

    it('should set layer opacity', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'test' });
      el.setLayerOpacity('test', 0.7);

      const layer = el.getLayer('test');

      expect(layer.opacity).to.equal(0.7);
    });

    it('should clamp opacity between 0 and 1', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'test' });

      el.setLayerOpacity('test', 2);
      expect(el.getLayer('test').opacity).to.equal(1);

      el.setLayerOpacity('test', -1);
      expect(el.getLayer('test').opacity).to.equal(0);
    });

    it('should set layer blend mode', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'test' });
      el.setLayerBlendMode('test', 'multiply');

      const layer = el.getLayer('test');

      expect(layer.blendMode).to.equal('multiply');
    });

    it('should set layer z-index', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'test', zIndex: 0 });
      el.setLayerZIndex('test', 50);

      const layer = el.getLayer('test');

      expect(layer.zIndex).to.equal(50);
    });
  });

  describe('Canvas Operations', () => {
    it('should get rendering context', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'test' });
      const ctx = el.getContext('test');

      expect(ctx).to.exist;
      expect(ctx).to.be.instanceOf(CanvasRenderingContext2D);
    });

    it('should return null for non-existent layer context', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      const ctx = el.getContext('nonexistent');

      expect(ctx).to.be.null;
    });

    it('should clear a specific layer', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'test' });
      const ctx = el.getContext('test');

      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 100, 100);

      // Should not throw
      el.clearLayer('test');
    });

    it('should clear all layers', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'layer1' });
      el.addLayer({ name: 'layer2' });

      // Should not throw
      el.clear();
    });

    it('should render to layer with callback', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'test' });

      let callbackCalled = false;
      el.renderToLayer('test', (ctx, width, height) => {
        callbackCalled = true;
        expect(ctx).to.be.instanceOf(CanvasRenderingContext2D);
        expect(width).to.equal(800);
        expect(height).to.equal(600);
      });

      expect(callbackCalled).to.equal(true);
    });
  });

  describe('Drawing Helpers', () => {
    it('should draw rectangle', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'test' });

      // Should not throw
      el.drawRect('test', 10, 10, 50, 50, 'red');
    });

    it('should draw circle', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      el.addLayer({ name: 'test' });

      // Should not throw
      el.drawCircle('test', 100, 100, 25, 'blue');
    });
  });

  describe('Grid Operations', () => {
    it('should convert grid to pixel coordinates', async () => {
      const el = await fixture(html`
        <board-layer grid-size="32"></board-layer>
      `);

      const pixel = el.gridToPixel(3, 5);

      expect(pixel.x).to.equal(96); // 3 * 32
      expect(pixel.y).to.equal(160); // 5 * 32
    });

    it('should convert pixel to grid coordinates', async () => {
      const el = await fixture(html`
        <board-layer grid-size="32"></board-layer>
      `);

      const grid = el.pixelToGrid(100, 200);

      expect(grid.x).to.equal(3); // floor(100/32)
      expect(grid.y).to.equal(6); // floor(200/32)
    });

    it('should get grid dimensions', async () => {
      const el = await fixture(html`
        <board-layer width="320" height="240" grid-size="32"></board-layer>
      `);

      const dims = el.getGridDimensions();

      expect(dims.cols).to.equal(10); // 320/32
      expect(dims.rows).to.equal(7); // floor(240/32)
    });

    it('should return zero dimensions when grid disabled', async () => {
      const el = await fixture(html`
        <board-layer grid-size="0"></board-layer>
      `);

      const dims = el.getGridDimensions();

      expect(dims.cols).to.equal(0);
      expect(dims.rows).to.equal(0);
    });

    it('should show grid overlay when enabled', async () => {
      const el = await fixture(html`
        <board-layer show-grid grid-size="32"></board-layer>
      `);

      const gridCanvas = el.shadowRoot.querySelector('.grid-overlay');

      expect(gridCanvas).to.exist;
      expect(gridCanvas.style.display).to.not.equal('none');
    });
  });

  describe('Debug Panel', () => {
    it('should show debug panel when enabled', async () => {
      const el = await fixture(html`<board-layer debug></board-layer>`);

      const panel = el.shadowRoot.querySelector('.debug-panel');

      expect(panel).to.exist;
    });

    it('should not show debug panel when disabled', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      const panel = el.shadowRoot.querySelector('.debug-panel');

      expect(panel).to.be.null;
    });

    it('should display layer info in debug panel', async () => {
      const el = await fixture(html`<board-layer debug></board-layer>`);

      el.addLayer({ name: 'testLayer' });
      await el.updateComplete;

      const panel = el.shadowRoot.querySelector('.debug-panel');

      expect(panel.textContent).to.contain('testLayer');
    });
  });

  describe('Resize Handling', () => {
    it('should resize layers when dimensions change', async () => {
      const el = await fixture(html`<board-layer width="400" height="300"></board-layer>`);

      el.addLayer({ name: 'test' });

      el.width = 800;
      el.height = 600;
      await el.updateComplete;

      const layer = el.getLayer('test');

      expect(layer.canvas.width).to.equal(800);
      expect(layer.canvas.height).to.equal(600);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible structure', async () => {
      const el = await fixture(html`<board-layer></board-layer>`);

      await expect(el).to.be.accessible();
    });
  });
});
