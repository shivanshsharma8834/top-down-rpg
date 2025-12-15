import kaplay from "kaplay";
import { SCALE } from "./config.js";
import { createPlayer } from "./entities/player.js";

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
    const mapLayout = [ 
        "###############################################################",
        "#                                                             #",
        "#             T                                               #",
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
            // Walls are static geometry, so they can stay in the level!
            "#": () => [
                k.rect(32, 32),
                k.color(100, 100, 100),
                k.area(),
                k.body({ isStatic: true }),
                k.anchor("center"),
                "wall"
            ],
            // MARKERS: These are placeholders. We will replace them with real objects.
            "T": () => [
                k.rect(32, 32), // Visual placeholder (optional)
                k.opacity(0),   // Invisible
                "table_spawn_marker"
            ],
            "C": () => [
                k.rect(32, 32),
                k.opacity(0),
                "cat_spawn_marker"
            ]
        }
    };

    // 1. Create the Level (This creates invisible markers)
    const level = k.addLevel(mapLayout, levelConfig);

    // 2. Spawn Real Objects based on Markers
    // We loop through the markers, spawn real entities at their WORLD position, and destroy the marker.

    // --- Spawn Cats ---
    level.get("cat_spawn_marker").forEach(marker => {
        // Calculate world position: Level Pos + Marker Local Pos + Center Offset (16,16)
        const worldPos = level.pos.add(marker.pos).add(16, 16); 

        k.add([
            k.sprite("catto", { anim: "idle"}),
            k.scale(SCALE / 1.7),
            k.pos(worldPos),
            k.area({ shape: new k.Rect(k.vec2(-10, -10), 64, 50) }),
            k.body({ isStatic: true }),
            k.anchor("center"),
            k.z(), // Enable Z-sorting
            "interactable",
            "cat", 
            { msg: "Meow! Welcome to the portfolio." }
        ]);
        
        marker.destroy(); // Remove the placeholder
    });

    // --- Spawn Tables ---
    level.get("table_spawn_marker").forEach(marker => {
        const worldPos = level.pos.add(marker.pos).add(16, 16);

        k.add([
            k.sprite("bean"),
            k.scale(SCALE),
            k.pos(worldPos),
            k.area(),
            k.body({ isStatic: true }),
            k.anchor("center"),
            k.z(), // Enable Z-sorting
            "table"
        ]);
        
        marker.destroy();
    });

    // --- SPAWN PLAYER ---
    const player = createPlayer(k, k.vec2(k.center()), 300);
    player.scale = k.vec2(SCALE);

    // --- UI ELEMENTS ---
    const textbox = document.getElementById("textbox");
    const content = document.getElementById("content");
    const hint = document.getElementById("hint");

    function closeDialogue() {
        textbox.style.display = "none";
        content.innerText = "";
        player.isInDialogue = false; 
        k.canvas.focus(); 
    }

    // --- MAIN UPDATE LOOP ---
    k.onUpdate(() => {
        // 1. Update Player Z
        player.z = player.pos.y; 
        
        // 2. Update Generic Object Z (Tables, etc)
        ["table", "interactable", "wall"].forEach(tag => {
            k.get(tag).forEach(obj => {
                if (obj.is("cat")) return;
                obj.z = obj.pos.y;
            });
        });

        // 3. Update Cat Z
        // Now that the cat is at the Root level (same as player), this comparison works perfectly.
        // We add +20 offset to make it look like the cat is slightly "in front" if overlapping.
        k.get("cat").forEach(cat => {
            cat.z = cat.pos.y + 20; 
        });

        // 4. Interaction Check
        let nearbyInteractable = null;
        k.get("interactable").forEach((obj) => {
            if (player.pos.dist(obj.pos) < 100) { 
                nearbyInteractable = obj;
            }
        });

        if (nearbyInteractable && textbox.style.display === "none") {
            if (hint) hint.style.display = "block";
        } else {
            if (hint) hint.style.display = "none";
        }

        if (k.isKeyPressed("space")) {
            if (textbox.style.display === "block") {
                closeDialogue();
            } else if (nearbyInteractable) {
                textbox.style.display = "block";
                content.innerText = nearbyInteractable.msg;
                player.isInDialogue = true; 
            }
        }
    });
});

k.go("main");