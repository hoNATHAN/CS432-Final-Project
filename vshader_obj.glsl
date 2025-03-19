attribute vec4 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;
uniform mat4 modelMatrix;
uniform mat4 cameraMatrix;
uniform mat4 projectionMatrix;
varying vec3 vNormal;
varying vec2 vTexCoord;

void main() {
    gl_Position = projectionMatrix * cameraMatrix * modelMatrix * aPosition;
    vNormal = aNormal;
    vTexCoord = aTexCoord;
}