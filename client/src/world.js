import * as THREE from "three";

export class World {
    constructor(scene) {
        this.scene = scene;

        this.colliders = [];
        this.interactables = [];
        this.signs = [];
        this.players = [];
        this.lights = [];

        this.materials = {};
        this.rooms = {};

        this.createMaterials();
        this.createWorld();
    }

    // =========================================================
    // MATERIALS
    // =========================================================

    createMaterials() {
        this.materials.floor = new THREE.MeshStandardMaterial({
            color: 0x242424,
            roughness: 0.82,
            metalness: 0.12
        });

        this.materials.floorDark = new THREE.MeshStandardMaterial({
            color: 0x151515,
            roughness: 0.9,
            metalness: 0.05
        });

        this.materials.wall = new THREE.MeshStandardMaterial({
            color: 0x303236,
            roughness: 0.72,
            metalness: 0.2
        });

        this.materials.wallDark = new THREE.MeshStandardMaterial({
            color: 0x17191b,
            roughness: 0.82,
            metalness: 0.15
        });

        this.materials.metal = new THREE.MeshStandardMaterial({
            color: 0x555a60,
            roughness: 0.38,
            metalness: 0.82
        });

        this.materials.darkMetal = new THREE.MeshStandardMaterial({
            color: 0x202327,
            roughness: 0.3,
            metalness: 0.9
        });

        this.materials.red = new THREE.MeshStandardMaterial({
            color: 0x8e241b,
            roughness: 0.5,
            metalness: 0.35
        });

        this.materials.orange = new THREE.MeshStandardMaterial({
            color: 0xd76b25,
            roughness: 0.42,
            metalness: 0.25,
            emissive: 0x351006,
            emissiveIntensity: 0.35
        });

        this.materials.yellow = new THREE.MeshStandardMaterial({
            color: 0xe3b42d,
            roughness: 0.5,
            metalness: 0.15
        });

        this.materials.purple = new THREE.MeshStandardMaterial({
            color: 0x6f3aa8,
            roughness: 0.4,
            metalness: 0.1,
            emissive: 0x250d45,
            emissiveIntensity: 0.55
        });

        this.materials.crystal = new THREE.MeshStandardMaterial({
            color: 0x9d63e8,
            roughness: 0.2,
            metalness: 0.05,
            emissive: 0x4c167a,
            emissiveIntensity: 0.7,
            transparent: true,
            opacity: 0.88
        });

        this.materials.blue = new THREE.MeshStandardMaterial({
            color: 0x356d9c,
            roughness: 0.35,
            metalness: 0.4,
            emissive: 0x0c2032,
            emissiveIntensity: 0.4
        });

        this.materials.green = new THREE.MeshStandardMaterial({
            color: 0x385e43,
            roughness: 0.8,
            metalness: 0.05
        });

        this.materials.wood = new THREE.MeshStandardMaterial({
            color: 0x67452d,
            roughness: 0.86,
            metalness: 0.05
        });

        this.materials.sign = new THREE.MeshStandardMaterial({
            color: 0xd5bd83,
            roughness: 0.95,
            metalness: 0
        });

        this.materials.glass = new THREE.MeshPhysicalMaterial({
            color: 0x78a8bb,
            transparent: true,
            opacity: 0.28,
            roughness: 0.1,
            metalness: 0.1
        });

        this.materials.lava = new THREE.MeshStandardMaterial({
            color: 0xff4b16,
            emissive: 0xff2400,
            emissiveIntensity: 2.2,
            roughness: 0.4
        });

        this.materials.white = new THREE.MeshStandardMaterial({
            color: 0xd7d7d7,
            roughness: 0.65
        });
    }

    // =========================================================
    // WORLD
    // =========================================================

