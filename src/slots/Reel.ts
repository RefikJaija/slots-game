import * as PIXI from 'pixi.js';
import { sound } from '../utils/sound';
import { AssetLoader } from '../utils/AssetLoader';

const SYMBOL_TEXTURES = [
    'symbol1.png',
    'symbol2.png',
    'symbol3.png',
    'symbol4.png',
    'symbol5.png',
];

const SPIN_SPEED = 50; // Pixels per frame (multiplied by ticker delta)
const SPIN_SPEED_PX_PER_SEC = 3000; // px/second
const SLOWDOWN_RATE = 0.90; // Rate at which the reel slows down

export class Reel {
    public container: PIXI.Container;
    private symbols: PIXI.Sprite[];
    private symbolSize: number;
    private symbolCount: number;
    private speed: number = 0;
    private isSpinning: boolean = false;

    constructor(symbolCount: number, symbolSize: number) {
        this.container = new PIXI.Container();
        this.symbols = [];
        this.symbolSize = symbolSize;
        this.symbolCount = symbolCount;

        this.createSymbols();
    }

    private createSymbols(): void {
        // Clean container
        this.container.removeChildren();
        this.symbols = [];

        // Create `symbolCount` sprites placed horizontally next to each other
        for (let i = 0; i < this.symbolCount; i++) {
            const sprite = this.createRandomSymbol();
            sprite.x = i * this.symbolSize;
            sprite.y = 0;
            sprite.width = this.symbolSize;
            sprite.height = this.symbolSize;
            sprite.anchor.set(0); // top-left anchor (we position by x,y)
            this.container.addChild(sprite);
            this.symbols.push(sprite);
        }
    }

    private createRandomSymbol(): PIXI.Sprite {
        // Choose a random texture name from SYMBOL_TEXTURES
        const name = SYMBOL_TEXTURES[Math.floor(Math.random() * SYMBOL_TEXTURES.length)];
        // Attempt to get texture from AssetLoader; fall back to empty texture
        let texture: PIXI.Texture | undefined;
        try {
            texture = AssetLoader.getTexture(name);
        } catch (e) {
            texture = undefined;
        }

        const sprite = new PIXI.Sprite(texture ?? PIXI.Texture.EMPTY);
        sprite.width = this.symbolSize;
        sprite.height = this.symbolSize;
        sprite.anchor.set(0);
        return sprite;
    }

    public update(delta: number): void {
        // PIXI's ticker passes a `delta` which is often ~1 per frame, can be >1 on slow devices.
        if (!this.isSpinning && this.speed === 0) return;

        
        // Move symbols horizontally to the left (creating leftward spin)
        const dtSeconds = delta / 60 ; // because PIXI's delta ≈ 1 per 1/60 sec
        const moveAmount = this.speed * dtSeconds;
        // const moveAmount = this.speed * delta;

        for (const sym of this.symbols) {
            sym.x -= moveAmount;
        }

        // Wrap symbols: if a symbol moves completely off the left edge, move it to the rightmost position
        // Compute rightmost x among symbols
        let maxX = Number.NEGATIVE_INFINITY ;
        for (const sym of this.symbols) {   
            if (sym.x > maxX) maxX = sym.x;
        }

        for (const sym of this.symbols) {
            if (sym.x + this.symbolSize <= 115) {
                // place it to the right of current max
                sym.x = maxX + this.symbolSize -15;
                maxX = sym.x;
                // optionally set a new random texture when it wraps
                const newTexName = SYMBOL_TEXTURES[Math.floor(Math.random() * SYMBOL_TEXTURES.length)];
                const newTex = AssetLoader.getTexture(newTexName);
                if (newTex) sym.texture = newTex;
            }
        }

        // If we're stopping, slow down the reel smoothly
        if (!this.isSpinning && this.speed > 0) {
            this.speed *= SLOWDOWN_RATE;

            // If speed is very low, stop completely and snap to grid
            if (this.speed < 15) {
                this.speed = 0;
                this.snapToGrid();
            }
        }
    }

    private snapToGrid(): void {
        // Align the symbols so that they sit exactly on multiples of symbolSize starting at x=0.
        // We'll sort current symbols by their x, then reposition them sequentially to the grid.
        const sorted = [...this.symbols].sort((a, b) => a.x - b.x);

        for (let i = 0; i < sorted.length; i++) {
            const targetX = i * this.symbolSize;
            // Smooth snap by directly assigning (small correction is fine after slowdown)
            sorted[i].x = targetX;
        }

        this.symbols = sorted;
        //Stop the Reel spin sound when the Reel stops spinning
        sound.stop('Reel spin');
    }

    public startSpin(): void {
        this.isSpinning = true;
        this.speed = SPIN_SPEED_PX_PER_SEC;
        // this.speed = SPIN_SPEED;
    }

    public stopSpin(): void {
        this.isSpinning = false;
        // The reel will gradually slow down in the update method
    }
}
