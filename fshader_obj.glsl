precision mediump float;
            varying vec4 vColor;
            varying vec3 vNormal; // Optional
            varying vec2 vTexCoord; // Optional
            void main() {
                gl_FragColor = vColor;
            }