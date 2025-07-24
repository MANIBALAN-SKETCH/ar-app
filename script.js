import {
  FilesetResolver,
  PoseLandmarker
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.mjs";

const video = document.getElementById("webcam");
const modelViewer = document.getElementById("model-viewer");

// Start webcam
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => resolve(video);
  });
}

let poseLandmarker;

async function initPoseDetection() {
  const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/pose_landmarker_lite.task`
    },
    runningMode: "VIDEO"
  });
}

let lastDetection = 0;

async function detect() {
  const now = Date.now();
  if (!poseLandmarker || !video.videoWidth) {
    requestAnimationFrame(detect);
    return;
  }

  const results = poseLandmarker.detectForVideo(video, performance.now());
  const hasPerson = results?.landmarks?.length > 0;

  // Toggle 3D model visibility
  modelViewer.style.display = hasPerson ? "block" : "none";

  requestAnimationFrame(detect);
}

(async () => {
  await startCamera();
  await initPoseDetection();
  detect();
})();
