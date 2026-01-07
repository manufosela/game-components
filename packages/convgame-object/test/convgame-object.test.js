import { html, fixture, expect, aTimeout } from '@open-wc/testing';
import '../src/convgame-object.js';

describe('ConvgameObject', () => {
  describe('Initialization', () => {
    it('should create element with default properties', async () => {
      const el = await fixture(html`<convgame-object></convgame-object>`);

      expect(el.x).to.equal(0);
      expect(el.y).to.equal(0);
      expect(el.width).to.equal(50);
      expect(el.height).to.equal(50);
      expect(el.velocityX).to.equal(0);
      expect(el.velocityY).to.equal(0);
      expect(el.mass).to.equal(1);
      expect(el.friction).to.equal(0.98);
      expect(el.restitution).to.equal(0.8);
      expect(el.isStatic).to.equal(false);
    });

    it('should accept custom properties', async () => {
      const el = await fixture(html`
        <convgame-object
          x="100"
          y="200"
          width="80"
          height="60"
          velocity-x="5"
          velocity-y="-3"
          mass="2"
          friction="0.95"
        ></convgame-object>
      `);

      expect(el.x).to.equal(100);
      expect(el.y).to.equal(200);
      expect(el.width).to.equal(80);
      expect(el.height).to.equal(60);
      expect(el.velocityX).to.equal(5);
      expect(el.velocityY).to.equal(-3);
      expect(el.mass).to.equal(2);
      expect(el.friction).to.equal(0.95);
    });

    it('should have a canvas element in shadow DOM', async () => {
      const el = await fixture(html`<convgame-object></convgame-object>`);
      const canvas = el.shadowRoot.querySelector('canvas');

      expect(canvas).to.exist;
    });
  });

  describe('Bounding Box', () => {
    it('should return correct bounding box', async () => {
      const el = await fixture(html`
        <convgame-object x="10" y="20" width="100" height="50"></convgame-object>
      `);

      const box = el.getBoundingBox();

      expect(box.x).to.equal(10);
      expect(box.y).to.equal(20);
      expect(box.width).to.equal(100);
      expect(box.height).to.equal(50);
    });

    it('should return correct center point', async () => {
      const el = await fixture(html`
        <convgame-object x="0" y="0" width="100" height="100"></convgame-object>
      `);

      const center = el.getCenter();

      expect(center.x).to.equal(50);
      expect(center.y).to.equal(50);
    });
  });

  describe('Physics Update', () => {
    it('should update position based on velocity', async () => {
      const el = await fixture(html`
        <convgame-object x="0" y="0" velocity-x="10" velocity-y="5" friction="1"></convgame-object>
      `);

      el.update();

      expect(el.x).to.equal(10);
      expect(el.y).to.equal(5);
    });

    it('should apply friction to velocity', async () => {
      const el = await fixture(html`
        <convgame-object velocity-x="10" velocity-y="10" friction="0.5"></convgame-object>
      `);

      el.update();

      expect(el.velocityX).to.equal(5);
      expect(el.velocityY).to.equal(5);
    });

    it('should not update static objects', async () => {
      const el = await fixture(html`
        <convgame-object x="50" y="50" velocity-x="10" velocity-y="10" is-static></convgame-object>
      `);

      el.update();

      expect(el.x).to.equal(50);
      expect(el.y).to.equal(50);
    });

    it('should dispatch position-change event on update', async () => {
      const el = await fixture(html`
        <convgame-object velocity-x="5" velocity-y="5" friction="1"></convgame-object>
      `);

      let eventFired = false;
      el.addEventListener('position-change', (e) => {
        eventFired = true;
        expect(e.detail.x).to.equal(5);
        expect(e.detail.y).to.equal(5);
      });

      el.update();

      expect(eventFired).to.be.true;
    });
  });

  describe('Force Application', () => {
    it('should apply force correctly', async () => {
      const el = await fixture(html`
        <convgame-object mass="2" friction="1"></convgame-object>
      `);

      el.applyForce(10, 20);
      el.update();

      // F = ma, so a = F/m = 10/2 = 5 and 20/2 = 10
      expect(el.velocityX).to.equal(5);
      expect(el.velocityY).to.equal(10);
    });

    it('should apply impulse correctly', async () => {
      const el = await fixture(html`
        <convgame-object mass="2" friction="1"></convgame-object>
      `);

      el.applyImpulse(10, 20);

      // Impulse applies immediately
      expect(el.velocityX).to.equal(5);
      expect(el.velocityY).to.equal(10);
    });

    it('should not apply force to static objects', async () => {
      const el = await fixture(html`
        <convgame-object is-static></convgame-object>
      `);

      el.applyForce(100, 100);
      el.update();

      expect(el.velocityX).to.equal(0);
      expect(el.velocityY).to.equal(0);
    });
  });

  describe('Collision Detection', () => {
    it('should detect collision between overlapping objects', async () => {
      const el1 = await fixture(html`
        <convgame-object x="0" y="0" width="50" height="50"></convgame-object>
      `);
      const el2 = await fixture(html`
        <convgame-object x="25" y="25" width="50" height="50"></convgame-object>
      `);

      expect(el1.collidesWith(el2)).to.be.true;
    });

    it('should not detect collision for non-overlapping objects', async () => {
      const el1 = await fixture(html`
        <convgame-object x="0" y="0" width="50" height="50"></convgame-object>
      `);
      const el2 = await fixture(html`
        <convgame-object x="100" y="100" width="50" height="50"></convgame-object>
      `);

      expect(el1.collidesWith(el2)).to.be.false;
    });

    it('should dispatch collision event when collision detected', async () => {
      const el1 = await fixture(html`
        <convgame-object x="0" y="0" width="50" height="50"></convgame-object>
      `);
      const el2 = await fixture(html`
        <convgame-object x="25" y="25" width="50" height="50"></convgame-object>
      `);

      let eventFired = false;
      el1.addEventListener('collision', (e) => {
        eventFired = true;
        expect(e.detail.other).to.equal(el2);
      });

      el1.collidesWith(el2);

      expect(eventFired).to.be.true;
    });

    it('should return false when checking collision with null', async () => {
      const el = await fixture(html`<convgame-object></convgame-object>`);

      expect(el.collidesWith(null)).to.be.false;
    });
  });

  describe('Boundary Handling', () => {
    it('should bounce off left boundary', async () => {
      const el = await fixture(html`
        <convgame-object x="-10" y="50" velocity-x="-5" friction="1" restitution="1"></convgame-object>
      `);

      el.bounds = { minX: 0, maxX: 200, minY: 0, maxY: 200 };
      el.update();

      expect(el.x).to.be.at.least(0);
      expect(el.velocityX).to.be.above(0);
    });

    it('should dispatch boundary-hit event', async () => {
      const el = await fixture(html`
        <convgame-object x="-10" y="50" velocity-x="-5" friction="1"></convgame-object>
      `);

      el.bounds = { minX: 0, maxX: 200, minY: 0, maxY: 200 };

      let eventFired = false;
      el.addEventListener('boundary-hit', (e) => {
        eventFired = true;
        expect(e.detail.boundary).to.equal('left');
      });

      el.update();

      expect(eventFired).to.be.true;
    });
  });

  describe('Utility Methods', () => {
    it('should set position correctly', async () => {
      const el = await fixture(html`<convgame-object></convgame-object>`);

      el.setPosition(100, 200);

      expect(el.x).to.equal(100);
      expect(el.y).to.equal(200);
    });

    it('should set velocity correctly', async () => {
      const el = await fixture(html`<convgame-object></convgame-object>`);

      el.setVelocity(15, -10);

      expect(el.velocityX).to.equal(15);
      expect(el.velocityY).to.equal(-10);
    });

    it('should stop object correctly', async () => {
      const el = await fixture(html`
        <convgame-object velocity-x="50" velocity-y="50"></convgame-object>
      `);

      el.stop();

      expect(el.velocityX).to.equal(0);
      expect(el.velocityY).to.equal(0);
    });

    it('should calculate distance to another object', async () => {
      const el1 = await fixture(html`
        <convgame-object x="0" y="0" width="0" height="0"></convgame-object>
      `);
      const el2 = await fixture(html`
        <convgame-object x="30" y="40" width="0" height="0"></convgame-object>
      `);

      // Distance from (0,0) to (30,40) should be 50
      expect(el1.distanceTo(el2)).to.equal(50);
    });

    it('should calculate angle to another object', async () => {
      const el1 = await fixture(html`
        <convgame-object x="0" y="0" width="0" height="0"></convgame-object>
      `);
      const el2 = await fixture(html`
        <convgame-object x="100" y="0" width="0" height="0"></convgame-object>
      `);

      // Angle should be 0 (pointing right)
      expect(el1.angleTo(el2)).to.equal(0);
    });
  });

  describe('Debug Mode', () => {
    it('should show velocity indicator in debug mode', async () => {
      const el = await fixture(html`
        <convgame-object debug velocity-x="10" velocity-y="10"></convgame-object>
      `);

      const indicator = el.shadowRoot.querySelector('.velocity-indicator');

      expect(indicator).to.exist;
    });

    it('should not show velocity indicator when not in debug mode', async () => {
      const el = await fixture(html`
        <convgame-object velocity-x="10" velocity-y="10"></convgame-object>
      `);

      const indicator = el.shadowRoot.querySelector('.velocity-indicator');

      expect(indicator).to.be.null;
    });
  });

  describe('Accessibility', () => {
    it('should be accessible', async () => {
      const el = await fixture(html`<convgame-object></convgame-object>`);

      await expect(el).to.be.accessible();
    });
  });
});
