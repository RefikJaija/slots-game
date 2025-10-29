import * as PIXI from 'pixi.js';
import 'pixi-spine';
import { Reel } from './Reel';
import { sound } from '../utils/sound';
import { AssetLoader } from '../utils/AssetLoader';
import {Spine} from "pixi-spine";

const REEL_COUNT = 4;
const SYMBOLS_PER_REEL = 6;
const SYMBOL_SIZE = 150;
const REEL_HEIGHT = SYMBOL_SIZE;
const REEL_SPACING = 10;

export class SlotMachine {
    public container: PIXI.Container;
    private reels: Reel[];
    private app: PIXI.Application;
    private isSpinning: boolean = false;
    private spinButton: PIXI.Sprite | null = null;
    private frameSpine: Spine | null = null;
    private winAnimation: Spine | null = null;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.reels = [];

        // Center the slot machine
        this.container.x = this.app.screen.width / 2 - ((SYMBOL_SIZE * SYMBOLS_PER_REEL) / 2);
        this.container.y = this.app.screen.height / 2 - ((REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1)) / 2);

        this.createBackground();

        this.createReels();

        this.initSpineAnimations();
    }

    private createBackground(): void {
        try {
            const background = new PIXI.Graphics();
            background.beginFill(0x000000, 0.5);
            background.drawRect(
                -20,
                -20,
                SYMBOL_SIZE * SYMBOLS_PER_REEL + 60, // Width now based on symbols per reel
                REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1) + 40 // Height based on reel count
            );
            background.endFill();
            this.container.addChild(background);
        } catch (error) {
            console.error('Error creating background:', error);
        }
    }

    private createReels(): void {
        // Create each reel
        for (let i = 0; i < REEL_COUNT; i++) {
            const reel = new Reel(SYMBOLS_PER_REEL, SYMBOL_SIZE);
            reel.container.y = i * (REEL_HEIGHT + REEL_SPACING);
            this.container.addChild(reel.container);
            this.reels.push(reel);
        }
    }

    public update(delta: number): void {
        // Update each reel
        for (const reel of this.reels) {
            reel.update(delta);
        }
    }

    public spin(): void {
        if (this.isSpinning) return;

        this.isSpinning = true;

        // Play spin sound
        sound.play('Reel spin');

        // Disable spin button
        if (this.spinButton) {
            this.spinButton.texture = AssetLoader.getTexture('button_spin_disabled.png');
            this.spinButton.interactive = false;
        }

        for (let i = 0; i < this.reels.length; i++) {
            setTimeout(() => {
                this.reels[i].startSpin();
            }, i * 200);
        }

        // Stop all reels after a delay
        setTimeout(() => {
            this.stopSpin();
        }, 500 + (this.reels.length - 1) * 200);

    }

    private stopSpin(): void {
        for (let i = 0; i < this.reels.length; i++) {
            setTimeout(() => {
                this.reels[i].stopSpin();

                // If this is the last reel, check for wins and enable spin button
                if (i === this.reels.length - 1) {
                    setTimeout(() => {
                        this.checkWin();
                        this.isSpinning = false;

                        if (this.spinButton) {
                            this.spinButton.texture = AssetLoader.getTexture('button_spin.png');
                            this.spinButton.interactive = true;
                        }
                    }, 500);
                }
            }, i * 400);
        }
    }

    private checkWin(): void {
        // Simple win check - just for demonstration
        const randomWin = Math.random() < 0.3; // 30% chance of winning

        if (randomWin) {
            sound.play('win');
            console.log('Winner!');

            if (this.winAnimation) {
                try {
                    this.winAnimation.visible = true;

                    // Prefer named animation 'win'/'boom'/'idle' if present, otherwise pick the first available animation
                    const state = (this.winAnimation as any).state;
                    // If Spine instance exposes animations list
                    let animName: string | undefined;

                    // --- 1. PREFERRED NAMES FIRST ---
                    const preferred = 'big-boom-h' ;
                    if (!animName && state.hasAnimation && state.hasAnimation(preferred)) {
                            animName = preferred;
                    }

                    // const preferred = ['win', 'boom', 'big-boom-h', 'idle'];
                    // for (const p of preferred) {
                    //     // Check if name is available and set it if animName is currently empty
                    //     if (!animName && state.hasAnimation && state.hasAnimation(p)) {
                    //         animName = p;
                    //     }
                    // }
                    
                    // --- 2. GENERIC FALLBACK SECOND ---
                    // Only run this if we STILL haven't found a preferred name
                    if (!animName && (this.winAnimation as any).spineData && (this.winAnimation as any).spineData.animations && (this.winAnimation as any).spineData.animations.length) {
                        animName = (this.winAnimation as any).spineData.animations[0].name;
                    }

                    console.log('Animation name: ', animName);

                    if (animName) {
                        state.setAnimation(0, animName, false);
                    } else if (state.setAnimation) {
                        // fallback: try 'idle' if available
                        state.setAnimation(0, 'idle', false);
                    }
                } catch (err) {
                    console.warn('Failed to play win animation', err);
                }
            }
        }
    }


    public setSpinButton(button: PIXI.Sprite): void {
        this.spinButton = button;
    }

    private initSpineAnimations(): void {
        try {
            const frameSpineData = AssetLoader.getSpine('base-feature-frame.json');
            if (frameSpineData) {
                this.frameSpine = new Spine(frameSpineData.spineData);

                this.frameSpine.y = (REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1)) / 2;
                this.frameSpine.x = (SYMBOL_SIZE * SYMBOLS_PER_REEL) / 2;

                if (this.frameSpine.state.hasAnimation('idle')) {
                    this.frameSpine.state.setAnimation(0, 'idle', true);
                }

                this.container.addChild(this.frameSpine);
            }

            const winSpineData = AssetLoader.getSpine('big-boom-h.json');
            if (winSpineData) {
                this.winAnimation = new Spine(winSpineData.spineData);

                this.winAnimation.x = (REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1)) / 2;
                this.winAnimation.y = (SYMBOL_SIZE * SYMBOLS_PER_REEL) / 2;

                this.winAnimation.visible = false;

                this.container.addChild(this.winAnimation);
            }
        } catch (error) {
            console.error('Error initializing spine animations:', error);
        }
    }
}
