class Sky extends Drawable {
  static vertexPositions = [
    vec3(-1, -1, 1),
    vec3(-1, 1, 1),
    vec3(1, 1, 1),
    vec3(1, -1, 1),
    vec3(-1, -1, -1),
    vec3(-1, 1, -1),
    vec3(1, 1, -1),
    vec3(1, -1, -1),
  ];

  static indices = [
    0, 3, 2, 0, 2, 1, 2, 3, 7, 2, 7, 6, 0, 4, 7, 0, 7, 3, 1, 2, 6, 1, 6, 5, 4,
    5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4,
  ];

  static positionBuffer = -1;
  static indexBuffer = -1;
  static shaderProgram = -1;
  static aPositionShader = -1;
  static uModelMatrixShader = -1;
  static uCameraMatrixShader = -1;
  static uProjectionMatrixShader = -1;
  static texture = -1;
  static uTextureUnitShader = -1;
  static imagesLoaded = 0;

  static initializeTexture() {
    var posX = new Image();
    var negX = new Image();
    var posY = new Image();
    var negY = new Image();
    var posZ = new Image();
    var negZ = new Image();

    Sky.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, Sky.texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

    posX.onload = function () {
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, Sky.texture);
      gl.texImage2D(
        gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        0,
        gl.RGB,
        posX.width,
        posX.height,
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        posX,
      );
      Sky.imagesLoaded += 1;
    };

    negX.onload = function () {
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, Sky.texture);
      gl.texImage2D(
        gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        0,
        gl.RGB,
        negX.width,
        negX.height,
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        negX,
      );
      Sky.imagesLoaded += 1;
    };

    posY.onload = function () {
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, Sky.texture);
      gl.texImage2D(
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        0,
        gl.RGB,
        posY.width,
        posY.height,
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        posY,
      );
      Sky.imagesLoaded += 1;
    };

    negY.onload = function () {
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, Sky.texture);
      gl.texImage2D(
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        0,
        gl.RGB,
        negY.width,
        negY.height,
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        negY,
      );
      Sky.imagesLoaded += 1;
    };

    posZ.onload = function () {
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, Sky.texture);
      gl.texImage2D(
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        0,
        gl.RGB,
        posZ.width,
        posZ.height,
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        posZ,
      );
      Sky.imagesLoaded += 1;
    };

    negZ.onload = function () {
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, Sky.texture);
      gl.texImage2D(
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        0,
        gl.RGB,
        negZ.width,
        negZ.height,
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        negZ,
      );
      Sky.imagesLoaded += 1;
    };

    posX.src = "sky_ue/sky_test_right.png";
    negX.src = "sky_ue/sky_test_left.png";
    posY.src = "sky_ue/sky_test_up.png";
    negY.src = "sky_ue/sky_test_down.png";
    posZ.src = "sky_ue/sky_test_front.png";
    negZ.src = "sky_ue/sky_test_back.png";
  }

  static initialize() {
    Sky.shaderProgram = initShaders(
      gl,
      "/vshader_sky.glsl",
      "/fshader_sky.glsl",
    );
    gl.useProgram(Sky.shaderProgram);

    Sky.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Sky.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten(Sky.vertexPositions),
      gl.STATIC_DRAW,
    );

    Sky.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Sky.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint8Array(Sky.indices),
      gl.STATIC_DRAW,
    );

    Sky.uTextureUnitShader = gl.getUniformLocation(
      Sky.shaderProgram,
      "uTextureUnit",
    );

    Sky.aPositionShader = gl.getAttribLocation(Sky.shaderProgram, "aPosition");

    Sky.uModelMatrixShader = gl.getUniformLocation(
      Sky.shaderProgram,
      "modelMatrix",
    );
    Sky.uCameraMatrixShader = gl.getUniformLocation(
      Sky.shaderProgram,
      "cameraMatrix",
    );
    Sky.uProjectionMatrixShader = gl.getUniformLocation(
      Sky.shaderProgram,
      "projectionMatrix",
    );
  }

  constructor(tx, ty, tz, scale, rotX, rotY, rotZ) {
    super(tx, ty, tz, scale, rotX, rotY, rotZ);
    Sky.imagesLoaded = 0;
    if (Sky.shaderProgram == -1) Sky.initialize();
    Sky.initializeTexture();
  }

  draw() {
    if (Sky.texture == -1 || Sky.imagesLoaded != 6) {
      return;
    }

    gl.useProgram(Sky.shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, Sky.positionBuffer);
    gl.vertexAttribPointer(Sky.aPositionShader, 3, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, Sky.texture);
    gl.uniform1i(Sky.uTextureUnitShader, 0);

    gl.uniformMatrix4fv(
      Sky.uModelMatrixShader,
      false,
      flatten(this.modelMatrix),
    );
    gl.uniformMatrix4fv(
      Sky.uCameraMatrixShader,
      false,
      flatten(camera.cameraMatrix),
    );
    gl.uniformMatrix4fv(
      Sky.uProjectionMatrixShader,
      false,
      flatten(camera.projectionMatrix),
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Sky.indexBuffer);

    gl.enableVertexAttribArray(Sky.aPositionShader);
    gl.drawElements(gl.TRIANGLES, Sky.indices.length, gl.UNSIGNED_BYTE, 0);
    gl.disableVertexAttribArray(Sky.aPositionShader);
  }
}
