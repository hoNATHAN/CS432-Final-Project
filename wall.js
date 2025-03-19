class Wall extends Drawable {
  //    5--------6
  //   /|       /|
  //  1--------2 |
  //  | |      | |
  //  | 4------|-7
  //  |/       |/
  //  0--------3

  static vertexPositions = [
    // front face
    vec3(0, -0.5, 0.5), // bottom left
    vec3(0, 4, 0.5), // top left
    vec3(0.5, 4, 0.5), // top right
    vec3(0.5, -0.5, 0.5), // bottom right

    // back face
    vec3(0, -0.5, -9), // bottom left
    vec3(0, 4, -9), // top left
    vec3(0.5, 4, -9), // top right
    vec3(0.5, -0.5, -9), // bottom right
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
    Wall.shaderProgram = initShaders(gl, "/vshader.glsl", "/fshader.glsl");
    Wall.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Wall.positionBuffer);
    let expandedPositions = [];
    for (let i = 0; i < Wall.vertexIndices.length; i++) {
      expandedPositions.push(Wall.vertexPositions[Wall.vertexIndices[i]]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, flatten(expandedPositions), gl.STATIC_DRAW);
    Wall.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Wall.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(Wall.texCoords), gl.STATIC_DRAW);
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
    Wall.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Wall.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint8Array(newIndices),
      gl.STATIC_DRAW,
    );
    Wall.aPositionShader = gl.getAttribLocation(
      Wall.shaderProgram,
      "aPosition",
    );
    Wall.aTextureCoordShader = gl.getAttribLocation(
      Wall.shaderProgram,
      "aTextureCoord",
    );
    Wall.uModelMatrixShader = gl.getUniformLocation(
      Wall.shaderProgram,
      "modelMatrix",
    );
    Wall.uCameraMatrixShader = gl.getUniformLocation(
      Wall.shaderProgram,
      "cameraMatrix",
    );
    Wall.uProjectionMatrixShader = gl.getUniformLocation(
      Wall.shaderProgram,
      "projectionMatrix",
    );
    Wall.uTextureUnitShader = gl.getUniformLocation(
      Wall.shaderProgram,
      "uTextureUnit",
    );
    Wall.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, Wall.texture);
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
      gl.bindTexture(gl.TEXTURE_2D, Wall.texture);
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
    if (Wall.shaderProgram == -1) Wall.initialize();
  }

  draw() {
    gl.useProgram(Wall.shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, Wall.positionBuffer);
    gl.vertexAttribPointer(Wall.aPositionShader, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(Wall.aPositionShader);
    gl.bindBuffer(gl.ARRAY_BUFFER, Wall.texCoordBuffer);

    gl.vertexAttribPointer(Wall.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(Wall.aTextureCoordShader);

    this.updateModelMatrix();

    gl.uniformMatrix4fv(
      Wall.uModelMatrixShader,
      false,
      flatten(this.modelMatrix),
    );

    gl.uniformMatrix4fv(
      Wall.uCameraMatrixShader,
      false,
      flatten(camera.cameraMatrix),
    );

    gl.uniformMatrix4fv(
      Wall.uProjectionMatrixShader,
      false,
      flatten(camera.projectionMatrix),
    );

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, Wall.texture);

    gl.uniform1i(Wall.uTextureUnitShader, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Wall.indexBuffer);

    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
    gl.disableVertexAttribArray(Wall.aPositionShader);
    gl.disableVertexAttribArray(Wall.aTextureCoordShader);
  }
}
