import * as THREE from "three";

export class World {
    constructor(scene) {
        this.scene = scene;

        this.colliders = [];
        this.interactables = [];
        this.signs = [];
        this.players = [];

        this.groups = [];

        this.materials = {};
        this.createMaterials();

        this.createWorld();
    }

    // =========================================================
    // MATERIALS
    // =========================================================

    createMaterials() {
        const mat = (color, roughness = 0.8, metalness = 0) =>
            new THREE.MeshStandardMaterial({
                color,
                roughness,
                metalness
            });

        this.materials.floor = mat(0x292b2d, 0.9);
        this.materials.floorLight = mat(0x3b3e40, 0.85);
        this.materials.wall = mat(0x45484b, 0.82);
        this.materials.wallDark = mat(0x202224, 0.9);
        this.materials.ceiling = mat(0x17191a, 0.9);

        this.materials.metal = mat(0x687075, 0.3, 0.8);
        this.materials.darkMetal = mat(0x292d30, 0.3, 0.9);
        this.materials.blackMetal = mat(0x101214, 0.25, 0.95);

        this.materials.red = mat(0xa72d22, 0.6);
        this.materials.yellow = mat(0xd59b26, 0.55);
        this.materials.orange = mat(0xd95c25, 0.55);

        this.materials.wood = mat(0x68442b, 0.9);
        this.materials.woodLight = mat(0x9a6a3e, 0.85);

        this.materials.glass =
            new THREE.MeshPhysicalMaterial({
                color: 0x9ebfc7,
                transparent: true,
                opacity: 0.32,
                roughness: 0.1,
                metalness: 0.2
            });

        this.materials.amethyst =
            new THREE.MeshStandardMaterial({
                color: 0x8d54c4,
                emissive: 0x32104c,
                emissiveIntensity: 0.8,
                roughness: 0.35
            });

        this.materials.lava =
            new THREE.MeshStandardMaterial({
                color: 0xff5418,
                emissive: 0xff2800,
                emissiveIntensity: 2.2,
                roughness: 0.35
            });

        this.materials.green = mat(0x354c38, 0.95);

        this.materials.bookRed = mat(0x87352f);
        this.materials.bookBlue = mat(0x38527d);
        this.materials.bookGreen = mat(0x3c684b);
        this.materials.bookYellow = mat(0xa98235);

        this.materials.sign = mat(0xb98b54, 0.85);
    }

    // =========================================================
    // WORLD
    // =========================================================

    createWorld() {
        this.createGround();

        /*
            MAP

                         VOLCANO
                            │
                  DISCO ─ ATRIUM ─ LIBRARY ─ MAZE
                            │
                         AMETHYST
                            │
                        SCRAPYARD
                            │
                         MUSEUM
                            │
                      DINING HALL
                            │
                    STORAGE ─ LOUNGE

                  VIEWING LOBBY
                         ╲
                       ATRIUM
        */

        this.createAtrium();

        this.createVolcano();
        this.createDisco();
        this.createAmethyst();
        this.createScrapyard();
        this.createMuseum();
        this.createDiningHall();

        this.createLibrary();
        this.createMaze();
        this.createStorage();
        this.createLounge();
        this.createViewingLobby();

        this.createConnections();
        this.createGlobalLighting();
    }

    // =========================================================
    // BASIC GEOMETRY
    // =========================================================

    addMesh(
        geometry,
        material,
        x = 0,
        y = 0,
        z = 0,
        options = {}
    ) {
        const mesh = new THREE.Mesh(
            geometry,
            material
        );

        mesh.position.set(x, y, z);

        if (options.rotation) {
            mesh.rotation.set(
                options.rotation.x || 0,
                options.rotation.y || 0,
                options.rotation.z || 0
            );
        }

        mesh.castShadow =
            options.castShadow !== false;

        mesh.receiveShadow =
            options.receiveShadow !== false;

        this.scene.add(mesh);

        if (options.collider) {
            this.colliders.push(mesh);
        }

        return mesh;
    }

