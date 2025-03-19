attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTextureCoord;

uniform mat4 modelMatrix;
uniform mat4 cameraMatrix;
uniform mat4 projectionMatrix;

uniform vec4 uLightPosition;
uniform vec3 uCameraPosition;
uniform vec3 uSpotDirection; // The direction the spotlight is pointing

varying vec3 vNormal;
varying vec2 vTextureCoord;
varying vec3 vLightDirection;
varying vec3 vViewDirection;
varying float vSpotEffect; // New varying for spotlight effect

void main() {
  // Transform vertex position to world coordinates
  vec4 worldPosition = modelMatrix * vec4(aPosition, 1.0);
  
  // Transform normal to world space (excluding translations)
  mat3 normalMatrix = mat3(modelMatrix);
  vNormal = normalize(normalMatrix * aNormal);
  
  // Calculate light direction in world space
  vec3 lightPosition = uLightPosition.xyz;
  vLightDirection = normalize(lightPosition - worldPosition.xyz);
  
  // Calculate view direction (from vertex to camera)
  vViewDirection = normalize(uCameraPosition - worldPosition.xyz);
  
  // Pass texture coordinates to fragment shader
  vTextureCoord = aTextureCoord;
  
  // Transform vertex to clip space
  gl_Position = projectionMatrix * cameraMatrix * worldPosition;
}