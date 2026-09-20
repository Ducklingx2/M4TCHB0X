import * as THREE from "three";

export class World {
    constructor(scene) {
        this.scene = scene;

        this.colliders = [];
        this.interactables = [];
        this.signs = [];
        this.players = [];

        this.roomMeshes = [];
        this.decorations = [];
        this.lights = [];

        this.materials = {};

        this.createMaterials();
        this.createWorld();
    }

    // =========================================================
    // MATERIALS
    // =========================================================

    createMaterials() {
        this.materials.floor = new THREE.MeshStandardMaterial({
            color: 0x292a2b,
            roughness: 0.9,
            metalness: 0.05
        });

        this.materials.floorDark = new THREE.MeshStandardMaterial({
            color: 0x171819,
            roughness: 0.95
        });

        this.materials.wall = new THREE.MeshStandardMaterial({
            color: 0x56585b,
            roughness: 0.82
        });

        this.materials.wallDark = new THREE.MeshStandardMaterial({
            color: 0x202224,
            roughness: 0.92
        });

        this.materials.concrete = new THREE.MeshStandardMaterial({
            color: 0x68696b,
            roughness: 0.9
        });

        this.materials.metal = new THREE.MeshStandardMaterial({
            color: 0x3d4144,
            metalness: 0.8,
            roughness: 0.3
        });

        this.materials.metalDark = new THREE.MeshStandardMaterial({
            color: 0x181a1c,
            metalness: 0.75,
            roughness: 0.4
        });

        this.materials.wood = new THREE.MeshStandardMaterial({
            color: 0x6b4630,
            roughness: 0.85
        });

        this.materials.red = new THREE.MeshStandardMaterial({
            color: 0x9b281b,
            roughness: 0.7
        });

        this.materials.orange = new THREE.MeshStandardMaterial({
            color: 0xff682e,
            emissive: 0x7d1e0b,
            emissiveIntensity: 1.2
        });

        this.materials.yellow = new THREE.MeshStandardMaterial({
            color: 0xffbd4a,
            emissive: 0x633b08,
            emissiveIntensity: 0.8
        });

        this.materials.purple = new THREE.MeshStandardMaterial({
            color: 0x7350a8,
            roughness: 0.5
        });

        this.materials.purpleGlow = new THREE.MeshStandardMaterial({
            color: 0xb47cff,
            emissive: 0x6325a0,
            emissiveIntensity: 1.8,
            roughness: 0.35
        });

        this.materials.glass = new THREE.MeshStandardMaterial({
            color: 0x8da8b5,
            transparent: true,
            opacity: 0.35,
            roughness: 0.12,
            metalness: 0.15
        });

        this.materials.sign = new THREE.MeshStandardMaterial({
            color: 0xc89a5d,
            roughness: 0.82
        });

        this.materials.grass = new THREE.MeshStandardMaterial({
            color: 0x26392a,
            roughness: 1
        });

        this.materials.stone = new THREE.MeshStandardMaterial({
            color: 0x45464a,
            roughness: 1
        });
    }

    // =========================================================
    // WORLD
    // =========================================================

    createWorld() {
        this.createBaseFloor();

        this.createMainRooms();
        this.createConnectingRooms();

        this.createVolcano();
        this.createDisco();
        this.createAmethyst();
        this.createScrapyard();
        this.createMuseum();
        this.createGraveyard();
        this.createMaze();
        this.createDiningHall();
        this.createStorage();
        this.createLounge();
        this.createViewingLobby();

        this.createDoors();
        this.createGeneralDecoration();
        this.createCeilingLights();
    }

    // =========================================================
    // BASE
    // =========================================================

    createBaseFloor() {
        const floor = this.mesh(
            new THREE.BoxGeometry(72, 0.5, 62),
            this.materials.floorDark,
            0,
            -0.25,
            0
        );

        floor.receiveShadow = true;
        this.addCollider(floor);
    }

    // =========================================================
    // ROOM LAYOUT
    // =========================================================

