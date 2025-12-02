import { DIAGONAL_FACTOR } from "../config.js";

// Function to create and manage the player entity
export function createPlayer(k, pos, speed) {
    const player = k.add([
        k.sprite("player", { anim: "walk-down" }),
        // k.scale(8),
        k.anchor("center"),
        k.area({ shape: new k.Rect(k.vec2(0), 5, 10) }),
        k.body(),
        k.pos(pos),
        "player",
        {
        direction: k.vec2(0, 0),
        directionName: "walk-down",
        },
    ])

    let isMouseDown = false;

    const canvas = document.getElementsByTagName("canvas")[0];


    // Handle mouse and touch events to track if the mouse is down
    canvas.addEventListener("focusout", () => {
        isMouseDown = false;
    });
    canvas.addEventListener("mousedown", () => {
        isMouseDown = true;
    });

    canvas.addEventListener("mouseup", () => {
        isMouseDown = false;
    });

    canvas.addEventListener("touchstart", () => {
        isMouseDown = true;
    });

    canvas.addEventListener("touchend", () => {
        isMouseDown = false;
    });

    // Update loop for player movement and camera following
    player.onUpdate(() => {

    // Smooth camera follow
    if (!k.camPos().eq(player.pos)) {
      k.tween(
        k.camPos(),
        player.pos,
        0.5, // duration in seconds
        (newPos) => k.camPos(newPos),
        k.easings.linear // easing function
      );
    }

    player.direction = k.vec2(0, 0);
    const worldMousePos = k.toWorld(k.mousePos());

    // Update player direction based on mouse position if mouse is down
    if (isMouseDown) {
      player.direction = worldMousePos.sub(player.pos).unit();
    }

    // Determine animation based on direction
    if (
      player.direction.eq(k.vec2(0, 0)) &&
      !player.getCurAnim().name.includes("idle")
    ) {
      player.play(`${player.directionName}-idle`);
      return;
    }

    // Determine direction name based on movement vector
    if (
      player.direction.x > 0 &&
      player.direction.y > -0.5 &&
      player.direction.y < 0.5
    ) {
      player.directionName = "walk-right";
    }

    // Left
    if (
      player.direction.x < 0 &&
      player.direction.y > -0.5 &&
      player.direction.y < 0.5
    )
      player.directionName = "walk-left";

    // Up
    if (player.direction.x < 0 && player.direction.y < -0.8)
      player.directionName = "walk-up";

    // Down
    if (player.direction.x < 0 && player.direction.y > 0.8)
      player.directionName = "walk-down";

    // Left up
    if (
      player.direction.x < 0 &&
      player.direction.y > -0.8 &&
      player.direction.y < -0.5
    )
      player.directionName = "walk-left-up";

    // Left down
    if (
      player.direction.x < 0 &&
      player.direction.y > 0.5 &&
      player.direction.y < 0.8
    )
      player.directionName = "walk-left-down";

    // Right up
    if (
      player.direction.x > 0 &&
      player.direction.y < -0.5 &&
      player.direction.y > -0.8
    )
      player.directionName = "walk-right-up";

    // Right down
    if (
      player.direction.x > 0 &&
      player.direction.y > 0.5 &&
      player.direction.y < 0.8
    )
      player.directionName = "walk-right-down";

    // Play the appropriate animation if not already playing
    if (player.getCurAnim().name !== player.directionName) {
      player.play(player.directionName);
    }

    // Move the player based on direction and speed
    if (player.direction.x && player.direction.y) {
      player.move(player.direction.scale(DIAGONAL_FACTOR * speed));
      return;
    }

    // Straight movement
    player.move(player.direction.scale(speed));
    });

  return player;

}