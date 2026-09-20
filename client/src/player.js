import * as THREE from "three";

export class Player {
    constructor(scene, camera, world, options = {}) {
        this.scene = scene;
        this.camera = camera;
        this.world = world;

        this.onMessage =
            options.onMessage || (() => {});

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

        this.grounded = false;

        this.yaw = 0;
        this.pitch = 0;

        this.keys = {};

        this.enabled = false;
        this.pointerLocked = false;

        this.uid = "LOCAL";
        this.role = "MATCH";

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

        this.raycaster =
            new THREE.Raycaster();

        this.center =
            new THREE.Vector2(0, 0);

        this.camera.rotation.order = "YXZ";

        this.setupInput();

        this.userData = {
            local: true,
            uid: this.uid,
            match: true
        };

        this.world.addPlayer(this);
    }

    // =========================================================
    // INPUT
    // =========================================================

    setupInput() {
        this.onKeyDown = event => {
            this.keys[event.code] = true;

            if (
                event.code.startsWith("Digit")
            ) {
                const slot =
                    Number(event.code.replace("Digit", "")) - 1;

                if (slot >= 0 && slot < 9) {
                    this.selectSlot(slot);
                }
            }

            if (event.code === "KeyR") {
                this.loadGun();
            }

            if (event.code === "KeyG") {
                if (this.role === "SPARK") {
                    this.sparkSwitch();
                }
            }

            if (event.code === "Space") {
                this.jump();
            }

            if (event.code === "Escape") {
                this.toggleMouse();
            }
        };

        this.onKeyUp = event => {
            this.keys[event.code] = false;
        };

        this.onMouseDown = event => {
            if (!this.enabled) return;

            if (event.button === 0) {
                this.requestMouse();
            }

            if (event.button === 2) {
                this.useSelectedItem();
            }
        };

        this.onMouseMove = event => {
            if (!this.pointerLocked) return;

            const sensitivity = 0.002;

            this.yaw -=
                event.movementX * sensitivity;

            this.pitch -=
                event.movementY * sensitivity;

            this.pitch = THREE.MathUtils.clamp(
                this.pitch,
                -Math.PI / 2 + 0.05,
                Math.PI / 2 - 0.05
            );
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
            () => {
                this.pointerLocked =
                    document.pointerLockElement ===
                    document.body;
            }
        );
    }

    // =========================================================
    // ENABLE
    // =========================================================

    enable() {
        this.enabled = true;

        this.camera.position.set(
            this.position.x,
            this.position.y + 0.55,
            this.position.z
        );

        this.camera.rotation.set(
            0,
            0,
            0
        );
    }

    // =========================================================
    // MOVEMENT
    // =========================================================

    update(delta) {
        if (!this.enabled) return;

        this.updateMovement(delta);
        this.updateCamera();
    }

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

