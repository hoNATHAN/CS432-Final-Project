class Floor extends Drawable {
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

  static texture = -1;
  static uTextureUnitShader = -1;

  static divideQuad(a, b, c, d, depth) {
    if (depth > 0) {
      const v1 = vec3((a[0] + b[0]) * 0.5, 0.0, (a[2] + b[2]) * 0.5);
      const v2 = vec3((b[0] + c[0]) * 0.5, 0.0, (b[2] + c[2]) * 0.5);
      const v3 = vec3((c[0] + d[0]) * 0.5, 0.0, (c[2] + d[2]) * 0.5);
      const v4 = vec3((d[0] + a[0]) * 0.5, 0.0, (d[2] + a[2]) * 0.5);
      const v5 = vec3(
        (a[0] + b[0] + c[0] + d[0]) * 0.25,
        0.0,
        (a[2] + b[2] + c[2] + d[2]) * 0.25,
      );

      Floor.divideQuad(a, v1, v5, v4, depth - 1);
      Floor.divideQuad(v1, b, v2, v5, depth - 1);
      Floor.divideQuad(v5, v2, c, v3, depth - 1);
      Floor.divideQuad(v4, v5, v3, d, depth - 1);
    } else {
      let index = Floor.vertexPositions.length;

      Floor.vertexPositions.push(a, b, c, d);

      Floor.vertexTextureCoords.push(
        vec2(0, 0),
        vec2(1, 0),
        vec2(1, 1),
        vec2(0, 1),
      );

      Floor.indices.push(
        index,
        index + 1,
        index + 2,
        index,
        index + 2,
        index + 3,
      );
    }
  }

  static generateFloor(subdivisionDepth = 4) {
    Floor.vertexPositions = [];
    Floor.vertexTextureCoords = [];
    Floor.indices = [];

    const a = vec3(-2.0, 0.0, -2.0);
    const b = vec3(-2.0, 0.0, 2.0);
    const c = vec3(2.0, 0.0, 2.0);
    const d = vec3(2.0, 0.0, -2.0);

    Floor.divideQuad(a, b, c, d, subdivisionDepth);
  }

  static initialize() {
    Floor.generateFloor(5);
    Floor.shaderProgram = initShaders(gl, "/vshader.glsl", "/fshader.glsl");

    Floor.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Floor.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten(Floor.vertexPositions),
      gl.STATIC_DRAW,
    );

    Floor.textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Floor.textureCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten(Floor.vertexTextureCoords),
      gl.STATIC_DRAW,
    );

    Floor.uTextureUnitShader = gl.getUniformLocation(
      Floor.shaderProgram,
      "uTextureUnit",
    );

    Floor.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Floor.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(Floor.indices),
      gl.STATIC_DRAW,
    );

    Floor.aPositionShader = gl.getAttribLocation(
      Floor.shaderProgram,
      "aPosition",
    );
    Floor.aTextureCoordShader = gl.getAttribLocation(
      Floor.shaderProgram,
      "aTextureCoord",
    );
    Floor.uModelMatrixShader = gl.getUniformLocation(
      Floor.shaderProgram,
      "modelMatrix",
    );
    Floor.uCameraMatrixShader = gl.getUniformLocation(
      Floor.shaderProgram,
      "cameraMatrix",
    );
    Floor.uProjectionMatrixShader = gl.getUniformLocation(
      Floor.shaderProgram,
      "projectionMatrix",
    );
  }

  static initializeTexture() {
    var image = new Image();

    image.onload = function () {
      Floor.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, Floor.texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGB,
        image.width,
        image.height,
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        image,
      );

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    };

    image.src = "/textures/wood-planks.avif";
  }

  constructor(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh) {
    super(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh);
    if (Floor.shaderProgram == -1) {
      Floor.initialize();
      Floor.initializeTexture();
    }
  }

  draw() {
    if (Floor.texture == -1) return;

    gl.useProgram(Floor.shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, Floor.positionBuffer);
    gl.vertexAttribPointer(Floor.aPositionShader, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, Floor.textureCoordBuffer);
    gl.vertexAttribPointer(Floor.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, Floor.texture);
    gl.uniform1i(Floor.uTextureUnitShader, 0);

    gl.uniformMatrix4fv(
      Floor.uModelMatrixShader,
      false,
      flatten(this.modelMatrix),
    );
    gl.uniformMatrix4fv(
      Floor.uCameraMatrixShader,
      false,
      flatten(camera.cameraMatrix),
    );
    gl.uniformMatrix4fv(
      Floor.uProjectionMatrixShader,
      false,
      flatten(camera.projectionMatrix),
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Floor.indexBuffer);

    gl.enableVertexAttribArray(Floor.aPositionShader);
    gl.enableVertexAttribArray(Floor.aTextureCoordShader);
    gl.drawElements(gl.TRIANGLES, Floor.indices.length, gl.UNSIGNED_SHORT, 0);

    gl.disableVertexAttribArray(Floor.aPositionShader);
    gl.disableVertexAttribArray(Floor.aTextureCoordShader);
  }
}
