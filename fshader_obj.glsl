precision mediump float;
varying vec3 vNormal;
varying vec2 vTexCoord;
uniform sampler2D uTextureUnit;

void main() {
    vec4 textureColor = texture2D(uTextureUnit, vTexCoord);
    gl_FragColor = textureColor;
}