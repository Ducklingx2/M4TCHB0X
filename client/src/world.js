import * as THREE from "three";

export class World {
    constructor(scene) {
        this.scene = scene;

        this.interactables = [];
        this.colliders = [];

        this.blockSize = 1;

        this.materials = {
            floor: new THREE.MeshStandardMaterial({
                color: 0x3b3935,
                roughness: 0.92
            }),

            wall: new THREE.MeshStandardMaterial({
                color: 0x56514a,
                roughness: 0.88
            }),

            wallDark: new THREE.MeshStandardMaterial({
                color: 0x292824,
                roughness: 0.94
            }),

            wood: new THREE.MeshStandardMaterial({
                color: 0x664b37,
                roughness: 0.9
            }),

            metal: new THREE.MeshStandardMaterial({
                color: 0x55524d,
                metalness: 0.55,
                roughness: 0.55
            }),

            red: new THREE.MeshStandardMaterial({
                color: 0x8c3024,
                roughness: 0.8
            }),

            glass: new THREE.MeshStandardMaterial({
                color: 0x777873,
                transparent: true,
                opacity: 0.35,
                roughness: 0.15
            })
        };

        this.build();
    }

    // =========================================================
    // WORLD BUILD
    // =========================================================

    build() {
        this.createFloor();
        this.createWalls();
        this.createRooms();
        this.createCenterArea();
        this.createProps();
        this.createSpawn();
    }

    // =========================================================
    // BASIC BLOCK
    // =========================================================

    createBlock(
        x,
        y,
        z,
        width,
        height,
        depth,
        material,
        options = {}
    ) {
        const geometry =
            new THREE.BoxGeometry(
                width,
                height,
                depth
            );

        const mesh =
            new THREE.Mesh(
                geometry,
                material
            );

        mesh.position.set(
            x,
            y,
            z
        );

        mesh.castShadow =
            options.castShadow !== false;

        mesh.receiveShadow =
            options.receiveShadow !== false;

        this.scene.add(mesh);

        if (options.collider !== false) {
            this.colliders.push(mesh);
        }

        if (options.interactable) {
            this.interactables.push(mesh);
        }

        return mesh;
    }

    // =========================================================
    // FLOOR
    // =========================================================

    createFloor() {
        const floor = this.createBlock(
            0,
            -0.5,
            0,
            60,
            1,
            60,
            this.materials.floor,
            {
                collider: false
            }
        );

        floor.receiveShadow = true;

        /*
         * Subtle grid-like floor divisions.
         * These are visual only.
         */

        const grid = new THREE.GridHelper(
            60,
            60,
            0x504d47,
            0x292824
        );

        grid.position.y = 0.012;

        this.scene.add(grid);
    }

    // =========================================================
    // OUTER WALLS
    // =========================================================

    createWalls() {
        const wallHeight = 5;
        const thickness = 0.7;
        const size = 30;

        // North
        this.createBlock(
            0,
            wallHeight / 2,
            -size,
            size * 2,
            wallHeight,
            thickness,
            this.materials.wallDark
        );

        // South
        this.createBlock(
            0,
            wallHeight / 2,
            size,
            size * 2,
            wallHeight,
            thickness,
            this.materials.wallDark
        );

        // West
        this.createBlock(
            -size,
            wallHeight / 2,
            0,
            thickness,
            wallHeight,
            size * 2,
            this.materials.wallDark
        );

        // East
        this.createBlock(
            size,
            wallHeight / 2,
            0,
            thickness,
            wallHeight,
            size * 2,
            this.materials.wallDark
        );
    }

    // =========================================================
    // ROOMS
    // =========================================================

    createRooms() {
        /*
         * EAST ROOM
         */

        this.createBlock(
            14,
            2.5,
            8,
            0.6,
            5,
            12,
            this.materials.wall
        );

        this.createBlock(
            14,
            2.5,
            -8,
            0.6,
            5,
            12,
            this.materials.wall
        );

        /*
         * WEST ROOM
         */

        this.createBlock(
            -14,
            2.5,
            8,
            0.6,
            5,
            12,
            this.materials.wall
        );

        this.createBlock(
            -14,
            2.5,
            -8,
            0.6,
            5,
            12,
            this.materials.wall
        );

        /*
         * NORTH DIVIDER
         */

        this.createBlock(
            -8,
            2.5,
            -14,
            12,
            5,
            0.6,
            this.materials.wall
        );

        this.createBlock(
            8,
            2.5,
            -14,
            12,
            5,
            0.6,
            this.materials.wall
        );

        /*
         * SOUTH DIVIDER
         */

        this.createBlock(
            -8,
            2.5,
            14,
            12,
            5,
            0.6,
            this.materials.wall
        );

        this.createBlock(
            8,
            2.5,
            14,
            12,
            5,
            0.6,
            this.materials.wall
        );
    }

