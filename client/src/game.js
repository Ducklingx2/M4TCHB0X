import * as THREE from "three";
import { Player } from "./player.js";
import { World } from "./world.js";

export class Game {
    constructor(container, options = {}) {
        this.container = container;

        this.onMessage =
            options.onMessage || (() => {});

        this.running = false;
        this.paused = false;

        this.clock =
            new THREE.Clock();

        this.scene =
            new THREE.Scene();

        this.scene.background =
            new THREE.Color(0x090909);

        this.camera =
            new THREE.PerspectiveCamera(
                75,
                window.innerWidth /
                    window.innerHeight,
                0.05,
                1000
            );

        this.renderer =
            new THREE.WebGLRenderer({
                antialias: true,
                powerPreference:
                    "high-performance"
            });

        this.renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );

        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        this.renderer.shadowMap.enabled = true;

        this.renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        this.renderer.outputColorSpace =
            THREE.SRGBColorSpace;

        this.renderer.toneMapping =
            THREE.ACESFilmicToneMapping;

        this.renderer.toneMappingExposure =
            1.15;

        this.container.appendChild(
            this.renderer.domElement
        );

        this.world =
            new World(this.scene);

        this.player =
            new Player(
                this.scene,
                this.camera,
                this.world,
                {
                    onMessage:
                        this.onMessage
                }
            );

        this.setupLighting();
        this.setupEvents();
    }

    setupLighting() {
        const ambient =
            new THREE.HemisphereLight(
                0xcfd5dc,
                0x161616,
                1.4
            );

        this.scene.add(ambient);

        const main =
            new THREE.DirectionalLight(
                0xffead2,
                2.3
            );

        main.position.set(
            -15,
            25,
            -10
        );

        main.castShadow = true;

        main.shadow.mapSize.width =
            2048;

        main.shadow.mapSize.height =
            2048;

        main.shadow.camera.near =
            0.5;

        main.shadow.camera.far =
            100;

        main.shadow.camera.left =
            -40;

        main.shadow.camera.right =
            40;

        main.shadow.camera.top =
            40;

        main.shadow.camera.bottom =
            -40;

        main.shadow.bias =
            -0.0004;

        this.scene.add(main);
    }

    setupEvents() {
        this.handleResize = () => {
            this.resize();
        };

        window.addEventListener(
            "resize",
            this.handleResize
        );
    }

    start() {
        if (this.running) return;

        this.running = true;
        this.paused = false;

        this.clock.start();

        this.player.enable();

        this.animate();
    }

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

    animate() {
        if (!this.running) return;

        requestAnimationFrame(
            () => this.animate()
        );

        const delta =
            Math.min(
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

    update(delta) {
        this.player.update(delta);
        this.world.update(delta);
    }

    resize() {
        const width =
            window.innerWidth;

        const height =
            window.innerHeight;

        this.camera.aspect =
            width / height;

        this.camera.updateProjectionMatrix();

        this.renderer.setSize(
            width,
            height
        );

        this.renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );
    }

    destroy() {
        this.running = false;

        window.removeEventListener(
            "resize",
            this.handleResize
        );

        this.player.destroy();
        this.world.destroy();

        this.renderer.dispose();

        this.container.innerHTML = "";
    }
}