    createMainRooms() {
        // Central atrium
        this.createRoom(
            "ATRIUM",
            18,
            14,
            0,
            0,
            this.materials.concrete
        );

        // Upper / north rooms
        this.createRoom(
            "VOLCANO",
            12,
            10,
            0,
            -13,
            this.materials.wallDark
        );

        this.createRoom(
            "DISCO",
            10,
            9,
            -15,
            -13,
            this.materials.wallDark
        );

        // Western chain
        this.createRoom(
            "AMETHYST",
            9,
            9,
            -17,
            0,
            this.materials.wallDark
        );

        this.createRoom(
            "SCRAPYARD",
            10,
            9,
            -17,
            13,
            this.materials.wallDark
        );

        this.createRoom(
            "MUSEUM",
            13,
            9,
            -5,
            15,
            this.materials.wallDark
        );

        // Eastern chain
        this.createRoom(
            "GRAVEYARD",
            11,
            9,
            15,
            0,
            this.materials.wallDark
        );

        this.createRoom(
            "MAZE",
            12,
            10,
            19,
            13,
            this.materials.wallDark
        );

        this.createRoom(
            "DINING",
            12,
            9,
            19,
            -13,
            this.materials.wallDark
        );
    }

    createConnectingRooms() {
        this.createRoom(
            "STORAGE",
            8,
            7,
            -7,
            -13,
            this.materials.wallDark
        );

        this.createRoom(
            "LOUNGE",
            8,
            7,
            8,
            14,
            this.materials.wallDark
        );

        this.createRoom(
            "VIEWING",
            8,
            7,
            8,
            -14,
            this.materials.wallDark
        );

        // Narrow corridors
        this.createCorridor(
            0,
            -7,
            3,
            7
        );

        this.createCorridor(
            -9,
            0,
            7,
            3
        );

        this.createCorridor(
            -9,
            7,
            3,
            8
        );

        this.createCorridor(
            9,
            0,
            7,
            3
        );

        this.createCorridor(
            15,
            7,
            3,
            8
        );

        this.createCorridor(
            8,
            -7,
            3,
            7
        );

        this.createCorridor(
            -5,
            13,
            7,
            3
        );

        this.createCorridor(
            12,
            13,
            7,
            3
        );
    }

    // =========================================================
    // ROOM BUILDER
    // =========================================================

    createRoom(name, width, depth, x, z, floorMaterial) {
        const floor = this.mesh(
            new THREE.BoxGeometry(width, 0.25, depth),
            floorMaterial,
            x,
            0.05,
            z
        );

        floor.receiveShadow = true;

        this.roomMeshes.push(floor);

        const wallHeight = 4;

        const north = this.mesh(
            new THREE.BoxGeometry(width, wallHeight, 0.35),
            this.materials.wall,
            x,
            wallHeight / 2,
            z - depth / 2
        );

        const south = this.mesh(
            new THREE.BoxGeometry(width, wallHeight, 0.35),
            this.materials.wall,
            x,
            wallHeight / 2,
            z + depth / 2
        );

        const west = this.mesh(
            new THREE.BoxGeometry(0.35, wallHeight, depth),
            this.materials.wall,
            x - width / 2,
            wallHeight / 2,
            z
        );

        const east = this.mesh(
            new THREE.BoxGeometry(0.35, wallHeight, depth),
            this.materials.wall,
            x + width / 2,
            wallHeight / 2,
            z
        );

        for (const wall of [north, south, west, east]) {
            wall.castShadow = true;
            wall.receiveShadow = true;
            this.addCollider(wall);
        }

        floor.userData.room = name;

        return {
            name,
            x,
            z,
            width,
            depth
        };
    }

    createCorridor(x, z, width, depth) {
        const floor = this.mesh(
            new THREE.BoxGeometry(width, 0.2, depth),
            this.materials.floor,
            x,
            0.05,
            z
        );

        floor.receiveShadow = true;
    }

    // =========================================================
    // VOLCANO
    // =========================================================

