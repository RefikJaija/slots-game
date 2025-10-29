// jest.mock for howler
jest.mock('howler', () => {
  return {
    Howl: class {
      _src: any;
      _volume = 1;
      constructor(opts: any) { this._src = opts.src; }
      play() { return 1; }
      stop() {}
      unload() {}
      fade() {}
      volume(v?: number) { if (v === undefined) return this._volume; this._volume = v; }
      duration() { return 0.5; }
      loop(_flag?: boolean) {}
    }
  };
});

import { sound } from '../utils/sound';

describe('sound wrapper', () => {
  test('add and play works', () => {
    sound.add('test', 'assets/sounds/test.webm');
    const id = sound.play('test');
    expect(typeof id === 'number' || id === undefined).toBeTruthy();
  });

  test('stop unloads gracefully', () => {
    sound.add('s', 'assets/sounds/s.webm');
    expect(() => sound.stop('s')).not.toThrow();
    expect(() => sound.unload('s')).not.toThrow();
  });
});
