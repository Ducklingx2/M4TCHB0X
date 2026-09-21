import * as THREE from "three";

export class Player {
    constructor(scene, camera, world, options = {}) {
        this.scene = scene;
        this.camera = camera;
        this.world = world;

        this.onMessage =
            options.onMessage || (() => {});

        // -------------------------
        // PLAYER STATE
        // -------------------------

        this.position = new THREE.Vector3(
            0,
            1.1,
            5
        );

        this.velocity = new THREE.Vector3();

        this.height = 1.8;
        this.radius = 0.35;

        this.walkSpeed = 4.5;
        this.sprintSpeed = 7.2;

        this.gravity = 22;
        this.jumpForce = 8;

        this.grounded = true;

        // -------------------------
        // LOOK
        // -------------------------

        this.yaw = 0;
        this.pitch = 0;

        // -------------------------
        // INPUT
        // -------------------------

        this.keys = {};

        this.enabled = false;
        this.pointerLocked = false;
        this.pointerLockCooldown = false;

        // -------------------------
        // MATCH DATA
        // -------------------------

        this.uid = "LOCAL";
        this.role = "MATCH";

        // -------------------------
        // INVENTORY
        // -------------------------

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

        // -------------------------
        // RAYCASTING
        // -------------------------

        this.raycaster =
            new THREE.Raycaster();

        this.center =
            new THREE.Vector2(0, 0);

        this.camera.rotation.order = "YXZ";

        // -------------------------
        // SETUP
        // -------------------------

        this.setupInput();

        this.userData = {
            local: true,
            uid: this.uid,
            match: true
        };

        this.world.addPlayer(this);
    }

    // =====================================================
    // INPUT
    // =====================================================

    setupInput() {
        this.onKeyDown = (event) => {
            if (!this.enabled) return;

            this.keys[event.code] = true;

            // Number keys
            if (event.code.startsWith("Digit")) {
                const slot =
                    Number(
                        event.code.replace("Digit", "")
                    ) - 1;

                if (
                    slot >= 0 &&
                    slot < this.inventory.length
                ) {
                    this.selectSlot(slot);
                }
            }

            // Load gun
            if (event.code === "KeyR") {
                this.loadGun();
            }

            // Spark switch
            if (event.code === "KeyG") {
                if (this.role === "SPARK") {
                    this.sparkSwitch();
                }
            }

            // Jump
            if (event.code === "Space") {
                event.preventDefault();
                this.jump();
            }

            // Release / request pointer lock
            if (event.code === "Escape") {
                this.toggleMouse();
            }
        };

        this.onKeyUp = (event) => {
            this.keys[event.code] = false;
        };

        this.onMouseDown = (event) => {
            if (!this.enabled) return;

            // Left click = request pointer lock
            if (event.button === 0) {
                if (!this.pointerLocked) {
                    this.requestMouse();
                }
            }

            // Right click = selected item
            if (event.button === 2) {
                this.useSelectedItem();
            }
        };

        this.onMouseMove = (event) => {
            if (!this.pointerLocked) return;

            const sensitivity = 0.002;

            this.yaw -=
                event.movementX * sensitivity;

            this.pitch -=
                event.movementY * sensitivity;

            this.pitch =
                THREE.MathUtils.clamp(
                    this.pitch,
                    -Math.PI / 2 + 0.05,
                    Math.PI / 2 - 0.05
                );
        };

        this.onPointerLockChange = () => {
            this.pointerLocked =
                document.pointerLockElement ===
                document.body;
        };

        document.addEventListener(
            "keydown",
            this.onKeyDown
        );

        document.addEventListener(
            "keyup",
            this.onKeyUp
        );

        document.addEventListener(
            "mousedown",
            this.onMouseDown
        );

        document.addEventListener(
            "mousemove",
            this.onMouseMove
        );

        document.addEventListener(
            "pointerlockchange",
            this.onPointerLockChange
        );
    }

