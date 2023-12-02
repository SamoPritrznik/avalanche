import { quat, vec3, mat4 } from '../../../lib/gl-matrix-module.js';

import { Transform } from '../core/Transform.js';

export class ThirdPersonController {

    constructor(node_camera, node_character, domElement, {
        pitch = 0,
        yaw = 0,
        distance = 5,
        target = [0, 0, 0],
        velocity = [0, 0, 0],
        acceleration = 5,
        forwardAcceleration = 1,
        gravity = 0.5,
        maxSpeed = 40,
        decay = 0.3,
        pointerSensitivity = 0.002,
    } = {}) {
        this.node_camera = node_camera;
        this.node_character = node_character;
        this.domElement = domElement;

        this.keys = {};

        this.pitch = pitch;
        this.yaw = yaw;
        this.distance = distance;
        this.target = target;

        this.velocity = velocity;
        this.acceleration = acceleration;
        this.forwardAcceleration = forwardAcceleration;
        this.maxSpeed = maxSpeed;
        this.decay = decay;
        this.pointerSensitivity = pointerSensitivity;

        this.initHandlers();
    }

    initHandlers() {
        // handle keydown for camera and character
        this.pointermoveHandler = this.pointermoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);


        const element = this.domElement;
        const doc = element.ownerDocument;

        doc.addEventListener('keydown', this.keydownHandler);
        doc.addEventListener('keyup', this.keyupHandler);

        element.addEventListener('click', e => element.requestPointerLock());
        doc.addEventListener('pointerlockchange', e => {
            if (doc.pointerLockElement === element) {
                doc.addEventListener('pointermove', this.pointermoveHandler);
            } else {
                doc.removeEventListener('pointermove', this.pointermoveHandler);
            }
        });
        
    }

    update(t, dt) {
        // Calculate forward and right vectors.
        const cos = Math.cos(this.yaw);
        const sin = Math.sin(this.yaw);
        const forward = [-sin, 0, -cos];
        const right = [cos, 0, -sin];
    
        // Map user input to the acceleration vector.
        const acc = vec3.create();
        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }

        // Apply gravity if object is in the air.
        if (this.node_character.getComponentOfType(Transform).translation[1] > 0.5) {
            vec3.add(acc, acc, [0, -0.5, 0]);
        }

        // set jump based on spacebar and if the character is on the ground
        if (this.keys['Space']) {
            vec3.add(acc, acc, [0, 1, 0]);
        }

        

        // Normalize acceleration vector.
        vec3.normalize(acc, acc);

        // Always move forward, with acceleration based on time.
        vec3.add(acc, acc, forward, dt * this.forwardAcceleration);
        
        // increment acceleration based on time
        this.forwardAcceleration += dt * this.forwardAcceleration;

        // Update velocity based on acceleration.
        vec3.scaleAndAdd(this.velocity, this.velocity, acc, dt * this.acceleration);

        // If there is no user input, apply decay.
        if (
            !this.keys['KeyD'] && !this.keys['KeyA'] && !this.keys['Space'])
        {
            const decay = Math.exp(dt * Math.log(1 - this.decay));
            vec3.scale(this.velocity, this.velocity, decay);
        }

        // Limit speed to prevent accelerating to infinity and beyond.
        const speed = vec3.length(this.velocity);
        if (speed > this.maxSpeed) {
            vec3.scale(this.velocity, this.velocity, this.maxSpeed / speed);
        }

        // Update position based on velocity. bind the camera to the character
        const transform = this.node_character.getComponentOfType(Transform);
        if (transform) {
            vec3.scaleAndAdd(transform.translation, transform.translation, this.velocity, dt);
            this.node_camera.getComponentOfType(Transform).translation = [transform.translation[0], transform.translation[1] + 2, transform.translation[2] + 3];
        }
        
    }

    pointermoveHandler(e) {
    }

    keydownHandler(event) {
        this.keys[event.code] = true;
    }

    keyupHandler(event) {
        this.keys[event.code] = false;
    }
}