class Vase extends Drawable {
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
  static uCameraPositionShader = -1;

  static generateVase() {
    const slices = 36;
    const stacks = 20;
    const height = 2.0;

    const profile = [];
    for (let i = 0; i <= stacks; i++) {
      let t = i / stacks;
      let y = height * (t - 0.5);

      let radius =
        0.15 + 0.7 * Math.sin(Math.PI * t) * (1 - 0.5 * Math.pow(2 * t - 1, 6));
      profile.push({ y, radius });
    }

    Vase.vertexPositions = [];
    Vase.vertexNormals = [];
    Vase.vertexTextureCoords = [];
    Vase.indices = [];

    for (let i = 0; i <= stacks; i++) {
      const { y, radius } = profile[i];

      for (let j = 0; j <= slices; j++) {
        const theta = (j / slices) * 2 * Math.PI;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);

        let nx = Math.cos(theta);
        let nz = Math.sin(theta);

        let ny = 0;
        if (i > 0 && i < stacks) {
          const prevRadius = profile[i - 1].radius;
          const nextRadius = profile[i + 1].radius;
          ny = (prevRadius - nextRadius) / (2 * (height / stacks));

          const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
          nx /= len;
          ny /= len;
          nz /= len;
        }

        Vase.vertexPositions.push(vec3(x, y, z));
        Vase.vertexNormals.push(vec3(nx, ny, nz));
        Vase.vertexTextureCoords.push(vec2(j / slices, i / stacks));

        if (i < stacks && j < slices) {
          const current = i * (slices + 1) + j;
          const next = current + 1;
          const below = current + (slices + 1);
          const belowNext = below + 1;

          Vase.indices.push(current, next, below);
          Vase.indices.push(next, belowNext, below);
        }
      }
    }
  }

  static initialize() {
    Vase.generateVase();
    Vase.shaderProgram = initShaders(
      gl,
      "/vshader_vase.glsl",
      "/fshader_vase.glsl",
    );

    Vase.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Vase.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten(Vase.vertexPositions),
      gl.STATIC_DRAW,
    );

    Vase.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Vase.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(Vase.vertexNormals), gl.STATIC_DRAW);

    Vase.textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Vase.textureCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten(Vase.vertexTextureCoords),
      gl.STATIC_DRAW,
    );

    Vase.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Vase.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(Vase.indices),
      gl.STATIC_DRAW,
    );

    Vase.aPositionShader = gl.getAttribLocation(
      Vase.shaderProgram,
      "aPosition",
    );
    Vase.aNormalShader = gl.getAttribLocation(Vase.shaderProgram, "aNormal");
    Vase.aTextureCoordShader = gl.getAttribLocation(
      Vase.shaderProgram,
      "aTextureCoord",
    );
    Vase.uModelMatrixShader = gl.getUniformLocation(
      Vase.shaderProgram,
      "modelMatrix",
    );
    Vase.uCameraMatrixShader = gl.getUniformLocation(
      Vase.shaderProgram,
      "cameraMatrix",
    );
    Vase.uProjectionMatrixShader = gl.getUniformLocation(
      Vase.shaderProgram,
      "projectionMatrix",
    );
    Vase.uTextureUnitShader = gl.getUniformLocation(
      Vase.shaderProgram,
      "uTextureUnit",
    );

    Vase.uAmbientProductShader = gl.getUniformLocation(
      Vase.shaderProgram,
      "uAmbientProduct",
    );
    Vase.uDiffuseProductShader = gl.getUniformLocation(
      Vase.shaderProgram,
      "uDiffuseProduct",
    );
    Vase.uSpecularProductShader = gl.getUniformLocation(
      Vase.shaderProgram,
      "uSpecularProduct",
    );
    Vase.uShininessShader = gl.getUniformLocation(
      Vase.shaderProgram,
      "uShininess",
    );
    Vase.uLightPositionShader = gl.getUniformLocation(
      Vase.shaderProgram,
      "uLightPosition",
    );
    Vase.uCameraPositionShader = gl.getUniformLocation(
      Vase.shaderProgram,
      "uCameraPosition",
    );
  }

  initializeTexture(imageSrc) {
    var image = new Image();
    image.onload = () => {
      this.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.generateMipmap(gl.TEXTURE_2D);
    };
    image.src = imageSrc;
  }

  constructor(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh, imageSrc) {
    super(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh);
    if (Vase.shaderProgram == -1) {
      Vase.initialize();
    }
    this.texture = -1;
    this.initializeTexture(imageSrc);

    this.ambientProduct = amb;
    this.diffuseProduct = dif;
    this.specularProduct = sp;
    this.shininess = sh;
  }

  draw() {
    if (this.texture == -1) return;

    gl.useProgram(Vase.shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, Vase.positionBuffer);
    gl.vertexAttribPointer(Vase.aPositionShader, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(Vase.aPositionShader);

    gl.bindBuffer(gl.ARRAY_BUFFER, Vase.normalBuffer);
    gl.vertexAttribPointer(Vase.aNormalShader, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(Vase.aNormalShader);

    gl.bindBuffer(gl.ARRAY_BUFFER, Vase.textureCoordBuffer);
    gl.vertexAttribPointer(Vase.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(Vase.aTextureCoordShader);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(Vase.uTextureUnitShader, 0);

    gl.uniformMatrix4fv(
      Vase.uModelMatrixShader,
      false,
      flatten(this.modelMatrix),
    );
    gl.uniformMatrix4fv(
      Vase.uCameraMatrixShader,
      false,
      flatten(camera.cameraMatrix),
    );
    gl.uniformMatrix4fv(
      Vase.uProjectionMatrixShader,
      false,
      flatten(camera.projectionMatrix),
    );

    gl.uniform4fv(Vase.uAmbientProductShader, flatten(this.ambientProduct));
    gl.uniform4fv(Vase.uDiffuseProductShader, flatten(this.diffuseProduct));
    gl.uniform4fv(Vase.uSpecularProductShader, flatten(this.specularProduct));
    gl.uniform1f(Vase.uShininessShader, this.shininess);

    const lightPosition = vec4(10.0, 10.0, 10.0, 1.0);
    gl.uniform4fv(Vase.uLightPositionShader, flatten(lightPosition));

    if (camera.eye) {
      gl.uniform3fv(Vase.uCameraPositionShader, flatten(camera.eye));
    } else {
      const cameraMatrix = camera.cameraMatrix;
      const cameraPosition = vec3(
        -cameraMatrix[0][3],
        -cameraMatrix[1][3],
        -cameraMatrix[2][3],
      );
      gl.uniform3fv(Vase.uCameraPositionShader, flatten(cameraPosition));
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Vase.indexBuffer);
    gl.drawElements(gl.TRIANGLES, Vase.indices.length, gl.UNSIGNED_SHORT, 0);

    gl.disableVertexAttribArray(Vase.aPositionShader);
    gl.disableVertexAttribArray(Vase.aNormalShader);
    gl.disableVertexAttribArray(Vase.aTextureCoordShader);
  }
}
