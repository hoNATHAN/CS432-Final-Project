precision mediump float;

varying vec3 vReflection;
varying vec2 vTexCoord;

uniform samplerCube uCubeMap;
uniform float uReflectivity;
uniform vec4 uMatAmbient;
uniform vec4 uMatDiffuse;
uniform vec4 uMatSpecular;

void main() {
  vec4 reflectionColor = textureCube(uCubeMap, vReflection);
  vec4 baseColor = uMatAmbient + uMatDiffuse;
  gl_FragColor = mix(baseColor, reflectionColor, uReflectivity);
}
