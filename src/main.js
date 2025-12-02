import kaplay from "kaplay";
import { SCALE } from "./config.js";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix
import { createPlayer } from "./entities/player.js";
const k = kaplay({
    global: false,
    debug: true
});

// k.loadRoot("./"); // A good idea for Itch.io publishing later

// Main sprite loading
k.loadSprite("player", "sprites/player.png", {
    sliceX: 4,
    sliceY: 8,
    anims: {
        "walk-down-idle": 0,
        "walk-down": { from: 0, to: 3, loop: true },
        "walk-left-down": { from: 4, to: 7, loop: true },
        "walk-left-down-idle": 4,
        "walk-left": { from: 8, to: 11, loop: true },
        "walk-left-idle": 8,
        "walk-left-up": { from: 12, to: 15, loop: true },
        "walk-left-up-idle": 12,
        "walk-up": { from: 16, to: 19, loop: true },
        "walk-up-idle": 16,
        "walk-right-up": { from: 20, to: 23, loop: true },
        "walk-right-up-idle": 20,
        "walk-right": { from: 24, to: 27, loop: true },
        "walk-right-idle": 24,
        "walk-right-down": { from: 28, to: 31, loop: true },
        "walk-right-down-idle": 28,
    }
});

k.loadSprite("bean", "sprites/bean.png")
// Test background color and player creation
k.setBackground(k.Color.fromHex("#311047"));
// createPlayer(k, k.vec2(k.center()), 700);

k.scene("main", () => {
    const wallConfig = {
        isStatic: true,
    };

    // Left Wall
    k.add([
        k.rect(50, 500), // Width, Height
        k.pos(200, 200), // X, Y position
        k.color(100, 100, 100), // Gray color (remove this later)
        k.area(), // Hitbox
        k.body(wallConfig), // Physics body
        "wall", // Tag
    ]);

    // Top Wall
    k.add([
        k.rect(500, 50),
        k.pos(200, 150),
        k.color(100, 100, 100),
        k.area(),
        k.body(wallConfig),
        "wall",
    ]);

    // --- 4. Furniture (Objects) ---
    // Let's add a "table" using the bean sprite
    const table = k.add([
        k.sprite("bean"),
        k.pos(500, 400),
        k.scale(SCALE),
        k.area(), // Default hitbox covers the whole sprite
        k.body({ isStatic: true }), 
        k.anchor("center"),
        "table", // Tag for interaction later
    ]);

    // --- 5. Player ---
    // We pass 'SCALE' so the player matches the world size
    const player = createPlayer(k, k.vec2(k.center()), 300);
    player.scale = k.vec2(SCALE); // Update player scale to match config

    // --- 6. Depth Handling (Z-Index) ---
    // This is the magic. It runs every frame.
    // Objects with a higher Y (lower on screen) get a higher Z (drawn on top).
    k.onUpdate(() => {
        // Set Z-index to Y position. 
        // We use player.pos.y for the player.
        player.z = player.pos.y;
        
        // If you have moving objects, update them too.
        // Static objects like the table can have their Z set once, 
        // but setting it here ensures it's always correct.
        table.z = table.pos.y;
    });
});

k.go("main");