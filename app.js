var canvas;
var gl;
var angle = 0.0;

class Light {
  constructor(loc, dir, amb, sp, dif, alpha, cutoff, type) {
    this.location = loc;
    this.direction = dir;
    this.ambient = amb;
    this.specular = sp;
    this.diffuse = dif;
    this.alpha = alpha;
    this.cutoff = cutoff;
    this.type = type;
    this.status = 1;
  }
  turnOff() {
    this.status = 0;
  }

  turnOn() {
    this.status = 1;
  }
}

class Camera {
  constructor(vrp, u, v, n) {
    this.vrp = vrp;
    this.u = normalize(u);
    this.v = normalize(v);
    this.n = normalize(n);

    this.projectionMatrix = perspective(90.0, 1.0, 0.1, 200);

    this.updateCameraMatrix();
  }

  updateCameraMatrix() {
    let t = translate(-this.vrp[0], -this.vrp[1], -this.vrp[2]);
    let r = mat4(
      this.u[0],
      this.u[1],
      this.u[2],
      0,
      this.v[0],
      this.v[1],
      this.v[2],
      0,
      this.n[0],
      this.n[1],
      this.n[2],
      0,
      0.0,
      0.0,
      0.0,
      1.0,
    );
    this.cameraMatrix = mult(r, t);
  }

  getModelMatrix() {
    return this.modelMatrix;
  }

  setModelMatrix(mm) {
    this.modelMatrix = mm;
  }

  rotateView(axis, theta) {
    let M = rotate(theta, axis);
    let v = normalize(mult(M, vec4(this.v[0], this.v[1], this.v[2], 0.0)));
    let n = normalize(mult(M, vec4(this.n[0], this.n[1], this.n[2], 0.0)));
    let u = normalize(mult(M, vec4(this.u[0], this.u[1], this.u[2], 0.0)));

    this.v = vec3(v[0], v[1], v[2]);
    this.n = vec3(n[0], n[1], n[2]);
    this.u = vec3(u[0], u[1], u[2]);
  }

  move(key, step) {
    switch (key) {
      case "ArrowUp":
        this.vrp = add(this.vrp, scale(-step, this.n));
        break;
      case "ArrowLeft":
        this.vrp = add(this.vrp, scale(-step, this.u));
        break;
      case "ArrowDown":
        this.vrp = add(this.vrp, scale(step, this.n));
        break;
      case "ArrowRight":
        this.vrp = add(this.vrp, scale(step, this.u));
        break;
      case "z":
        this.rotateView(this.n, 5);
        break;
      case "Z":
        this.rotateView(this.n, -5);
        break;
      case "x":
        this.rotateView(this.u, 5);
        break;
      case "X":
        this.rotateView(this.u, -5);
        break;
      case "c":
        this.rotateView(this.v, 5);
        break;
      case "C":
        this.rotateView(this.v, -5);
        break;
    }

    this.updateCameraMatrix();
  }
}

var camera = new Camera(
  vec3(0, 5, 5),
  vec3(1, 0, 0),
  vec3(0, Math.sqrt(2) / 2, -Math.sqrt(2) / 2),
  vec3(0, Math.sqrt(2) / 2, Math.sqrt(2) / 2),
);

var light1 = new Light(
  vec3(0, 0, 0),
  vec3(0, 1, -1),
  vec4(0.4, 0.4, 0.4, 1.0),
  vec4(1, 1, 1, 1),
  vec4(1, 1, 1, 1),
  0,
  0,
  1,
);

class Drawable {
  constructor(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh) {
    this.tx = tx;
    this.ty = ty;
    this.tz = tz;
    this.scale = scale;
    this.modelRotationX = rotX;
    this.modelRotationY = rotY;
    this.modelRotationZ = rotZ;
    this.updateModelMatrix();

    this.matAmbient = amb;
    this.matDiffuse = dif;
    this.matSpecular = sp;
    this.matAlpha = sh;
  }

  updateModelMatrix() {
    let t = translate(this.tx, this.ty, this.tz);

    let s = scale(this.scale, this.scale, this.scale);

    let rx = rotateX(this.modelRotationX);
    let ry = rotateY(this.modelRotationY);
    let rz = rotateZ(this.modelRotationZ);

    this.modelMatrix = mult(t, mult(s, mult(rz, mult(ry, rx))));
  }

  getModelMatrix() {
    return this.modelMatrix;
  }

  setModelMatrix(mm) {
    this.modelMatrix = mm;
  }
}

var plane;
var painting2;
var painting3;
var vase;
var spotlight;

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("WebGL 2.0 isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.enable(gl.DEPTH_TEST);

  window.addEventListener("keydown", (event) => {
    const step = 1;
    const key = event.key;
    camera.move(key, step);
  });

  var pos = vec3(0, 0, 0);
  var rot = vec3(0, 0, 0);
  var scale = 5.0;
  var amb = vec4(0.2, 0.2, 0.2, 1.0);
  var dif = vec4(0.6, 0.1, 0.0, 1.0);
  var spec = vec4(1.0, 1.0, 1.0, 1.0);
  var shine = 100.0;

  plane = new Plane(
    pos[0],
    pos[1],
    pos[2],
    scale,
    rot[0],
    rot[1],
    rot[2],
    amb,
    dif,
    spec,
    shine,
  );

  spotlight = new Spotlight(
    1.0, 1.0, -5.0,  // Position (tx, ty, tz)
    0.25,              // Scale (uniform scale factor)
    0.0, 0.0, 0.0,    // Rotation angles (rotX, rotY, rotZ)
    vec4(0.1, 0.1, 0.1, 1.0), // Ambient color (RGB)
    vec4(1.0, 1.0, 1.0, 1.0), // Diffuse color (RGB)
    vec4(1.0, 1.0, 1.0, 1.0), // Specular color (RGB)
    shine,              // Shininess coefficient
    "/textures/spotlight.jpg",  // Texture file path (optional)
    light1
);

  painting = new Painting(0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 32, "/paintings/mona_lisa.jpg");
  painting2 = new Painting(2, 1, 1, 1, 0, 0, 0, 1, 1, 1, 32, "/paintings/starry_night.jpg");
  painting3 = new Painting(-2, 1, 1, 1, 0, 0, 0, 1, 1, 1, 32, "/paintings/girl_with_pearl_earrings.jpg");
  vase = new Vase(-5, 1, 1, 1, 0, 0, 0, amb, dif, spec, shine, "/textures/vase_texture.png");
  render();
};

function render() {
  setTimeout(function () {
    requestAnimationFrame(render);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    plane.draw();
    painting.draw();
    painting2.draw();
    painting3.draw();
    vase.draw();
    spotlight.draw();
  }, 100); //10fps
}
