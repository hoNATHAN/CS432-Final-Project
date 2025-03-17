class Plane extends Drawable {
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

      Plane.divideQuad(a, v1, v5, v4, depth - 1);
      Plane.divideQuad(v1, b, v2, v5, depth - 1);
      Plane.divideQuad(v5, v2, c, v3, depth - 1);
      Plane.divideQuad(v4, v5, v3, d, depth - 1);
    } else {
      let index = Plane.vertexPositions.length;

      Plane.vertexPositions.push(a, b, c, d);

      Plane.vertexTextureCoords.push(
        vec2(0, 0),
        vec2(1, 0),
        vec2(1, 1),
        vec2(0, 1),
      );

      Plane.indices.push(
        index,
        index + 1,
        index + 2,
        index,
        index + 2,
        index + 3,
      );
    }
  }

  static generatePlane(subdivisionDepth = 4) {
    Plane.vertexPositions = [];
    Plane.vertexTextureCoords = [];
    Plane.indices = [];

    const a = vec3(-1.0, 0.0, -1.0);
    const b = vec3(-1.0, 0.0, 1.0);
    const c = vec3(1.0, 0.0, 1.0);
    const d = vec3(1.0, 0.0, -1.0);

    Plane.divideQuad(a, b, c, d, subdivisionDepth);
  }

  static initialize() {
    Plane.generatePlane(5);
    Plane.shaderProgram = initShaders(gl, "/vshader.glsl", "/fshader.glsl");

    Plane.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Plane.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten(Plane.vertexPositions),
      gl.STATIC_DRAW,
    );

    Plane.textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Plane.textureCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten(Plane.vertexTextureCoords),
      gl.STATIC_DRAW,
    );

    Plane.uTextureUnitShader = gl.getUniformLocation(
      Plane.shaderProgram,
      "uTextureUnit",
    );

    Plane.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Plane.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(Plane.indices),
      gl.STATIC_DRAW,
    );

    Plane.aPositionShader = gl.getAttribLocation(
      Plane.shaderProgram,
      "aPosition",
    );
    Plane.aTextureCoordShader = gl.getAttribLocation(
      Plane.shaderProgram,
      "aTextureCoord",
    );
    Plane.uModelMatrixShader = gl.getUniformLocation(
      Plane.shaderProgram,
      "modelMatrix",
    );
    Plane.uCameraMatrixShader = gl.getUniformLocation(
      Plane.shaderProgram,
      "cameraMatrix",
    );
    Plane.uProjectionMatrixShader = gl.getUniformLocation(
      Plane.shaderProgram,
      "projectionMatrix",
    );
  }

  static initializeTexture() {
    var image = new Image();

    image.onload = function () {
      Plane.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, Plane.texture);
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

    image.src = "256x grass block.png";
  }

  constructor(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh) {
    super(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh);
    if (Plane.shaderProgram == -1) {
      Plane.initialize();
      Plane.initializeTexture();
    }
  }

  draw() {
    if (Plane.texture == -1) return;

    gl.useProgram(Plane.shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, Plane.positionBuffer);
    gl.vertexAttribPointer(Plane.aPositionShader, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, Plane.textureCoordBuffer);
    gl.vertexAttribPointer(Plane.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, Plane.texture);
    gl.uniform1i(Plane.uTextureUnitShader, 0);

    gl.uniformMatrix4fv(
      Plane.uModelMatrixShader,
      false,
      flatten(this.modelMatrix),
    );
    gl.uniformMatrix4fv(
      Plane.uCameraMatrixShader,
      false,
      flatten(camera.cameraMatrix),
    );
    gl.uniformMatrix4fv(
      Plane.uProjectionMatrixShader,
      false,
      flatten(camera.projectionMatrix),
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Plane.indexBuffer);

    gl.enableVertexAttribArray(Plane.aPositionShader);
    gl.enableVertexAttribArray(Plane.aTextureCoordShader);
    gl.drawElements(gl.TRIANGLES, Plane.indices.length, gl.UNSIGNED_SHORT, 0);

    gl.disableVertexAttribArray(Plane.aPositionShader);
    gl.disableVertexAttribArray(Plane.aTextureCoordShader);
  }
}
