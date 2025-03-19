class OBJModel {
    constructor(fname) {
        this.vertices = [];
        this.normals = [];
        this.textureCoords = [];
        this.indices = [];

        this.rotationAngle = 0.0;

        // Load the .obj file
        const f = loadFileAJAX(fname);
        const lines = f.split('\n');

        for (let line = 0; line < lines.length; line++) {
            const strings = lines[line].trimRight().split(/\s+/);
            if (strings.length === 0) continue;

            switch (strings[0]) {
                case 'v': // Vertex
                    this.vertices.push(vec3(
                        parseFloat(strings[1]) * 0.025,
                        parseFloat(strings[2]) * 0.025,
                        parseFloat(strings[3]) * 0.025
                    ));
                    // this.colors.push(vec4(Math.random(), Math.random(), Math.random(), 1.0)); // Random color
                    break;

                case 'vt': // Texture Coordinate
                    this.textureCoords.push(vec2(
                        parseFloat(strings[1]),
                        parseFloat(strings[2])
                    ));
                    break;

                case 'vn': // Normal
                    this.normals.push(vec3(
                        parseFloat(strings[1]),
                        parseFloat(strings[2]),
                        parseFloat(strings[3])
                    ));
                    break;

                case 'f': // Face
                    for (let i = 1; i < strings.length; i++) {
                        const indices = strings[i].split('/');
                        const vertexIndex = parseInt(indices[0]) - 1; // OBJ indices start at 1
                        const texCoordIndex = parseInt(indices[1]) - 1; // Texture coordinate index
                        this.indices.push({ vertexIndex, texCoordIndex });
                    }
                    break;
            }
        }

        // Ensure normals array matches vertices array
        if (this.normals.length < this.vertices.length) {
            console.warn("Normals array is smaller than vertices array. Padding with default normals.");
            while (this.normals.length < this.vertices.length) {
                this.normals.push(vec3(0, 0, 0)); // Default normal
            }
        }

        this.numIndices = this.indices.length;
        this.initBuffers();
        this.initShaders();

        this.modelMatrix = mat4(); // Identity matrix
    }

    initBuffers() {
        const gl = window.gl;

        // Vertex buffer
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices.flat()), gl.STATIC_DRAW);

        // Color buffer
        // this.colorBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors.flat()), gl.STATIC_DRAW);

        // Index buffer
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices.map(i => i.vertexIndex)), gl.STATIC_DRAW);

        // Normal buffer
        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals.flat()), gl.STATIC_DRAW);

        // Texture coordinate buffer
        if (this.textureCoords.length > 0) {
            this.textureCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textureCoords.flat()), gl.STATIC_DRAW);
        }
    }

    initShaders() {
        const gl = window.gl;

        // Initialize shaders
        this.shaderProgram = initShaders(gl, "vshader_obj.glsl", "fshader_obj.glsl");
        gl.useProgram(this.shaderProgram);

        // Get attribute and uniform locations
        this.aPosition = gl.getAttribLocation(this.shaderProgram, "aPosition");
        // this.aColor = gl.getAttribLocation(this.shaderProgram, "aColor");
        this.aNormal = gl.getAttribLocation(this.shaderProgram, "aNormal");
        this.aTexCoord = gl.getAttribLocation(this.shaderProgram, "aTexCoord");

        this.uModelMatrix = gl.getUniformLocation(this.shaderProgram, "modelMatrix");
        this.uCameraMatrix = gl.getUniformLocation(this.shaderProgram, "cameraMatrix");
        this.uProjectionMatrix = gl.getUniformLocation(this.shaderProgram, "projectionMatrix");
        this.uTextureUnit = gl.getUniformLocation(this.shaderProgram, "uTextureUnit");
    }

    initializeTexture(imageSrc) {
        var image = new Image();
        image.onload = () => {
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.generateMipmap(gl.TEXTURE_2D);
        };
        image.src = imageSrc;
    }

    draw(camera) {
        const gl = window.gl;
        gl.useProgram(this.shaderProgram);
    
        // Update the model matrix with rotation
        let rotationMatrix = rotateY(this.rotationAngle); // Rotate around the y-axis
        this.modelMatrix = mult(rotationMatrix, this.modelMatrix);
    
        // Bind vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.aPosition);
    
        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(this.aNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.aNormal);
    
        // Bind texture coordinate buffer
        if (this.textureCoordBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
            gl.vertexAttribPointer(this.aTexCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aTexCoord);
        }
    
        // Bind texture
        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(this.uTextureUnit, 0);
        }
    
        // Bind index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    
        // Set uniform matrices
        gl.uniformMatrix4fv(this.uModelMatrix, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(this.uCameraMatrix, false, flatten(camera.cameraMatrix));
        gl.uniformMatrix4fv(this.uProjectionMatrix, false, flatten(camera.projectionMatrix));
    
        // Draw the model
        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_INT, 0);
    }
}