import * as THREE from "three";

export class Player {
    constructor(scene, camera, world, options = {}) {
        this.scene = scene;
        this.camera = camera;
        this.world = world;

        this.onMessage = options.onMessage || (() => {});

        // -----------------------------
        // Player settings
        // -----------------------------

        this.height = 1.8;
        this.radius = 0.35;

        this.walkSpeed = 4.5;
        this.sprintSpeed = 7.5;
        this.jumpStrength = 7.5;

        this.gravity = 20;

        // -----------------------------
        // Position / movement
        // -----------------------------

        this.position = new THREE.Vector3(0, 2, 6);
        this.velocity = new THREE.Vector3();

        this.onGround = false;
        this.enabled = false;

        // -----------------------------
        // Camera
        // -----------------------------

        this.pitch = 0;
        this.yaw = 0;

        this.mouseSensitivity = 0.0022;

        // -----------------------------
        // Input
        // -----------------------------

        this.keys = new Set();

        this.isSprinting = false;

        this.selectedSlot = 0;

        this.slots = [
            "fist",
            "block",
            "sign",
            "arrow",
            null,
            null,
            null,
            null,
            null
        ];

        // -----------------------------
        // Interaction
        // -----------------------------

        this.interactionDistance = 4;

        this.raycaster = new THREE.Raycaster();

        // -----------------------------
        // Player body
        // -----------------------------

        this.body = this.createBody();

        this.scene.add(this.body);

        this.body.position.copy(this.position);

        // First-person camera
        this.camera.position.set(
            0,
            this.height - 0.15,
            0
        );

        this.body.add(this.camera);

        // -----------------------------
        // Events
        // -----------------------------

        this.boundKeyDown = this.handleKeyDown.bind(this);
        this.boundKeyUp = this.handleKeyUp.bind(this);
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundMouseDown = this.handleMouseDown.bind(this);
        this.boundWheel = this.handleWheel.bind(this);
        this.boundPointerLockChange =
            this.handlePointerLockChange.bind(this);

        window.addEventListener(
            "keydown",
            this.boundKeyDown
        );

        window.addEventListener(
            "keyup",
            this.boundKeyUp
        );

        document.addEventListener(
            "mousemove",
            this.boundMouseMove
        );

        document.addEventListener(
            "mousedown",
            this.boundMouseDown
        );

        document.addEventListener(
            "wheel",
            this.boundWheel,
            { passive: true }
        );

        document.addEventListener(
            "pointerlockchange",
            this.boundPointerLockChange
        );

        this.updateHotbar();
    }

    // =========================================================
    // PLAYER BODY
    // =========================================================

