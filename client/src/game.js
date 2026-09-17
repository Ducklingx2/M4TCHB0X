import * as THREE from "three";
import { Player } from "./player.js";
import { World } from "./world.js";

export class Game {
    constructor(container, options = {}) {
        this.container = container;
        this.onMessage = options.onMessage || (() => {});

        this.running = false;
        this.paused = false;

        this.clock = new THREE.Clock();

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x101010);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.05,
            1000
        );

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });

        this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );

        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        this.container.appendChild(this.renderer.domElement);

        this.world = new World(this.scene);

        this.player = new Player(
            this.scene,
            this.camera,
            this.world,
            {
                onMessage: this.onMessage
            }
        );

        this.setupLighting();
        this.setupEvents();
    }

    /*
     * ---------------------------------------------------------
     * Lighting
     * ---------------------------------------------------------
     */

    setupLighting() {
        const ambient = new THREE.HemisphereLight(
            0xe8e3d7,
            0x24201b,
            1.5
        );

        this.scene.add(ambient);

        const mainLight = new THREE.DirectionalLight(
            0xfff4df,
            2.2
        );

        mainLight.position.set(10, 18, 8);

        mainLight.castShadow = true;

        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;

        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 80;

        mainLight.shadow.camera.left = -30;
        mainLight.shadow.camera.right = 30;
        mainLight.shadow.camera.top = 30;
        mainLight.shadow.camera.bottom = -30;

        mainLight.shadow.bias = -0.0005;

        this.scene.add(mainLight);

        /*
         * Small warm light.
         * This will eventually become useful for the
         * actual Matchbox environment.
         */

        const warmLight = new THREE.PointLight(
            0xff9b68,
            8,
            22,
            2
        );

        warmLight.position.set(0, 4, 0);

        this.scene.add(warmLight);
    }

    /*
     * ---------------------------------------------------------
     * Events
     * ---------------------------------------------------------
     */

    setupEvents() {
        this.handleResize = () => {
            this.resize();
        };

        window.addEventListener(
            "resize",
            this.handleResize
        );

        this.handleKeyDown = (event) => {
            if (event.code === "Escape") {
                this.player.releaseMouse();
            }
        };

        window.addEventListener(
            "keydown",
            this.handleKeyDown
        );
    }

    /*
     * ---------------------------------------------------------
     * Start
     * ---------------------------------------------------------
     */

    start() {
        if (this.running) return;

        this.running = true;
        this.paused = false;

        this.clock.start();

        this.player.enable();

        this.animate();
    }

    /*
     * ---------------------------------------------------------
     * Pause / Resume
     * ---------------------------------------------------------
     */

    pause() {
        if (!this.running) return;

        this.paused = true;

        this.player.releaseMouse();
    }

    resume() {
        if (!this.running) return;

        this.paused = false;

        this.clock.getDelta();
    }

    /*
     * ---------------------------------------------------------
     * Main loop
     * ---------------------------------------------------------
     */

    animate() {
        if (!this.running) return;

        requestAnimationFrame(() => {
            this.animate();
        });

        const delta = Math.min(
            this.clock.getDelta(),
            0.05
        );

        if (!this.paused) {
            this.update(delta);
        }

        this.renderer.render(
            this.scene,
            this.camera
        );
    }

    /*
     * ---------------------------------------------------------
     * Update
     * ---------------------------------------------------------
     */

    update(delta) {
        this.player.update(delta);
        this.world.update(delta);
    }

    /*
     * ---------------------------------------------------------
     * Resize
     * ---------------------------------------------------------
     */

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(
            width,
            height
        );

        this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );
    }

    /*
     * ---------------------------------------------------------
     * Cleanup
     * ---------------------------------------------------------
     */

    destroy() {
        this.running = false;

        window.removeEventListener(
            "resize",
            this.handleResize
        );

        window.removeEventListener(
            "keydown",
            this.handleKeyDown
        );

        this.player.destroy();
        this.world.destroy();

        this.renderer.dispose();

        this.container.innerHTML = "";
    }
}
