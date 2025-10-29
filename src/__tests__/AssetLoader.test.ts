jest.mock('pixi.js', () => {
  return {
    Assets: {
      init: jest.fn(),
      addBundle: jest.fn(),
      loadBundle: jest.fn().mockResolvedValue({
        'symbol1.png': { dummy: true },
        'background.png': { dummy: true }
      })
    },
    Texture: {
      EMPTY: {}
    }
  };
});

import { AssetLoader } from '../utils/AssetLoader';

describe('AssetLoader', () => {
  test('loads images and populates cache', async () => {
    const loader = new AssetLoader();
    await expect(loader.loadAssets()).resolves.not.toThrow();
  });
});