    // =========================================================
    // CENTER AREA
    // =========================================================

    createCenterArea() {
        /*
         * Central raised platform.
         */

        this.createBlock(
            0,
            0.15,
            0,
            8,
            0.3,
            8,
            this.materials.wood,
            {
                collider: false
            }
        );

        /*
         * Matchbox-like central structure.
         */

        this.createBlock(
            0,
            1.15,
            0,
            3.5,
            2,
            2.2,
            this.materials.red
        );

        /*
         * Top lip.
         */

        this.createBlock(
            0,
            2.25,
            0,
            3.9,
            0.2,
            2.5,
            this.materials.metal
        );
    }

    // =========================================================
    // PROPS
    // =========================================================

    createProps() {
        /*
         * Tables
         */

        this.createTable(
            -8,
            0,
            -7
        );

        this.createTable(
            8,
            0,
            7
        );

        this.createTable(
            -8,
            0,
            7
        );

        this.createTable(
            8,
            0,
            -7
        );

        /*
         * Crates
         */

        this.createCrate(
            -21,
            0,
            -20
        );

        this.createCrate(
            -19,
            0,
            -20
        );

        this.createCrate(
            21,
            0,
            20
        );

        /*
         * Lamps
         */

        this.createLamp(
            -7,
            0,
            0
        );

        this.createLamp(
            7,
            0,
            0
        );
    }

    createTable(x, y, z) {
        const top = this.createBlock(
            x,
            y + 1.1,
            z,
            3,
            0.25,
            1.6,
            this.materials.wood
        );

        const legPositions = [
            [-1.2, -0.6],
            [1.2, -0.6],
            [-1.2, 0.6],
            [1.2, 0.6]
        ];

        for (const [lx, lz] of legPositions) {
            this.createBlock(
                x + lx,
                y + 0.5,
                z + lz,
                0.18,
                1,
                0.18,
                this.materials.wood
            );
        }

        return top;
    }

    createCrate(x, y, z) {
        return this.createBlock(
            x,
            y + 0.6,
            z,
            1.2,
            1.2,
            1.2,
            this.materials.wood,
            {
                interactable: true
            }
        );
    }

    createLamp(x, y, z) {
        this.createBlock(
            x,
            y + 2.7,
            z,
            0.15,
            5.4,
            0.15,
            this.materials.metal
        );

        this.createBlock(
            x,
            y + 5.2,
            z,
            0.8,
            0.35,
            0.8,
            this.materials.red,
            {
                collider: false
            }
        );

        const light =
            new THREE.PointLight(
                0xffb07c,
                4,
                12
            );

        light.position.set(
            x,
            y + 4.8,
            z
        );

        light.castShadow = true;

        this.scene.add(light);
    }

    // =========================================================
    // SPAWN
    // =========================================================

    createSpawn() {
        /*
         * Spawn marker.
         * Invisible during normal gameplay.
         */

        this.spawn = new THREE.Vector3(
            0,
            0,
            10
        );
    }

    getSpawnPosition() {
        return this.spawn.clone();
    }

    // =========================================================
    // INTERACTION
    // =========================================================

    getInteractableObjects() {
        return this.interactables;
    }

    // =========================================================
    // FLOOR HEIGHT
    // =========================================================

    getFloorHeight(x, z) {
        /*
         * Prototype currently uses a flat floor.
         *
         * This method exists so we can later add:
         * - stairs
         * - raised rooms
         * - platforms
         * - uneven terrain
         */

        return 0;
    }

    // =========================================================
    // UPDATE
    // =========================================================

    update(delta) {
        /*
         * World animations will eventually live here.
         *
         * Examples:
         * - flickering lights
         * - moving doors
         * - round events
         * - locked rooms
         */

        void delta;
    }

    // =========================================================
    // CLEANUP
    // =========================================================

    destroy() {
        for (const object of [...this.scene.children]) {
            if (
                object.isMesh ||
                object.isLight ||
                object.isGridHelper
            ) {
                this.scene.remove(object);

                if (object.geometry) {
                    object.geometry.dispose();
                }

                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(
                            material => material.dispose()
                        );
                    } else {
                        object.material.dispose();
                    }
                }
            }
        }

        this.interactables = [];
        this.colliders = [];
    }
}