    box(
        x,
        y,
        z,
        sx,
        sy,
        sz,
        material,
        collider = false
    ) {
        return this.addMesh(
            new THREE.BoxGeometry(
                sx,
                sy,
                sz
            ),
            material,
            x,
            y,
            z,
            { collider }
        );
    }

    cylinder(
        x,
        y,
        z,
        radius,
        height,
        material,
        segments = 16,
        collider = false
    ) {
        return this.addMesh(
            new THREE.CylinderGeometry(
                radius,
                radius,
                height,
                segments
            ),
            material,
            x,
            y,
            z,
            { collider }
        );
    }

    // =========================================================
    // GROUND
    // =========================================================

    createGround() {
        this.box(
            5,
            -0.15,
            5,
            70,
            0.3,
            70,
            this.materials.floor
        );

        const grid =
            new THREE.GridHelper(
                70,
                70,
                0x484b4d,
                0x202224
            );

        grid.position.y = 0.01;

        this.scene.add(grid);
    }

    // =========================================================
    // ROOM BUILDER
    // =========================================================

    room(
        x,
        z,
        width,
        depth,
        height = 5
    ) {
        const group = new THREE.Group();

        this.scene.add(group);

        // floor
        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                0.18,
                depth
            ),
            this.materials.floorLight
        );

        floor.position.set(
            x,
            0.09,
            z
        );

        floor.receiveShadow = true;
        group.add(floor);

        // ceiling
        const ceiling = new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                0.2,
                depth
            ),
            this.materials.ceiling
        );

        ceiling.position.set(
            x,
            height,
            z
        );

        group.add(ceiling);

        return {
            group,
            x,
            z,
            width,
            depth,
            height
        };
    }

    wall(
        x,
        z,
        width,
        depth,
        height = 5,
        material = this.materials.wall
    ) {
        return this.box(
            x,
            height / 2,
            z,
            width,
            height,
            depth,
            material,
            true
        );
    }

    pillar(
        x,
        z,
        height = 5,
        radius = 0.3
    ) {
        return this.cylinder(
            x,
            height / 2,
            z,
            radius,
            height,
            this.materials.metal,
            12,
            true
        );
    }

    // =========================================================
    // ATRIUM
    // =========================================================

    createAtrium() {
        const x = 0;
        const z = 0;
        const w = 20;
        const d = 18;

        this.room(
            x,
            z,
            w,
            d,
            8
        );

        // Walls with large openings toward branches.
        this.wall(-9.75, 0, 0.5, 18, 8);
        this.wall(9.75, 5.5, 0.5, 7, 8);
        this.wall(9.75, -5.5, 0.5, 7, 8);

        this.wall(0, 8.75, 20, 0.5, 8);

        this.wall(
            -6.5,
            -8.75,
            7,
            0.5,
            8
        );

        this.wall(
            6.5,
            -8.75,
            7,
            0.5,
            8
        );

        // central raised platform
        this.box(
            0,
            0.35,
            0,
            7,
            0.7,
            5,
            this.materials.darkMetal,
            true
        );

        // central structure
        this.box(
            0,
            2.0,
            0,
            5.5,
            3.2,
            2.6,
            this.materials.red,
            true
        );

        // black central stripe
        this.box(
            0,
            2.0,
            0,
            0.18,
            3.25,
            2.7,
            this.materials.blackMetal
        );

        // Atrium pillars
        for (const px of [-8, 8]) {
            for (const pz of [-6, 6]) {
                this.pillar(
                    px,
                    pz,
                    8,
                    0.38
                );
            }
        }

        // upper balconies
        this.createBalcony(
            -6,
            -5,
            5,
            1.8
        );

        this.createBalcony(
            6,
            5,
            5,
            1.8
        );

        // railings
        this.createRail(
            -6,
            -4.1,
            5,
            0
        );

        this.createRail(
            6,
            5.9,
            5,
            Math.PI
        );

        // hanging lights
        for (let i = -6; i <= 6; i += 3) {
            this.createHangingLamp(
                i,
                6.7,
                0
            );
        }

        // benches
        this.createBench(
            -6,
            1.2,
            -1.8
        );

        this.createBench(
            6,
            1.2,
            1.8
        );

        this.roomLabel(
            "ATRIUM",
            0,
            -8.4
        );
    }

    createBalcony(
        x,
        z,
        width,
        depth
    ) {
        this.box(
            x,
            2.8,
            z,
            width,
            0.35,
            depth,
            this.materials.darkMetal,
            true
        );

        for (
            let i = -width / 2;
            i <= width / 2;
            i += 1
        ) {
            this.cylinder(
                x + i,
                3.7,
                z - depth / 2,
                0.06,
                1.8,
                this.materials.metal,
                8,
                true
            );
        }

        this.box(
            x,
            4.55,
            z - depth / 2,
            width,
            0.1,
            0.1,
            this.materials.metal,
            true
        );
    }

    // =========================================================
    // VOLCANO
    // =========================================================

    createVolcano() {
        const r = this.room(
            0,
            -18,
            13,
            12,
            7
        );

        this.createOpenRoomWalls(
            r,
            ["south"]
        );

        // lava pit
        this.cylinder(
            0,
            0.18,
            -18,
            3.3,
            0.3,
            this.materials.lava,
            32
        );

        // machinery
        for (let x = -5; x <= 5; x += 2.5) {
            this.createTank(
                x,
                -20.8
            );
        }

        // pipes
        for (let i = 0; i < 5; i++) {
            this.createPipe(
                -5 + i * 2.5,
                2.8,
                -14.8,
                2.5
            );
        }

        // catwalk
        this.box(
            0,
            2.2,
            -21.8,
            9,
            0.25,
            1.3,
            this.materials.metal,
            true
        );

        this.createRail(
            0,
            -22.4,
            9,
            0
        );

        this.createPointLight(
            0,
            3,
            -18,
            0xff4918,
            9,
            14
        );

        this.roomLabel(
            "VOLCANO",
            0,
            -23.4
        );
    }

    createTank(x, z) {
        this.cylinder(
            x,
            1.2,
            z,
            0.7,
            2.4,
            this.materials.darkMetal,
            16,
            true
        );

        this.cylinder(
            x,
            2.5,
            z,
            0.45,
            0.2,
            this.materials.yellow,
            16
        );

        this.createPipe(
            x,
            3,
            z,
            1.2
        );
    }

    createPipe(
        x,
        y,
        z,
        length,
        horizontal = true
    ) {
        const pipe =
            this.cylinder(
                x,
                y,
                z,
                0.11,
                length,
                this.materials.metal,
                10
            );

        if (horizontal) {
            pipe.rotation.z =
                Math.PI / 2;
        }

        return pipe;
    }

    // =========================================================
    // DISCO
    // =========================================================

    createDisco() {
        const r = this.room(
            -16,
            -10,
            10,
            9,
            6
        );

        this.createOpenRoomWalls(
            r,
            ["east"]
        );

        // dance floor
        for (let x = -19; x <= -13; x += 2) {
            for (let z = -13; z <= -7; z += 2) {
                this.box(
                    x,
                    0.08,
                    z,
                    1.7,
                    0.12,
                    1.7,
                    new THREE.MeshStandardMaterial({
                        color:
                            ((x + z) / 2) % 2
                                ? 0x4d315d
                                : 0x263b61,
                        emissive:
                            ((x + z) / 2) % 2
                                ? 0x291333
                                : 0x10203a,
                        emissiveIntensity: 1
                    })
                );
            }
        }

        // DJ booth
        this.box(
            -16,
            1,
            -13.2,
            5,
            1.5,
            0.8,
            this.materials.blackMetal,
            true
        );

        // speakers
        for (const x of [-20, -12]) {
            this.createSpeaker(
                x,
                1.7,
                -12.8
            );
        }

        // disco ball
        this.cylinder(
            -16,
            4.8,
            -10,
            0.7,
            0.7,
            this.materials.metal,
            24
        );

        this.createPointLight(
            -16,
            4,
            -10,
            0x774cff,
            6,
            10
        );

        this.createPointLight(
            -19,
            3,
            -8,
            0xff2d68,
            4,
            8
        );

        this.roomLabel(
            "DISCO",
            -16,
            -14.2
        );
    }

    createSpeaker(x, y, z) {
        this.box(
            x,
            y,
            z,
            1,
            2.2,
            0.8,
            this.materials.blackMetal,
            true
        );

        this.cylinder(
            x,
            y + 0.2,
            z - 0.42,
            0.28,
            0.15,
            this.materials.metal,
            20
        );

        this.cylinder(
            x,
            y - 0.6,
            z - 0.42,
            0.38,
            0.15,
            this.materials.metal,
            20
        );
    }

    // =========================================================
    // AMETHYST
    // =========================================================

    createAmethyst() {
        const r = this.room(
            -19,
            1,
            11,
            11,
            5.5
        );

        this.createOpenRoomWalls(
            r,
            ["east", "south"]
        );

        for (let i = 0; i < 28; i++) {
            const crystal =
                new THREE.Mesh(
                    new THREE.ConeGeometry(
                        0.25 + Math.random() * 0.45,
                        1 + Math.random() * 2.5,
                        6
                    ),
                    this.materials.amethyst
                );

            crystal.position.set(
                -24.2 + Math.random() * 10,
                0.5 + Math.random() * 0.3,
                -3.5 + Math.random() * 9
            );

            crystal.rotation.y =
                Math.random() * Math.PI;

            crystal.castShadow = true;

            this.scene.add(crystal);
        }

        this.createPointLight(
            -19,
            3,
            1,
            0x8b4dff,
            7,
            13
        );

        this.roomLabel(
            "AMETHYST",
            -19,
            -4.3
        );
    }

    // =========================================================
    // SCRAPYARD
    // =========================================================

    createScrapyard() {
        const r = this.room(
            -18,
            13,
            13,
            9,
            5
        );

        this.createOpenRoomWalls(
            r,
            ["north", "south"]
        );

        for (let i = 0; i < 25; i++) {
            this.createScrapPiece(
                -23 + Math.random() * 10,
                0.3 + Math.random() * 1.2,
                10 + Math.random() * 6
            );
        }

        for (let x = -23; x <= -13; x += 2) {
            this.createTire(
                x,
                1,
                15
            );
        }

        this.roomLabel(
            "SCRAPYARD",
            -18,
            17.2
        );
    }

    createScrapPiece(x, y, z) {
        const size =
            0.4 + Math.random() * 1.3;

        const scrap =
            this.box(
                x,
                y,
                z,
                size,
                size,
                size,
                Math.random() > 0.5
                    ? this.materials.metal
                    : this.materials.darkMetal,
                true
            );

        scrap.rotation.set(
            Math.random(),
            Math.random(),
            Math.random()
        );
    }

    createTire(x, y, z) {
        const tire =
            new THREE.Mesh(
                new THREE.TorusGeometry(
                    0.7,
                    0.25,
                    10,
                    20
                ),
                this.materials.blackMetal
            );

        tire.position.set(
            x,
            y,
            z
        );

        tire.rotation.x =
            Math.PI / 2;

        this.scene.add(tire);
    }

    // =========================================================
    // MUSEUM
    // =========================================================

    createMuseum() {
        const r = this.room(
            -10,
            23,
            14,
            9,
            5
        );

        this.createOpenRoomWalls(
            r,
            ["north", "east"]
        );

        for (let i = 0; i < 4; i++) {
            const x =
                -14 + i * 2.6;

            this.createDisplayCase(
                x,
                23
            );
        }

        this.roomLabel(
            "MUSEUM",
            -10,
            27.2
        );
    }

    createDisplayCase(x, z) {
        this.box(
            x,
            0.8,
            z,
            1.7,
            0.2,
            1.2,
            this.materials.wood,
            true
        );

        const glass =
            this.box(
                x,
                1.5,
                z,
                1.5,
                1.2,
                1,
                this.materials.glass
            );

        glass.userData.type =
            "museum-display";

        this.cylinder(
            x,
            1.35,
            z,
            0.3,
            0.6,
            this.materials.yellow,
            12
        );
    }

    // =========================================================
    // DINING HALL
    // =========================================================

    createDiningHall() {
        const r = this.room(
            4,
            23,
            12,
            9,
            5
        );

        this.createOpenRoomWalls(
            r,
            ["north", "west", "east"]
        );

        for (let x = 0; x < 8; x += 4) {
            this.createDiningTable(
                x,
                21
            );

            this.createDiningTable(
                x,
                25
            );
        }

        this.box(
            4,
            1.2,
            26.7,
            8,
            2.2,
            0.8,
            this.materials.darkMetal,
            true
        );

        this.roomLabel(
            "DINING HALL",
            4,
            27.2
        );
    }

    createDiningTable(x, z) {
        this.box(
            x,
            1.25,
            z,
            3,
            0.25,
            1.2,
            this.materials.wood,
            true
        );

        for (const dx of [-1.2, 1.2]) {
            for (const dz of [-0.4, 0.4]) {
                this.box(
                    x + dx,
                    0.6,
                    z + dz,
                    0.15,
                    1.2,
                    0.15,
                    this.materials.metal,
                    true
                );
            }
        }

        for (const dx of [-1.8, 1.8]) {
            this.createChair(
                x + dx,
                z
            );
        }
    }

    createChair(x, z) {
        this.box(
            x,
            0.6,
            z,
            0.7,
            0.15,
            0.7,
            this.materials.wood,
            true
        );

        this.box(
            x,
            1,
            z + 0.3,
            0.7,
            1,
            0.12,
            this.materials.wood
        );
    }

    // =========================================================
    // LIBRARY
    // =========================================================

    createLibrary() {
        const r = this.room(
            17,
            0,
            12,
            12,
            6
        );

        this.createOpenRoomWalls(
            r,
            ["west", "east", "south"]
        );

        for (let z = -4; z <= 4; z += 2.5) {
            this.createBookshelf(
                13.2,
                z
            );

            this.createBookshelf(
                20.8,
                z
            );
        }

        for (let z = -2; z <= 3; z += 5) {
            this.createReadingTable(
                17,
                z
            );
        }

        this.roomLabel(
            "LIBRARY",
            17,
            -5.4
        );
    }

    createBookshelf(x, z) {
        this.box(
            x,
            1.8,
            z,
            1,
            3.6,
            0.55,
            this.materials.wood,
            true
        );

        const books = [
            this.materials.bookRed,
            this.materials.bookBlue,
            this.materials.bookGreen,
            this.materials.bookYellow
        ];

        for (let y = 0.6; y < 3.3; y += 0.55) {
            for (let i = -0.3; i <= 0.3; i += 0.3) {
                this.box(
                    x + i,
                    y,
                    z - 0.32,
                    0.18,
                    0.42,
                    0.08,
                    books[
                        Math.floor(
                            Math.random() * books.length
                        )
                    ]
                );
            }
        }
    }

    createReadingTable(x, z) {
        this.box(
            x,
            1,
            z,
            3,
            0.2,
            1.4,
            this.materials.wood,
            true
        );

        this.box(
            x,
            0.5,
            z,
            0.15,
            1,
            0.15,
            this.materials.metal,
            true
        );
    }

    // =========================================================
    // MAZE
    // =========================================================

    createMaze() {
        const r = this.room(
            29,
            1,
            14,
            15,
            5
        );

        this.createOpenRoomWalls(
            r,
            ["west"]
        );

        const walls = [
            [-4, -5, 6, 0.4],
            [1, -5, 0.4, 6],
            [-1, -2, 5, 0.4],
            [-5, 1, 0.4, 7],
            [-1, 4, 6, 0.4],
            [4, 2, 0.4, 6],
            [1, -1, 5, 0.4],
            [5, -5, 0.4, 5]
        ];

        for (const [
            x,
            z,
            sx,
            sz
        ] of walls) {
            this.box(
                29 + x,
                1.5,
                1 + z,
                sx,
                3,
                sz,
                this.materials.wallDark,
                true
            );
        }

        this.roomLabel(
            "MAZE",
            29,
            -6.4
        );
    }

    // =========================================================
    // STORAGE
    // =========================================================

    createStorage() {
        const r = this.room(
            18,
            16,
            11,
            9,
            5
        );

        this.createOpenRoomWalls(
            r,
            ["north", "south", "east"]
        );

        for (let x = 15; x <= 21; x += 2) {
            for (let z = 14; z <= 18; z += 2) {
                this.createCrate(
                    x,
                    z,
                    Math.random() > 0.5
                );
            }
        }

        this.roomLabel(
            "STORAGE",
            18,
            20.2
        );
    }

    createCrate(x, z, large) {
        const size =
            large ? 1.5 : 1;

        this.box(
            x,
            size / 2,
            z,
            size,
            size,
            size,
            this.materials.wood,
            true
        );

        this.box(
            x,
            size / 2,
            z - size / 2 - 0.01,
            size * 0.08,
            size * 0.95,
            0.06,
            this.materials.darkMetal
        );
    }

    // =========================================================
    // LOUNGE
    // =========================================================

    createLounge() {
        const r = this.room(
            27,
            23,
            13,
            9,
            5
        );

        this.createOpenRoomWalls(
            r,
            ["north", "west"]
        );

        this.createCouch(
            27,
            21
        );

        this.createCouch(
            23,
            24,
            Math.PI / 2
        );

        this.cylinder(
            28,
            0.45,
            25,
            1,
            0.5,
            this.materials.wood,
            24,
            true
        );

        this.createPlant(
            33,
            25
        );

        this.roomLabel(
            "LOUNGE",
            27,
            27.2
        );
    }

    createCouch(x, z, rotation = 0) {
        const group =
            new THREE.Group();

        group.position.set(
            x,
            0,
            z
        );

        group.rotation.y =
            rotation;

        const base =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    4,
                    0.7,
                    1.4
                ),
                this.materials.red
            );

        base.position.y =
            0.65;

        group.add(base);

        const back =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    4,
                    1.2,
                    0.35
                ),
                this.materials.red
            );

        back.position.set(
            0,
            1.25,
            0.52
        );

        group.add(back);

        this.scene.add(group);

        this.colliders.push(base);
    }

    createPlant(x, z) {
        this.cylinder(
            x,
            0.45,
            z,
            0.5,
            0.9,
            this.materials.wood,
            16,
            true
        );

        for (let i = 0; i < 5; i++) {
            const leaf =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.35,
                        8,
                        6
                    ),
                    this.materials.green
                );

            leaf.position.set(
                x + (Math.random() - 0.5),
                1.1 + Math.random(),
                z + (Math.random() - 0.5)
            );

            this.scene.add(leaf);
        }
    }

    // =========================================================
    // VIEWING LOBBY
    // =========================================================

    createViewingLobby() {
        const r = this.room(
            17,
            -9,
            12,
            7,
            6
        );

        this.createOpenRoomWalls(
            r,
            ["south"]
        );

        // huge observation window
        this.box(
            17,
            2.8,
            -12.35,
            9,
            4.5,
            0.12,
            this.materials.glass
        );

        this.box(
            17,
            0.8,
            -11.7,
            9,
            0.25,
            0.7,
            this.materials.metal,
            true
        );

        this.createRail(
            17,
            -11.2,
            9,
            0
        );

        this.createPointLight(
            17,
            3,
            -9,
            0x8ed9ff,
            5,
            14
        );

        this.roomLabel(
            "VIEWING LOBBY",
            17,
            -12.7
        );
    }

    // =========================================================
    // CONNECTIONS
    // =========================================================

    createConnections() {
        /*
            These are deliberately narrow.
            Rooms connect, but they do NOT become one giant open map.
        */

        // Atrium → Volcano
        this.createCorridor(
            0,
            -13.5,
            3,
            5
        );

        // Atrium → Disco
        this.createCorridor(
            -12.5,
            -7,
            5,
            3
        );

        // Atrium → Amethyst
        this.createCorridor(
            -11,
            1,
            5,
            3
        );

        // Amethyst → Scrapyard
        this.createCorridor(
            -19,
            7.5,
            3,
            4
        );

        // Scrapyard → Museum
        this.createCorridor(
            -13,
            18,
            5,
            3
        );

        // Museum → Dining
        this.createCorridor(
            -3,
            23,
            5,
            3
        );

        // Atrium → Library
        this.createCorridor(
            12,
            1,
            5,
            3
        );

        // Library → Maze
        this.createCorridor(
            23,
            1,
            5,
            3
        );

        // Library → Storage
        this.createCorridor(
            17,
            9,
            3,
            5
        );

        // Storage → Lounge
        this.createCorridor(
            22,
            20,
            5,
            3
        );

        // Atrium → Viewing Lobby
        this.createCorridor(
            9,
            -7,
            5,
            3
        );
    }

    createCorridor(
        x,
        z,
        width,
        depth
    ) {
        this.box(
            x,
            0.05,
            z,
            width,
            0.1,
            depth,
            this.materials.floorLight
        );

        // overhead lights
        this.createHangingLamp(
            x,
            4,
            z
        );
    }

    // =========================================================
    // OPEN ROOM WALLS
    // =========================================================

    createOpenRoomWalls(room, openings = []) {
        const {
            x,
            z,
            width,
            depth,
            height
        } = room;

        const t = 0.45;

        if (!openings.includes("north")) {
            this.wall(
                x,
                z - depth / 2,
                width,
                t,
                height
            );
        }

        if (!openings.includes("south")) {
            this.wall(
                x,
                z + depth / 2,
                width,
                t,
                height
            );
        }

        if (!openings.includes("west")) {
            this.wall(
                x - width / 2,
                z,
                t,
                depth,
                height
            );
        }

        if (!openings.includes("east")) {
            this.wall(
                x + width / 2,
                z,
                t,
                depth,
                height
            );
        }
    }

    // =========================================================
    // PROPS
    // =========================================================

    createBench(x, y, z) {
        this.box(
            x,
            y,
            z,
            3,
            0.25,
            0.65,
            this.materials.wood,
            true
        );

        this.box(
            x - 1.1,
            y / 2,
            z,
            0.15,
            y,
            0.15,
            this.materials.metal,
            true
        );

        this.box(
            x + 1.1,
            y / 2,
            z,
            0.15,
            y,
            0.15,
            this.materials.metal,
            true
        );
    }

    createRail(
        x,
        z,
        width,
        rotation = 0
    ) {
        const group =
            new THREE.Group();

        group.position.set(
            x,
            0,
            z
        );

        group.rotation.y =
            rotation;

        for (
            let i = -width / 2;
            i <= width / 2;
            i += 1
        ) {
            const post =
                new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        0.05,
                        0.05,
                        1.3,
                        8
                    ),
                    this.materials.metal
                );

            post.position.set(
                i,
                0.65,
                0
            );

            group.add(post);
        }

        const bar =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    width,
                    0.08,
                    0.08
                ),
                this.materials.metal
            );

        bar.position.y = 1.3;

        group.add(bar);

        this.scene.add(group);
    }

    createHangingLamp(
        x,
        y,
        z
    ) {
        this.box(
            x,
            y,
            z,
            0.5,
            0.15,
            0.5,
            this.materials.blackMetal
        );

        const light =
            new THREE.PointLight(
                0xffd89b,
                2.5,
                7
            );

        light.position.set(
            x,
            y - 0.3,
            z
        );

        this.scene.add(light);
    }

    // =========================================================
    // LABELS
    // =========================================================

    roomLabel(text, x, z) {
        const canvas =
            document.createElement("canvas");

        canvas.width = 512;
        canvas.height = 128;

        const ctx =
            canvas.getContext("2d");

        ctx.fillStyle =
            "#111111";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle =
            "#eeeeee";

        ctx.font =
            "bold 42px monospace";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            text,
            256,
            64
        );

        const texture =
            new THREE.CanvasTexture(
                canvas
            );

        const label =
            new THREE.Mesh(
                new THREE.PlaneGeometry(
                    3.2,
                    0.8
                ),
                new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true
                })
            );

        label.position.set(
            x,
            3.1,
            z
        );

        label.rotation.y =
            Math.PI;

        this.scene.add(label);
    }

    // =========================================================
    // LIGHTING
    // =========================================================

    createPointLight(
        x,
        y,
        z,
        color,
        intensity,
        distance
    ) {
        const light =
            new THREE.PointLight(
                color,
                intensity,
                distance
            );

        light.position.set(
            x,
            y,
            z
        );

        light.castShadow = true;

        this.scene.add(light);

        return light;
    }

    createGlobalLighting() {
        const hemi =
            new THREE.HemisphereLight(
                0xcbd4dd,
                0x101010,
                1.2
            );

        this.scene.add(hemi);

        const sun =
            new THREE.DirectionalLight(
                0xffe5c7,
                1.5
            );

        sun.position.set(
            -20,
            30,
            -15
        );

        sun.castShadow = true;

        sun.shadow.mapSize.set(
            2048,
            2048
        );

        this.scene.add(sun);
    }

    // =========================================================
    // SIGNS
    // =========================================================

    placeSign(
        position,
        rotation = 0
    ) {
        if (!position) return null;

        const group =
            new THREE.Group();

        group.position.copy(position);
        group.rotation.y =
            rotation;

        const board =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.3,
                    0.75,
                    0.08
                ),
                this.materials.sign
            );

        group.add(board);

        const left =
            this.box(
                -0.42,
                -0.65,
                0,
                0.08,
                0.75,
                0.08,
                this.materials.wood
            );

        const right =
            this.box(
                0.42,
                -0.65,
                0,
                0.08,
                0.75,
                0.08,
                this.materials.wood
            );

        group.add(left);
        group.add(right);

        group.userData.type =
            "sign";

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
    }

    getSigns() {
        return this.signs;
    }

    // =========================================================
    // PLAYERS
    // =========================================================

    addPlayer(player) {
        if (!this.players.includes(player)) {
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
    // COLLISION
    // =========================================================

    getColliders() {
        return this.colliders;
    }

    getInteractables() {
        return this.interactables;
    }

    canMoveTo(
        position,
        radius,
        height
    ) {
        const playerBox =
            new THREE.Box3(
                new THREE.Vector3(
                    position.x - radius,
                    position.y,
                    position.z - radius
                ),
                new THREE.Vector3(
                    position.x + radius,
                    position.y + height,
                    position.z + radius
                )
            );

        for (const collider of this.colliders) {
            if (!collider.visible) {
                continue;
            }

            const box =
                new THREE.Box3().setFromObject(
                    collider
                );

            if (
                box.max.y <= playerBox.min.y ||
                box.min.y >= playerBox.max.y
            ) {
                continue;
            }

            if (
                playerBox.intersectsBox(box)
            ) {
                return false;
            }
        }

        return true;
    }

    // =========================================================
    // SWITCH
    // =========================================================

    switchWithPlayer(target) {
        if (!target) {
            return false;
        }

        const temp =
            this.players.find(
                p => p !== target &&
                     p.userData?.local
            );

        if (!temp) {
            return false;
        }

        const position =
            temp.position.clone();

        temp.position.copy(
            target.position
        );

        target.position.copy(
            position
        );

        return true;
    }

    // =========================================================
    // UPDATE
    // =========================================================

    update(delta) {
        // Environmental animation can go here.
    }

    // =========================================================
    // CLEANUP
    // =========================================================

    destroy() {
        this.colliders.length = 0;
        this.interactables.length = 0;
        this.signs.length = 0;
        this.players.length = 0;

        for (
            const child of [...this.scene.children]
        ) {
            this.scene.remove(child);
        }
    }
}
