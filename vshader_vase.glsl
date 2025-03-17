attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTextureCoord;

uniform mat4 modelMatrix;
uniform mat4 cameraMatrix;
uniform mat4 projectionMatrix;

uniform vec4 uLightPosition;
// Add camera position as a uniform since we can't compute it in the shader
uniform vec3 uCameraPosition;

varying vec3 vNormal;
varying vec2 vTextureCoord;
varying vec3 vLightDirection;
varying vec3 vViewDirection;

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
  // Instead of trying to compute camera position from the matrix,
  // we use the camera position passed as a uniform
  vViewDirection = normalize(uCameraPosition - worldPosition.xyz);
  
  // Pass texture coordinates to fragment shader
  vTextureCoord = aTextureCoord;
  
  // Transform vertex to clip space
  gl_Position = projectionMatrix * cameraMatrix * worldPosition;
}