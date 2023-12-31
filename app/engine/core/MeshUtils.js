import { vec3 } from '../../../lib/gl-matrix-module.js';

export function calculateAxisAlignedBoundingBox(mesh) {
    const initial = {
        min: vec3.clone(mesh.vertices[0].position),
        max: vec3.clone(mesh.vertices[0].position),
    };

    return {
        min: mesh.vertices.reduce((a, b) => vec3.min(a, a, b.position), initial.min),
        max: mesh.vertices.reduce((a, b) => vec3.max(a, a, b.position), initial.max),
    };
}

export function mergeAxisAlignedBoundingBoxes(boxes) {
    if (!boxes || boxes.length === 0) {
        throw new Error('No bounding boxes provided.');
    }

    const initial = {
        min: vec3.clone(boxes[0].min),
        max: vec3.clone(boxes[0].max),
    };

    return {
        min: boxes.reduce((accumulated, box) => {
            if (!box.min) {
                throw new Error('Bounding box missing min vector.');
            }
            return vec3.min(accumulated, accumulated, box.min);
        }, initial.min),
        max: boxes.reduce((accumulated, box) => {
            if (!box.max) {
                throw new Error('Bounding box missing max vector.');
            }
            return vec3.max(accumulated, accumulated, box.max);
        }, initial.max),
    };
}
