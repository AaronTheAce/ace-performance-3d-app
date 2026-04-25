// ACE Performance 3D App
// Original implementation by Aaron W-G
//
// Generative AI was used only in an assistive capacity in line with module guidance,
// specifically for debugging non-working code, troubleshooting Three.js issues,
// and explaining technical concepts. All final code was manually reviewed,
// edited, tested and integrated by me, the author :)


import * as THREE from "https://esm.sh/three@0.161.0";
import { GLTFLoader } from "https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";

let scene, camera, renderer;
let currentModel = null;
let spotlight = null;
let wireframeEnabled = false;

const models = {
  protein_tub: "models/protein_tub.glb",
  prevail_tub: "models/prevail_tub.glb",
  shaker: "models/shaker.glb"
};

const modelDescriptions = {
  protein_tub: "ACE Protein: a high-protein supplement tub aimed at strength athletes.",
  prevail_tub: "PRE-VAIL: a graffiti-inspired pre-workout tub designed to represent a more aggressive, energetic product line.",
  shaker: "ACE Shaker Bottle: a reusable shaker used to mix pre-workout and protein shakes."
};

init();
animate();

// AI-assisted troubleshooting used to understand Three.js lighting,
// shadows and scene visibility settings.
// Finalised values by the me.
function init() {
  const container = document.getElementById("viewer");
  if (!container) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);
  const aspect = container.clientWidth / container.clientHeight;
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
  camera.position.set(0, 1.5, 4);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 1.4);
  scene.add(ambient);

  spotlight = new THREE.SpotLight(0xffffff, 1.9);
  spotlight.position.set(3, 5, 3);
  spotlight.castShadow = true;
  spotlight.angle = Math.PI / 6;
  spotlight.penumbra = 0.3;
  scene.add(spotlight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(-3, 4, 2);
  scene.add(directionalLight);

  const planeGeo = new THREE.PlaneGeometry(10, 10);
  const planeMat = new THREE.MeshStandardMaterial({ color: 0x303030, roughness: 1 });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0;
  plane.receiveShadow = true;
  scene.add(plane);

  loadModel("protein_tub");
  setupUI();
  window.addEventListener("resize", onWindowResize);
}

function disposeMaterial(material) {
  if (!material) return;

  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
    return;
  }

  if (material.map) material.map.dispose();
  if (material.normalMap) material.normalMap.dispose();
  if (material.roughnessMap) material.roughnessMap.dispose();
  if (material.metalnessMap) material.metalnessMap.dispose();
  if (material.alphaMap) material.alphaMap.dispose();
  material.dispose();
}

// AI-assisted debugging used during development to diagnose GLB loading,
// material visibility, and model rendering issues.
// Final loader logic and integration completed manually by myself.
function loadModel(key) {
  const path = models[key];
  if (!path) return;

  if (currentModel) {
    scene.remove(currentModel);
    currentModel.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose();
        disposeMaterial(child.material);
      }
    });
    currentModel = null;
  }

  const loader = new GLTFLoader();

  loader.load(
    path,
    (gltf) => {
      currentModel = gltf.scene;

      currentModel.traverse((child) => {
        if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.wireframe = wireframeEnabled;

              if (child.name.toLowerCase().includes("label")) {
                mat.side = THREE.FrontSide;
              } else {
                mat.side = THREE.DoubleSide;
              }
            });

    } else if (child.material) {
      child.material.wireframe = wireframeEnabled;

      if (child.name.toLowerCase().includes("label")) {
        child.material.side = THREE.FrontSide;
      } else {
        child.material.side = THREE.DoubleSide;
      }
    }
  }
});

      const box = new THREE.Box3().setFromObject(currentModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      currentModel.position.x -= center.x;
      currentModel.position.y -= box.min.y;
      currentModel.position.z -= center.z;

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.6 / maxDim;
      currentModel.scale.setScalar(scale);
      currentModel.rotation.y = Math.PI;

      currentModel.rotation.y = Math.PI;

      scene.add(currentModel);

      const descEl = document.getElementById("model-description");
      if (descEl && modelDescriptions[key]) {
        descEl.textContent = modelDescriptions[key];
      }
    },
    undefined,
    (error) => {
      console.error("Error loading model:", error);
    }
  );
}

function setupUI() {
  document.querySelectorAll("button[data-model]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-model");
      loadModel(key);
    });
  });

  const wireBtn = document.getElementById("btn-wireframe");
  if (wireBtn) {
    wireBtn.addEventListener("click", () => {
      wireframeEnabled = !wireframeEnabled;

      if (!currentModel) return;

      currentModel.traverse((child) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.wireframe = wireframeEnabled;
            });
          } else {
            child.material.wireframe = wireframeEnabled;
          }
        }
      });
    });
  }

  const lightBtn = document.getElementById("btn-toggle-light");
  if (lightBtn) {
    lightBtn.addEventListener("click", () => {
      if (spotlight) spotlight.visible = !spotlight.visible;
    });
  }

  const cameraPositions = [
    { x: 0, y: 1.5, z: 4 },
    { x: 3, y: 2, z: 2 },
    { x: 0, y: 3.5, z: 0.5 },
    { x: -3, y: 2, z: 2 }
  ];

  let camIndex = 0;
  const camBtn = document.getElementById("btn-next-camera");
  if (camBtn) {
    camBtn.addEventListener("click", () => {
      camIndex = (camIndex + 1) % cameraPositions.length;
      const pos = cameraPositions[camIndex];
      camera.position.set(0, 1.35, 4.6);
      camera.lookAt(0, 0.95, 0);
    });
  }

  const spinBtn = document.getElementById("btn-spin");
  if (spinBtn) {
    spinBtn.addEventListener("click", () => {
      if (!currentModel) return;

      let spinsLeft = 180;
      const spinStep = () => {
        if (!currentModel || spinsLeft <= 0) return;
        currentModel.rotation.y += THREE.MathUtils.degToRad(5);
        spinsLeft -= 5;
        requestAnimationFrame(spinStep);
      };
      spinStep();
    });
  }
}

function onWindowResize() {
  const container = document.getElementById("viewer");
  if (!container) return;

  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}