class Painting extends Drawable {
  static vertexPositions = [];
  static vertexTextureCoords = [];
  static indices = [];
  static positionBuffer = -1;
  static textureCoordBuffer = -1;
  static indexBuffer = -1;
  static shaderProgram = -1;
  static aPositionShader = -1;
  static aTextureCoordShader = -1;
  static uModelMatrixShader = -1;
  static uCameraMatrixShader = -1;
  static uProjectionMatrixShader = -1;
  static uTextureUnitShader = -1;

  static generatePainting() {
    let depth = 0.02;
    Painting.vertexPositions = [
      // Front face
      vec3(-1.0, -1.0, depth),
      vec3(1.0, -1.0, depth),
      vec3(1.0, 1.0, depth),
      vec3(-1.0, 1.0, depth),

      // Back face
      vec3(-1.0, -1.0, -depth),
      vec3(1.0, -1.0, -depth),
      vec3(1.0, 1.0, -depth),
      vec3(-1.0, 1.0, -depth),
    ];

    Painting.vertexTextureCoords = [
      // Front face
      vec2(0, 1),
      vec2(1, 1),
      vec2(1, 0),
      vec2(0, 0),
      // Back face
      vec2(0, 1),
      vec2(1, 1),
      vec2(1, 0),
      vec2(0, 0),
    ];

    Painting.indices = [
      // Front face
      0, 1, 2, 0, 2, 3,
      // Back face
      4, 6, 5, 4, 7, 6,
      // Left face
      4, 0, 3, 4, 3, 7,
      // Right face
      1, 5, 6, 1, 6, 2,
      // Top face
      3, 2, 6, 3, 6, 7,
      // Bottom face
      4, 5, 1, 4, 1, 0,
    ];
  }

  static initialize() {
    Painting.generatePainting();
    Painting.shaderProgram = initShaders(gl, "/vshader.glsl", "/fshader.glsl");

    Painting.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Painting.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten(Painting.vertexPositions),
      gl.STATIC_DRAW,
    );

    Painting.textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Painting.textureCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten(Painting.vertexTextureCoords),
      gl.STATIC_DRAW,
    );

    Painting.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Painting.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(Painting.indices),
      gl.STATIC_DRAW,
    );

    Painting.aPositionShader = gl.getAttribLocation(
      Painting.shaderProgram,
      "aPosition",
    );
    Painting.aTextureCoordShader = gl.getAttribLocation(
      Painting.shaderProgram,
      "aTextureCoord",
    );
    Painting.uModelMatrixShader = gl.getUniformLocation(
      Painting.shaderProgram,
      "modelMatrix",
    );
    Painting.uCameraMatrixShader = gl.getUniformLocation(
      Painting.shaderProgram,
      "cameraMatrix",
    );
    Painting.uProjectionMatrixShader = gl.getUniformLocation(
      Painting.shaderProgram,
      "projectionMatrix",
    );
    Painting.uTextureUnitShader = gl.getUniformLocation(
      Painting.shaderProgram,
      "uTextureUnit",
    );
  }

  initializeTexture(imageSrc) {
    var image = new Image();
    image.onload = () => {
      this.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };
    image.src = imageSrc;
  }

  constructor(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh, imageSrc) {
    super(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh);
    if (Painting.shaderProgram == -1) {
      Painting.initialize();
    }
    this.texture = -1;
    this.initializeTexture(imageSrc);
  }

  draw() {
    if (this.texture == -1) return;

    gl.useProgram(Painting.shaderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, Painting.positionBuffer);
    gl.vertexAttribPointer(Painting.aPositionShader, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(Painting.aPositionShader);

    gl.bindBuffer(gl.ARRAY_BUFFER, Painting.textureCoordBuffer);
    gl.vertexAttribPointer(
      Painting.aTextureCoordShader,
      2,
      gl.FLOAT,
      false,
      0,
      0,
    );
    gl.enableVertexAttribArray(Painting.aTextureCoordShader);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(Painting.uTextureUnitShader, 0);

    gl.uniformMatrix4fv(
      Painting.uModelMatrixShader,
      false,
      flatten(this.modelMatrix),
    );
    gl.uniformMatrix4fv(
      Painting.uCameraMatrixShader,
      false,
      flatten(camera.cameraMatrix),
    );
    gl.uniformMatrix4fv(
      Painting.uProjectionMatrixShader,
      false,
      flatten(camera.projectionMatrix),
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Painting.indexBuffer);
    gl.drawElements(
      gl.TRIANGLES,
      Painting.indices.length,
      gl.UNSIGNED_SHORT,
      0,
    );

    gl.disableVertexAttribArray(Painting.aPositionShader);
    gl.disableVertexAttribArray(Painting.aTextureCoordShader);
  }
}
