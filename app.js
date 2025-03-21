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
    this.isFPS = true;

    this.fpsVrp = vec3(vrp[0], vrp[1], vrp[2]);
    this.fpsU = vec3(this.u[0], this.u[1], this.u[2]);
    this.fpsV = vec3(this.v[0], this.v[1], this.v[2]);
    this.fpsN = vec3(this.n[0], this.n[1], this.n[2]);
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

  changeView() {
    // switch to a static surveillance camera
    if (!this.isFPS) {
      console.log("surveillance");
      this.vrp = vec3(3, 3, 5);

      this.n = normalize(vec3(1, 1, 2));
      this.v = normalize(vec3(0, 1, 0));
      this.u = normalize(cross(this.v, this.n));

      this.v = normalize(cross(this.n, this.u));
    } else {
      // restore to fps camera
      this.vrp = vec3(this.fpsVrp[0], this.fpsVrp[1], this.fpsVrp[2]);
      this.u = vec3(this.fpsU[0], this.fpsU[1], this.fpsU[2]);
      this.v = vec3(this.fpsV[0], this.fpsV[1], this.fpsV[2]);
      this.n = vec3(this.fpsN[0], this.fpsN[1], this.fpsN[2]);
    }

    this.updateCameraMatrix();
  }

  move(key, step) {
    // change view if 'o' is pressed
    if (key === "o") {
      this.isFPS = !this.isFPS;
      this.changeView();
    }

    if (this.isFPS) {
      switch (key) {
        case "w":
          this.vrp = add(this.vrp, scale(-step, this.n));
          break;
        case "a":
          this.vrp = add(this.vrp, scale(-step, this.u));
          break;
        case "s":
          this.vrp = add(this.vrp, scale(step, this.n));
          break;
        case "d":
          this.vrp = add(this.vrp, scale(step, this.u));
          break;
        case "j":
          this.rotateView(this.v, -10);
          break;
        case "l":
          this.rotateView(this.v, 10);
          break;
      }
    }

    this.updateCameraMatrix();
  }
}

var camera = new Camera(
  vec3(0, 1.5, 10),
  vec3(1, 0, 0),
  vec3(0, 1, 0),
  vec3(0, 0, 1),
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

var monaLisa;
var starryNight;
var girl;
var scream;

var vase;
var vase2;

var spotlight;

var wallLeft;
var wallRight;
var wallBack;
var ceiling;
var floor;

var dogObj;
var spotlightObj;

var sky;

var mirror;

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

    if (key.toLowerCase() === "") {
      console.log("HI");
    } else {
      camera.move(key.toLowerCase(), step);
    }
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
    20,
    rot[0],
    rot[1],
    rot[2],
    amb,
    dif,
    spec,
    shine,
  );

  floor = new Floor(0, 0.001, 0, 2.2, 0, 0, 0, amb, dif, spec, shine);

  spotlight = new Spotlight(
    0,
    3,
    0,
    0.25,
    0,
    0,
    0,
    vec4(0.1, 0.1, 0.1, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0),
    shine,
    "/textures/spotlight.jpg",
    light1,
  );

  wallLeft = new Wall(
    -4.5,
    0,
    4,
    1,
    0,
    0,
    0,
    vec4(0.2, 0.2, 0.2, 1.0),
    vec4(0.6, 0.1, 0.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0),
    100.0,
  );

  wallRight = new Wall(
    4,
    0,
    4,
    1,
    0,
    0,
    0,
    vec4(0.2, 0.2, 0.2, 1.0),
    vec4(0.6, 0.1, 0.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0),
    100.0,
  );

  wallBack = new Wall(
    4,
    0,
    -4,
    0.9,
    0,
    90,
    0,
    vec4(0.2, 0.2, 0.2, 1.0),
    vec4(0.6, 0.1, 0.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0),
    100.0,
  );

  ceiling = new Ceiling(
    0,
    0,
    3,
    1,
    0,
    0,
    0,
    vec4(0.2, 0.2, 0.2, 1.0),
    vec4(0.6, 0.1, 0.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0),
    100.0,
  );

  monaLisa = new Painting(
    -4,
    1.8,
    2,
    1,
    0,
    -90,
    0,
    1,
    1,
    1,
    32,
    "/paintings/mona_lisa.jpg",
  );

  starryNight = new Painting(
    4,
    1.8,
    2,
    1,
    0,
    -90,
    0,
    1,
    1,
    1,
    32,
    "/paintings/starry_night.jpg",
  );

  scream = new Painting(
    4,
    1.8,
    -2,
    1,
    0,
    -90,
    0,
    1,
    1,
    1,
    32,
    "/paintings/the-scream.jpg",
  );

  girl = new Painting(
    -4,
    1.8,
    -2,
    1,
    0,
    -90,
    0,
    1,
    1,
    1,
    32,
    "/paintings/girl_with_pearl_earrings.jpg",
  );

  vase = new Vase(
    -3,
    0.5,
    0,
    0.5,
    0,
    0,
    0,
    amb,
    dif,
    spec,
    shine,
    "/textures/vase_texture.png",
  );

  vase2 = new Vase(
    3,
    0.5,
    0,
    0.5,
    0,
    0,
    0,
    amb,
    dif,
    spec,
    shine,
    "/textures/vase_texture.png",
  );

  dogObj = new OBJModel("/models/dog.obj");
  dogObj.initializeTexture("/textures/checker.jpeg");

  sky = new Sky(0, 0, 0, 50, 0, -45, 0, amb, dif, spec, shine);

  mirror = new Mirror(
    0,
    2,
    -3.99,
    1.3,
    0,
    0,
    0,
    vec4(0.1, 0.1, 0.1, 1.0),
    vec4(0.1, 0.1, 0.1, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0),
    200.0,
  );

  render();
};

function render() {
  setTimeout(function () {
    requestAnimationFrame(render);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // outdoor ground
    plane.draw();

    // paintings
    monaLisa.draw();
    starryNight.draw();
    girl.draw();
    scream.draw();

    // decor
    dogObj.rotationAngle = -5.0;
    vase.draw();
    vase2.draw();
    spotlight.draw();
    dogObj.draw(camera);

    // art gallery room
    wallLeft.draw();
    wallRight.draw();
    wallBack.draw();
    ceiling.draw();
    floor.draw();

    // skybox
    sky.draw();

    // advanced mapping mirror
    mirror.draw();
  }, 100); //10fps
}
