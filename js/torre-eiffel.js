import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* ------------------- Escena ------------------- */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
camera.position.set(15, 0, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.HemisphereLight(0xfffff, 0x222222, 1));
const dirLight = new THREE.DirectionalLight(0xffeeee, 35);
dirLight.position.set(5, 20, 5);
scene.add(dirLight);

/* ------------------- Sky ------------------- */
const skyGeo = new THREE.SphereGeometry(200, 40, 20);
skyGeo.scale(-1, 1, 1);
const skyTex = new THREE.TextureLoader().load("img/torre-eiffel-blur.png");
const skyMat = new THREE.MeshBasicMaterial({ map: skyTex });
const sky = new THREE.Mesh(skyGeo, skyMat);
sky.rotation.y = Math.PI / 0.55; // giro del fondo
sky.rotation.z = Math.PI / -0.55; // giro del fondo
scene.add(sky);

/* ------------------- GLTF loader ------------------- */
const gltfLoader = new GLTFLoader();
const loaderDiv = document.getElementById("global-loader");

gltfLoader.load("modelos/torre-eiffel.glb",
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.15,0.15,0.15);
    model.position.set(0,-7,0)
    scene.add(model);

    // 🔹 Ocultar loader cuando termina
    loaderDiv.style.display = "none";
  },
  (xhr) => {
    // 🔹 Progreso opcional (0–100%)
    if (xhr.total) {
      const percent = (xhr.loaded / xhr.total) * 100;
      loaderDiv.querySelector("p").innerText = `Cargando experiencia... ${percent.toFixed(0)}%`;
    }
  },
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
createDOMHotspot(0.5, 10, 0, "Cómo se desarrolló:", "Ubicada en Paris, Francia, fue construida entre 1887 y 1889 con motivo de la Exposición Universal de París, celebrada para conmemorar el centenario de la Revolución Francesa. Su levantamiento se completó en poco más de dos años, en un tiempo récord para su época.", 
"img/.jpeg", { sizePx: 80 });
createDOMHotspot(-6, 6, 0, "Autor", "Fue diseñada por el ingeniero Gustave Eiffel junto con los ingenieros Maurice Koechlin y Émile Nouguier, además del arquitecto Stephen Sauvestre, encargado de su aspecto estético.", 
"img/.jpeg", { sizePx: 80});
createDOMHotspot(4, 1, 0, "Definición artística", "Se considera un icono del arte y la arquitectura del hierro del siglo XIX, representando el triunfo de la ingeniería moderna y la estética industrial.", 
"img/.jpeg", { sizePx: 80 });
createDOMHotspot(-11, -4, 0, "Técnica", "La torre está formada por más de 18.000 piezas de hierro forjado unidas con 2,5 millones de remaches. Su diseño combina funcionalidad con ligereza visual, logrando una estructura sólida pero elegante.", 
"img/.jpeg", { sizePx: 80 });
createDOMHotspot(7, -4, 0, "Datos relevantes", "Al inaugurarse fue la construcción más alta del mundo con 300 metros, y aunque al inicio fue criticada, hoy es uno de los monumentos más visitados del planeta.", 
"img/.jpeg", { sizePx: 80 });

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
