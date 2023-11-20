import { mat4 } from "../../lib/gl-matrix-min.js";

class Draw {
    drawCube() {
        // Get the canvas element
        const canvas = document.getElementById("myCanvas");

        // get the context for 3d drawing
        const gl = canvas.getContext("webgl2");

        // create a view matrix
        const viewMatrix = mat4.create();

        // create a projection matrix
        const projectionMatrix = mat4.create();

        // set the view matrix to look at the center of the cube
        mat4.lookAt(viewMatrix, [0, 0, 5], [0, 0, 0], [0, 1, 0]);

        // set the projection matrix to perspective
        mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100);

        // create a simple vertex shader 
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, `
            attribute vec3 position;
            uniform mat4 modelMatrix;
            uniform mat4 viewMatrix;
            uniform mat4 projectionMatrix;
            void main() {
                gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1);
                gl_PointSize = 1.0; // Set the point size to 1 pixel
            }
        `);
        gl.compileShader(vertexShader);

        // create a simple fragment shader
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, `
            precision highp float;
            uniform vec4 color;
            void main() {
                gl_FragColor = color;
            }
        `);
        gl.compileShader(fragmentShader);
        // link the two shaders into a program
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        // look up where the vertex data needs to go.
        const positionLocation = gl.getAttribLocation(program, "position");

        // look up uniform locations
        const colorLocation = gl.getUniformLocation(program, "color");
        const modelMatrixLocation = gl.getUniformLocation(program, "modelMatrix");
        const viewMatrixLocation = gl.getUniformLocation(program, "viewMatrix");
        const projectionMatrixLocation = gl.getUniformLocation(program, "projectionMatrix");

        // Create a buffer and put the cube vertex data in it
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                // Front face
                -1, -1, 1,
                1, -1, 1,
                -1, 1, 1,
                -1, 1, 1,
                1, -1, 1,
                1, 1, 1,
                // Back face
                -1, -1, -1,
                -1, 1, -1,
                1, -1, -1,
                1, -1, -1,
                -1, 1, -1,
                1, 1, -1,
                // Left face
                -1, -1, -1,
                -1, -1, 1,
                -1, 1, -1,
                -1, 1, -1,
                -1, -1, 1,
                -1, 1, 1,
                // Right face
                1, -1, -1,
                1, 1, -1,
                1, -1, 1,
                1, -1, 1,
                1, 1, -1,
                1, 1, 1,
                // Top face
                -1, 1, -1,
                -1, 1, 1,
                1, 1, -1,
                1, 1, -1,
                -1, 1, 1,
                1, 1, 1,
                // Bottom face
                -1, -1, -1,
                1, -1, -1,
                -1, -1, 1,
                -1, -1, 1,
                1, -1, -1,
                1, -1, 1
            ]),
            gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        // draw
        gl.useProgram(program);

        // Set a random color.
        gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);

        // Set the model, view, and projection matrices
        const modelMatrix = mat4.create();
        mat4.identity(modelMatrix);
        gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
        gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
        gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

        gl.drawArrays(gl.TRIANGLES, 0, 36);

    // Define the rotation angle
    let angle = 0;

    // Define the animation function
    function animate() {
        // Update the rotation angle
        angle += 0.01;

        // Clear the canvas
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Set the model matrix with the rotation angle
        mat4.identity(modelMatrix);
        mat4.rotateY(modelMatrix, modelMatrix, angle);
        gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);

        // Draw the cube
        gl.drawArrays(gl.TRIANGLES, 0, 36);

        // Request the next frame
        requestAnimationFrame(animate);
    }

    // Start the animation
    animate();

    }
}

const d = new Draw();
d.drawCube();