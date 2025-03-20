attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uModelMatrix;
uniform mat4 uCameraMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;

varying vec3 vReflection;
varying vec2 vTexCoord;

void main() {
  vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);
  vec3 worldNormal = normalize(mat3(uModelMatrix) * aNormal);

  vec3 viewVector = normalize(uCameraPosition - worldPosition.xyz);

  vReflection = reflect(-viewVector, worldNormal);

  vTexCoord = aTexCoord;

  gl_Position = uProjectionMatrix * uCameraMatrix * worldPosition;
}
