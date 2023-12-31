#version 100

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;  // Texture coordinate attribute

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTexCoord;    // Pass texture coordinates to fragment shader
varying vec3 vNormal;
varying vec3 vFragPos;

void main() {
    vTexCoord = aTexCoord;  // Pass the texture coordinate to the fragment shader

    // Standard transformation code
    vec4 fragPos = uModelMatrix * vec4(aPosition, 1.0);
    vFragPos = vec3(fragPos);
    vNormal = mat3(uModelMatrix) * aNormal;

    gl_Position = uProjectionMatrix * uViewMatrix * fragPos;
}