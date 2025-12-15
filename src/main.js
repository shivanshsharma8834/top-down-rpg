import kaplay from "kaplay";
import { SCALE } from "./config.js";
import { createPlayer } from "./entities/player.js";
import { displayDialogue } from "./utils.js"; // Import the new UI logic

const k = kaplay({
    global: false,
    debug: true,
    background: [30, 30, 40],
    canvas: document.getElementById("game-canvas"),
});

// --- LOAD ASSETS ---
k.loadSprite("player", "sprites/shreya_3.png", {
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

k.loadSprite("bean", "sprites/bean.png");
k.loadSprite("catto", "sprites/catto.png", {
    sliceX: 4,
    sliceY: 8,
    anims: {
        "idle": { from: 0, to: 3, loop: true, speed: 2 },
    }
});

k.setBackground(k.Color.fromHex("#cbcbcb"));

k.scene("main", () => {
    
    // --- MAP LAYOUT ---
    // Added 'B' for Bookshelf in the top right
    const mapLayout = [ 
        "###############################################################",
        "#                                                             #",
        "#                                        B                    #",
        "#                                                             #",
        "#                                                             #",
        "#                                                             #",
        "#                                                             #",
        "#                                                             #",
        "#                    C                                        #",
        "#                                                             #",
        "#                               T                             #",
        "#                                                             #",
        "#                                                             #",
        "#                                                             #",
        "#                                                             #",
        "#                                                             #",
        "#                                                             #",
        "#                                                             #",
        "#                                                             #",
        "#                                                             #",
        "###############################################################",
    ];

    const levelConfig = { 
        tileWidth: 32, 
        tileHeight: 32,
        pos: k.vec2(100, 100),
        tiles: {
            "#": () => [
                k.rect(32, 32),
                k.color(100, 100, 100),
                k.area(),
                k.body({ isStatic: true }),
                k.anchor("center"),
                "wall"
            ],
            "T": () => [
                k.rect(32, 32), k.opacity(0), "table_spawn_marker"
            ],
            "C": () => [
                k.rect(32, 32), k.opacity(0), "cat_spawn_marker"
            ],
            "B": () => [
                k.rect(32, 32), k.opacity(0), "bookshelf_spawn_marker"
            ]
        }
    };

    // 1. Create the Level
    const level = k.addLevel(mapLayout, levelConfig);

    // 2. Spawn Real Objects
    
    // --- Spawn Cats ---
    level.get("cat_spawn_marker").forEach(marker => {
        k.add([
            k.sprite("catto", { anim: "idle"}),
            k.scale(SCALE / 1.5),
            k.pos(level.pos.add(marker.pos).add(16, 16)),
            k.area({ shape: new k.Rect(k.vec2(0, 0), 48, 48) }),
            k.body({ isStatic: true }),
            k.anchor("center"),
            k.z(), 
            "interactable",
            "cat", 
            { msg: "Meow! I am the guardian of this portfolio." }
        ]);
        marker.destroy();
    });

    // --- Spawn Tables ---
    level.get("table_spawn_marker").forEach(marker => {
        k.add([
            k.sprite("bean"),
            k.scale(SCALE),
            k.pos(level.pos.add(marker.pos).add(16, 16)),
            k.area(),
            k.body({ isStatic: true }),
            k.anchor("center"),
            k.z(), 
            "interactable", // Added interactable tag to table!
            "table",
            { msg: "It's a nice table. Great for coding!" }
        ]);
        marker.destroy();
    });

    // --- Spawn Bookshelves ---
    level.get("bookshelf_spawn_marker").forEach(marker => {
        k.add([
            k.sprite("bean"), // Reusing bean for now (you can load a bookshelf sprite later)
            k.color(139, 69, 19), // Brown tint
            k.scale(SCALE),
            k.pos(level.pos.add(marker.pos).add(16, 16)),
            k.area(),
            k.body({ isStatic: true }),
            k.anchor("center"),
            k.z(),
            "interactable",
            "bookshelf",
            { msg: "These are my projects: 1. RPG Game, 2. E-Commerce Site..." }
        ]);
        marker.destroy();
    });

    // --- SPAWN PLAYER ---
    const player = createPlayer(k, k.vec2(k.center()), 300);
    player.scale = k.vec2(SCALE);

    // --- UI ELEMENTS ---
    const hint = document.getElementById("hint");
    let closeCurrentDialogue = null; // Store the cleanup function

    // --- MAIN UPDATE LOOP ---
    k.onUpdate(() => {
        // 1. Z-Sorting
        player.z = player.pos.y; 
        ["table", "interactable", "wall", "bookshelf"].forEach(tag => {
            k.get(tag).forEach(obj => {
                if (obj.is("cat")) return;
                obj.z = obj.pos.y;
            });
        });
        k.get("cat").forEach(cat => cat.z = cat.pos.y + 20);

        // 2. Interaction Check
        let nearbyInteractable = null;
        k.get("interactable").forEach((obj) => {
            if (player.pos.dist(obj.pos) < 100) { 
                nearbyInteractable = obj;
            }
        });

        // Hint Logic
        const textbox = document.getElementById("textbox");
        if (nearbyInteractable && textbox.style.display === "none") {
            if (hint) hint.style.display = "block";
        } else {
            if (hint) hint.style.display = "none";
        }

        // Space Key Logic
        if (k.isKeyPressed("space")) {
            // Case A: Dialogue is open -> Close it
            if (player.isInDialogue) {
                if (closeCurrentDialogue) closeCurrentDialogue();
                player.isInDialogue = false;
                k.canvas.focus();
            } 
            // Case B: Nearby object -> Open Dialogue
            else if (nearbyInteractable) {
                // Call our utility function
                closeCurrentDialogue = displayDialogue(
                    nearbyInteractable.msg, 
                    () => { player.isInDialogue = false; }
                );
                player.isInDialogue = true; 
            }
        }
    });
});

k.go("main");