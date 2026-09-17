import * as THREE from "three";

export class Player {
    constructor(scene, camera, world, options = {}) {
        this.scene = scene;
        this.camera = camera;
        this.world = world;

        this.onMessage = options.onMessage || (() => {});

        // --------------------------------------------------
        // Player state
        // --------------------------------------------------

        this.position = new THREE.Vector3(0, 1.7, 10);
        this.velocity = new THREE.Vector3();

        this.height = 1.7;
        this.radius = 0.35;

        this.walkSpeed = 4.5;
        this.sprintSpeed = 7.5;

        this.gravity = 22;
        this.jumpStrength = 8;

        this.grounded = true;

        // --------------------------------------------------
        // Identity / role
        // --------------------------------------------------

        this.uid = "LOCAL";
        this.role = "MATCH";

        // Possible values:
        // MATCH
        // SPARK
        // SNUFFER
        // FLICKER

        // --------------------------------------------------
        // Inventory
        // --------------------------------------------------

        this.inventory = [
            {
                type: "fist",
                name: "OPEN FIST",
                amount: Infinity
            },
            {
                type: "sign",
                name: "SIGNS",
                amount: 48
            },
            {
                type: "dart",
                name: "DART",
                amount: 1
            },
            {
                type: "gun",
                name: "GUN",
                amount: 1,
                loaded: false
            },
            {
                type: "axe",
                name: "AXE",
                amount: 1
            }
        ];

        this.selectedSlot = 0;

        // --------------------------------------------------
        // Input
        // --------------------------------------------------

        this.keys = new Set();

        this.mouse = {
            sensitivity: 0.0022,
            locked: false
        };

        this.pitch = 0;
        this.yaw = 0;

        this.enabled = false;

        // --------------------------------------------------
        // Raycasting
        // --------------------------------------------------

        this.raycaster = new THREE.Raycaster();

        this.raycaster.far = 6;

        // --------------------------------------------------
        // Temporary player body
        // --------------------------------------------------

        this.body = this.createBody();

        // --------------------------------------------------
        // Events
        // --------------------------------------------------

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handlePointerLockChange =
            this.handlePointerLockChange.bind(this);

        window.addEventListener(
            "keydown",
            this.handleKeyDown
        );

        window.addEventListener(
            "keyup",
            this.handleKeyUp
        );

        document.addEventListener(
            "mousemove",
            this.handleMouseMove
        );

        document.addEventListener(
            "mousedown",
            this.handleMouseDown
        );

        document.addEventListener(
            "pointerlockchange",
            this.handlePointerLockChange
        );

        this.updateHotbar();
    }

    // ======================================================
    // ENABLE / DISABLE
    // ======================================================

    enable() {
        this.enabled = true;

        this.position.set(0, this.height, 10);

        this.velocity.set(0, 0, 0);

        this.updateCamera();

        this.requestMouse();
    }

    disable() {
        this.enabled = false;

        this.keys.clear();

        this.releaseMouse();
    }

    // ======================================================
    // BODY
    // ======================================================