    createWorld() {
        this.createGround();

        /*
             MAP LAYOUT

                              VOLCANO
                                 |
                          ┌──────┴──────┐
                          │             │
                          │   ATRIUM    ├───────┐
                          │             │       │
                          └──────┬──────┘     ROOM
                                 │
                 ┌───────┐      │
                 │ ROOM  ├──────┘
                 └───┬───┘
                     │
                 ┌───┴───┐
                 │ ROOM  │
                 └───┬───┘
                     │
                 ┌───┴────────┐
                 │    ROOM    │
                 └────────────┘

        The exact visual rooms are built around this structure.
        */

        // CENTRAL AREA
        this.createAtrium(0, 0, 22, 18);

        // TOP
        this.createVolcano(0, -24, 15, 15);

        // LEFT CHAIN
        this.createDisco(-20, -2, 11, 10);
        this.createAmethyst(-25, 11, 11, 12);
        this.createScrapyard(-25, 25, 16, 10);

        // LOWER / LEFT
        this.createMuseum(-5, 27, 15, 10);

        // RIGHT
        this.createGraveyard(19, -1, 13, 11);
        this.createMaze(34, 4, 15, 15);

        // LOWER CENTRAL
        this.createDiningHall(4, 20, 17, 11);

        // LOWER RIGHT
        this.createStorage(23, 22, 12, 10);
        this.createLounge(38, 22, 14, 10);
        this.createViewingLobby(39, 35, 18, 12);

        // CONNECTIONS
        this.createCorridor(
            0,
            -13,
            5,
            10,
            "vertical"
        );

        this.createCorridor(
            -12,
            -2,
            8,
            4,
            "horizontal"
        );

        this.createCorridor(
            -25,
            4,
            4,
            8,
            "vertical"
        );

        this.createCorridor(
            -25,
            18,
            4,
            8,
            "vertical"
        );

        this.createCorridor(
            -13,
            23,
            10,
            4,
            "horizontal"
        );

        this.createCorridor(
            14,
            -1,
            10,
            4,
            "horizontal"
        );

        this.createCorridor(
            28,
            4,
            10,
            4,
            "horizontal"
        );

        this.createCorridor(
            4,
            10,
            4,
            10,
            "vertical"
        );

        this.createCorridor(
            15,
            22,
            8,
            4,
            "horizontal"
        );

        this.createCorridor(
            30,
            22,
            10,
            4,
            "horizontal"
        );

        this.createCorridor(
            39,
            28,
            4,
            8,
            "vertical"
        );

        this.createLighting();
        this.createSpawnArea();
    }

    // =========================================================
    // BASIC BUILDING
    // =========================================================

    createGround() {
        const ground = new THREE.Mesh(
            new THREE.BoxGeometry(110, 0.5, 90),
            this.materials.floorDark
        );

        ground.position.set(5, -0.3, 12);
        ground.receiveShadow = true;

        this.scene.add(ground);

        this.colliders.push(ground);
    }

    addBox(
        geometry,
        material,
        x,
        y,
        z,
        {
            collider = false,
            castShadow = true,
            receiveShadow = true
        } = {}
    ) {
        const mesh = new THREE.Mesh(
            geometry,
            material
        );

        mesh.position.set(x, y, z);

        mesh.castShadow = castShadow;
        mesh.receiveShadow = receiveShadow;

        this.scene.add(mesh);

        if (collider) {
            this.colliders.push(mesh);
        }

        return mesh;
    }

