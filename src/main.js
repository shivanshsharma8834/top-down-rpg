import kaplay from "kaplay";
import { SCALE } from "./config.js";
import { createPlayer } from "./entities/player.js";
import { displayDialogue } from "./utils.js";

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
    anims: { "idle": { from: 0, to: 3, loop: true, speed: 2 } }
});

k.setBackground(k.Color.fromHex("#cbcbcb"));

k.scene("main", () => {
    
    // --- MAP LAYOUT ---
    // Added 'P' for PC/Computer
    // Added 'G' for Goldfish
    const mapLayout = [ 
        "###############################################################",
        "#                                                             #",
        "#             T                          B                    #",
        "#                                                             #",
        "#                                                             #",
        "#                      T                                      #",
        "#                                                             #",
        "#                                                             #",
        "#                    C                                        #",
        "#           P                    G                            #",
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
                k.rect(32, 32), k.color(100, 100, 100), k.area(), k.body({ isStatic: true }), k.anchor("center"), "wall"
            ],
            "T": () => [ k.rect(32, 32), k.opacity(0), "table_spawn_marker" ],
            "C": () => [ k.rect(32, 32), k.opacity(0), "cat_spawn_marker" ],
            "B": () => [ k.rect(32, 32), k.opacity(0), "bookshelf_spawn_marker" ],
            "P": () => [ k.rect(32, 32), k.opacity(0), "pc_spawn_marker" ],
            "G": () => [ k.rect(32, 32), k.opacity(0), "goldfish_spawn_marker" ]
        }
    };

    const level = k.addLevel(mapLayout, levelConfig);

    // --- SPAWN OBJECTS ---
    
    // CAT
    level.get("cat_spawn_marker").forEach(marker => {
        k.add([
            k.sprite("catto", { anim: "idle"}),
            k.scale(SCALE / 1.5),
            k.pos(level.pos.add(marker.pos).add(16, 16)),
            k.area({ shape: new k.Rect(k.vec2(-24, -24), 48, 48) }),
            k.body({ isStatic: true }),
            k.anchor("center"),
            k.z(), 
            "interactable",
            "cat", 
            { msg: "Meow! I am the guardian of this portfolio." }
        ]);
        marker.destroy();
    });

    // TABLES
    level.get("table_spawn_marker").forEach(marker => {
        k.add([
            k.sprite("bean"),
            k.scale(SCALE),
            k.pos(level.pos.add(marker.pos).add(16, 16)),
            k.area(),
            k.body({ isStatic: true }),
            k.anchor("center"),
            k.z(), 
            "interactable", "table",
            { msg: "It's a nice table. Great for coding!" }
        ]);
        marker.destroy();
    });

    // BOOKSHELVES
    level.get("bookshelf_spawn_marker").forEach(marker => {
        k.add([
            k.sprite("bean"), k.color(139, 69, 19), 
            k.scale(SCALE),
            k.pos(level.pos.add(marker.pos).add(16, 16)),
            k.area(), k.body({ isStatic: true }), k.anchor("center"), k.z(),
            "interactable", "bookshelf",
            { msg: "My Projects: 1. RPG Game, 2. E-Commerce Site..." }
        ]);
        marker.destroy();
    });

    // PC (LINK EXAMPLE)
    level.get("pc_spawn_marker").forEach(marker => {
        k.add([
            k.sprite("bean"), k.color(0, 0, 255), // Blue tint for PC
            k.scale(SCALE),
            k.pos(level.pos.add(marker.pos).add(16, 16)),
            k.area(), k.body({ isStatic: true }), k.anchor("center"), k.z(),
            "interactable", "pc",
            { 
                msg: "Visit my GitHub? (Press Space again to open)",
                isLink: true,
                url: "https://github.com/shivanshsharma8834"
            }
        ]);
        marker.destroy();
    });

    // GOLDFISH
    level.get("goldfish_spawn_marker").forEach(marker => {
        k.add([
            k.sprite("bean"), k.color(255, 165, 0), // Orange tint for Goldfish
            k.scale(SCALE),
            k.pos(level.pos.add(marker.pos).add(16, 16)),
            k.area(), k.body({ isStatic: true }), k.anchor("center"), k.z(),
            "interactable", "goldfish",
            { msg: "Glub glub... I forgot what I was going to say." }
        ]);
        marker.destroy();
    });

    const player = createPlayer(k, k.vec2(k.center()), 300);
    player.scale = k.vec2(SCALE);

    // --- CAMERA SETUP ---
    // 1. Zoom in so the pixel art looks good
    k.camScale(1.5);

    // 2. Calculate Map Bounds (for Camera Locking)
    // Width = columns * tileWidth * camScale
    // Height = rows * tileHeight * camScale
    // Note: We use 32 * 1.5 (camScale) roughly to estimate, 
    // but Kaplay camera logic works in World Units, so just tileWidth is enough.
    const mapWidth = mapLayout[0].length * 32;
    const mapHeight = mapLayout.length * 32;

    const hint = document.getElementById("hint");
    const textbox = document.getElementById("textbox");
    let closeCurrentDialogue = null; 

    k.onUpdate(() => {
        // --- 1. CAMERA LOCK ---
        // Clamp the camera position so it never shows the black void outside the walls
        // We use k.camPos().lerp for smoothness, but clamp the result.
        
        const camX = k.clamp(player.pos.x, 100 + (k.width() / 2) / 1.5, 100 + mapWidth - (k.width() / 2) / 1.5);
        const camY = k.clamp(player.pos.y, 100 + (k.height() / 2) / 1.5, 100 + mapHeight - (k.height() / 2) / 1.5);
        
        // Smoothly move camera to the clamped position
        k.camPos(k.camPos().lerp(k.vec2(camX, camY), 0.1));

        // --- 2. DEPTH SORTING ---
        player.z = player.pos.y; 
        ["table", "interactable", "wall", "bookshelf", "pc", "goldfish"].forEach(tag => {
            k.get(tag).forEach(obj => {
                if (obj.is("cat")) return;
                obj.z = obj.pos.y;
            });
        });
        k.get("cat").forEach(cat => cat.z = cat.pos.y + 20);

        // --- 3. INTERACTION ---
        let nearbyInteractable = null;
        k.get("interactable").forEach((obj) => {
            if (player.pos.dist(obj.pos) < 100) nearbyInteractable = obj;
        });

        if (nearbyInteractable && textbox.style.display === "none") {
            hint.style.display = "block";
        } else {
            hint.style.display = "none";
        }

        if (k.isKeyPressed("space")) {
            // Case A: Close Dialogue (and handle Link opening)
            if (player.isInDialogue) {
                // If it was a link object, open the window now
                if (player.currentInteractable?.isLink) {
                    window.open(player.currentInteractable.url, "_blank");
                }
                
                if (closeCurrentDialogue) closeCurrentDialogue();
                player.isInDialogue = false;
                player.currentInteractable = null;
                k.canvas.focus();
            } 
            // Case B: Open Dialogue
            else if (nearbyInteractable) {
                closeCurrentDialogue = displayDialogue(
                    nearbyInteractable.msg, 
                    () => { player.isInDialogue = false; }
                );
                player.isInDialogue = true; 
                player.currentInteractable = nearbyInteractable; // Store reference
            }
        }
    });
});

k.go("main");