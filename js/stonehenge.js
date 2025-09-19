import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* ------------------- Escena ------------------- */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
camera.position.set(15, 10, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

/* ------------------- Sky ------------------- */
const skyGeo = new THREE.SphereGeometry(200, 40, 20);
skyGeo.scale(-1, 1, 1);
const skyTex = new THREE.TextureLoader().load("img/stonehenge-blur.png");
const skyMat = new THREE.MeshBasicMaterial({ map: skyTex });
const sky = new THREE.Mesh(skyGeo, skyMat);
scene.add(sky);

/* ------------------- GLTF loader ------------------- */
const gltfLoader = new GLTFLoader();
gltfLoader.load("modelos/.glb",
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.7,0.7,0.7);
    scene.add(model);
  },
  undefined,
  (err) => console.error(err)
);

/* ---------- referencia al popup del HTML ---------- */
const popup = document.getElementById("popup");

/* ---------- Hotspot data ---------- */
const domHotspots = []; // { anchor, el, info, options }

function createDOMHotspot(x,y,z, title, desc, img, options = {}) {
  const anchor = new THREE.Object3D();
  anchor.position.set(x,y,z);
  scene.add(anchor);

  const el = document.createElement("div");
  el.className = "dom-hotspot";
  el.innerHTML = `<div class="dot"><div class="eye"></div></div>`;

  if (options.sizePx) {
    el.querySelector(".dot").style.width = `${options.sizePx}px`;
    el.querySelector(".dot").style.height = `${options.sizePx}px`;
  }

  el.addEventListener("click", (e) => {
    e.stopPropagation();
    showPopupAtScreen(title, desc, img);
  });

  document.body.appendChild(el);
  domHotspots.push({ anchor, el, info: { title, desc, img }, options });
  return { anchor, el };
}

/* ---------- proyección 3D -> 2D ---------- */
function updateHotspotScreenPosition(h) {
  const wpos = new THREE.Vector3();
  h.anchor.getWorldPosition(wpos);
  const proj = wpos.clone().project(camera);

  if (proj.z > 1 || proj.z < -1) {
    h.el.style.display = "none";
    return;
  }

  const x = (proj.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-proj.y * 0.5 + 0.5) * window.innerHeight;

  h.el.style.display = "block";
  h.el.style.left = `${x}px`;
  h.el.style.top = `${y}px`;

  if (h.options && h.options.scaleWithDistance) {
    const dist = camera.position.distanceTo(wpos);
    const scale = THREE.MathUtils.clamp(1 / (dist * 0.09), 0.45, 1.2);
    h.el.style.transform = `translate(-50%,-50%) scale(${scale})`;
  } else {
    h.el.style.transform = `translate(-50%,-50%)`;
  }
}

function showPopupAtScreen(title, desc, img) {
  document.getElementById("popup-title").innerText = title || "";
  document.getElementById("popup-desc").innerText = desc || "";

  const pimg = document.getElementById("popup-img");
  if (img) {
    pimg.src = img;
    pimg.style.display = "block";
  } else {
    pimg.style.display = "none";
  }

  // Forzar display antes de animar
  popup.style.display = "block";
  setTimeout(() => popup.classList.add("show"), 10);
}

document.getElementById("popup-close").addEventListener("click", () => {
  popup.classList.remove("show");
  setTimeout(() => { popup.style.display = "none"; }, 400); // esperar la animación
});


/* ---------- Hotspots ---------- */
createDOMHotspot(5, 0, 0, "Stonehenge", "Monumento megalítico en Inglaterra.", "img/stonehenge.jpeg", { sizePx: 150, scaleWithDistance: true });
createDOMHotspot(2, 0, 0, "Punto B", "Otra info", "img/stonehenge.jpeg", { sizePx: 56 });
createDOMHotspot(-6, 0, 0, "Punto C", "Más info", "img/stonehenge.jpeg", { sizePx: 80 });

/* ---------- resize ---------- */
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
});

/* ---------- animación ---------- */
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  for (const h of domHotspots) updateHotspotScreenPosition(h);
  renderer.render(scene, camera);
}
animate();
