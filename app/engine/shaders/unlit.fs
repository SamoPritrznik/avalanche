#version 300 es
precision highp float;

// Varyings
in vec3 vNormal;     
in vec3 vFragPos;    
in vec2 vTexCoord;   

// Uniforms
uniform sampler2D uBaseTexture;
uniform vec4 uBaseFactor;
uniform vec3 uLightPosition;  
uniform vec3 uViewPosition;   
uniform vec3 uAmbientReflectivity;  
uniform vec3 uDiffuseReflectivity;
uniform vec3 uSpecularReflectivity;
uniform float uShininess;     

// Output
out vec4 fragColor; 

void main() {
    // Ambient component
    vec3 ambient = uAmbientReflectivity * uBaseFactor.rgb;

    // Diffuse component
    vec3 norm = normalize(vNormal);
    vec3 lightDir = normalize(uLightPosition - vFragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = uDiffuseReflectivity * diff * uBaseFactor.rgb;

    // Specular component
    vec3 viewDir = normalize(uViewPosition - vFragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
    vec3 specular = uSpecularReflectivity * spec;

    // Calculate final color
    vec3 finalColor = (ambient + diffuse + specular) * texture(uBaseTexture, vTexCoord).rgb;
    fragColor = vec4(finalColor, uBaseFactor.a);
}