    createBody() {
        const group = new THREE.Group();

        const material = new THREE.MeshStandardMaterial({
            color: 0x181818
        });

        const body = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.65,
                1.25,
                0.4
            ),
            material
        );

        body.position.y = 0.625;

        group.add(body);

        const head = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.5,
                0.5,
                0.5
            ),
            material
        );

        head.position.y = 1.5;

        group.add(head);

        group.position.copy(this.position);

        // First-person player body is currently hidden.
        group.visible = false;

        this.scene.add(group);

        return group;
    }

    // ======================================================
    // INPUT
    // ======================================================

    handleKeyDown(event) {
        if (!this.enabled) return;

        // Prevent browser actions for game keys.
        if (
            [
                "KeyW",
                "KeyA",
                "KeyS",
                "KeyD",
                "KeyR",
                "KeyG",
                "Space"
            ].includes(event.code)
        ) {
            event.preventDefault();
        }

        // --------------------------------------------------
        // ESC
        // --------------------------------------------------
        // Escape releases pointer lock.
        // Clicking the game locks it again.
        //
        // Browser pointer lock itself handles the release.
        // --------------------------------------------------

        // --------------------------------------------------
        // Movement
        // --------------------------------------------------

        this.keys.add(event.code);

        // --------------------------------------------------
        // Jump
        // --------------------------------------------------

        if (
            event.code === "Space" &&
            this.grounded
        ) {
            this.velocity.y = this.jumpStrength;
            this.grounded = false;
        }

        // --------------------------------------------------
        // Hotbar
        // --------------------------------------------------

        const number = Number(event.key);

        if (
            number >= 1 &&
            number <= 9
        ) {
            this.selectSlot(number - 1);
        }

        // --------------------------------------------------
        // Load Dart
        // --------------------------------------------------

        if (
            event.code === "KeyR" &&
            !event.repeat
        ) {
            this.loadGun();
        }

        // --------------------------------------------------
        // Spark Switch
        // --------------------------------------------------

        if (
            event.code === "KeyG" &&
            !event.repeat
        ) {
            this.sparkSwitch();
        }
    }

    handleKeyUp(event) {
        this.keys.delete(event.code);
    }

    handleMouseMove(event) {
        if (!this.enabled) return;

        if (
            document.pointerLockElement !==
            document.querySelector("#game canvas")
        ) {
            return;
        }

        this.yaw -=
            event.movementX *
            this.mouse.sensitivity;

        this.pitch -=
            event.movementY *
            this.mouse.sensitivity;

        const limit = Math.PI / 2 - 0.05;

        this.pitch = THREE.MathUtils.clamp(
            this.pitch,
            -limit,
            limit
        );

        this.updateCameraRotation();
    }

    handleMouseDown(event) {
        if (!this.enabled) return;

        // Left click locks the mouse.
        if (event.button === 0) {
            this.requestMouse();
            return;
        }

        // Right click uses the equipped item.
        if (event.button === 2) {
            if (
                document.pointerLockElement ===
                document.querySelector("#game canvas")
            ) {
                this.useItem();
            }
        }
    }

    handlePointerLockChange() {
        const canvas =
            document.querySelector("#game canvas");

        this.mouse.locked =
            document.pointerLockElement === canvas;
    }

    // ======================================================
    // MOUSE
    // ======================================================

    requestMouse() {
        if (!this.enabled) return;

        const canvas =
            document.querySelector("#game canvas");

        if (!canvas) return;

        if (
            document.pointerLockElement !== canvas
        ) {
            canvas.requestPointerLock();
        }
    }

    releaseMouse() {
        if (
            document.pointerLockElement
        ) {
            document.exitPointerLock();
        }
    }

    // ======================================================
    // HOTBAR
    // ======================================================

    selectSlot(index) {
        if (
            index < 0 ||
            index >= this.inventory.length
        ) {
            return;
        }

        this.selectedSlot = index;

        this.updateHotbar();

        const item =
            this.inventory[index];

        this.onMessage(
            item.name,
            700
        );
    }

    updateHotbar() {
        const slots =
            document.querySelectorAll(
                "#hotbar .slot"
            );

        slots.forEach((slot, index) => {
            slot.classList.toggle(
                "selected",
                index === this.selectedSlot
            );
        });

        // Update sign count.
        const signSlot =
            document.querySelector(
                '#hotbar .slot[data-slot="1"] .item-count'
            );

        if (signSlot) {
            signSlot.textContent =
                this.inventory[1].amount;
        }

        // Update dart count.
        const dartSlot =
            document.querySelector(
                '#hotbar .slot[data-slot="2"] .item-count'
            );

        if (dartSlot) {
            dartSlot.textContent =
                this.inventory[2].amount;
        }

        // Show gun loading state.
        const gunSlot =
            document.querySelector(
                '#hotbar .slot[data-slot="3"]'
            );

        if (gunSlot) {
            gunSlot.classList.toggle(
                "loaded",
                this.inventory[3].loaded
            );
        }
    }

    getSelectedItem() {
        return this.inventory[
            this.selectedSlot
        ];
    }

    // ======================================================
    // ITEM USE
    // ======================================================

    useItem() {
        const item =
            this.getSelectedItem();

        if (!item) return;

        switch (item.type) {
            case "fist":
                this.useFist();
                break;

            case "sign":
                this.placeSign();
                break;

            case "dart":
                this.onMessage(
                    "LOAD THE DART INTO THE GUN",
                    1200
                );
                break;

            case "gun":
                this.fireGun();
                break;

            case "axe":
                this.useAxe();
                break;
        }
    }

    // ======================================================
    // OPEN FIST
    // ======================================================

    useFist() {
        const target =
            this.getTargetPlayer();

        if (!target) {
            this.onMessage(
                "NO MATCH IN RANGE",
                900
            );

            return;
        }

        if (
            this.role === "SPARK"
        ) {
            this.onMessage(
                "MATCH MARKED",
                1100
            );

            return;
        }

        if (
            this.role === "SNUFFER"
        ) {
            this.onMessage(
                "MATCH PROTECTED",
                1100
            );

            return;
        }

        this.onMessage(
            "OPEN FIST",
            700
        );
    }

    // ======================================================
    // SIGNS
    // ======================================================

    placeSign() {
        if (
            this.inventory[1].amount <= 0
        ) {
            this.onMessage(
                "NO SIGNS LEFT",
                1100
            );

            return;
        }

        const position =
            this.getPlacementPosition();

        if (!position) {
            this.onMessage(
                "CANNOT PLACE SIGN",
                900
            );

            return;
        }

        this.inventory[1].amount--;

        this.updateHotbar();

        if (
            this.world &&
            typeof this.world.placeSign ===
                "function"
        ) {
            this.world.placeSign(
                position,
                this.yaw
            );
        }

        this.onMessage(
            `SIGN PLACED • ${this.inventory[1].amount} LEFT`,
            1100
        );
    }

    // ======================================================
    // DART + GUN
    // ======================================================

    loadGun() {
        const gun =
            this.inventory[3];

        const dart =
            this.inventory[2];

        if (gun.loaded) {
            this.onMessage(
                "GUN ALREADY LOADED",
                1000
            );

            return;
        }

        if (dart.amount <= 0) {
            this.onMessage(
                "NO DART",
                1000
            );

            return;
        }

        dart.amount--;

        gun.loaded = true;

        this.updateHotbar();

        this.onMessage(
            "DART LOADED",
            1000
        );
    }

    fireGun() {
        const gun =
            this.inventory[3];

        if (!gun.loaded) {
            this.onMessage(
                "GUN EMPTY • PRESS R",
                1100
            );

            return;
        }

        const direction =
            new THREE.Vector3();

        this.camera.getWorldDirection(
            direction
        );

        const origin =
            this.camera.position.clone();

        // The actual multiplayer server will
        // validate the shot later.
        this.fireRay(
            origin,
            direction
        );

        gun.loaded = false;

        this.updateHotbar();

        this.onMessage(
            "DART FIRED",
            1000
        );
    }

    fireRay(origin, direction) {
        this.raycaster.set(
            origin,
            direction
        );

        const targets =
            this.getPlayerTargets();

        const hits =
            this.raycaster.intersectObjects(
                targets,
                true
            );

        if (hits.length === 0) {
            return;
        }

        const object =
            hits[0].object;

        let target =
            object;

        while (
            target &&
            !target.userData?.match
        ) {
            target = target.parent;
        }

        if (
            target &&
            target.userData?.uid
        ) {
            this.onMessage(
                `UID: ${target.userData.uid}`,
                2400
            );
        }
    }

    // ======================================================
    // AXE
    // ======================================================

    useAxe() {
        const target =
            this.getTargetSign();

        if (!target) {
            this.onMessage(
                "NO SIGN IN RANGE",
                900
            );

            return;
        }

        if (
            this.world &&
            typeof this.world.destroySign ===
                "function"
        ) {
            this.world.destroySign(target);

            this.onMessage(
                "SIGN DESTROYED",
                1000
            );
        }
    }

    // ======================================================
    // SPARK SWITCH
    // ======================================================

    sparkSwitch() {
        if (
            this.role !== "SPARK"
        ) {
            return;
        }

        const target =
            this.getTargetPlayer();

        if (!target) {
            this.onMessage(
                "NO MATCH TO SWITCH WITH",
                1000
            );

            return;
        }

        if (
            this.world &&
            typeof this.world.switchWithPlayer ===
                "function"
        ) {
            this.world.switchWithPlayer(
                target
            );

            this.onMessage(
                "SWITCH",
                1000
            );
        }
    }

    // ======================================================
    // TARGETING
    // ======================================================

    getTargetPlayer() {
        const targets =
            this.getPlayerTargets();

        if (targets.length === 0) {
            return null;
        }

        const direction =
            new THREE.Vector3();

        this.camera.getWorldDirection(
            direction
        );

        this.raycaster.set(
            this.camera.position,
            direction
        );

        const hits =
            this.raycaster.intersectObjects(
                targets,
                true
            );

        if (hits.length === 0) {
            return null;
        }

        let target =
            hits[0].object;

        while (
            target &&
            !target.userData?.match
        ) {
            target = target.parent;
        }

        return target || null;
    }

    getPlayerTargets() {
        if (
            this.world &&
            typeof this.world.getPlayers ===
                "function"
        ) {
            return this.world.getPlayers();
        }

        return [];
    }

    getTargetSign() {
        if (
            this.world &&
            typeof this.world.getSigns ===
                "function"
        ) {
            const signs =
                this.world.getSigns();

            const direction =
                new THREE.Vector3();

            this.camera.getWorldDirection(
                direction
            );

            this.raycaster.set(
                this.camera.position,
                direction
            );

            const hits =
                this.raycaster.intersectObjects(
                    signs,
                    true
                );

            if (hits.length > 0) {
                return hits[0].object;
            }
        }

        return null;
    }

    getPlacementPosition() {
        const direction =
            new THREE.Vector3();

        this.camera.getWorldDirection(
            direction
        );

        return this.camera.position
            .clone()
            .add(
                direction.multiplyScalar(2.5)
            );
    }

    // ======================================================
    // MOVEMENT
    // ======================================================

    update(delta) {
        if (!this.enabled) return;

        const speed =
            this.keys.has("ShiftLeft") ||
            this.keys.has("ShiftRight")
                ? this.sprintSpeed
                : this.walkSpeed;

        const forward =
            new THREE.Vector3();

        const right =
            new THREE.Vector3();

        forward.set(
            -Math.sin(this.yaw),
            0,
            -Math.cos(this.yaw)
        );

        right.set(
            Math.cos(this.yaw),
            0,
            -Math.sin(this.yaw)
        );

        const movement =
            new THREE.Vector3();

        if (this.keys.has("KeyW")) {
            movement.add(forward);
        }

        if (this.keys.has("KeyS")) {
            movement.sub(forward);
        }

        if (this.keys.has("KeyD")) {
            movement.add(right);
        }

        if (this.keys.has("KeyA")) {
            movement.sub(right);
        }

        if (movement.lengthSq() > 0) {
            movement.normalize();

            this.velocity.x =
                movement.x * speed;

            this.velocity.z =
                movement.z * speed;
        } else {
            this.velocity.x =
                THREE.MathUtils.damp(
                    this.velocity.x,
                    0,
                    12,
                    delta
                );

            this.velocity.z =
                THREE.MathUtils.damp(
                    this.velocity.z,
                    0,
                    12,
                    delta
                );
        }

        this.velocity.y -=
            this.gravity * delta;

        this.position.x +=
            this.velocity.x * delta;

        this.position.y +=
            this.velocity.y * delta;

        this.position.z +=
            this.velocity.z * delta;

        // --------------------------------------------------
        // Ground
        // --------------------------------------------------

        const floorHeight =
            this.world &&
            typeof this.world.getFloorHeight ===
                "function"
                ? this.world.getFloorHeight(
                    this.position.x,
                    this.position.z
                )
                : 0;

        const minY =
            floorHeight + this.height;

        if (this.position.y <= minY) {
            this.position.y = minY;

            this.velocity.y = 0;

            this.grounded = true;
        }

        // --------------------------------------------------
        // World bounds
        // --------------------------------------------------

        const bounds = 28;

        this.position.x =
            THREE.MathUtils.clamp(
                this.position.x,
                -bounds,
                bounds
            );

        this.position.z =
            THREE.MathUtils.clamp(
                this.position.z,
                -bounds,
                bounds
            );

        this.body.position.copy(
            this.position
        );

        this.updateCamera();
    }

    // ======================================================
    // CAMERA
    // ======================================================

    updateCamera() {
        this.camera.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );

        this.updateCameraRotation();
    }

    updateCameraRotation() {
        this.camera.rotation.order =
            "YXZ";

        this.camera.rotation.y =
            this.yaw;

        this.camera.rotation.x =
            this.pitch;
    }

    // ======================================================
    // CLEANUP
    // ======================================================

    destroy() {
        window.removeEventListener(
            "keydown",
            this.handleKeyDown
        );

        window.removeEventListener(
            "keyup",
            this.handleKeyUp
        );

        document.removeEventListener(
            "mousemove",
            this.handleMouseMove
        );

        document.removeEventListener(
            "mousedown",
            this.handleMouseDown
        );

        document.removeEventListener(
            "pointerlockchange",
            this.handlePointerLockChange
        );

        this.releaseMouse();

        if (this.body) {
            this.scene.remove(
                this.body
            );
        }
    }

    // ======================================================
    // HELPERS
    // ======================================================

    isOpenFist() {
        return (
            this.getSelectedItem()?.type ===
            "fist"
        );
    }
}
