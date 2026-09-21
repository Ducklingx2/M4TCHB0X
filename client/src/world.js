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

    // =========================================================
    // MATERIALS
    // =========================================================

    createMaterials() {
        this.materials.floor =
            new THREE.MeshStandardMaterial({
                color: 0x353535,
                roughness: 0.85
            });

        this.materials.wall =
            new THREE.MeshStandardMaterial({
                color: 0x565656,
                roughness: 0.8
            });

        this.materials.wallDark =
            new THREE.MeshStandardMaterial({
                color: 0x242424,
                roughness: 0.9
            });

        this.materials.metal =
            new THREE.MeshStandardMaterial({
                color: 0x4b4f52,
                metalness: 0.7,
                roughness: 0.32
            });

        this.materials.darkMetal =
            new THREE.MeshStandardMaterial({
                color: 0x202326,
                metalness: 0.8,
                roughness: 0.25
            });

        this.materials.wood =
            new THREE.MeshStandardMaterial({
                color: 0x69472f,
                roughness: 0.9
            });

        this.materials.red =
            new THREE.MeshStandardMaterial({
                color: 0x9d2c20,
                roughness: 0.65
            });

        this.materials.black =
            new THREE.MeshStandardMaterial({
                color: 0x090909,
                roughness: 0.8
            });

        this.materials.amethyst =
            new THREE.MeshStandardMaterial({
                color: 0x8755bd,
                emissive: 0x281238,
                emissiveIntensity: 0.45,
                roughness: 0.45
            });

        this.materials.disco =
            new THREE.MeshStandardMaterial({
                color: 0x15151a,
                roughness: 0.35,
                metalness: 0.5
            });

        this.materials.lava =
            new THREE.MeshStandardMaterial({
                color: 0xff4a16,
                emissive: 0xff2600,
                emissiveIntensity: 2,
                roughness: 0.4
            });

        this.materials.glass =
            new THREE.MeshPhysicalMaterial({
                color: 0x9fb8c2,
                transparent: true,
                opacity: 0.32,
                roughness: 0.12,
                metalness: 0.15
            });

        this.materials.sign =
            new THREE.MeshStandardMaterial({
                color: 0xc49a63,
                roughness: 0.85
            });

        this.materials.grass =
            new THREE.MeshStandardMaterial({
                color: 0x303c2e,
                roughness: 1
            });
    }

    // =========================================================
    // WORLD
    // =========================================================

    createWorld() {
        this.createFloor();

        this.createRoom(
            "Atrium",
            0,
            0,
            20,
            18
        );

        this.createRoom(
            "Volcano",
            0,
            -19,
            12,
            12
        );

        this.createRoom(
            "Disco",
            -18,
            -10,
            11,
            10
        );

        this.createRoom(
            "Amethyst",
            -20,
            5,
            12,
            11
        );

        this.createRoom(
            "Scrapyard",
            -20,
            18,
            12,
            10
        );

        this.createRoom(
            "Museum",
            -8,
            24,
            14,
            9
        );

        this.createRoom(
            "Dining Hall",
            5,
            24,
            12,
            9
        );

        this.createRoom(
            "Library",
            18,
            2,
            12,
            12
        );

        this.createRoom(
            "Maze",
            28,
            5,
            13,
            14
        );

        this.createRoom(
            "Storage",
            18,
            18,
            11,
            9
        );

        this.createRoom(
            "Lounge",
            26,
            25,
            12,
            9
        );

        this.createRoom(
            "Viewing Lobby",
            19,
            -12,
            13,
            8
        );

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

        this.createLighting();
        this.createDetails();
    }

    // =========================================================
    // FLOOR
    // =========================================================

    createFloor() {
        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(
                75,
                0.2,
                70
            ),
            this.materials.floor
        );

        floor.position.set(
            4,
            -0.1,
            4
        );

        floor.receiveShadow = true;

        this.scene.add(floor);
    }

    // =========================================================
    // ROOM SHELL
    // =========================================================

    createRoom(
        name,
        x,
        z,
        width,
        depth
    ) {
        const height = 5;
        const thickness = 0.5;

        this.createWall(
            x,
            z - depth / 2,
            width,
            thickness,
            height
        );

        this.createWall(
            x,
            z + depth / 2,
            width,
            thickness,
            height
        );

        this.createWall(
            x - width / 2,
            z,
            thickness,
            depth,
            height
        );

        this.createWall(
            x + width / 2,
            z,
            thickness,
            depth,
            height
        );

        this.createRoomSign(
            name,
            x,
            z - depth / 2 + 0.08
        );
    }

    createWall(
        x,
        z,
        width,
        depth,
        height = 5
    ) {
        return this.addBox(
            width,
            height,
            depth,
            x,
            height / 2,
            z,
            this.materials.wall
        );
    }

    // =========================================================
    // DOORS / CONNECTIONS
    // =========================================================

    createDoor(
        x,
        z,
        horizontal = true,
        width = 3
    ) {
        const wallLength = 10;
        const thickness = 0.5;
        const height = 5;

        const sideLength =
            (wallLength - width) / 2;

        if (horizontal) {
            this.createWall(
                x - (width + sideLength) / 2,
                z,
                sideLength,
                thickness,
                height
            );

            this.createWall(
                x + (width + sideLength) / 2,
                z,
                sideLength,
                thickness,
                height
            );
        }
    }

    // =========================================================
    // ATRIUM
    // =========================================================

    createAtrium() {
        const platform = new THREE.Mesh(
            new THREE.BoxGeometry(
                8,
                0.3,
                6
            ),
            this.materials.darkMetal
        );

        platform.position.set(
            0,
            0.15,
            0
        );

        platform.receiveShadow = true;

        this.scene.add(platform);

        // Central matchbox
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(
                6,
                2,
                2.8
            ),
            this.materials.red
        );

        box.position.set(
            0,
            1.15,
            0
        );

        box.castShadow = true;

        this.scene.add(box);

        const stripe = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.15,
                2.05,
                2.9
            ),
            this.materials.black
        );

        stripe.position.set(
            0,
            1.15,
            0
        );

        this.scene.add(stripe);
    }

    // =========================================================
    // VOLCANO
    // =========================================================

    createVolcano() {
        const lava = new THREE.Mesh(
            new THREE.CylinderGeometry(
                3.5,
                4.5,
                0.35,
                32
            ),
            this.materials.lava
        );

        lava.position.set(
            0,
            0.2,
            -19
        );

        this.scene.add(lava);

        const light =
            new THREE.PointLight(
                0xff4b18,
                8,
                15
            );

        light.position.set(
            0,
            2,
            -19
        );

        this.scene.add(light);

        for (let i = 0; i < 6; i++) {
            const pipe = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.15,
                    0.15,
                    3,
                    12
                ),
                this.materials.metal
            );

            pipe.position.set(
                -4 + i * 1.5,
                1.5,
                -21
            );

            pipe.rotation.z =
                Math.PI / 2;

            this.scene.add(pipe);
        }
    }

    // =========================================================
    // DISCO
    // =========================================================

    createDisco() {
        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(
                7,
                0.08,
                6
            ),
            this.materials.black
        );

        floor.position.set(
            -18,
            0.08,
            -10
        );

        this.scene.add(floor);

        for (let x = -20; x <= -16; x += 2) {
            for (let z = -12; z <= -8; z += 2) {
                const tile = new THREE.Mesh(
                    new THREE.BoxGeometry(
                        1.6,
                        0.08,
                        1.6
                    ),
                    new THREE.MeshStandardMaterial({
                        color:
                            Math.random() > 0.5
                                ? 0x38243f
                                : 0x252a42,
                        emissive:
                            Math.random() > 0.5
                                ? 0x24102c
                                : 0x10182e,
                        emissiveIntensity: 1
                    })
                );

                tile.position.set(
                    x,
                    0.13,
                    z
                );

                this.scene.add(tile);
            }
        }

        for (let i = 0; i < 4; i++) {
            const light =
                new THREE.PointLight(
                    i % 2
                        ? 0x7c54ff
                        : 0xff3c7a,
                    4,
                    9
                );

            light.position.set(
                -21 + i * 2,
                3.5,
                -12
            );

            this.scene.add(light);
        }
    }

    // =========================================================
    // AMETHYST
    // =========================================================

    createAmethyst() {
        for (let i = 0; i < 16; i++) {
            const crystal = new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.35 + Math.random() * 0.35,
                    1.5 + Math.random() * 2,
                    6
                ),
                this.materials.amethyst
            );

            crystal.position.set(
                -24 + Math.random() * 8,
                0.8 + Math.random() * 0.4,
                1 + Math.random() * 8
            );

            crystal.rotation.y =
                Math.random() * Math.PI;

            crystal.castShadow = true;

            this.scene.add(crystal);
        }
    }

    // =========================================================
    // SCRAPYARD
    // =========================================================

    createScrapyard() {
        for (let i = 0; i < 14; i++) {
            const size =
                0.7 + Math.random() * 1.4;

            const scrap = new THREE.Mesh(
                new THREE.BoxGeometry(
                    size,
                    size,
                    size
                ),
                this.materials.darkMetal
            );

            scrap.position.set(
                -24 + Math.random() * 8,
                size / 2,
                15 + Math.random() * 6
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
    }

    // =========================================================
    // MUSEUM
    // =========================================================

    createMuseum() {
        for (let i = 0; i < 4; i++) {
            const display =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        2,
                        1.8,
                        1.4
                    ),
                    this.materials.glass
                );

            display.position.set(
                -12 + i * 3,
                1,
                24
            );

            this.scene.add(display);

            const artifact =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        0.7,
                        0.7,
                        0.7
                    ),
                    this.materials.metal
                );

            artifact.position.set(
                -12 + i * 3,
                1,
                24
            );

            this.scene.add(artifact);
        }
    }

    // =========================================================
    // DINING HALL
    // =========================================================

    createDiningHall() {
        for (let x = 1; x <= 9; x += 4) {
            this.createTable(
                x,
                24,
                2.5
            );
        }

        const kitchen =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    8,
                    2,
                    1
                ),
                this.materials.metal
            );

        kitchen.position.set(
            5,
            1,
            27
        );

        this.scene.add(kitchen);
        this.colliders.push(kitchen);
    }

    createTable(x, z, width) {
        const top = new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                0.25,
                1.4
            ),
            this.materials.wood
        );

        top.position.set(
            x,
            1.5,
            z
        );

        this.scene.add(top);
        this.colliders.push(top);

        for (const lx of [
            -width / 2 + 0.2,
            width / 2 - 0.2
        ]) {
            for (const lz of [
                -0.5,
                0.5
            ]) {
                const leg = new THREE.Mesh(
                    new THREE.BoxGeometry(
                        0.2,
                        1.5,
                        0.2
                    ),
                    this.materials.metal
                );

                leg.position.set(
                    x + lx,
                    0.75,
                    z + lz
                );

                this.scene.add(leg);
                this.colliders.push(leg);
            }
        }
    }

    // =========================================================
    // LIBRARY
    // =========================================================

    createLibrary() {
        for (let x = 14; x <= 22; x += 2) {
            const shelf = new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.2,
                    3,
                    0.5
                ),
                this.materials.wood
            );

            shelf.position.set(
                x,
                1.5,
                0
            );

            this.scene.add(shelf);
            this.colliders.push(shelf);

            for (let y = 0; y < 3; y++) {
                const book = new THREE.Mesh(
                    new THREE.BoxGeometry(
                        0.3,
                        0.5,
                        0.4
                    ),
                    this.materials.red
                );

                book.position.set(
                    x - 0.25,
                    0.6 + y * 0.75,
                    -0.28
                );

                this.scene.add(book);
            }
        }
    }

    // =========================================================
    // MAZE
    // =========================================================

    createMaze() {
        const walls = [
            [25, -1, 5, 0.4],
            [29, 2, 0.4, 6],
            [25, 5, 5, 0.4],
            [23, 9, 0.4, 7],
            [27, 12, 6, 0.4],
            [32, 8, 0.4, 8],
            [29, 3, 5, 0.4],
            [27, 6, 0.4, 5]
        ];

        for (const [
            x,
            z,
            width,
            depth
        ] of walls) {
            this.createWall(
                x,
                z,
                width,
                depth,
                3
            );
        }
    }

    // =========================================================
    // STORAGE
    // =========================================================

    createStorage() {
        for (let x = 14; x <= 22; x += 2) {
            for (let z = 16; z <= 20; z += 2) {
                const crate =
                    new THREE.Mesh(
                        new THREE.BoxGeometry(
                            1.5,
                            1.5,
                            1.5
                        ),
                        this.materials.wood
                    );

                crate.position.set(
                    x,
                    0.75,
                    z
                );

                crate.castShadow = true;

                this.scene.add(crate);
                this.colliders.push(crate);
            }
        }
    }

    // =========================================================
    // LOUNGE
    // =========================================================

    createLounge() {
        const couch =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    6,
                    1,
                    1.8
                ),
                this.materials.red
            );

        couch.position.set(
            26,
            0.7,
            25
        );

        this.scene.add(couch);
        this.colliders.push(couch);

        const table =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    1,
                    1,
                    0.5,
                    24
                ),
                this.materials.wood
            );

        table.position.set(
            26,
            0.4,
            28
        );

        this.scene.add(table);
        this.colliders.push(table);
    }

    // =========================================================
    // VIEWING LOBBY
    // =========================================================

    createViewingLobby() {
        const window =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    8,
                    3,
                    0.15
                ),
                this.materials.glass
            );

        window.position.set(
            19,
            2.2,
            -15.8
        );

        this.scene.add(window);

        const light =
            new THREE.PointLight(
                0x9ed8ff,
                3,
                12
            );

        light.position.set(
            19,
            3,
            -14
        );

        this.scene.add(light);
    }

    // =========================================================
    // ROOM SIGNS
    // =========================================================

    createRoomSign(
        text,
        x,
        z
    ) {
        const group =
            new THREE.Group();

        group.position.set(
            x,
            2.8,
            z
        );

        group.userData.room = text;

        const board =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    2.5,
                    0.7,
                    0.08
                ),
                this.materials.black
            );

        group.add(board);

        this.scene.add(group);
    }

    // =========================================================
    // LIGHTING
    // =========================================================

    createLighting() {
        const ambient =
            new THREE.HemisphereLight(
                0xb8c3d0,
                0x151515,
                1.1
            );

        this.scene.add(ambient);

        const main =
            new THREE.DirectionalLight(
                0xffe5c4,
                1.8
            );

        main.position.set(
            -20,
            30,
            -15
        );

        main.castShadow = true;

        main.shadow.mapSize.set(
            2048,
            2048
        );

        this.scene.add(main);
    }

    // =========================================================
    // DETAILS
    // =========================================================

    createDetails() {
        const grid =
            new THREE.GridHelper(
                70,
                70,
                0x454545,
                0x222222
            );

        grid.position.y = 0.01;

        this.scene.add(grid);
    }

    // =========================================================
    // GENERIC BOX
    // =========================================================

    addBox(
        width,
        height,
        depth,
        x,
        y,
        z,
        material,
        collider = true
    ) {
        const mesh =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    width,
                    height,
                    depth
                ),
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

        if (collider) {
            this.colliders.push(mesh);
        }

        return mesh;
    }

    // =========================================================
    // SIGNS
    // =========================================================

    placeSign(
        position,
        rotationY = 0
    ) {
        if (!position) return null;

        const group =
            new THREE.Group();

        group.position.copy(position);
        group.rotation.y = rotationY;

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

        group.add(board);

        const left =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.08,
                    0.8,
                    0.08
                ),
                this.materials.wood
            );

        left.position.set(
            -0.42,
            -0.7,
            0
        );

        group.add(left);

        const right =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.08,
                    0.8,
                    0.08
                ),
                this.materials.wood
            );

        right.position.set(
            0.42,
            -0.7,
            0
        );

        group.add(right);

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

    getSigns() {
        return this.signs;
    }

    getColliders() {
        return this.colliders;
    }

    getInteractables() {
        return this.interactables;
    }

    // =========================================================
    // COLLISION
    // =========================================================

    canMoveTo(
        position,
        radius,
        height
    ) {
        const box =
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
            if (
                !collider ||
                !collider.visible
            ) {
                continue;
            }

            const colliderBox =
                new THREE.Box3().setFromObject(
                    collider
                );

            if (
                colliderBox.max.y <= box.min.y ||
                colliderBox.min.y >= box.max.y
            ) {
                continue;
            }

            if (
                box.intersectsBox(
                    colliderBox
                )
            ) {
                return false;
            }
        }

        return true;
    }

    // =========================================================
    // GAME LOOP
    // =========================================================

    update(delta) {
        // Reserved for future world animation.
    }

    // =========================================================
    // CLEANUP
    // =========================================================

    destroy() {
        for (const object of [...this.scene.children]) {
            if (object.userData?.persistent) {
                continue;
            }

            this.scene.remove(object);
        }

        this.colliders.length = 0;
        this.interactables.length = 0;
        this.signs.length = 0;
        this.players.length = 0;
    }
}
