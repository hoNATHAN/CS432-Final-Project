class Spotlight extends Drawable {
    static vertexPositions = [];
    static vertexNormals = [];
    static vertexTextureCoords = [];
    static indices = [];
    static positionBuffer = -1;
    static normalBuffer = -1;
    static textureCoordBuffer = -1;
    static indexBuffer = -1;
    static shaderProgram = -1;
    static aPositionShader = -1;
    static aNormalShader = -1;
    static aTextureCoordShader = -1;
    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;
    static uTextureUnitShader = -1;
    static uAmbientProductShader = -1;
    static uDiffuseProductShader = -1;
    static uSpecularProductShader = -1;
    static uShininessShader = -1;
    static uLightPositionShader = -1;
    static uCameraPositionShader = -1;  // Added camera position uniform

    static uSpotDirectionShader = -1;
    static uSpotCutoffShader = -1;
    static uSpotExponentShader = -1;

    static generateSpotlight() {
        const slices = 36;  // Number of segments around the circumference
        const stacks = 20;  // Number of segments from top to bottom
        const height = 3.0; // Height of the spotlight
        const radiusAtBase = 1.0;  // Base radius of the cone
        const radiusAtTop = 0.2;   // Top radius of the cone
        
        Spotlight.vertexPositions = [];
        Spotlight.vertexNormals = [];
        Spotlight.vertexTextureCoords = [];
        Spotlight.indices = [];
        
        // Generate the cone-like shape (spotlight)
        for (let i = 0; i <= stacks; i++) {
            const t = i / stacks;
            const y = height * (t - 0.5);  // Map to range [-1, 1]
            const radius = radiusAtBase + (radiusAtTop - radiusAtBase) * t;
            
            for (let j = 0; j <= slices; j++) {
                const theta = (j / slices) * 2 * Math.PI;
                const x = radius * Math.cos(theta);
                const z = radius * Math.sin(theta);
                
                // Calculate normal vector for the spotlight
                const nx = x;
                const ny = -height / stacks;
                const nz = z;
                const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
                
                Spotlight.vertexPositions.push(vec3(x, y, z));
                Spotlight.vertexNormals.push(vec3(nx / len, ny / len, nz / len));
                Spotlight.vertexTextureCoords.push(vec2(j / slices, i / stacks));
                
                if (i < stacks && j < slices) {
                    const current = i * (slices + 1) + j;
                    const next = current + 1;
                    const below = current + (slices + 1);
                    const belowNext = below + 1;
                    
                    Spotlight.indices.push(current, next, below);
                    Spotlight.indices.push(next, belowNext, below);
                }
            }
        }
    }

    static initialize() {
        Spotlight.generateSpotlight();
        Spotlight.shaderProgram = initShaders(gl, "/vshader_vase.glsl", "/fshader_vase.glsl");

        Spotlight.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Spotlight.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(Spotlight.vertexPositions), gl.STATIC_DRAW);

        Spotlight.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Spotlight.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(Spotlight.vertexNormals), gl.STATIC_DRAW);

        Spotlight.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Spotlight.textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(Spotlight.vertexTextureCoords), gl.STATIC_DRAW);

        Spotlight.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Spotlight.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(Spotlight.indices), gl.STATIC_DRAW);

        // Get shader locations
        Spotlight.aPositionShader = gl.getAttribLocation(Spotlight.shaderProgram, "aPosition");
        Spotlight.aNormalShader = gl.getAttribLocation(Spotlight.shaderProgram, "aNormal");
        Spotlight.aTextureCoordShader = gl.getAttribLocation(Spotlight.shaderProgram, "aTextureCoord");
        Spotlight.uModelMatrixShader = gl.getUniformLocation(Spotlight.shaderProgram, "modelMatrix");
        Spotlight.uCameraMatrixShader = gl.getUniformLocation(Spotlight.shaderProgram, "cameraMatrix");
        Spotlight.uProjectionMatrixShader = gl.getUniformLocation(Spotlight.shaderProgram, "projectionMatrix");
        Spotlight.uTextureUnitShader = gl.getUniformLocation(Spotlight.shaderProgram, "uTextureUnit");

        // Material and lighting uniforms
        Spotlight.uAmbientProductShader = gl.getUniformLocation(Spotlight.shaderProgram, "uAmbientProduct");
        Spotlight.uDiffuseProductShader = gl.getUniformLocation(Spotlight.shaderProgram, "uDiffuseProduct");
        Spotlight.uSpecularProductShader = gl.getUniformLocation(Spotlight.shaderProgram, "uSpecularProduct");
        Spotlight.uShininessShader = gl.getUniformLocation(Spotlight.shaderProgram, "uShininess");
        Spotlight.uLightPositionShader = gl.getUniformLocation(Spotlight.shaderProgram, "uLightPosition");
        Spotlight.uCameraPositionShader = gl.getUniformLocation(Spotlight.shaderProgram, "uCameraPosition");

        Spotlight.uSpotDirectionShader = gl.getUniformLocation(Spotlight.shaderProgram, "uSpotDirection");
        Spotlight.uSpotCutoffShader = gl.getUniformLocation(Spotlight.shaderProgram, "uSpotCutoff");
        Spotlight.uSpotExponentShader = gl.getUniformLocation(Spotlight.shaderProgram, "uSpotExponent");
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

    constructor(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh, imageSrc) {
        super(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh);
        if (Spotlight.shaderProgram == -1) {
            Spotlight.initialize();
        }
        this.texture = -1;
        this.initializeTexture(imageSrc);

        // Set material properties
        this.ambientProduct = amb;
        this.diffuseProduct = dif;
        this.specularProduct = sp;
        this.shininess = sh;

        this.spotDirection = vec3(0.0, -1.0, 0.0); // Points downward by default along the y-axis
        this.spotCutoff = Math.cos(Math.PI / 6); // 30 degrees cutoff angle (in cos units)
        this.spotExponent = 4.0; // Controls the spotlight's focus sharpness
    }

    draw() {
        if (this.texture == -1) return;
  
        gl.useProgram(Spotlight.shaderProgram);
        

        // Calculate spotlight direction in world space
        // This transforms the spotlight direction by the model's rotation
        const modelRotation = mat3(
            this.modelMatrix[0][0], this.modelMatrix[0][1], this.modelMatrix[0][2],
            this.modelMatrix[1][0], this.modelMatrix[1][1], this.modelMatrix[1][2],
            this.modelMatrix[2][0], this.modelMatrix[2][1], this.modelMatrix[2][2]
        );
        
        const worldSpotDirection = normalize(mult(modelRotation, this.spotDirection));
        
        // Pass spotlight parameters to the shader
        gl.uniform3fv(Spotlight.uSpotDirectionShader, flatten(worldSpotDirection));
        gl.uniform1f(Spotlight.uSpotCutoffShader, this.spotCutoff);
        gl.uniform1f(Spotlight.uSpotExponentShader, this.spotExponent);
        
        // Set light position to be at the base (wide part) of the spotlight
        // The base is at y = -1.5 in the model's local space (based on your generateSpotlight function)
        const localLightPos = vec4(0.0, -1.5, 0.0, 1.0);
        const worldLightPos = mult(this.modelMatrix, localLightPos);
        gl.uniform4fv(Spotlight.uLightPositionShader, flatten(worldLightPos));
        

        // Set vertex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, Spotlight.positionBuffer);
        gl.vertexAttribPointer(Spotlight.aPositionShader, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(Spotlight.aPositionShader);
        
        // Set vertex normals
        gl.bindBuffer(gl.ARRAY_BUFFER, Spotlight.normalBuffer);
        gl.vertexAttribPointer(Spotlight.aNormalShader, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(Spotlight.aNormalShader);
  
        // Set texture coordinates
        gl.bindBuffer(gl.ARRAY_BUFFER, Spotlight.textureCoordBuffer);
        gl.vertexAttribPointer(Spotlight.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(Spotlight.aTextureCoordShader);
  
        // Bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(Spotlight.uTextureUnitShader, 0);
  
        // Set transformation matrices
        gl.uniformMatrix4fv(Spotlight.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(Spotlight.uCameraMatrixShader, false, flatten(camera.cameraMatrix));
        gl.uniformMatrix4fv(Spotlight.uProjectionMatrixShader, false, flatten(camera.projectionMatrix));
        
        // Set material properties and light position
        gl.uniform4fv(Spotlight.uAmbientProductShader, flatten(this.ambientProduct));
        gl.uniform4fv(Spotlight.uDiffuseProductShader, flatten(this.diffuseProduct));
        gl.uniform4fv(Spotlight.uSpecularProductShader, flatten(this.specularProduct));
        gl.uniform1f(Spotlight.uShininessShader, this.shininess);
        
        // Set light position
        const lightPosition = vec4(10.0, 10.0, 10.0, 1.0);
        gl.uniform4fv(Spotlight.uLightPositionShader, flatten(lightPosition));
        
        // Set camera position
        // Extract camera position from the camera matrix
        // Assuming camera.eye exists (common in WebGL camera implementations)
        // If not, you'll need to adapt this to your camera system
        if (camera.eye) {
            gl.uniform3fv(Spotlight.uCameraPositionShader, flatten(camera.eye));
        } else {
            // Alternative approach if camera.eye doesn't exist
            // Extract the camera position from the inverse of the camera matrix
            // This might not work with all camera implementations
            // The camera position is the negative of the translation part of the view matrix
            const cameraMatrix = camera.cameraMatrix;
            const cameraPosition = vec3(
                -cameraMatrix[0][3],
                -cameraMatrix[1][3],
                -cameraMatrix[2][3]
            );
            gl.uniform3fv(Spotlight.uCameraPositionShader, flatten(cameraPosition));
        }
  
        // Draw elements
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Spotlight.indexBuffer);
        gl.drawElements(gl.TRIANGLES, Spotlight.indices.length, gl.UNSIGNED_SHORT, 0);
  
        // Clean up
        gl.disableVertexAttribArray(Spotlight.aPositionShader);
        gl.disableVertexAttribArray(Spotlight.aNormalShader);
        gl.disableVertexAttribArray(Spotlight.aTextureCoordShader);


        
    }
    
}
