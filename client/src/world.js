import * as THREE from "three";

export class World {
    constructor(scene) {
        this.scene = scene;

        this.colliders = [];
        this.interactables = [];
        this.signs = [];
        this.players = [];

        this.materials = {};

        this.createMaterials();
        this.createWorld();
    }

    // ======================================================
    // MATERIALS
    // ======================================================

    createMaterials() {
        this.materials.floor =
            new THREE.MeshStandardMaterial({
                color: 0x3a3732,
                roughness: 0.92
            });

        this.materials.wall =
            new THREE.MeshStandardMaterial({
                color: 0x68645d,
                roughness: 0.88
            });

        this.materials.wallDark =
            new THREE.MeshStandardMaterial({
                color: 0x292724,
                roughness: 0.95
            });

        this.materials.wood =
            new THREE.MeshStandardMaterial({
                color: 0x6f4930,
                roughness: 0.9
            });

        this.materials.sign =
            new THREE.MeshStandardMaterial({
                color: 0xc79b61,
                roughness: 0.82
            });

        this.materials.metal =
            new THREE.MeshStandardMaterial({
                color: 0x454545,
                metalness: 0.75,
                roughness: 0.3
            });

        this.materials.red =
            new THREE.MeshStandardMaterial({
                color: 0x8e2419,
                roughness: 0.7
            });

        this.materials.black =
            new THREE.MeshStandardMaterial({
                color: 0x111111,
                roughness: 0.8
            });

        this.materials.glass =
            new THREE.MeshStandardMaterial({
                color: 0x87959a,
                transparent: true,
                opacity: 0.35,
                roughness: 0.15,
                metalness: 0.1
            });
    }

    // ======================================================
    // WORLD
    // ======================================================

    createWorld() {
        this.createFloor();
        this.createOuterWalls();
        this.createRooms();
        this.createCentralArea();
        this.createTables();
        this.createCrates();
        this.createLights();
        this.createGrid();
    }

    // ======================================================
    // FLOOR
    // ======================================================

    createFloor() {
        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(
                60,
                0.4,
                60
            ),
            this.materials.floor
        );

        floor.position.set(
            0,
            -0.2,
            0
        );

        floor.receiveShadow = true;

        this.scene.add(floor);

