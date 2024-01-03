#version 300 es

// Vertex position (from vertex buffer)
in vec3 aPosition;

// Texture coordinates (from vertex buffer)
out vec3 vTexCoord;

// Projection and view matrices
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

void main() {
    // Pass the texture coordinates to the fragment shader
    vTexCoord = aPosition;

    // Apply view and projection matrices 
    // Remove translation from the view matrix to keep the skybox stationary
    mat4 viewMatrixNoTranslation = uViewMatrix;
    viewMatrixNoTranslation[3][0] = 0.0;
    viewMatrixNoTranslation[3][1] = 0.0;
    viewMatrixNoTranslation[3][2] = 0.0;
    
    gl_Position = uProjectionMatrix * viewMatrixNoTranslation * vec4(aPosition, 1.0);
}