import { DIAGONAL_FACTOR } from "../config.js";

// Function to create and manage the player entity
export function createPlayer(k, pos, speed) {
    const player = k.add([
        k.sprite("player", { anim: "walk-down" }),
        k.anchor("center"),
        k.area({ shape: new k.Rect(k.vec2(0, 3), 6, 10) }),
        k.body(),
        k.pos(pos),
        k.z(), // REQUIRED: Enables depth sorting for the player
        "player",
        {
            direction: k.vec2(0, 0),
            directionName: "walk-down",
        },
    ]);

    let isMouseDown = false;
    const canvas = document.getElementsByTagName("canvas")[0];

    if (canvas) {
        canvas.addEventListener("focusout", () => { isMouseDown = false; });
        canvas.addEventListener("mousedown", () => { isMouseDown = true; });
        canvas.addEventListener("mouseup", () => { isMouseDown = false; });
        canvas.addEventListener("touchstart", () => { isMouseDown = true; });
        canvas.addEventListener("touchend", () => { isMouseDown = false; });
    }

    // Update loop for player movement and camera following
    player.onUpdate(() => {
        // Smooth camera follow
        if (!k.camPos().eq(player.pos)) {
            k.tween(
                k.camPos(),
                player.pos,
                0.5,
                (newPos) => k.camPos(newPos),
                k.easings.linear
            );
        }

        player.direction = k.vec2(0, 0);
        const worldMousePos = k.toWorld(k.mousePos());

        if (isMouseDown) {
            player.direction = worldMousePos.sub(player.pos).unit();
        }

        if (player.direction.eq(k.vec2(0, 0)) && !player.getCurAnim().name.includes("idle")) {
            player.play(`${player.directionName}-idle`);
            return;
        }

        if (player.direction.x > 0 && Math.abs(player.direction.y) < 0.5) player.directionName = "walk-right";
        if (player.direction.x < 0 && Math.abs(player.direction.y) < 0.5) player.directionName = "walk-left";
        if (player.direction.y < -0.8) player.directionName = "walk-up";
        if (player.direction.y > 0.8) player.directionName = "walk-down";

        if (player.direction.x < 0 && player.direction.y < -0.5 && player.direction.y > -0.8) player.directionName = "walk-left-up";
        if (player.direction.x < 0 && player.direction.y > 0.5 && player.direction.y < 0.8) player.directionName = "walk-left-down";
        if (player.direction.x > 0 && player.direction.y < -0.5 && player.direction.y > -0.8) player.directionName = "walk-right-up";
        if (player.direction.x > 0 && player.direction.y > 0.5 && player.direction.y < 0.8) player.directionName = "walk-right-down";

        if (player.getCurAnim().name !== player.directionName) {
            player.play(player.directionName);
        }

        if (player.direction.x && player.direction.y) {
            player.move(player.direction.scale(DIAGONAL_FACTOR * speed));
            return;
        }
        player.move(player.direction.scale(speed));
    });

    return player;
}