import * as THREE from "three";
import { Game } from "./game.js";

const container = document.getElementById("game");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const controls = document.getElementById("controls");
const connectionStatus = document.getElementById("connection-status");
const message = document.getElementById("message");

let game = null;

/*
 * ---------------------------------------------------------
 * M4TCHB0X
 * Application entry point
 * ---------------------------------------------------------
 */

function showMessage(text, duration = 2200) {
    if (!message) return;

    message.textContent = text;
    message.classList.add("visible");

    window.clearTimeout(showMessage.timeout);

    showMessage.timeout = window.setTimeout(() => {
        message.classList.remove("visible");
    }, duration);
}

function startGame() {
    if (game) return;

    game = new Game(container, {
        onMessage: showMessage
    });

    game.start();

    startScreen.classList.add("hidden");
    controls.classList.remove("hidden");

    connectionStatus.textContent = "LOCAL";

    showMessage("MATCHBOX INITIALIZED", 1600);
}

startButton.addEventListener("click", startGame);

/*
 * RMB belongs to M4TCHB0X.
 */

window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

/*
 * Resize
 */

window.addEventListener("resize", () => {
    if (game) {
        game.resize();
    }
});

/*
 * Pause when the browser tab loses focus.
 */

document.addEventListener("visibilitychange", () => {
    if (!game) return;

    if (document.hidden) {
        game.pause();
    } else {
        game.resume();
    }
});

/*
 * Error protection
 */

window.addEventListener("error", (event) => {
    console.error("M4TCHB0X:", event.error || event.message);

    if (game) {
        showMessage("SYSTEM ERROR", 2500);
    }
});

window.addEventListener("unhandledrejection", (event) => {
    console.error("M4TCHB0X:", event.reason);

    if (game) {
        showMessage("SYSTEM ERROR", 2500);
    }
});

/*
 * Console identity
 */

console.log(
    "%cM4TCHB0X",
    "font-family: monospace; font-size: 24px; font-weight: bold;"
);

console.log(
    "%cTHE FIRST MATCHBOX",
    "font-family: monospace; color: #d64a32;"
);