    createBody() {
        const group = new THREE.Group();

        /*
         * Temporary Match body.
         *
         * Everyone will eventually use the exact same model.
         * No nameplates. No identifying colors.
         */

        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xb9b4aa,
            roughness: 0.82
        });

        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xd0cbc1,
            roughness: 0.78
        });

        const bodyGeometry = new THREE.BoxGeometry(
            0.7,
            1.05,
            0.42
        );

        const body = new THREE.Mesh(
            bodyGeometry,
            bodyMaterial
        );

        body.position.y = 0.7;

        body.castShadow = true;
        body.receiveShadow = true;

        group.add(body);

        const headGeometry = new THREE.BoxGeometry(
            0.58,
            0.58,
            0.58
        );

        const head = new THREE.Mesh(
            headGeometry,
            headMaterial
        );

        head.position.y = 1.5;

        head.castShadow = true;
        head.receiveShadow = true;

        group.add(head);

        /*
         * Simple arms.
         */

        const armGeometry = new THREE.BoxGeometry(
            0.18,
            0.85,
            0.2
        );

        const leftArm = new THREE.Mesh(
            armGeometry,
            bodyMaterial
        );

        leftArm.position.set(
            -0.47,
            0.75,
            0
        );

        leftArm.castShadow = true;

        group.add(leftArm);

        const rightArm = new THREE.Mesh(
            armGeometry,
            bodyMaterial
        );

        rightArm.position.set(
            0.47,
            0.75,
            0
        );

        rightArm.castShadow = true;

        group.add(rightArm);

        /*
         * Legs.
         */

        const legGeometry = new THREE.BoxGeometry(
            0.25,
            0.75,
            0.28
        );

        const leftLeg = new THREE.Mesh(
            legGeometry,
            bodyMaterial
        );

        leftLeg.position.set(
            -0.19,
            0.05,
            0
        );

        leftLeg.castShadow = true;

        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(
            legGeometry,
            bodyMaterial
        );

        rightLeg.position.set(
            0.19,
            0.05,
            0
        );

        rightLeg.castShadow = true;

        group.add(rightLeg);

        /*
         * We don't need to render our own body from
         * first-person view.
         */

        group.visible = false;

        return group;
    }

    // =========================================================
    // ENABLE
    // =========================================================

    enable() {
        this.enabled = true;

        this.camera.rotation.order = "YXZ";

        this.requestMouse();
    }

    disable() {
        this.enabled = false;
        this.releaseMouse();
    }

    // =========================================================
    // POINTER LOCK
    // =========================================================

    requestMouse() {
        const canvas = this.scene.renderer?.domElement;

        const target =
            canvas ||
            document.querySelector("#game canvas");

        if (!target) return;

        target.requestPointerLock();
    }

    releaseMouse() {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    handlePointerLockChange() {
        const locked =
            document.pointerLockElement !== null;

        const controls =
            document.getElementById("controls");

        if (controls) {
            controls.classList.toggle(
                "hidden",
                !locked
            );
        }
    }

    // =========================================================
    // KEYBOARD
    // =========================================================

    handleKeyDown(event) {
        if (!this.enabled) return;

        this.keys.add(event.code);

        // Number keys
        if (
            event.code.startsWith("Digit")
        ) {
            const number =
                Number(
                    event.code.replace("Digit", "")
                );

            if (
                number >= 1 &&
                number <= 9
            ) {
                this.selectSlot(number - 1);
            }
        }

        if (
            event.code === "Space" &&
            this.onGround
        ) {
            this.velocity.y =
                this.jumpStrength;

            this.onGround = false;
        }
    }

    handleKeyUp(event) {
        this.keys.delete(event.code);
    }

    // =========================================================
    // MOUSE
    // =========================================================

    handleMouseMove(event) {
        if (!this.enabled) return;

        if (
            document.pointerLockElement === null
        ) {
            return;
        }

        this.yaw -=
            event.movementX *
            this.mouseSensitivity;

        this.pitch -=
            event.movementY *
            this.mouseSensitivity;

        const limit =
            Math.PI / 2 - 0.05;

        this.pitch = THREE.MathUtils.clamp(
            this.pitch,
            -limit,
            limit
        );

        this.camera.rotation.x =
            this.pitch;

        this.body.rotation.y =
            this.yaw;
    }

    handleMouseDown(event) {
        if (!this.enabled) return;

        if (event.button === 2) {
            event.preventDefault();

            this.interact();
        }
    }

    handleWheel(event) {
        if (!this.enabled) return;

        const direction =
            Math.sign(event.deltaY);

        if (direction === 0) return;

        let next =
            this.selectedSlot + direction;

        if (next < 0) {
            next = 8;
        }

        if (next > 8) {
            next = 0;
        }

        this.selectSlot(next);
    }

    // =========================================================
    // HOTBAR
    // =========================================================

    selectSlot(index) {
        if (
            index < 0 ||
            index >= this.slots.length
        ) {
            return;
        }

        this.selectedSlot = index;

        this.updateHotbar();
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
    }

    getSelectedItem() {
        return this.slots[
            this.selectedSlot
        ];
    }

    isOpenFist() {
        return this.getSelectedItem() === "fist";
    }

    // =========================================================
    // INTERACTION
    // =========================================================

    interact() {
        if (
            document.pointerLockElement === null
        ) {
            this.requestMouse();
            return;
        }

        const item =
            this.getSelectedItem();

        /*
         * The important rule:
         *
         * Spark/Snuffer interactions only work
         * while the player has an OPEN FIST.
         */

        if (item === "fist") {
            this.rightClickOpenFist();
            return;
        }

        if (item === "sign") {
            this.useSign();
            return;
        }

        if (item === "arrow") {
            this.useArrow();
            return;
        }

        if (item === "block") {
            this.useBlock();
        }
    }

    rightClickOpenFist() {
        const target =
            this.getTargetPlayer();

        if (target) {
            this.onMessage(
                "PLAYER INTERACTION"
            );

            /*
             * Multiplayer role logic will eventually
             * live on the server.
             *
             * This client only reports the interaction.
             */
        } else {
            this.onMessage(
                "OPEN FIST"
            );
        }
    }

    useSign() {
        this.onMessage(
            "SIGN SELECTED"
        );
    }

    useArrow() {
        const target =
            this.getTargetPlayer();

        if (!target) {
            this.onMessage(
                "NO MATCH IN RANGE"
            );

            return;
        }

        this.onMessage(
            "ARROW FIRED"
        );
    }

    useBlock() {
        this.onMessage(
            "BLOCK SELECTED"
        );
    }

    // =========================================================
    // TARGETING
    // =========================================================

    getTargetPlayer() {
        this.raycaster.setFromCamera(
            new THREE.Vector2(0, 0),
            this.camera
        );

        const objects =
            this.world.getInteractableObjects();

        if (!objects.length) {
            return null;
        }

        const hits =
            this.raycaster.intersectObjects(
                objects,
                true
            );

        for (const hit of hits) {
            if (
                hit.distance <=
                this.interactionDistance
            ) {
                return hit.object;
            }
        }

        return null;
    }

    // =========================================================
    // MOVEMENT
    // =========================================================

    update(delta) {
        if (!this.enabled) return;

        this.updateMovement(delta);

        this.updateInteractionPrompt();

        this.body.position.copy(
            this.position
        );
    }

    updateMovement(delta) {
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();

        this.camera.getWorldDirection(forward);

        forward.y = 0;
        forward.normalize();

        right.crossVectors(
            forward,
            new THREE.Vector3(0, 1, 0)
        ).normalize();

        const direction =
            new THREE.Vector3();

        if (
            this.keys.has("KeyW")
        ) {
            direction.add(forward);
        }

        if (
            this.keys.has("KeyS")
        ) {
            direction.sub(forward);
        }

        if (
            this.keys.has("KeyD")
        ) {
            direction.add(right);
        }

        if (
            this.keys.has("KeyA")
        ) {
            direction.sub(right);
        }

        if (direction.lengthSq() > 0) {
            direction.normalize();
        }

        this.isSprinting =
            this.keys.has("ShiftLeft") ||
            this.keys.has("ShiftRight");

        const speed =
            this.isSprinting
                ? this.sprintSpeed
                : this.walkSpeed;

        const targetVelocity =
            direction.multiplyScalar(speed);

        const acceleration = 14;

        this.velocity.x = THREE.MathUtils.damp(
            this.velocity.x,
            targetVelocity.x,
            acceleration,
            delta
        );

        this.velocity.z = THREE.MathUtils.damp(
            this.velocity.z,
            targetVelocity.z,
            acceleration,
            delta
        );

        // Gravity
        this.velocity.y -=
            this.gravity * delta;

        this.position.x +=
            this.velocity.x * delta;

        this.position.y +=
            this.velocity.y * delta;

        this.position.z +=
            this.velocity.z * delta;

        this.handleWorldCollision();
    }

    // =========================================================
    // BASIC WORLD COLLISION
    // =========================================================

    handleWorldCollision() {
        const floorY =
            this.world.getFloorHeight(
                this.position.x,
                this.position.z
            );

        if (
            this.position.y <=
            floorY
        ) {
            this.position.y =
                floorY;

            this.velocity.y = 0;

            this.onGround = true;
        } else {
            this.onGround = false;
        }

        /*
         * Keep the player inside the prototype map.
         */

        const limit = 28;

        this.position.x =
            THREE.MathUtils.clamp(
                this.position.x,
                -limit,
                limit
            );

        this.position.z =
            THREE.MathUtils.clamp(
                this.position.z,
                -limit,
                limit
            );
    }

    // =========================================================
    // INTERACTION UI
    // =========================================================

    updateInteractionPrompt() {
        const interaction =
            document.getElementById(
                "interaction"
            );

        if (!interaction) return;

        const target =
            this.getTargetPlayer();

        const item =
            this.getSelectedItem();

        if (
            target &&
            (
                item === "fist" ||
                item === "arrow"
            )
        ) {
            interaction.classList.add(
                "visible"
            );

            const text =
                document.getElementById(
                    "interaction-text"
                );

            if (text) {
                text.textContent =
                    item === "arrow"
                        ? "RIGHT CLICK · FIRE ARROW"
                        : "RIGHT CLICK · INTERACT";
            }
        } else {
            interaction.classList.remove(
                "visible"
            );
        }
    }

    // =========================================================
    // CLEANUP
    // =========================================================

    destroy() {
        window.removeEventListener(
            "keydown",
            this.boundKeyDown
        );

        window.removeEventListener(
            "keyup",
            this.boundKeyUp
        );

        document.removeEventListener(
            "mousemove",
            this.boundMouseMove
        );

        document.removeEventListener(
            "mousedown",
            this.boundMouseDown
        );

        document.removeEventListener(
            "wheel",
            this.boundWheel
        );

        document.removeEventListener(
            "pointerlockchange",
            this.boundPointerLockChange
        );

        this.releaseMouse();

        this.scene.remove(
            this.body
        );
    }
}
