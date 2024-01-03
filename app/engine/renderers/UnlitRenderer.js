import { mat4 } from '../../../lib/gl-matrix-module.js';

import * as WebGL from '../WebGL.js';

import { BaseRenderer } from './BaseRenderer.js';

import {
    getLocalModelMatrix,
    getGlobalViewMatrix,
    getProjectionMatrix,
    getModels,
} from '../core/SceneUtils.js';

export class UnlitRenderer extends BaseRenderer {

    constructor(canvas) {
        super(canvas);
        this.light = null;
        this.camera = null;
    }

    async initialize() {
        const gl = this.gl;

        const unlitVertexShader = await fetch(new URL('../shaders/unlit.vs', import.meta.url))
            .then(response => response.text());

        const unlitFragmentShader = await fetch(new URL('../shaders/unlit.fs', import.meta.url))
            .then(response => response.text());

        this.programs = WebGL.buildPrograms(gl, {
            unlit: {
                vertex: unlitVertexShader,
                fragment: unlitFragmentShader,
            },
        });

        gl.clearColor(0.8, 1, 1, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
    }

    render(scene, camera, light) {
        const gl = this.gl;

        // Set viewport and clear buffers
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Use shader program
        const { program, uniforms } = this.programs.unlit;
        gl.useProgram(program);

        // Set view and projection matrices
        const viewMatrix = getGlobalViewMatrix(camera);
        const projectionMatrix = getProjectionMatrix(camera);
        gl.uniformMatrix4fv(uniforms.uViewMatrix, false, viewMatrix);
        gl.uniformMatrix4fv(uniforms.uProjectionMatrix, false, projectionMatrix);

        this.light = light;
        this.camera = camera;

        // Set light and view position uniforms
        const lightPos = light[0].components[0].translation;
        const lightColor = [0.4, 0.4, 0.4];
        gl.uniform3fv(uniforms.uLightPosition, lightPos);
        gl.uniform3fv(uniforms.uLightColor, lightColor);
        gl.uniform3fv(uniforms.uViewPosition, camera.components[0].translation);
        gl.uniform1f(uniforms.uLightIntensity, 2.0);

        // Render the scene
        this.renderNode(scene);
    }

    renderNode(node, modelMatrix = mat4.create()) {
        const gl = this.gl;

        const { program, uniforms } = this.programs.unlit;

        const localMatrix = getLocalModelMatrix(node);
        modelMatrix = mat4.mul(mat4.create(), modelMatrix, localMatrix);
        gl.uniformMatrix4fv(uniforms.uModelMatrix, false, modelMatrix);

        const models = getModels(node);
        
        for (const model of models) {
            for (const primitive of model.primitives) {
                this.renderPrimitive(primitive);
            }
        }

        //debugger;

        for (const child of node.children) {
            if(child.isGenerate) continue;
            if(child.isSeethrough) continue;
            this.renderNode(child, modelMatrix);
        }
    }

    renderPrimitive(primitive) {
        const gl = this.gl;
        const { program, uniforms } = this.programs.unlit;

        // Prepare the mesh for rendering
        const vao = this.prepareMesh(primitive.mesh);
        gl.bindVertexArray(vao);

        // Set material properties
        const material = primitive.material;
        gl.uniform4fv(uniforms.uBaseFactor, material.baseFactor);

        // Phong lighting uniforms
        const lightPosition = this.light[0].components[0].translation; // Assuming light has a Transform component
        const viewPosition = this.camera.components[0].translation; // Assuming camera has a Transform component

        const specularReflectivity = [0.2, 0.2, 0.2]; // Example value, adjust as needed
        const shininess = 10; // Example value, adjust as needed
        const diffuseReflectivity = [0.1, 0.1, 0.1]; // Extract RGB, ignore alpha
        const ambientReflectivity = [0.7, 0.7, 0.7];

        gl.uniform3fv(uniforms.uLightPosition, lightPosition);
        gl.uniform3fv(uniforms.uViewPosition, viewPosition);

        gl.uniform3fv(uniforms.uAmbientReflectivity, ambientReflectivity);
        gl.uniform3fv(uniforms.uDiffuseReflectivity, diffuseReflectivity);
        gl.uniform3fv(uniforms.uSpecularReflectivity, specularReflectivity);
        gl.uniform1f(uniforms.uShininess, shininess);

        // Bind texture if available
        if (material.baseTexture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.uniform1i(uniforms.uBaseTexture, 0);
            const glTexture = this.prepareImage(material.baseTexture.image);
            const glSampler = this.prepareSampler(material.baseTexture.sampler);
            gl.bindTexture(gl.TEXTURE_2D, glTexture);
            gl.bindSampler(0, glSampler);
        }

        // Draw the primitive
        gl.drawElements(gl.TRIANGLES, primitive.mesh.indices.length, gl.UNSIGNED_INT, 0);
        gl.bindVertexArray(null);
    }
}