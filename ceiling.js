class Ceiling extends Drawable {
  //    5--------6
  //   /|       /|
  //  1--------2 |
  //  | |      | |
  //  | 4------|-7
  //  |/       |/
  //  0--------3

  static vertexPositions = [
    vec3(-3.5, 3, 0.5), // bottom left
    vec3(-3.5, 3.5, 0.5), // top left
    vec3(3, 3.5, 0.5), // top right
    vec3(3, 3, 0.5), // bottom right

    vec3(-3.5, 3, -10), // bottom left
    vec3(-3.5, 3.5, -10), // top left
    vec3(3, 3.5, -10), // top right
    vec3(3, 3, -10), // bottom right
  ];

  static texCoords = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0),
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0),
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0),
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0),
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0),
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0),
  ];

  static indices = [
    0, 3, 2, 0, 2, 1, 4, 5, 6, 4, 6, 7, 1, 2, 6, 1, 6, 5, 0, 4, 7, 0, 7, 3, 3,
    7, 6, 3, 6, 2, 0, 1, 5, 0, 5, 4,
  ];

  static vertexIndices = [
    0, 1, 2, 3, 4, 5, 6, 7, 1, 5, 6, 2, 0, 4, 7, 3, 3, 7, 6, 2, 0, 4, 5, 1,
  ];

  static positionBuffer = -1;
  static texCoordBuffer = -1;
  static indexBuffer = -1;

  static shaderProgram = -1;

  static aPositionShader = -1;
  static aTextureCoordShader = -1;

  static uModelMatrixShader = -1;
  static uCameraMatrixShader = -1;
  static uProjectionMatrixShader = -1;
  static uTextureUnitShader = -1;

  static texture = null;

  static initialize() {
    Ceiling.shaderProgram = initShaders(gl, "/vshader.glsl", "/fshader.glsl");
    Ceiling.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Ceiling.positionBuffer);
    let expandedPositions = [];
    for (let i = 0; i < Ceiling.vertexIndices.length; i++) {
      expandedPositions.push(Ceiling.vertexPositions[Ceiling.vertexIndices[i]]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, flatten(expandedPositions), gl.STATIC_DRAW);
    Ceiling.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Ceiling.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(Ceiling.texCoords), gl.STATIC_DRAW);
    let newIndices = [];
    for (let i = 0; i < 6; i++) {
      let offset = i * 4;
      newIndices.push(offset);
      newIndices.push(offset + 1);
      newIndices.push(offset + 2);
      newIndices.push(offset);
      newIndices.push(offset + 2);
      newIndices.push(offset + 3);
    }
    Ceiling.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Ceiling.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint8Array(newIndices),
      gl.STATIC_DRAW,
    );
    Ceiling.aPositionShader = gl.getAttribLocation(
      Ceiling.shaderProgram,
      "aPosition",
    );
    Ceiling.aTextureCoordShader = gl.getAttribLocation(
      Ceiling.shaderProgram,
      "aTextureCoord",
    );
    Ceiling.uModelMatrixShader = gl.getUniformLocation(
      Ceiling.shaderProgram,
      "modelMatrix",
    );
    Ceiling.uCameraMatrixShader = gl.getUniformLocation(
      Ceiling.shaderProgram,
      "cameraMatrix",
    );
    Ceiling.uProjectionMatrixShader = gl.getUniformLocation(
      Ceiling.shaderProgram,
      "projectionMatrix",
    );
    Ceiling.uTextureUnitShader = gl.getUniformLocation(
      Ceiling.shaderProgram,
      "uTextureUnit",
    );
    Ceiling.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, Ceiling.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 255, 255]),
    );
    const image = new Image();
    image.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, Ceiling.texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
      gl.generateMipmap(gl.TEXTURE_2D);
    };
    image.src = "textures/concrete.jpg";
  }

  constructor(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, spec, sh) {
    super(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, spec, sh);
    if (Ceiling.shaderProgram == -1) Ceiling.initialize();
  }

  draw() {
    gl.useProgram(Ceiling.shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, Ceiling.positionBuffer);
    gl.vertexAttribPointer(Ceiling.aPositionShader, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(Ceiling.aPositionShader);
    gl.bindBuffer(gl.ARRAY_BUFFER, Ceiling.texCoordBuffer);

    gl.vertexAttribPointer(
      Ceiling.aTextureCoordShader,
      2,
      gl.FLOAT,
      false,
      0,
      0,
    );
    gl.enableVertexAttribArray(Ceiling.aTextureCoordShader);

    this.updateModelMatrix();

    gl.uniformMatrix4fv(
      Ceiling.uModelMatrixShader,
      false,
      flatten(this.modelMatrix),
    );

    gl.uniformMatrix4fv(
      Ceiling.uCameraMatrixShader,
      false,
      flatten(camera.cameraMatrix),
    );

    gl.uniformMatrix4fv(
      Ceiling.uProjectionMatrixShader,
      false,
      flatten(camera.projectionMatrix),
    );

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, Ceiling.texture);

    gl.uniform1i(Ceiling.uTextureUnitShader, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Ceiling.indexBuffer);

    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
    gl.disableVertexAttribArray(Ceiling.aPositionShader);
    gl.disableVertexAttribArray(Ceiling.aTextureCoordShader);
  }
}