    wall(x, z, width, depth, height = 3.4) {
        return this.addBox(
            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),
            this.materials.wall,
            x,
            height / 2,
            z,
            {
                collider: true
            }
        );
    }

    floor(x, z, width, depth, material = this.materials.floor) {
        return this.addBox(
            new THREE.BoxGeometry(
                width,
                0.18,
                depth
            ),
            material,
            x,
            0.05,
            z,
            {
                collider: true
            }
        );
    }

    // =========================================================
    // ROOM WITH DOOR OPENINGS
    // =========================================================

    createRoomBase(
        name,
        x,
        z,
        width,
        depth,
        floorMaterial = this.materials.floor
    ) {
        this.rooms[name] = {
            name,
            x,
            z,
            width,
            depth
        };

        this.floor(
            x,
            z,
            width,
            depth,
            floorMaterial
        );

        const t = 0.6;
        const h = 3.4;

        // North wall
        this.wall(
            x,
            z - depth / 2,
            width,
            t,
            h
        );

        // South wall
        this.wall(
            x,
            z + depth / 2,
            width,
            t,
            h
        );

        // West wall
        this.wall(
            x - width / 2,
            z,
            t,
            depth,
            h
        );

        // East wall
        this.wall(
            x + width / 2,
            z,
            t,
            depth,
            h
        );

        // Door-frame accents
        this.addDoorFrames(
            x,
            z - depth / 2 + 0.1,
            width,
            "horizontal"
        );

        return this.rooms[name];
    }

    addDoorFrames(x, z, width, direction) {
        const postHeight = 3;

        if (direction === "horizontal") {
            this.addBox(
                new THREE.BoxGeometry(
                    0.25,
                    postHeight,
                    0.25
                ),
                this.materials.red,
                x - 2,
                postHeight / 2,
                z,
                { collider: false }
            );

            this.addBox(
                new THREE.BoxGeometry(
                    0.25,
                    postHeight,
                    0.25
                ),
                this.materials.red,
                x + 2,
                postHeight / 2,
                z,
                { collider: false }
            );
        }
    }

    // =========================================================
    // CORRIDORS
    // =========================================================

    createCorridor(
        x,
        z,
        width,
        depth,
        direction = "horizontal"
    ) {
        this.floor(
            x,
            z,
            width,
            depth,
            this.materials.floor
        );

        const h = 3.2;
        const t = 0.5;

        if (direction === "horizontal") {
            this.wall(
                x,
                z - depth / 2,
                width,
                t,
                h
            );

            this.wall(
                x,
                z + depth / 2,
                width,
                t,
                h
            );
        } else {
            this.wall(
                x - width / 2,
                z,
                t,
                depth,
                h
            );

            this.wall(
                x + width / 2,
                z,
                t,
                depth,
                h
            );
        }

        // Ceiling light strips
        const light = new THREE.Mesh(
            new THREE.BoxGeometry(
                direction === "horizontal"
                    ? width - 1
                    : 0.35,
                0.08,
                direction === "horizontal"
                    ? 0.35
                    : depth - 1
            ),
            this.materials.white
        );

        light.position.set(
            x,
            3.12,
            z
        );

        light.material.emissive = new THREE.Color(
            0xeeeeee
        );

        light.material.emissiveIntensity = 1.5;

        this.scene.add(light);
    }

    // =========================================================
    // ATRIUM
    // =========================================================

    createAtrium(x, z, width, depth) {
        this.createRoomBase(
            "Atrium",
            x,
            z,
            width,
            depth
        );

        const platform = new THREE.Mesh(
            new THREE.CylinderGeometry(
                5,
                5.4,
                0.5,
                32
            ),
            this.materials.darkMetal
        );

        platform.position.set(
            x,
            0.32,
            z
        );

        platform.castShadow = true;
        platform.receiveShadow = true;

        this.scene.add(platform);
        this.colliders.push(platform);

        // Central glowing column
        const column = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.75,
                0.75,
                6,
                24
            ),
            this.materials.glass
        );

        column.position.set(
            x,
            3,
            z
        );

        this.scene.add(column);

        // Rings
        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(
                    1.2 + i * 0.5,
                    0.06,
                    8,
                    32
                ),
                this.materials.orange
            );

            ring.position.set(
                x,
                1.5 + i * 1.4,
                z
            );

            ring.rotation.x = Math.PI / 2;

            this.scene.add(ring);
        }

        // Atrium lights
        const light = new THREE.PointLight(
            0xff7733,
            10,
            24
        );

        light.position.set(
            x,
            4,
            z
        );

        this.scene.add(light);
        this.lights.push(light);
    }

    // =========================================================
    // VOLCANO
    // =========================================================

    createVolcano(x, z, width, depth) {
        this.createRoomBase(
            "Volcano",
            x,
            z,
            width,
            depth,
            this.materials.darkMetal
        );

        // Lava pit
        const lava = new THREE.Mesh(
            new THREE.CylinderGeometry(
                4.5,
                5.2,
                0.4,
                32
            ),
            this.materials.lava
        );

        lava.position.set(
            x,
            0.35,
            z
        );

        this.scene.add(lava);

        this.colliders.push(lava);

        // Industrial towers
        for (let i = 0; i < 6; i++) {
            const angle =
                (i / 6) * Math.PI * 2;

            const px =
                x + Math.cos(angle) * 5;

            const pz =
                z + Math.sin(angle) * 5;

            this.addBox(
                new THREE.BoxGeometry(
                    0.8,
                    4 + (i % 2),
                    0.8
                ),
                this.materials.metal,
                px,
                2,
                pz,
                {
                    collider: true
                }
            );
        }

        // Pipes
        for (let i = 0; i < 5; i++) {
            const pipe = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.14,
                    0.14,
                    8,
                    10
                ),
                this.materials.orange
            );

            pipe.position.set(
                x - 5 + i * 2.5,
                2.5,
                z - 5.5
            );

            pipe.rotation.z =
                Math.PI / 2;

            this.scene.add(pipe);
        }

        const light = new THREE.PointLight(
            0xff3c0a,
            16,
            22
        );

        light.position.set(
            x,
            3,
            z
        );

        this.scene.add(light);
        this.lights.push(light);
    }

    // =========================================================
    // DISCO
    // =========================================================

    createDisco(x, z, width, depth) {
        this.createRoomBase(
            "Disco",
            x,
            z,
            width,
            depth,
            this.materials.floorDark
        );

        // Dance floor
        const tileSize = 1;

        for (let ix = -4; ix <= 4; ix++) {
            for (let iz = -3; iz <= 3; iz++) {
                const tile = new THREE.Mesh(
                    new THREE.BoxGeometry(
                        tileSize - 0.04,
                        0.12,
                        tileSize - 0.04
                    ),
                    [
                        this.materials.red,
                        this.materials.blue,
                        this.materials.purple,
                        this.materials.yellow
                    ][
                        (ix + iz + 20) % 4
                    ]
                );

                tile.position.set(
                    x + ix,
                    0.15,
                    z + iz
                );

                this.scene.add(tile);
            }
        }

        // DJ booth
        this.addBox(
            new THREE.BoxGeometry(
                4,
                1,
                1.2
            ),
            this.materials.darkMetal,
            x,
            0.55,
            z - 3.8,
            {
                collider: true
            }
        );

        // Speakers
        for (const sx of [-4, 4]) {
            this.addBox(
                new THREE.BoxGeometry(
                    1,
                    2.6,
                    1
                ),
                this.materials.darkMetal,
                x + sx,
                1.3,
                z - 3.2,
                {
                    collider: true
                }
            );
        }

        const light = new THREE.PointLight(
            0xa84cff,
            8,
            18
        );

        light.position.set(
            x,
            3,
            z
        );

        this.scene.add(light);
        this.lights.push(light);
    }

    // =========================================================
    // AMETHYST
    // =========================================================

    createAmethyst(x, z, width, depth) {
        this.createRoomBase(
            "Amethyst",
            x,
            z,
            width,
            depth,
            this.materials.wallDark
        );

        for (let i = 0; i < 26; i++) {
            const crystal = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.25 + Math.random() * 0.4,
                    0.45,
                    1.5 + Math.random() * 3,
                    6
                ),
                this.materials.crystal
            );

            crystal.position.set(
                x - width / 2 + 1 +
                    Math.random() * (width - 2),
                0.9,
                z - depth / 2 + 1 +
                    Math.random() * (depth - 2)
            );

            crystal.rotation.x =
                (Math.random() - 0.5) * 0.7;

            crystal.rotation.z =
                (Math.random() - 0.5) * 0.7;

            crystal.castShadow = true;

            this.scene.add(crystal);
        }

        const light = new THREE.PointLight(
            0x963cff,
            10,
            18
        );

        light.position.set(
            x,
            2,
            z
        );

        this.scene.add(light);
        this.lights.push(light);
    }

    // =========================================================
    // SCRAPYARD
    // =========================================================

    createScrapyard(x, z, width, depth) {
        this.createRoomBase(
            "Scrapyard",
            x,
            z,
            width,
            depth,
            this.materials.floorDark
        );

        for (let i = 0; i < 24; i++) {
            const size =
                0.7 + Math.random() * 1.3;

            const scrap = new THREE.Mesh(
                new THREE.BoxGeometry(
                    size,
                    size,
                    size
                ),
                i % 3 === 0
                    ? this.materials.red
                    : this.materials.metal
            );

            scrap.position.set(
                x - width / 2 + 1 +
                    Math.random() * (width - 2),
                size / 2,
                z - depth / 2 + 1 +
                    Math.random() * (depth - 2)
            );

            scrap.rotation.set(
                Math.random(),
                Math.random(),
                Math.random()
            );

            scrap.castShadow = true;

            this.scene.add(scrap);
            this.colliders.push(scrap);
        }

        // Crane
        this.addBox(
            new THREE.BoxGeometry(
                0.5,
                5,
                0.5
            ),
            this.materials.darkMetal,
            x - 5,
            2.5,
            z + 3,
            {
                collider: true
            }
        );

        this.addBox(
            new THREE.BoxGeometry(
                8,
                0.4,
                0.5
            ),
            this.materials.darkMetal,
            x - 1,
            5,
            z + 3,
            {
                collider: true
            }
        );
    }

    // =========================================================
    // MUSEUM
    // =========================================================

    createMuseum(x, z, width, depth) {
        this.createRoomBase(
            "Museum",
            x,
            z,
            width,
            depth,
            this.materials.white
        );

        // Display cases
        for (let i = -5; i <= 5; i += 2.5) {
            const caseMesh = new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.8,
                    1.4,
                    1.2
                ),
                this.materials.glass
            );

            caseMesh.position.set(
                x + i,
                0.8,
                z
            );

            this.scene.add(caseMesh);

            this.colliders.push(caseMesh);

            const exhibit = new THREE.Mesh(
                new THREE.DodecahedronGeometry(
                    0.45
                ),
                this.materials.orange
            );

            exhibit.position.set(
                x + i,
                1.7,
                z
            );

            this.scene.add(exhibit);
        }

        // Statue
        const statue = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.7,
                1,
                2.5,
                10
            ),
            this.materials.metal
        );

        statue.position.set(
            x,
            1.3,
            z - 3
        );

        this.scene.add(statue);
        this.colliders.push(statue);
    }

    // =========================================================
    // GRAVEYARD
    // =========================================================

    createGraveyard(x, z, width, depth) {
        this.createRoomBase(
            "Graveyard",
            x,
            z,
            width,
            depth,
            this.materials.green
        );

        // Dirt patches
        for (let i = 0; i < 5; i++) {
            const mound = new THREE.Mesh(
                new THREE.SphereGeometry(
                    1.1,
                    12,
                    6
                ),
                this.materials.wood
            );

            mound.scale.y = 0.35;

            mound.position.set(
                x - 4 + i * 2,
                0.25,
                z
            );

            this.scene.add(mound);
        }

        // Gravestones
        for (let i = 0; i < 10; i++) {
            const stone = new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.8,
                    1.4,
                    0.3
                ),
                this.materials.white
            );

            stone.position.set(
                x - width / 2 + 2 +
                    Math.random() * (width - 4),
                0.75,
                z - depth / 2 + 2 +
                    Math.random() * (depth - 4)
            );

            stone.rotation.y =
                (Math.random() - 0.5) * 0.5;

            stone.castShadow = true;

            this.scene.add(stone);
            this.colliders.push(stone);
        }
    }

    // =========================================================
    // MAZE
    // =========================================================

    createMaze(x, z, width, depth) {
        this.createRoomBase(
            "Maze",
            x,
            z,
            width,
            depth,
            this.materials.floorDark
        );

        const wallHeight = 2.5;
        const wallThickness = 0.45;
        const cell = 2.4;

        const maze = [
            "1111111",
            "1000001",
            "1011101",
            "1010001",
            "1010111",
            "1000001",
            "1111111"
        ];

        for (let row = 0; row < maze.length; row++) {
            for (
                let col = 0;
                col < maze[row].length;
                col++
            ) {
                if (maze[row][col] !== "1") {
                    continue;
                }

                const px =
                    x - 7 +
                    col * cell;

                const pz =
                    z - 7 +
                    row * cell;

                const wall = this.addBox(
                    new THREE.BoxGeometry(
                        cell,
                        wallHeight,
                        cell
                    ),
                    this.materials.wallDark,
                    px,
                    wallHeight / 2,
                    pz,
                    {
                        collider: true
                    }
                );

                wall.castShadow = true;
            }
        }
    }

    // =========================================================
    // DINING HALL
    // =========================================================

    createDiningHall(x, z, width, depth) {
        this.createRoomBase(
            "Dining Hall",
            x,
            z,
            width,
            depth,
            this.materials.floor
        );

        for (let row = -1; row <= 1; row++) {
            const table = new THREE.Mesh(
                new THREE.BoxGeometry(
                    5,
                    0.25,
                    1.4
                ),
                this.materials.wood
            );

            table.position.set(
                x,
                1,
                z + row * 3
            );

            this.scene.add(table);
            this.colliders.push(table);

            for (const sx of [-1.8, 1.8]) {
                for (const sz of [-0.45, 0.45]) {
                    this.addBox(
                        new THREE.BoxGeometry(
                            0.18,
                            1,
                            0.18
                        ),
                        this.materials.wood,
                        x + sx,
                        0.5,
                        z + row * 3 + sz,
                        {
                            collider: true
                        }
                    );
                }
            }
        }

        // Kitchen counter
        this.addBox(
            new THREE.BoxGeometry(
                3,
                1.2,
                5
            ),
            this.materials.metal,
            x + 5,
            0.6,
            z,
            {
                collider: true
            }
        );
    }

    // =========================================================
    // STORAGE
    // =========================================================

    createStorage(x, z, width, depth) {
        this.createRoomBase(
            "Storage",
            x,
            z,
            width,
            depth,
            this.materials.floorDark
        );

        for (let row = -1; row <= 1; row++) {
            for (let col = -1; col <= 1; col++) {
                const shelf = new THREE.Mesh(
                    new THREE.BoxGeometry(
                        2.5,
                        2.5,
                        0.5
                    ),
                    this.materials.metal
                );

                shelf.position.set(
                    x + col * 3.5,
                    1.25,
                    z + row * 3
                );

                this.scene.add(shelf);
                this.colliders.push(shelf);

                for (let i = 0; i < 3; i++) {
                    const crate = new THREE.Mesh(
                        new THREE.BoxGeometry(
                            0.7,
                            0.7,
                            0.7
                        ),
                        this.materials.wood
                    );

                    crate.position.set(
                        shelf.position.x +
                            (Math.random() - 0.5),
                        0.5 + i * 0.7,
                        shelf.position.z -
                            0.5
                    );

                    this.scene.add(crate);
                    this.colliders.push(crate);
                }
            }
        }
    }

    // =========================================================
    // LOUNGE
    // =========================================================

    createLounge(x, z, width, depth) {
        this.createRoomBase(
            "Lounge",
            x,
            z,
            width,
            depth,
            this.materials.floor
        );

        // Sofas
        for (const sx of [-4, 4]) {
            const sofa = new THREE.Mesh(
                new THREE.BoxGeometry(
                    4,
                    1,
                    1.5
                ),
                this.materials.red
            );

            sofa.position.set(
                x + sx,
                0.6,
                z
            );

            this.scene.add(sofa);
            this.colliders.push(sofa);
        }

        // Table
        const table = new THREE.Mesh(
            new THREE.CylinderGeometry(
                1.3,
                1.3,
                0.25,
                24
            ),
            this.materials.darkMetal
        );

        table.position.set(
            x,
            0.8,
            z
        );

        this.scene.add(table);
        this.colliders.push(table);

        // Plant
        const pot = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.6,
                0.45,
                0.8,
                12
            ),
            this.materials.wood
        );

        pot.position.set(
            x,
            0.4,
            z + 3
        );

        this.scene.add(pot);

        const leaves = new THREE.Mesh(
            new THREE.SphereGeometry(
                1.2,
                12,
                8
            ),
            this.materials.green
        );

        leaves.position.set(
            x,
            1.7,
            z + 3
        );

        this.scene.add(leaves);
    }

    // =========================================================
    // VIEWING LOBBY
    // =========================================================

    createViewingLobby(x, z, width, depth) {
        this.createRoomBase(
            "Viewing Lobby",
            x,
            z,
            width,
            depth,
            this.materials.darkMetal
        );

        // Huge viewing window
        const window = new THREE.Mesh(
            new THREE.BoxGeometry(
                width - 2,
                3.2,
                0.15
            ),
            this.materials.glass
        );

        window.position.set(
            x,
            2,
            z - depth / 2 + 0.3
        );

        this.scene.add(window);

        // Window frame
        for (let i = -3; i <= 3; i++) {
            const frame = new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.12,
                    3.3,
                    0.25
                ),
                this.materials.metal
            );

            frame.position.set(
                x + i * 2.3,
                2,
                z - depth / 2 + 0.1
            );

            this.scene.add(frame);
        }

        // Huge object outside
        const outside = new THREE.Mesh(
            new THREE.IcosahedronGeometry(
                8,
                2
            ),
            this.materials.darkMetal
        );

        outside.position.set(
            x,
            1,
            z - depth / 2 - 8
        );

        this.scene.add(outside);

        // Interior bench
        this.addBox(
            new THREE.BoxGeometry(
                8,
                0.7,
                1
            ),
            this.materials.red,
            x,
            0.5,
            z + 3,
            {
                collider: true
            }
        );
    }

    // =========================================================
    // LIGHTING
    // =========================================================

    createLighting() {
        const ceilingPositions = [
            [0, 0],
            [-20, -2],
            [-25, 11],
            [-25, 25],
            [-5, 27],
            [19, -1],
            [34, 4],
            [4, 20],
            [23, 22],
            [38, 22],
            [39, 35]
        ];

        for (const [x, z] of ceilingPositions) {
            const light = new THREE.PointLight(
                0xffd5b5,
                2.5,
                12
            );

            light.position.set(
                x,
                3,
                z
            );

            this.scene.add(light);
            this.lights.push(light);
        }
    }

    // =========================================================
    // SPAWN
    // =========================================================

    createSpawnArea() {
        const spawn = new THREE.Mesh(
            new THREE.CylinderGeometry(
                1.2,
                1.2,
                0.12,
                24
            ),
            this.materials.orange
        );

        spawn.position.set(
            0,
            0.12,
            4
        );

        this.scene.add(spawn);
    }

    // =========================================================
    // COLLISION
    // =========================================================

    getCollisionBox(object) {
        const box =
            new THREE.Box3().setFromObject(
                object
            );

        return box;
    }

    canMoveTo(
        position,
        radius = 0.35,
        height = 1.8
    ) {
        const playerBox =
            new THREE.Box3(
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

        for (
            const collider of this.colliders
        ) {
            if (!collider) continue;

            const box =
                this.getCollisionBox(
                    collider
                );

            if (
                playerBox.intersectsBox(
                    box
                )
            ) {
                return false;
            }
        }

        return true;
    }

    // =========================================================
    // SIGNS
    // =========================================================

    placeSign(
        position,
        rotationY = 0
    ) {
        if (
            this.signs.length >= 48
        ) {
            return null;
        }

        const sign =
            new THREE.Group();

        sign.position.copy(position);

        sign.position.y = 1;

        sign.rotation.y =
            rotationY;

        const board =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.25,
                    0.8,
                    0.08
                ),
                this.materials.sign
            );

        board.castShadow = true;

        sign.add(board);

        const post =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.08,
                    0.8,
                    0.08
                ),
                this.materials.wood
            );

        post.position.y = -0.7;

        sign.add(post);

        sign.userData.type =
            "sign";

        sign.userData.playerCreated =
            true;

        sign.userData.owner =
            "LOCAL";

        this.scene.add(sign);

        this.signs.push(sign);

        return sign;
    }

    removeSign(sign) {
        const index =
            this.signs.indexOf(sign);

        if (index === -1) {
            return;
        }

        this.signs.splice(
            index,
            1
        );

        this.scene.remove(sign);
    }

    // =========================================================
    // PLAYERS
    // =========================================================

    addPlayer(player) {
        if (
            !this.players.includes(player)
        ) {
            this.players.push(player);
        }
    }

    removePlayer(player) {
        const index =
            this.players.indexOf(player);

        if (index !== -1) {
            this.players.splice(
                index,
                1
            );
        }
    }

    getPlayers() {
        return this.players;
    }

    // =========================================================
    // RAYCASTING HELPERS
    // =========================================================

    getColliders() {
        return this.colliders;
    }

    getInteractables() {
        return this.interactables;
    }

    // =========================================================
    // UPDATE
    // =========================================================

    update(delta) {
        // Animated lava
        const lavaObjects =
            this.scene.children.filter(
                object =>
                    object.material ===
                    this.materials.lava
            );

        for (
            const lava of lavaObjects
        ) {
            lava.scale.y =
                1 +
                Math.sin(
                    performance.now() *
                    0.002
                ) *
                0.025;
        }

        // Slight crystal movement
        for (
            const child
            of this.scene.children
        ) {
            if (
                child.material ===
                this.materials.crystal
            ) {
                child.rotation.y +=
                    delta * 0.08;
            }
        }
    }

    // =========================================================
    // CLEANUP
    // =========================================================

    destroy() {
        for (
            const object
            of [...this.scene.children]
        ) {
            this.scene.remove(object);
        }

        this.colliders = [];
        this.interactables = [];
        this.signs = [];
        this.players = [];
        this.lights = [];
    }
}