    // =====================================================
    // ENABLE / DISABLE
    // =====================================================

    enable() {
        this.enabled = true;

        this.camera.position.set(
            this.position.x,
            this.position.y + 0.55,
            this.position.z
        );

        this.camera.rotation.set(
            this.pitch,
            this.yaw,
            0
        );
    }

    disable() {
        this.enabled = false;

        this.keys = {};

        this.releaseMouse();
    }

    // =====================================================
    // UPDATE
    // =====================================================

    update(delta) {
        if (!this.enabled) return;

        this.updateMovement(delta);
        this.updateCamera();
    }

    // =====================================================
    // MOVEMENT
    // =====================================================

    updateMovement(delta) {
        const direction =
            new THREE.Vector3();

        const forward =
            new THREE.Vector3(
                0,
                0,
                -1
            );

        const right =
            new THREE.Vector3(
                1,
                0,
                0
            );

        const up =
            new THREE.Vector3(
                0,
                1,
                0
            );

        // Rotate movement according to camera yaw
        forward.applyAxisAngle(
            up,
            this.yaw
        );

        right.applyAxisAngle(
            up,
            this.yaw
        );

        if (this.keys.KeyW) {
            direction.add(forward);
        }

        if (this.keys.KeyS) {
            direction.sub(forward);
        }

        if (this.keys.KeyD) {
            direction.add(right);
        }

        if (this.keys.KeyA) {
            direction.sub(right);
        }

        if (direction.lengthSq() > 0) {
            direction.normalize();
        }

        const sprint =
            this.keys.ShiftLeft ||
            this.keys.ShiftRight;

        const speed =
            sprint
                ? this.sprintSpeed
                : this.walkSpeed;

        const movement =
            direction.multiplyScalar(
                speed * delta
            );

        // Horizontal movement
        this.tryMove(
            movement.x,
            movement.z
        );

        // Gravity
        this.velocity.y -=
            this.gravity * delta;

        const nextY =
            this.position.y +
            this.velocity.y * delta;

        // Ground
        if (nextY <= 1.1) {
            this.position.y = 1.1;
            this.velocity.y = 0;
            this.grounded = true;
        } else {
            this.position.y = nextY;
            this.grounded = false;
        }
    }

    tryMove(dx, dz) {
        // X movement
        if (Math.abs(dx) > 0) {
            const nextX =
                this.position.clone();

            nextX.x += dx;

            if (
                this.canMoveTo(nextX)
            ) {
                this.position.x =
                    nextX.x;
            }
        }

        // Z movement
        if (Math.abs(dz) > 0) {
            const nextZ =
                this.position.clone();

            nextZ.z += dz;

            if (
                this.canMoveTo(nextZ)
            ) {
                this.position.z =
                    nextZ.z;
            }
        }
    }

    canMoveTo(position) {
        if (
            !this.world ||
            typeof this.world.canMoveTo !== "function"
        ) {
            return true;
        }

        return this.world.canMoveTo(
            position,
            this.radius,
            this.height
        );
    }

    // =====================================================
    // JUMP
    // =====================================================

    jump() {
        if (!this.enabled) return;

        if (!this.grounded) return;

        this.velocity.y =
            this.jumpForce;

        this.grounded = false;
    }

    // =====================================================
    // CAMERA
    // =====================================================

    updateCamera() {
        this.camera.position.set(
            this.position.x,
            this.position.y + 0.55,
            this.position.z
        );

        this.camera.rotation.set(
            this.pitch,
            this.yaw,
            0
        );
    }

    // =====================================================
    // INVENTORY
    // =====================================================

    selectSlot(index) {
        if (!this.inventory[index]) {
            return;
        }

        this.selectedSlot = index;

        document
            .querySelectorAll("#hotbar .slot")
            .forEach((slot) => {
                slot.classList.toggle(
                    "selected",
                    Number(slot.dataset.slot) === index
                );
            });
    }

