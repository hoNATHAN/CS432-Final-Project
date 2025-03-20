class Mirror extends Drawable {
  constructor(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh) {
    super(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh);

    this.reflectivity = 0.8;
    this.setupGeometry();
    this.loadShaders();
    this.setupCubeMap();
  }

  setupGeometry() {
    this.vertices = [
      -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0,
    ];

    this.indices = [0, 1, 2, 0, 2, 3];

    this.normals = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0];

    this.texCoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];

    this.vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.vertices),
      gl.STATIC_DRAW,
    );

    this.nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.normals),
      gl.STATIC_DRAW,
    );

    this.tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.texCoords),
      gl.STATIC_DRAW,
    );

    this.iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.indices),
      gl.STATIC_DRAW,
    );
  }

  loadShaders() {
    this.program = initShaders(
      gl,
      "vshader_mirror.glsl",
      "fshader_mirror.glsl",
    );

    this.positionLoc = gl.getAttribLocation(this.program, "aPosition");
    this.normalLoc = gl.getAttribLocation(this.program, "aNormal");
    this.texCoordLoc = gl.getAttribLocation(this.program, "aTexCoord");

    this.modelMatrixLoc = gl.getUniformLocation(this.program, "uModelMatrix");
    this.cameraMatrixLoc = gl.getUniformLocation(this.program, "uCameraMatrix");
    this.projectionMatrixLoc = gl.getUniformLocation(
      this.program,
      "uProjectionMatrix",
    );
    this.cameraPositionLoc = gl.getUniformLocation(
      this.program,
      "uCameraPosition",
    );
    this.cubeMapLoc = gl.getUniformLocation(this.program, "uCubeMap");
    this.reflectivityLoc = gl.getUniformLocation(this.program, "uReflectivity");

    this.matAmbientLoc = gl.getUniformLocation(this.program, "uMatAmbient");
    this.matDiffuseLoc = gl.getUniformLocation(this.program, "uMatDiffuse");
    this.matSpecularLoc = gl.getUniformLocation(this.program, "uMatSpecular");
  }

  setupCubeMap() {
    this.cubeMapTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubeMapTexture);

    const faceInfos = [
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        url: "/textures/cubemap/posx.png",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        url: "/textures/cubemap/negx.png",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        url: "/textures/cubemap/posy.png",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        url: "/textures/cubemap/negy.png",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        url: "/textures/cubemap/posz.png",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        url: "/textures/cubemap/negz.png",
      },
    ];

    const cubeMapTexture = this.cubeMapTexture;

    const level = 0;
    const internalFormat = gl.RGBA;
    const size = 16; // Small power-of-2 size for placeholder
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    const colors = [
      [255, 0, 0, 255],
      [0, 255, 0, 255],
      [0, 0, 255, 255],
      [255, 255, 0, 255],
      [255, 0, 255, 255],
      [0, 255, 255, 255],
    ];

    faceInfos.forEach((faceInfo, i) => {
      const data = new Uint8Array(size * size * 4);
      for (let j = 0; j < size * size; j++) {
        const offset = j * 4;
        data[offset] = colors[i][0];
        data[offset + 1] = colors[i][1];
        data[offset + 2] = colors[i][2];
        data[offset + 3] = colors[i][3];
      }

      gl.texImage2D(
        faceInfo.target,
        level,
        internalFormat,
        size,
        size,
        0,
        format,
        type,
        data,
      );
    });

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

    let loadedImages = 0;
    const totalImages = faceInfos.length;

    faceInfos.forEach((faceInfo) => {
      const image = new Image();

      image.crossOrigin = "anonymous";

      image.onload = function () {
        console.log(
          `Loaded image: ${faceInfo.url}, dimensions: ${image.width}x${image.height}`,
        );

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMapTexture);
        gl.texImage2D(
          faceInfo.target,
          level,
          internalFormat,
          format,
          type,
          image,
        );

        loadedImages++;

        if (loadedImages === totalImages) {
          const isPowerOf2 = (value) => (value & (value - 1)) === 0;
          const firstImage = new Image();
          firstImage.onload = function () {
            if (isPowerOf2(firstImage.width) && isPowerOf2(firstImage.height)) {
              gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMapTexture);
              gl.texParameteri(
                gl.TEXTURE_CUBE_MAP,
                gl.TEXTURE_MIN_FILTER,
                gl.LINEAR_MIPMAP_LINEAR,
              );
              try {
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                console.log("Successfully generated mipmaps");
              } catch (e) {
                console.error("Failed to generate mipmaps:", e);
                // Fall back to non-mipmapped filtering
                gl.texParameteri(
                  gl.TEXTURE_CUBE_MAP,
                  gl.TEXTURE_MIN_FILTER,
                  gl.LINEAR,
                );
              }
            } else {
              console.warn(
                "Images are not power of 2 size, using LINEAR filtering instead",
              );
              gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMapTexture);
              gl.texParameteri(
                gl.TEXTURE_CUBE_MAP,
                gl.TEXTURE_MIN_FILTER,
                gl.LINEAR,
              );
            }
          };
          firstImage.src = faceInfos[0].url;
        }
      };

      image.onerror = function () {
        console.error(`Failed to load image: ${faceInfo.url}`);
        loadedImages++; // Count failed loads to avoid hanging
      };

      image.src = faceInfo.url;
    });
  }

  draw() {
    gl.useProgram(this.program);

    this.updateModelMatrix();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.vertexAttribPointer(this.positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.positionLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.normalLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
    gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.texCoordLoc);

    gl.uniformMatrix4fv(this.modelMatrixLoc, false, flatten(this.modelMatrix));
    gl.uniformMatrix4fv(
      this.cameraMatrixLoc,
      false,
      flatten(camera.cameraMatrix),
    );
    gl.uniformMatrix4fv(
      this.projectionMatrixLoc,
      false,
      flatten(camera.projectionMatrix),
    );
    gl.uniform3fv(this.cameraPositionLoc, new Float32Array(camera.vrp));
    gl.uniform1f(this.reflectivityLoc, this.reflectivity);

    gl.uniform4fv(this.matAmbientLoc, new Float32Array(this.matAmbient));
    gl.uniform4fv(this.matDiffuseLoc, new Float32Array(this.matDiffuse));
    gl.uniform4fv(this.matSpecularLoc, new Float32Array(this.matSpecular));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubeMapTexture);
    gl.uniform1i(this.cubeMapLoc, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }
}
