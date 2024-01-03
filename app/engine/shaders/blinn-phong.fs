#version 300 es
precision highp float;

// Texture coordinates from the vertex shader
in vec3 vTexCoord;

// Fragment color output
out vec4 fragColor;

// Skybox texture (cube map)
uniform samplerCube uSkybox;

void main() {
    // Sample the texture from the cube map
    fragColor = texture(uSkybox, vTexCoord);
}