attribute vec4 aPosition;
attribute vec4 aColor;
attribute vec3 aNormal; // Optional
attribute vec2 aTexCoord; // Optional
uniform mat4 modelMatrix;
uniform mat4 cameraMatrix;
uniform mat4 projectionMatrix;
varying vec4 vColor;
varying vec3 vNormal; // Optional
varying vec2 vTexCoord; // Optional

void main() {
    gl_Position = projectionMatrix * cameraMatrix * modelMatrix * aPosition;
    vColor = aColor;
    vNormal = aNormal; // Optional
    vTexCoord = aTexCoord; // Optional
}