    getSelectedItem() {
        return this.inventory[
            this.selectedSlot
        ];
    }

    // =====================================================
    // ITEM USE
    // =====================================================

    useSelectedItem() {
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

            case "gun":
                this.fireGun();
                break;

            case "axe":
                this.useAxe();
                break;
        }
    }

    // =====================================================
    // OPEN FIST
    // =====================================================

    useFist() {
        const target =
            this.getTargetPlayer();

        if (!target) {
            this.onMessage(
                "NO MATCH TARGET"
            );

            return;
        }

        if (this.role === "SPARK") {
            target.userData.marked = true;

            this.onMessage(
                "MATCH MARKED"
            );

            return;
        }

        if (this.role === "SNUFFER") {
            target.userData.protected = true;

            this.onMessage(
                "MATCH PROTECTED"
            );

            return;
        }

        this.onMessage(
            "OPEN FIST"
        );
    }

    // =====================================================
    // SIGNS
    // =====================================================

    placeSign() {
        const item =
            this.inventory[1];

        if (item.amount <= 0) {
            this.onMessage(
                "NO SIGNS LEFT"
            );

            return;
        }

        const placement =
            this.getSignPlacement();

        if (!placement) {
            this.onMessage(
                "NO VALID SIGN LOCATION"
            );

            return;
        }

        const sign =
            this.world.placeSign(
                placement.position,
                placement.rotation
            );

        if (!sign) {
            this.onMessage(
                "SIGN CANNOT BE PLACED HERE"
            );

            return;
        }

        item.amount--;

        this.updateHotbarCount(
            1,
            item.amount
        );

        this.onMessage(
            "SIGN PLACED"
        );
    }

    getSignPlacement() {
        this.raycaster.setFromCamera(
            this.center,
            this.camera
        );

        const objects =
            this.world.getColliders();

        const hits =
            this.raycaster.intersectObjects(
                objects,
                false
            );

        if (hits.length === 0) {
            return null;
        }

        const hit =
            hits[0];

        if (hit.distance > 5) {
            return null;
        }

        const position =
            hit.point.clone();

        position.y = 1;

        let rotation =
            this.yaw;

        if (hit.face) {
            const normal =
                hit.face.normal
                    .clone()
                    .transformDirection(
                        hit.object.matrixWorld
                    );

            rotation =
                Math.atan2(
                    normal.x,
                    normal.z
                );
        }

        return {
            position,
            rotation
        };
    }

    // =====================================================
    // GUN
    // =====================================================

    loadGun() {
        const dart =
            this.inventory[2];

        const gun =
            this.inventory[3];

        if (dart.amount <= 0) {
            this.onMessage(
                "NO DART"
            );

            return;
        }

        if (gun.loaded) {
            this.onMessage(
                "GUN ALREADY LOADED"
            );

            return;
        }

        dart.amount--;

        gun.loaded = true;

        this.updateHotbarCount(
            2,
            dart.amount
        );

        const gunSlot =
            document.querySelector(
                '.slot[data-slot="3"]'
            );

        if (gunSlot) {
            gunSlot.classList.add(
                "loaded"
            );
        }

        this.onMessage(
            "DART LOADED"
        );
    }

    fireGun() {
        const gun =
            this.inventory[3];

        if (!gun.loaded) {
            this.onMessage(
                "LOAD THE GUN FIRST"
            );

            return;
        }

        const target =
            this.getTargetPlayer();

        if (!target) {
            this.onMessage(
                "NO MATCH TARGET"
            );

            return;
        }

        gun.loaded = false;

        const gunSlot =
            document.querySelector(
                '.slot[data-slot="3"]'
            );

        if (gunSlot) {
            gunSlot.classList.remove(
                "loaded"
            );
        }

        const uid =
            target.userData?.uid ||
            "UNKNOWN";

        this.onMessage(
            `IDENTITY: ${uid}`
        );
    }

    // =====================================================
    // AXE
    // =====================================================

    useAxe() {
        const target =
            this.getTargetSign();

        if (!target) {
            this.onMessage(
                "NO SIGN TARGET"
            );

            return;
        }

        this.world.destroySign(
            target
        );

        this.onMessage(
            "SIGN DESTROYED"
        );
    }

    // =====================================================
    // SPARK SWITCH
    // =====================================================

    sparkSwitch() {
        if (this.role !== "SPARK") {
            return;
        }

        const target =
            this.getTargetPlayer();

        if (!target) {
            this.onMessage(
                "NO MATCH TARGET"
            );

            return;
        }

        const switched =
            this.world.switchWithPlayer(
                target
            );

        if (switched) {
            this.onMessage(
                "LOCATION SWITCHED"
            );
        }
    }

    // =====================================================
    // TARGETING
    // =====================================================

    getTargetPlayer() {
        this.raycaster.setFromCamera(
            this.center,
            this.camera
        );

        const players =
            this.world
                .getPlayers()
                .filter(
                    player =>
                        player !== this
                );

        const hits =
            this.raycaster.intersectObjects(
                players,
                true
            );

        for (const hit of hits) {
            let object =
                hit.object;

            while (
                object &&
                !object.userData?.match
            ) {
                object =
                    object.parent;
            }

            if (object) {
                return object;
            }
        }

        return null;
    }

    getTargetSign() {
        this.raycaster.setFromCamera(
            this.center,
            this.camera
        );

        const hits =
            this.raycaster.intersectObjects(
                this.world.getSigns(),
                true
            );

        if (hits.length === 0) {
            return null;
        }

        let object =
            hits[0].object;

        while (
            object &&
            object.userData?.type !== "sign"
        ) {
            object =
                object.parent;
        }

        return object || null;
    }

    // =====================================================
    // POINTER LOCK
    // =====================================================

    requestMouse() {
        if (!this.enabled) {
            return;
        }

        if (document.pointerLockElement) {
            return;
        }

        if (this.pointerLockCooldown) {
            return;
        }

        this.pointerLockCooldown = true;

        try {
            const request =
                document.body.requestPointerLock();

            if (
                request &&
                typeof request.catch === "function"
            ) {
                request.catch(() => {});
            }
        } catch {
            // Browser rejected pointer lock.
        }

        window.setTimeout(() => {
            this.pointerLockCooldown = false;
        }, 250);
    }

    releaseMouse() {
        if (
            document.pointerLockElement
        ) {
            document.exitPointerLock();
        }

        this.pointerLocked = false;
    }

    toggleMouse() {
        if (
            document.pointerLockElement
        ) {
            this.releaseMouse();
            return;
        }

        this.requestMouse();
    }

    // =====================================================
    // HOTBAR
    // =====================================================

    updateHotbarCount(
        slotIndex,
        amount
    ) {
        const slot =
            document.querySelector(
                `.slot[data-slot="${slotIndex}"]`
            );

        if (!slot) return;

        const counter =
            slot.querySelector(
                ".item-count"
            );

        if (!counter) return;

        counter.textContent =
            amount;
    }

    // =====================================================
    // CLEANUP
    // =====================================================

    destroy() {
        this.disable();

        document.removeEventListener(
            "keydown",
            this.onKeyDown
        );

        document.removeEventListener(
            "keyup",
            this.onKeyUp
        );

        document.removeEventListener(
            "mousedown",
            this.onMouseDown
        );

        document.removeEventListener(
            "mousemove",
            this.onMouseMove
        );

        document.removeEventListener(
            "pointerlockchange",
            this.onPointerLockChange
        );

        if (
            this.world &&
            typeof this.world.removePlayer ===
                "function"
        ) {
            this.world.removePlayer(
                this
            );
        }
    }
}
