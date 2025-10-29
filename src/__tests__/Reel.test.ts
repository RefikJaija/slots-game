/**
 * Unit tests for src/slots/Reel.ts
 *
 * These tests mock a tiny subset of PIXI.Sprite/Texture and AssetLoader.getTexture
 * so they run in Node without a browser or real PIXI.
 */

jest.mock('pixi.js', () => {
  // Minimal mocked PIXI
  class Texture {
    static EMPTY = new Texture('__EMPTY__');
    name: string;
    constructor(name = '__TEXTURE__') { this.name = name; }
  }

  class Sprite {
    texture: any;
    x: number;
    y: number;
    width: number;
    height: number;
    _anchor: { x: number; y: number; };
    constructor(texture?: any) {
      this.texture = texture ?? Texture.EMPTY;
      this.x = 0;
      this.y = 0;
      this.width = 0;
      this.height = 0;
      this._anchor = { x: 0, y: 0 };
    }
    anchor = {
      set: (x: number, y?: number) => { this._anchor.x = x; this._anchor.y = y ?? x; }
    };
  }

  class Container {
    children: any[] = [];
    addChild(c: any) { this.children.push(c); }
    removeChildren() { this.children = []; }
  }

  return {
    __esModule: true,
    Texture,
    Sprite,
    Container,
  };
});

jest.mock('../utils/AssetLoader', () => ({
  AssetLoader: {
    getTexture: (name: string) => {
      // return a mock texture object (we don't use internals)
      return { mockedTextureName: name };
    }
  }
}));

import { Reel } from '../slots/Reel';
import { Sprite } from 'pixi.js';

describe('Reel', () => {
  const SYMBOL_SIZE = 100;
  const SYMBOL_COUNT = 5;

  test('snapToGrid aligns sprites to exact multiples of symbolSize', () => {
    const reel = new Reel(SYMBOL_COUNT, SYMBOL_SIZE);
    // access private symbols via casting to any
    const internal = reel as any;
    expect(internal.symbols).toBeDefined();
    const symbols: Sprite[] = internal.symbols;

    // set arbitrary x positions (not aligned)
    symbols.forEach((s, i) => {
      s.x = i * SYMBOL_SIZE + (i % 2 === 0 ? 7 : -13); // offsets
    });

    // call private method snapToGrid
    internal.snapToGrid();

    // after snapping, expect positions to be exactly multiples of SYMBOL_SIZE starting at 0
    const xs = symbols.map(s => s.x);
    const expected = xs.map((_, i) => i * SYMBOL_SIZE);
    expect(xs).toEqual(expected);
  });

  test('update wraps a symbol that moves off the left to the rightmost position and assigns new texture', () => {
    const reel = new Reel(SYMBOL_COUNT, SYMBOL_SIZE);
    const internal = reel as any;
    const symbols: Sprite[] = internal.symbols;

    // Arrange: place symbols such that one is just within left edge, one is beyond left edge
    // We'll move with speed > 0 so update will subtract from x
    // set speed and isSpinning so movement happens
    internal.isSpinning = true;
    internal.speed = 20; // px per delta (unit test delta we'll pass = 1)

    // set positions: make first sprite fully off left (x + size <= 0)
    symbols[0].x = -SYMBOL_SIZE - 1; // off left
    // set others spaced normally
    for (let i = 1; i < symbols.length; i++) {
      symbols[i].x = i * SYMBOL_SIZE;
    }

    // compute current maxX
    const maxBefore = Math.max(...symbols.map(s => s.x));

    // call update with delta=1
    internal.update(1);

    // After update, off-left symbol should have been wrapped to right of previous max
    const xsAfter = symbols.map(s => s.x);
    const maxAfter = Math.max(...xsAfter);
    // Expect a sprite that was off-left to have been moved to the right side
    // i.e. there should now exist a sprite whose x is greater than the previous maxBefore
    const wrappedSprite = symbols.find(s => s.x > maxBefore + 0.0001);
    expect(wrappedSprite).toBeDefined();

    // Also ensure that the wrapped sprite's texture was updated (AssetLoader mock returns object with mockedTextureName)
    expect((wrappedSprite as any).texture).toBeDefined();
    expect((wrappedSprite as any).texture.mockedTextureName).toBeDefined();


    // Also expect textures have been updated (AssetLoader mock returns object with name)
    // Because createRandomSymbol sets texture using AssetLoader.getTexture(name)
    // After wrapping the texture is updated (we check it's an object with mockedTextureName property)
    expect((wrappedSprite as any).texture).toBeDefined();
    expect((wrappedSprite as any).texture.mockedTextureName).toBeDefined();
  });

  test('startSpin and stopSpin change speed and stop eventually triggers snapToGrid when slow', () => {
    const reel = new Reel(SYMBOL_COUNT, SYMBOL_SIZE);
    const internal = reel as any;
    // Start spin
    internal.startSpin();
    expect(internal.isSpinning).toBe(true);
    expect(internal.speed).toBeGreaterThan(0);

    // Stop spin - this will set isSpinning false but speed remains and decays in update
    internal.stopSpin();
    expect(internal.isSpinning).toBe(false);

    // Simulate multiple update calls until speed falls below threshold (<0.5)
    // We call update with delta=1 repeatedly
    let iterations = 0;
    while (internal.speed > 0 && iterations < 200) {
      internal.update(1);
      iterations++;
    }

    expect(internal.speed).toBe(0);
    // At the end, symbols should be snapped to exact grid
    const xs = (internal.symbols as Sprite[]).map((s: Sprite, i: number) => s.x);
    const expected = xs.map((_, i) => i * SYMBOL_SIZE);
    expect(xs).toEqual(expected);
  });
});