        this.colliders.push(floor);
    }

    // ======================================================
    // OUTER WALLS
    // ======================================================

    createOuterWalls() {
        this.createBlock(
            60,
            5,
            0.5,
            0,
            2.5,
            -30,
            this.materials.wallDark
        );

        this.createBlock(
            60,
            5,
            0.5,
            0,
            2.5,
            30,
            this.materials.wallDark
        );

        this.createBlock(
            0.5,
            5,
            60,
            -30,
            2.5,
            0,
            this.materials.wallDark
        );

        this.createBlock(
            0.5,
            5,
            60,
            30,
            2.5,
            0,
            this.materials.wallDark
        );
    }

    // ======================================================
    // INTERNAL ROOMS
    // ======================================================

    createRooms() {
        // North divider
        this.createBlock(
            24,
            4,
            0.4,
            -16,
            2,
            -12,
            this.materials.wall
        );

        this.createBlock(
            10,
            4,
            0.4,
            17,
            2,
            -12,
            this.materials.wall
        );

        // South divider
        this.createBlock(
            20,
            4,
            0.4,
            -20,
            2,
            12,
            this.materials.wall
        );

        this.createBlock(
            16,
            4,
            0.4,
            16,
            2,
            12,
            this.materials.wall
        );

        // West vertical divider
        this.createBlock(
            0.4,
            4,
            18,
            -12,
            2,
            0,
            this.materials.wall
        );

        // East vertical divider
        this.createBlock(
            0.4,
            4,
            16,
            12,
            2,
            4,
            this.materials.wall
        );

        // Small enclosed room
        this.createBlock(
            8,
            3,
            0.4,
            20,
            1.5,
            -5,
            this.materials.wallDark
        );

        this.createBlock(
            0.4,
            3,
            7,
            16,
            1.5,
            -8,
            this.materials.wallDark
        );

        this.createBlock(
            0.4,
            3,
            7,
            24,
            1.5,
            -8,
            this.materials.wallDark
        );
    }

    // ======================================================
    // CENTRAL AREA
    // ======================================================

    createCentralArea() {
        const platform = new THREE.Mesh(
            new THREE.BoxGeometry(
                12,
                0.5,
                8
            ),
            this.materials.wallDark
        );

        platform.position.set(
            0,
            0.25,
            0
        );

        platform.castShadow = true;
        platform.receiveShadow = true;

        this.scene.add(platform);

        this.colliders.push(platform);

        // Central matchbox structure
        this.createBlock(
            7,
            2.2,
            3.2,
            0,
            1.35,
            0,
            this.materials.red
        );

        // Black top
        const top = new THREE.Mesh(
            new THREE.BoxGeometry(
                7.2,
                0.15,
                3.4
            ),
            this.materials.black
        );

        top.position.set(
            0,
            2.55,
            0
        );

        top.castShadow = true;

        this.scene.add(top);

        // Matchbox stripe
        const stripe = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.18,
                2.1,
                3.35
            ),
            this.materials.wallDark
        );

        stripe.position.set(
            0,
            1.4,
            0
        );

        stripe.castShadow = true;

        this.scene.add(stripe);
    }

    // ======================================================
    // TABLES
    // ======================================================

    createTables() {
        this.createTable(
            -20,
            4,
            6,
            2.2
        );

        this.createTable(
            18,
            18,
            6,
            2.2
        );

        this.createTable(
            -20,
            -20,
            7,
            2.2
        );
    }

    createTable(x, z, width, height) {
        const top = new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                0.3,
                2.4
            ),
            this.materials.wood
        );

        top.position.set(
            x,
            height,
            z
        );

        top.castShadow = true;
        top.receiveShadow = true;

        this.scene.add(top);

        const legPositions = [
            [-width / 2 + 0.3, -0.9],
            [width / 2 - 0.3, -0.9],
            [-width / 2 + 0.3, 0.9],
            [width / 2 - 0.3, 0.9]
        ];

        for (const [lx, lz] of legPositions) {
            const leg = new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.3,
                    height,
                    0.3
                ),
                this.materials.metal
            );

            leg.position.set(
                x + lx,
                height / 2,
                z + lz
            );

            leg.castShadow = true;

            this.scene.add(leg);

            this.colliders.push(leg);
        }

        this.colliders.push(top);
    }

    // ======================================================
    // CRATES
    // ======================================================

    createCrates() {
        this.createCrate(
            -24,
            20,
            1.8
        );

        this.createCrate(
            -22,
            20,
            1.8
        );

        this.createCrate(
            23,
            18,
            2
        );

        this.createCrate(
            20,
            -22,
            1.5
        );
    }

    createCrate(x, z, size) {
        const crate = new THREE.Mesh(
            new THREE.BoxGeometry(
                size,
                size,
                size
            ),
            this.materials.wood
        );

        crate.position.set(
            x,
            size / 2,
            z
        );

        crate.castShadow = true;
        crate.receiveShadow = true;

        crate.userData.interactable = true;
        crate.userData.type = "crate";

        this.scene.add(crate);

        this.colliders.push(crate);
        this.interactables.push(crate);
    }

    // ======================================================
    // LIGHTS
    // ======================================================

    createLights() {
        const positions = [
            [-18, 4, -18],
            [18, 4, -18],
            [-18, 4, 18],
            [18, 4, 18],
            [0, 4, 0]
        ];

        for (const [x, y, z] of positions) {
            const light = new THREE.PointLight(
                0xffd7a3,
                3.5,
                15,
                2
            );

            light.position.set(
                x,
                y,
                z
            );

            light.castShadow = true;

            this.scene.add(light);
        }
    }

    // ======================================================
    // GRID
    // ======================================================

    createGrid() {
        const grid = new THREE.GridHelper(
            60,
            60,
            0x5c5852,
            0x282624
        );

        grid.position.y = 0.01;

        this.scene.add(grid);

        this.grid = grid;
    }

    // ======================================================
    // SIGNS
    // ======================================================

    placeSign(position, rotationY = 0) {
        const group = new THREE.Group();

        group.position.copy(position);
        group.rotation.y = rotationY;

        // Sign board
        const board = new THREE.Mesh(
            new THREE.BoxGeometry(
                1.25,
                0.8,
                0.08
            ),
            this.materials.sign
        );

        board.castShadow = true;
        board.receiveShadow = true;

        group.add(board);

        // Left post
        const postLeft = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.08,
                0.8,
                0.08
            ),
            this.materials.wood
        );

        postLeft.position.set(
            -0.42,
            -0.7,
            0
        );

        group.add(postLeft);

        // Right post
        const postRight = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.08,
                0.8,
                0.08
            ),
            this.materials.wood
        );

        postRight.position.set(
            0.42,
            -0.7,
            0
        );

        group.add(postRight);

        group.userData.type = "sign";
        group.userData.playerCreated = true;

        this.scene.add(group);

        this.signs.push(group);

        return group;
    }

    destroySign(sign) {
        if (!sign) return;

        const index =
            this.signs.indexOf(sign);

        if (index !== -1) {
            this.signs.splice(
                index,
                1
            );
        }

        this.scene.remove(sign);

        sign.traverse((object) => {
                        if (object.geometry) {
                object.geometry.dispose();
            }

            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach((material) => {
                        material.dispose();
                    });
                } else {
                    object.material.dispose();
                }
            }
        });
    }

    // ======================================================
    // PLAYERS
    // ======================================================

    addPlayer(player) {
        if (!player) return;

        if (!this.players.includes(player)) {
            this.players.push(player);
        }
    }

    removePlayer(player) {
        const index = this.players.indexOf(player);

        if (index !== -1) {
            this.players.splice(index, 1);
        }
    }

    getPlayers() {
        return this.players;
    }

    // ======================================================
    // SIGNS / INTERACTABLES
    // ======================================================

    getSigns() {
        return this.signs;
    }

    getInteractables() {
        return this.interactables;
    }

    // ======================================================
    // SPARK SWITCH
    // ======================================================

    switchWithPlayer(target) {
        if (!target) return;

        const localPlayer =
            this.players.find(
                player => player.userData?.local === true
            );

        if (!localPlayer) return;

        const localPosition =
            localPlayer.position.clone();

        const targetPosition =
            target.position.clone();

        localPlayer.position.copy(
            targetPosition
        );

        target.position.copy(
            localPosition
        );
    }

    // ======================================================
    // BLOCK CREATION
    // ======================================================

    createBlock(
        width,
        height,
        depth,
        x,
        y,
        z,
        material
    ) {
        const block = new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),
            material
        );

        block.position.set(
            x,
            y,
            z
        );

        block.castShadow = true;
        block.receiveShadow = true;

        this.scene.add(block);

        this.colliders.push(block);

        return block;
    }

    // ======================================================
    // COLLISION HELPERS
    // ======================================================

    getColliders() {
        return this.colliders;
    }

    isPositionBlocked(position, radius = 0.35) {
        const playerBox = new THREE.Box3(
            new THREE.Vector3(
                position.x - radius,
                0,
                position.z - radius
            ),
            new THREE.Vector3(
                position.x + radius,
                1.8,
                position.z + radius
            )
        );

        for (const collider of this.colliders) {
            if (!collider) continue;

            const box = new THREE.Box3()
                .setFromObject(collider);

            if (playerBox.intersectsBox(box)) {
                return true;
            }
        }

        return false;
    }

    // ======================================================
    // WORLD UPDATE
    // ======================================================

    update(delta) {
        // Reserved for doors, moving objects,
        // multiplayer interpolation, etc.
    }

    // ======================================================
    // CLEANUP
    // ======================================================

    destroy() {
        for (const object of [...this.signs]) {
            this.destroySign(object);
        }

        for (const object of this.interactables) {
            if (!object) continue;

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

        this.signs = [];
        this.players = [];
        this.interactables = [];
        this.colliders = [];

        if (this.grid) {
            this.scene.remove(this.grid);
            this.grid.geometry.dispose();

            if (this.grid.material) {
                if (Array.isArray(this.grid.material)) {
                    this.grid.material.forEach(
                        material => material.dispose()
                    );
                } else {
                    this.grid.material.dispose();
                }
            }
        }
    }
}
