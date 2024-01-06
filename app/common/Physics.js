import { vec3, mat4 } from '../../lib/gl-matrix-module.js';
import { getGlobalModelMatrix } from '../engine/core/SceneUtils.js';
import { Transform } from '../engine/core.js';

export class Physics {

    constructor(scene) {
        this.scene = scene;
        this.numberOfCoins = 0;
        this.end = false;
    }

    update(t, dt) {
        this.scene.traverse(node => {
            if (node.isDynamic) {
                this.scene.traverse(other => {
                    if (node !== other && (other.isStatic || other.isColectable || other.isGenerate || other.isObstacle)) {
                        this.resolveCollision(node, other);
                    }
                });
            }
        });
    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    getEnd() {
        return this.end;
    }

    getTransformedAABB(node) {
        // Retrieve the Transform component which contains translation, rotation, and scale
        const transform = node.getComponentOfType(Transform);
    
        // Scale the min and max points of the AABB
        const scaledMin = vec3.multiply(vec3.create(), node.aabb.min, transform.scale);
        const scaledMax = vec3.multiply(vec3.create(), node.aabb.max, transform.scale);
    
        // Get the global model matrix (including translation, rotation, and scale)
        const matrix = getGlobalModelMatrix(node);
    
        // List of vertices for the scaled AABB
        const vertices = [
            [scaledMin[0], scaledMin[1], scaledMin[2]],
            [scaledMin[0], scaledMin[1], scaledMax[2]],
            [scaledMin[0], scaledMax[1], scaledMin[2]],
            [scaledMin[0], scaledMax[1], scaledMax[2]],
            [scaledMax[0], scaledMin[1], scaledMin[2]],
            [scaledMax[0], scaledMin[1], scaledMax[2]],
            [scaledMax[0], scaledMax[1], scaledMin[2]],
            [scaledMax[0], scaledMax[1], scaledMax[2]],
        ].map(v => vec3.transformMat4(v, v, matrix));
    
        // Find new min and max by component
        const xs = vertices.map(v => v[0]);
        const ys = vertices.map(v => v[1]);
        const zs = vertices.map(v => v[2]);
        const newMin = [Math.min(...xs), Math.min(...ys), Math.min(...zs)];
        const newMax = [Math.max(...xs), Math.max(...ys), Math.max(...zs)];
    
        return { min: newMin, max: newMax };
    }

    resolveCollision(a, b) {
        const aBox = this.getTransformedAABB(a);
        const bBox = this.getTransformedAABB(b);

        const isColliding = this.aabbIntersection(aBox, bBox);
        if (!isColliding) {
            return;
        }

        if(a.isProtected) {
            for(let i = 0; i < this.scene.children.length; i++){
                if(this.scene.children[i] === b){
                    this.scene.children.splice(i, 1);
                }
            }
            
            a.isProtected = false;
        }

        if(b.isObstacle) {
            this.end = true;
        }

        if(b.isColectable){
            this.numberOfCoins++;
        
            for(let i = 0; i < document.getElementsByClassName('numberOfCoins').length; i++){
                document.getElementsByClassName('numberOfCoins')[i].innerHTML = this.numberOfCoins;
            }

            for(let i = 0; i < this.scene.children.length; i++){
                if(this.scene.children[i] === b){
                    this.scene.children.splice(i, 1);
                }
            }
        }

        if(b.isGenerate) {
            console.log('Generating!');
            

            for(let i = 0; i < this.scene.children.length; i++){
                if(this.scene.children[i] === b){
                    this.scene.children.splice(i, 1);
                }
            }

            this.scene.newScene = true;
        }

        // Move node A minimally to avoid collision.
        const diffa = vec3.sub(vec3.create(), bBox.max, aBox.min);
        const diffb = vec3.sub(vec3.create(), aBox.max, bBox.min);

        let minDiff = Infinity;
        let minDirection = [0, 0, 0];
        if (diffa[0] >= 0 && diffa[0] < minDiff) {
            minDiff = diffa[0];
            minDirection = [minDiff, 0, 0];
        }
        if (diffa[1] >= 0 && diffa[1] < minDiff) {
            minDiff = diffa[1];
            minDirection = [0, minDiff, 0];
        }
        if (diffa[2] >= 0 && diffa[2] < minDiff) {
            minDiff = diffa[2];
            minDirection = [0, 0, minDiff];
        }
        if (diffb[0] >= 0 && diffb[0] < minDiff) {
            minDiff = diffb[0];
            minDirection = [-minDiff, 0, 0];
        }
        if (diffb[1] >= 0 && diffb[1] < minDiff) {
            minDiff = diffb[1];
            minDirection = [0, -minDiff, 0];
        }
        if (diffb[2] >= 0 && diffb[2] < minDiff) {
            minDiff = diffb[2];
            minDirection = [0, 0, -minDiff];
        }

        const transform = a.getComponentOfType(Transform);
        if (!transform) {
            return;
        }

        vec3.add(transform.translation, transform.translation, minDirection);
    }

}
