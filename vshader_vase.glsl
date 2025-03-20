attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTextureCoord;

uniform mat4 modelMatrix;
uniform mat4 cameraMatrix;
uniform mat4 projectionMatrix;

uniform vec4 uLightPosition;
uniform vec3 uCameraPosition;

varying vec3 vNormal;
varying vec2 vTextureCoord;
varying vec3 vLightDirection;
varying vec3 vViewDirection;

void main() {
  vec4 worldPosition = modelMatrix * vec4(aPosition, 1.0);

  mat3 normalMatrix = mat3(modelMatrix);
  vNormal = normalize(normalMatrix * aNormal);

  vec3 lightPosition = uLightPosition.xyz;
  vLightDirection = normalize(lightPosition - worldPosition.xyz);

  vViewDirection = normalize(uCameraPosition - worldPosition.xyz);

  vTextureCoord = aTextureCoord;

  gl_Position = projectionMatrix * cameraMatrix * worldPosition;
}
