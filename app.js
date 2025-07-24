import {
  FilesetResolver,
  PoseLandmarker
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.mjs";

// ====== Setup Webcam =======
const video = document.getElementById("webcam");
const constraints = { video: { facingMode: "user" }, audio: false };
const stream = await navigator.mediaDevices.getUserMedia(constraints);
video.srcObject = stream;
await video.play();

// ====== Setup Three.js =======
const canvas = document.getElementById("webgl-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const light = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
scene.add(light);

let model;
const loader = new THREE.GLTFLoader();
loader.load("model.glb", (gltf) => {
  model = gltf.scene;
  model.scale.set(1.5, 1.5, 1.5);
  model.position.set(0, -1.5, 0);
  model.visible = false; // Start hidden
  scene.add(model);
});

// ====== Setup MediaPipe Pose Detection =======
const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/pose_landmarker_lite.task"
  },
  runningMode: "VIDEO"
});

let lastDetectionTime = 0;

function detectPose() {
  const currentTime = performance.now();
  if (!poseLandmarker || !video.videoWidth) return;

  const results = poseLandmarker.detectForVideo(video, currentTime);
  const personDetected = results?.landmarks?.length > 0;

  if (model) {
    model.visible = personDetected;
  }
}

// ====== Render Loop =======
function animate() {
  requestAnimationFrame(animate);
  detectPose();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
