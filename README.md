# slots-game
This project is my implementation of the slots-game using PixiJS and TypeScript.
It includes horizontal reel spinning, a sound player, and several improvements for performance, maintainability, and clarity.

---

## Completed Tasks

### 1. Implemented All TODOs

* All existing `TODO` comments have been completed.
* Each implementation was tested and verified for correctness.

### 2. Reels Implementation

* Reels spin horizontally with smooth animation and natural slowdown.
* Implemented frame-rate–independent motion using Pixi’s ticker and delta time.
* Symbols wrap seamlessly from left to right.
* Reels snap precisely to the grid when stopping.

### 3. Sound Player

* Added a basic sound system using Howler.js.
* Plays reel spin and win sounds, stops automatically when reels finish spinning.

---

## Bonus Points Implemented

*  Refactoring: Code split into logical modules ( `Reel`, `sound`, `AssetLoader`).
*  Unit Tests (Jest):
    * Reel motion and wrapping
    * Deceleration and stop behavior
    * Snap-to-grid correctness
* Consistent TypeScript: Strong typing, interfaces, and idiomatic TS used throughout.
* Improved Maintainability: Clear method separation and comments for future scalability.

---

## Testing

Run tests with:

```bash
npm test
```

All key logic (reel spin, snapping, speed decay) is covered by unit tests.

---

## Setup & Run

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm start
```

Then open [http://localhost:8080]

### 3. Build for production

```bash
npm run build
```

---

### Author

[Refik Jaija]
Software Engineer — Slot Machine Technical Test Submission

