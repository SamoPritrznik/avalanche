#version 100

precision highp float;

varying vec2 vTexCoord;    // Receive texture coordinates from vertex shader
varying vec3 vNormal;
varying vec3 vFragPos;

uniform sampler2D uTexture; // Texture sampler

uniform vec3 uLightPosition;
uniform vec3 uViewPosition;
uniform vec3 uLightColor;
uniform float uLightIntensity;

uniform vec3 uAmbientReflectivity;
uniform vec3 uDiffuseReflectivity;
uniform vec3 uSpecularReflectivity;
uniform float uShininess;

void main() {
    // Sample the texture
    vec4 texColor = texture2D(uTexture, vTexCoord);

    // Normalize the normal vector
    vec3 norm = normalize(vNormal);

    // Calculate vectors
    vec3 lightDir = normalize(uLightPosition - vFragPos);
    vec3 viewDir = normalize(uViewPosition - vFragPos);
    vec3 halfwayDir = normalize(lightDir + viewDir);

    vec3 effectiveLightColor = uLightIntensity * uLightColor;

    // Ambient component
    vec3 ambient = uAmbientReflectivity * effectiveLightColor;

    // Diffuse component
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = uDiffuseReflectivity * diff * effectiveLightColor;

    // Blinn-Phong Specular component
    float spec = pow(max(dot(norm, halfwayDir), 0.0), uShininess);
    vec3 specular = uSpecularReflectivity * spec * effectiveLightColor;

    // Combine all components
    vec3 result = (ambient + diffuse + specular) * texColor.rgb;
    gl_FragColor = vec4(result, texColor.a); // Use texture's alpha
}