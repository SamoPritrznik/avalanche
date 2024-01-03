#version 300 es

// Attributes
in vec3 aPosition; 
in vec3 aNormal;   
in vec2 aTexCoord; 

// Uniforms
uniform mat4 uModelMatrix;      
uniform mat4 uViewMatrix;       
uniform mat4 uProjectionMatrix; 

// Varyings
out vec3 vNormal;       
out vec3 vFragPos;      
out vec2 vTexCoord;     

void main() {
    // Transform vertex position into world space
    vFragPos = vec3(uModelMatrix * vec4(aPosition, 1.0));

    // Extract the upper-left 3x3 part of the model matrix
    mat3 normalMatrix = mat3(uModelMatrix);

    // If your model matrix includes non-uniform scaling, compute the inverse transpose
    // normalMatrix = transpose(inverse(normalMatrix));

    // Transform normals into world space
    vNormal = normalMatrix * aNormal;

    // Pass the texture coordinate
    vTexCoord = aTexCoord;

    // Calculate the final position of the vertex
    gl_Position = uProjectionMatrix * uViewMatrix * vec4(vFragPos, 1.0);
}