/**
 * Translated from http://mrdoob.github.com/three.js/examples/webgl_postprocessing.html
 * @author alteredq
 */
var camera, scene, renderer, composer;
var object, light;
var dsEffect;

var THREE = require('three')
  , EffectComposer = require('./')(THREE)

THREE.DotScreenShader = {
  uniforms: {
    "tDiffuse": { type: "t", value: null },
    "tSize":    { type: "v2", value: new THREE.Vector2( 256, 256 ) },
    "center":   { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },
    "angle":    { type: "f", value: 1.57 },
    "scale":    { type: "f", value: 1.0 }
  },
  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n"),
  fragmentShader: [
    "uniform vec2 center;",
    "uniform float angle;",
    "uniform float scale;",
    "uniform vec2 tSize;",
    "uniform sampler2D tDiffuse;",
    "varying vec2 vUv;",
    "float pattern() {",
      "float s = sin( angle ), c = cos( angle );",
      "vec2 tex = vUv * tSize - center;",
      "vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;",
      "return ( sin( point.x ) * sin( point.y ) ) * 4.0;",
    "}",
    "void main() {",
      "vec4 color = texture2D( tDiffuse, vUv );",
      "float average = ( color.r + color.g + color.b ) / 3.0;",
      "gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );",
    "}"
  ].join("\n")
};

THREE.RGBShiftShader = {
  uniforms: {
    "tDiffuse": { type: "t", value: null },
    "amount":   { type: "f", value: 0.005 },
    "angle":    { type: "f", value: 0.0 }
  },
  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n"),
  fragmentShader: [
    "uniform sampler2D tDiffuse;",
    "uniform float amount;",
    "uniform float angle;",
    "varying vec2 vUv;",
    "void main() {",
      "vec2 offset = amount * vec2( cos(angle), sin(angle));",
      "vec4 cr = texture2D(tDiffuse, vUv + offset);",
      "vec4 cga = texture2D(tDiffuse, vUv);",
      "vec4 cb = texture2D(tDiffuse, vUv - offset);",
      "gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);",
    "}"
  ].join("\n")
};



init();
animate();

function init() {

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 400;

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0x000000, 1, 1000 );

  object = new THREE.Object3D();
  scene.add( object );

  var geometry = new THREE.SphereGeometry( 1, 4, 4 );
  var material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );

  for ( var i = 0; i < 100; i ++ ) {

    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ).normalize();
    mesh.position.multiplyScalar( Math.random() * 400 );
    mesh.rotation.set( Math.random() * 2, Math.random() * 2, Math.random() * 2 );
    mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
    object.add( mesh );

  }

  scene.add( new THREE.AmbientLight( 0x222222 ) );

  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 );
  scene.add( light );

  // postprocessing

  composer = new EffectComposer( renderer );
  composer.addPass( new EffectComposer.RenderPass( scene, camera ) );

  dsEffect = new EffectComposer.ShaderPass( THREE.DotScreenShader );
  composer.addPass( dsEffect );

  var effect = new EffectComposer.ShaderPass( THREE.RGBShiftShader );
  effect.uniforms[ 'amount' ].value = 0.0015;
  effect.renderToScreen = true;
  composer.addPass( effect );

  window.addEventListener( 'resize', onWindowResize, false );
  onWindowResize();

}

function onWindowResize() {

  var w = window.innerWidth;
  var h = window.innerHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize( w, h );
  composer.setSize( w, h );

  //some passes need screen resolution passed in
  dsEffect.uniforms.tSize.value = new THREE.Vector2(w,h);

}

function animate() {

  requestAnimationFrame( animate );

  var time = Date.now();

  object.rotation.x += 0.005;
  object.rotation.y += 0.01;

  composer.render();

}