        forward.applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            this.yaw
        );

        right.applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
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

        this.tryMove(
            movement.x,
            0,
            movement.z
        );

        this.velocity.y -=
            this.gravity * delta;

        const vertical =
            this.velocity.y * delta;

        const nextY =
            this.position.y + vertical;

        if (nextY <= 1.1) {
            this.position.y = 1.1;
            this.velocity.y = 0;
            this.grounded = true;
        } else {
            this.position.y = nextY;
            this.grounded = false;
        }
    }

   tryMove(dx, dy, dz) {
    const nextX = this.position.clone();
    nextX.x += dx;

    if (this.canOccupy(nextX)) {
        this.position.x = nextX.x;
    }

    const nextZ = this.position.clone();
    nextZ.z += dz;

    if (this.canOccupy(nextZ)) {
        this.position.z = nextZ.z;
    }
}

    canOccupy(position) {
    const colliders = this.world.getColliders();

    if (!colliders || colliders.length === 0) {
        return true;
    }

    const playerBox = new THREE.Box3(
        new THREE.Vector3(
            position.x - this.radius,
            position.y,
            position.z - this.radius
        ),
        new THREE.Vector3(
            position.x + this.radius,
            position.y + this.height,
            position.z + this.radius
        )
    );

    for (const collider of colliders) {
        if (!collider || !collider.visible) {
            continue;
        }

        const colliderBox =
            new THREE.Box3().setFromObject(collider);

        if (
            colliderBox.max.y <= playerBox.min.y ||
            colliderBox.min.y >= playerBox.max.y
        ) {
            continue;
        }

        if (playerBox.intersectsBox(colliderBox)) {
            return false;
        }
    }

    return true;
}

    jump() {
        if (!this.grounded) return;

        this.velocity.y =
            this.jumpForce;

        this.grounded = false;
    }

    // =========================================================
    // CAMERA
    // =========================================================

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

    // =========================================================
    // INVENTORY
    // =========================================================

    selectSlot(index) {
        if (!this.inventory[index]) return;

        this.selectedSlot = index;

        document
            .querySelectorAll("#hotbar .slot")
            .forEach(slot => {
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

    // =========================================================
    // ITEMS
    // =========================================================

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

    useFist() {
        const target =
            this.getTargetPlayer();

        if (!target) {
            this.onMessage("NO MATCH TARGET");
            return;
        }

        if (this.role === "SPARK") {
            target.userData.marked = true;
            this.onMessage("MATCH MARKED");
            return;
        }

        if (this.role === "SNUFFER") {
            target.userData.protected = true;
            this.onMessage("MATCH PROTECTED");
            return;
        }

        this.onMessage("OPEN FIST");
    }

    // =========================================================
    // SIGNS
    // =========================================================

    placeSign() {
        const item =
            this.inventory[1];

        if (item.amount <= 0) {
            this.onMessage("NO SIGNS LEFT");
            return;
        }

        const placement =
            this.getSignPlacement();

        if (!placement) {
            this.onMessage("NO VALID SIGN LOCATION");
            return;
        }

        const sign =
            this.world.placeSign(
                placement.position,
                placement.rotation
            );

        if (!sign) {
            this.onMessage("SIGN CANNOT BE PLACED HERE");
            return;
        }

        item.amount--;

        this.updateHotbarCount(
            1,
            item.amount
        );

        this.onMessage("SIGN PLACED");
    }

    getSignPlacement() {
        this.raycaster.setFromCamera(
            this.center,
            this.camera
        );

        const objects = [
            ...this.world.getColliders()
        ];

        const hits =
            this.raycaster.intersectObjects(
                objects,
                false
            );

        if (hits.length === 0) {
            return null;
        }

        const hit = hits[0];

        if (
            hit.distance > 5
        ) {
            return null;
        }

        const position =
            hit.point.clone();

        position.y = 1;

        const normal =
            hit.face?.normal
                ?.clone()
                ?.transformDirection(
                    hit.object.matrixWorld
                );

        let rotation = this.yaw;

        if (normal) {
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

    // =========================================================
    // DART / GUN
    // =========================================================

    loadGun() {
        const dart =
            this.inventory[2];

        const gun =
            this.inventory[3];

        if (dart.amount <= 0) {
            this.onMessage("NO DART");
            return;
        }

        if (gun.loaded) {
            this.onMessage("GUN ALREADY LOADED");
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
            gunSlot.classList.add("loaded");
        }

        this.onMessage("DART LOADED");
    }

    fireGun() {
        const gun =
            this.inventory[3];

        if (!gun.loaded) {
            this.onMessage("LOAD THE GUN FIRST");
            return;
        }

        const target =
            this.getTargetPlayer();

        if (!target) {
            this.onMessage("NO MATCH TARGET");
            return;
        }

        gun.loaded = false;

        const gunSlot =
            document.querySelector(
                '.slot[data-slot="3"]'
            );

        if (gunSlot) {
            gunSlot.classList.remove("loaded");
        }

        const uid =
            target.userData?.uid ||
            "UNKNOWN";

        this.onMessage(
            `IDENTITY: ${uid}`
        );
    }

    // =========================================================
    // AXE
    // =========================================================

    useAxe() {
        const target =
            this.getTargetSign();

        if (!target) {
            this.onMessage("NO SIGN TARGET");
            return;
        }

        this.world.destroySign(
            target
        );

        this.onMessage("SIGN DESTROYED");
    }

    // =========================================================
    // SPARK SWITCH
    // =========================================================

    sparkSwitch() {
        if (this.role !== "SPARK") {
            return;
        }

        const target =
            this.getTargetPlayer();

        if (!target) {
            this.onMessage("NO MATCH TARGET");
            return;
        }

        if (
            this.world.switchWithPlayer(
                target
            )
        ) {
            this.onMessage("LOCATION SWITCHED");
        }
    }

    // =========================================================
    // RAYCASTING
    // =========================================================

    getTargetPlayer() {
        this.raycaster.setFromCamera(
            this.center,
            this.camera
        );

        const objects =
            this.world
                .getPlayers()
                .filter(
                    player => player !== this
                );

        const hits =
            this.raycaster.intersectObjects(
                objects,
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
            object = object.parent;
        }

        return object || null;
    }

    // =========================================================
    // MOUSE
    // =========================================================

   requestMouse() {
    if (
        document.pointerLockElement ||
        this.pointerLockCooldown
    ) {
        return;
    }

    this.pointerLockCooldown = true;

    const lock = document.body.requestPointerLock();

    if (lock && typeof lock.catch === "function") {
        lock.catch(() => {});
    }

    setTimeout(() => {
        this.pointerLockCooldown = false;
    }, 150);
}

releaseMouse() {
    if (document.pointerLockElement) {
        document.exitPointerLock();
    }
}

toggleMouse() {
    if (document.pointerLockElement) {
        this.releaseMouse();
    } else {
        this.requestMouse();
    }
}
    // =========================================================
    // UI
    // =========================================================

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

    // =========================================================
    // CLEANUP
    // =========================================================

    destroy() {
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

        this.world.removePlayer(
            this
        );

        this.releaseMouse();
    }
}
