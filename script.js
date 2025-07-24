import {
  FilesetResolver,
  PoseLandmarker
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.mjs";

const video = document.getElementById("webcam");
const modelViewer = document.getElementById("animalModel");

// Start webcam
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

// Load pose model
let poseLandmarker;
async function initPoseModel() {
  const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/pose_landmarker_lite.task`
    },
    runningMode: "VIDEO"
  });
}

let lastTime = 0;

async function detectPose() {
  const now = Date.now();
  if (!poseLandmarker || now - lastTime < 300) {
    requestAnimationFrame(detectPose);
    return;
  }

  const results = await poseLandmarker.detectForVideo(video, performance.now());
  const hasPerson = results?.landmarks?.length > 0;

  modelViewer.style.display = hasPerson ? "block" : "none";
  lastTime = now;
  requestAnimationFrame(detectPose);
}

// Initialize all
(async () => {
  await setupCamera();
  await initPoseModel();
  detectPose();
})();