    createVolcano() {
        const x = 0;
        const z = -13;

        const crater = new THREE.Mesh(
            new THREE.CylinderGeometry(3.5, 4.5, 0.8, 16),
            this.materials.metalDark
        );

        crater.position.set(x, 0.5, z);
        crater.castShadow = true;

        this.scene.add(crater);
        this.addCollider(crater);

        const lava = new THREE.Mesh(
            new THREE.CylinderGeometry(2.7, 2.7, 0.12, 24),
            this.materials.orange
        );

        lava.position.set(x, 0.95, z);

        this.scene.add(lava);

        const lavaLight = new THREE.PointLight(
            0xff4a18,
            8,
            12
        );

        lavaLight.position.set(x, 2, z);
        this.scene.add(lavaLight);
        this.lights.push(lavaLight);

        for (let i = 0; i < 5; i++) {
            const pipe = this.createCylinder(
                0.18,
                3.5,
                this.materials.metal
            );

            pipe.position.set(
                x - 4 + i * 2,
                1.8,
                z + 3
            );

            pipe.rotation.z = Math.PI / 2;

            this.scene.add(pipe);
            this.addCollider(pipe);
        }
    }

    // =========================================================
    // DISCO
    // =========================================================

    createDisco() {
        const x = -15;
        const z = -13;

        const floor = this.mesh(
            new THREE.BoxGeometry(6, 0.15, 5),
            this.materials.black,
            x,
            0.15,
            z
        );

        this.createNeonStrip(x - 2.8, 0.3, z);
        this.createNeonStrip(x + 2.8, 0.3, z);

        const discoBall = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 16, 16),
            this.materials.metal
        );

        discoBall.position.set(x, 3.3, z);

        this.scene.add(discoBall);

        const lightColors = [
            0xff3344,
            0x33aaff,
            0xcc44ff,
            0x44ff99
        ];

        lightColors.forEach((color, i) => {
            const light = new THREE.PointLight(
                color,
                4,
                10
            );

            light.position.set(
                x + Math.cos(i * 1.57) * 3,
                2.8,
                z + Math.sin(i * 1.57) * 3
            );

            this.scene.add(light);
            this.lights.push(light);
        });
    }

    createNeonStrip(x, y, z) {
        const strip = this.mesh(
            new THREE.BoxGeometry(0.12, 0.12, 5),
            this.materials.red,
            x,
            y,
            z
        );

        strip.material.emissive = new THREE.Color(0x55100a);
        strip.material.emissiveIntensity = 2;
    }

    // =========================================================
    // AMETHYST
    // =========================================================

    createAmethyst() {
        const x = -17;
        const z = 0;

        for (let i = 0; i < 12; i++) {
            const crystal = new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.35 + Math.random() * 0.3,
                    1.5 + Math.random() * 1.7,
                    6
                ),
                this.materials.purpleGlow
            );

            crystal.position.set(
                x + (Math.random() - 0.5) * 6,
                0.9,
                z + (Math.random() - 0.5) * 6
            );

            crystal.rotation.z =
                (Math.random() - 0.5) * 0.4;

            crystal.rotation.x =
                (Math.random() - 0.5) * 0.3;

            this.scene.add(crystal);
            this.decorations.push(crystal);
        }

        const light = new THREE.PointLight(
            0x8c4dff,
            6,
            12
        );

        light.position.set(x, 2.5, z);

        this.scene.add(light);
        this.lights.push(light);
    }

    // =========================================================
    // SCRAPYARD
    // =========================================================

    createScrapyard() {
        const x = -17;
        const z = 13;

        for (let i = 0; i < 15; i++) {
            const size = 0.7 + Math.random() * 1;

            const scrap = this.mesh(
                new THREE.BoxGeometry(
                    size,
                    size * 0.7,
                    size
                ),
                this.materials.metal,
                x + (Math.random() - 0.5) * 7,
                size * 0.35,
                z + (Math.random() - 0.5) * 6
            );

            scrap.rotation.y =
                Math.random() * Math.PI;

            scrap.castShadow = true;

            this.addCollider(scrap);
        }
    }

    // =========================================================
    // MUSEUM
    // =========================================================

    createMuseum() {
        const x = -5;
        const z = 15;

        for (let i = 0; i < 4; i++) {
            const display = this.mesh(
                new THREE.BoxGeometry(
                    1.8,
                    1.2,
                    1.4
                ),
                this.materials.glass,
                x - 4 + i * 2.5,
                0.7,
                z
            );

            display.material.transparent = true;

            this.addCollider(display);

            const exhibit = new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.6,
                    0.8,
                    0.6
                ),
                i % 2 === 0
                    ? this.materials.red
                    : this.materials.purple
            );

            exhibit.position.set(
                x - 4 + i * 2.5,
                1.25,
                z
            );

            this.scene.add(exhibit);
        }
    }

    // =========================================================
    // GRAVEYARD
    // =========================================================

    createGraveyard() {
        const x = 15;
        const z = 0;

        for (let i = 0; i < 12; i++) {
            const grave = this.mesh(
                new THREE.BoxGeometry(
                    0.65,
                    0.9,
                    0.2
                ),
                this.materials.stone,
                x + (Math.random() - 0.5) * 8,
                0.45,
                z + (Math.random() - 0.5) * 6
            );

            grave.rotation.y =
                (Math.random() - 0.5) * 0.15;

            this.addCollider(grave);
        }

        const tree = this.mesh(
            new THREE.CylinderGeometry(
                0.45,
                0.65,
                4,
                8
            ),
            this.materials.wood,
            x + 3,
            2,
            z - 2
        );

        this.addCollider(tree);
    }

    // =========================================================
    // MAZE
    // =========================================================

    createMaze() {
        const x = 19;
        const z = 13;

        const walls = [
            [0, -3, 7, 0.35],
            [-3, 0, 0.35, 6],
            [3, 1, 0.35, 6],
            [-1, 3, 5, 0.35],
            [0, -0.5, 0.35, 4],
            [2, -2, 0.35, 3]
        ];

        for (const [ox, oz, width, depth] of walls) {
            const wall = this.mesh(
                new THREE.BoxGeometry(
                    width,
                    2.4,
                    depth
                ),
                this.materials.wallDark,
                x + ox,
                1.2,
                z + oz
            );

            this.addCollider(wall);
        }
    }

    // =========================================================
    // DINING HALL
    // =========================================================

    createDiningHall() {
        const x = 19;
        const z = -13;

        for (let i = 0; i < 2; i++) {
            this.createTable(
                x - 3 + i * 6,
                z,
                4,
                1.5
            );
        }

        const counter = this.mesh(
            new THREE.BoxGeometry(
                7,
                1.2,
                0.8
            ),
            this.materials.wood,
            x,
            0.6,
            z - 3
        );

        this.addCollider(counter);
    }

    // =========================================================
    // STORAGE
    // =========================================================

    createStorage() {
        const x = -7;
        const z = -13;

        for (let row = 0; row < 2; row++) {
            for (let i = 0; i < 4; i++) {
                const shelf = this.mesh(
                    new THREE.BoxGeometry(
                        0.9,
                        2,
                        1.2
                    ),
                    this.materials.wood,
                    x - 3 + i * 2,
                    1,
                    z + row * 2 - 1
                );

                this.addCollider(shelf);
            }
        }
    }

    // =========================================================
    // LOUNGE
    // =========================================================

    createLounge() {
        const x = 8;
        const z = 14;

        const sofa = this.mesh(
            new THREE.BoxGeometry(
                4,
                0.8,
                1.3
            ),
            this.materials.red,
            x,
            0.5,
            z
        );

        this.addCollider(sofa);

        const table = this.mesh(
            new THREE.BoxGeometry(
                2,
                0.35,
                1.2
            ),
            this.materials.wood,
            x,
            0.7,
            z + 2
        );

        this.addCollider(table);
    }

    // =========================================================
    // VIEWING LOBBY
    // =========================================================

    createViewingLobby() {
        const x = 8;
        const z = -14;

        const window = this.mesh(
            new THREE.BoxGeometry(
                6,
                2.8,
                0.12
            ),
            this.materials.glass,
            x,
            2,
            z - 3
        );

        window.material.emissive =
            new THREE.Color(0x15242d);

        window.material.emissiveIntensity = 0.5;

        // Large object visible beyond the glass.
        const structure = this.mesh(
            new THREE.CylinderGeometry(
                3,
                4,
                7,
                12
            ),
            this.materials.metalDark,
            x,
            3,
            z - 7
        );

        this.addCollider(structure);
    }

    // =========================================================
    // TABLE
    // =========================================================

    createTable(x, z, width, height) {
        const top = this.mesh(
            new THREE.BoxGeometry(
                width,
                0.3,
                2
            ),
            this.materials.wood,
            x,
            height,
            z
        );

        this.addCollider(top);

        const legPositions = [
            [-width / 2 + 0.25, -0.7],
            [width / 2 - 0.25, -0.7],
            [-width / 2 + 0.25, 0.7],
            [width / 2 - 0.25, 0.7]
        ];

        for (const [lx, lz] of legPositions) {
            const leg = this.mesh(
                new THREE.BoxGeometry(
                    0.25,
                    height,
                    0.25
                ),
                this.materials.metal,
                x + lx,
                height / 2,
                z + lz
            );

            this.addCollider(leg);
        }
    }

    // =========================================================
    // DOORS
    // =========================================================

    createDoors() {
        const doors = [
            [0, -6.7, 2.5, 0.25],
            [-9, 0, 0.25, 2.5],
            [9, 0, 0.25, 2.5],
            [15, 7, 0.25, 2.5]
        ];

        for (const [x, z, width, depth] of doors) {
            const door = this.mesh(
                new THREE.BoxGeometry(
                    width,
                    3,
                    depth
                ),
                this.materials.metalDark,
                x,
                1.5,
                z
            );

            door.userData.type = "door";
            door.userData.locked = false;

            this.interactables.push(door);
        }
    }

    // =========================================================
    // GENERAL DECORATION
    // =========================================================

    createGeneralDecoration() {
        for (const [x, z] of [
            [-27, -26],
            [27, -25],
            [-27, 26],
            [27, 26]
        ]) {
            this.createCrate(x, z, 1.6);
        }
    }

    createCrate(x, z, size) {
        const crate = this.mesh(
            new THREE.BoxGeometry(
                size,
                size,
                size
            ),
            this.materials.wood,
            x,
            size / 2,
            z
        );

        crate.userData.type = "crate";
        crate.userData.interactable = true;

        this.addCollider(crate);
        this.interactables.push(crate);
    }

    // =========================================================
    // LIGHTING
    // =========================================================

    createCeilingLights() {
        const positions = [
            [-18, -20],
            [0, -20],
            [18, -20],
            [-18, 0],
            [0, 0],
            [18, 0],
            [-18, 20],
            [0, 20],
            [18, 20]
        ];

        for (const [x, z] of positions) {
            const light = new THREE.PointLight(
                0xffd9ad,
                2.2,
                14,
                2
            );

            light.position.set(
                x,
                3.6,
                z
            );

            this.scene.add(light);
            this.lights.push(light);

            const fixture = this.mesh(
                new THREE.BoxGeometry(
                    0.8,
                    0.12,
                    0.8
                ),
                this.materials.yellow,
                x,
                3.95,
                z
            );

            fixture.material.emissiveIntensity = 1.5;
        }
    }

    // =========================================================
    // SIGNS
    // =========================================================

    placeSign(position, rotationY = 0) {
        const placement = this.validateSignPlacement(
            position,
            rotationY
        );

        if (!placement.valid) {
            return null;
        }

        const group = new THREE.Group();

        group.position.copy(placement.position);
        group.rotation.y = rotationY;

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

        const post = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.08,
                0.8,
                0.08
            ),
            this.materials.wood
        );

        post.position.y = -0.7;

        group.add(post);

        group.userData.type = "sign";
        group.userData.playerCreated = true;
        group.userData.owner = "LOCAL";

        this.scene.add(group);

        this.signs.push(group);

        return group;
    }

    validateSignPlacement(position, rotationY) {
        const pos = position.clone();

        // Signs must sit on the floor.
        pos.y = 1.0;

        const halfWidth = 0.7;
        const halfDepth = 0.08;

        const box = new THREE.Box3(
            new THREE.Vector3(
                pos.x - halfWidth,
                0,
                pos.z - halfDepth
            ),
            new THREE.Vector3(
                pos.x + halfWidth,
                1.8,
                pos.z + halfDepth
            )
        );

        // Don't put signs inside walls or furniture.
        for (const collider of this.colliders) {
            if (!collider) continue;

            const colliderBox =
                new THREE.Box3().setFromObject(collider);

            if (box.intersectsBox(colliderBox)) {
                return {
                    valid: false
                };
            }
        }

        // Don't stack signs directly on one another.
        for (const sign of this.signs) {
            const distance = new THREE.Vector2(
                sign.position.x,
                sign.position.z
            ).distanceTo(
                new THREE.Vector2(
                    pos.x,
                    pos.z
                )
            );

            if (distance < 1.2) {
                return {
                    valid: false
                };
            }
        }

        return {
            valid: true,
            position: pos
        };
    }

    destroySign(sign) {
        if (!sign) return;

        const index =
            this.signs.indexOf(sign);

        if (index !== -1) {
            this.signs.splice(index, 1);
        }

        this.scene.remove(sign);

        sign.traverse(object => {
            if (object.geometry) {
                object.geometry.dispose();
            }
        });
    }

    getSigns() {
        return this.signs;
    }

    // =========================================================
    // PLAYERS
    // =========================================================

    addPlayer(player) {
        if (!player) return;

        if (!this.players.includes(player)) {
            this.players.push(player);
        }
    }

    removePlayer(player) {
        const index =
            this.players.indexOf(player);

        if (index !== -1) {
            this.players.splice(index, 1);
        }
    }

    getPlayers() {
        return this.players;
    }

    // =========================================================
    // COLLISION
    // =========================================================

    addCollider(object) {
        if (!object) return;

        object.userData.collider = true;

        this.colliders.push(object);
    }

    getColliders() {
        return this.colliders;
    }

    getCollisionBox(object) {
        return new THREE.Box3().setFromObject(object);
    }

    canMoveTo(position, radius = 0.35, height = 1.8) {
        const playerBox = new THREE.Box3(
            new THREE.Vector3(
                position.x - radius,
                0.05,
                position.z - radius
            ),
            new THREE.Vector3(
                position.x + radius,
                height,
                position.z + radius
            )
        );

        for (const collider of this.colliders) {
            if (!collider) continue;

            const box =
                this.getCollisionBox(collider);

            if (playerBox.intersectsBox(box)) {
                return false;
            }
        }

        return true;
    }

    // =========================================================
    // SPARK SWITCH
    // =========================================================

    switchWithPlayer(target) {
        if (!target) return false;

        const localPlayer =
            this.players.find(
                player =>
                    player.userData?.local === true
            );

        if (!localPlayer) return false;

        const localPosition =
            localPlayer.position.clone();

        localPlayer.position.copy(
            target.position
        );

        target.position.copy(
            localPosition
        );

        return true;
    }

    // =========================================================
    // HELPERS
    // =========================================================

    mesh(geometry, material, x, y, z) {
        const mesh = new THREE.Mesh(
            geometry,
            material
        );

        mesh.position.set(
            x,
            y,
            z
        );

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        this.scene.add(mesh);

        return mesh;
    }

    createCylinder(radius, height, material) {
        return new THREE.Mesh(
            new THREE.CylinderGeometry(
                radius,
                radius,
                height,
                12
            ),
            material
        );
    }

    // =========================================================
    // UPDATE
    // =========================================================

    update(delta) {
        // Future:
        // - Flicker event
        // - animated lights
        // - doors
        // - multiplayer interpolation
    }

    // =========================================================
    // CLEANUP
    // =========================================================

    destroy() {
        for (const sign of [...this.signs]) {
            this.destroySign(sign);
        }

        for (const object of this.scene.children.slice()) {
            if (object === this.scene) continue;

            if (
                object.userData?.worldObject ||
                this.colliders.includes(object) ||
                this.decorations.includes(object)
            ) {
                this.scene.remove(object);
            }
        }

        this.colliders = [];
        this.interactables = [];
        this.signs = [];
        this.players = [];
        this.roomMeshes = [];
        this.decorations = [];
        this.lights = [];
    }
}
