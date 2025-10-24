// src/utils/sound.ts
import { Howl } from 'howler';

type HowlMap = Record<string, Howl>;

const _sounds: HowlMap = {};

export const sound = {
    /**
     * Add a new sound by alias and url (local path or remote).
     * Example: sound.add('Reel spin', 'assets/sounds/Reel spin.webm')
     */
    add: (alias: string, url: string): void => {
        try {
            // If alias already exists, unload old instance
            if (_sounds[alias]) {
                _sounds[alias].unload();
            }

            _sounds[alias] = new Howl({
                src: [url],
                preload: true,
            });
        } catch (err) {
            // If howler isn't available or fails, keep a no-op fallback
            // eslint-disable-next-line no-console
            console.warn(`Failed to register sound "${alias}" at ${url}`, err);
        }
    },

    play: (alias: string): void => {
        const h = _sounds[alias];
        if (!h) {
            // eslint-disable-next-line no-console
            console.warn(`Sound ${alias} not found. Did you call AssetLoader.loadAssets()?`);
            return;
        }
        try {
            h.stop(); // reset to start (optional)
            h.play();
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn(`Error playing sound ${alias}`, err);
        }
    },

    stop: (alias: string): void => {
        const h = _sounds[alias];
        if (!h) return;
        try {
            h.stop();
        } catch {}
    },

    unload: (alias: string): void => {
        const h = _sounds[alias];
        if (!h) return;
        try {
            h.unload();
            delete _sounds[alias];
        } catch {}
    }
};
