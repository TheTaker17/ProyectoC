import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* ------------------- Escena ------------------- */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
camera.position.set(12, 7, 10);

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
sky.rotation.y = Math.PI / 0.7;
sky.rotation.y = Math.PI / 0.8; // giro del fondo
scene.add(sky);

/* ------------------- GLTF loader ------------------- */
const gltfLoader = new GLTFLoader();
const loaderDiv = document.getElementById("global-loader");

gltfLoader.load("modelos/stonehenge.glb",
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.75,0.75,0.75);
    model.position.set(-5,0,0)
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
createDOMHotspot(-20, 1, 0, "Cómo se desarrolló", "Stonehenge o en español “circulo de piedras“ ubicado 13 kilómetros al norte de la ciudad de Salisbury en Renido Unido, fue construido en varias fases entre el 3000 y 2000 a.C., en la llanura de Salisbury. Se cree que implicó complejas tareas de transporte y alineación de piedras enormes.", 
"img/cards/stonehenge/stonehenge-1.jpg", { sizePx: 80,});
createDOMHotspot(1, -6, 0, "Autor", "No se conoce un autor específico, ya que fue obra de distintas comunidades prehistóricas que transmitieron conocimientos de generación en generación.", 
"img/cards/stonehenge/stonehenge-2.jpg", { sizePx: 80 });
createDOMHotspot(5, 5, 0, "Definición artística", "Se considera un ejemplo de arquitectura megalítica ceremonial, donde el arte se mezcla con la espiritualidad y la astronomía.", 
"img/cards/stonehenge/stonehenge-3.jpg", { sizePx: 80 });
createDOMHotspot(9, 2, 0, "Técnica", "Consiste en círculos concéntricos de piedras gigantes (sarsens y bluestones), algunas de más de 25 toneladas, colocadas mediante sistemas de encaje y alineadas con fenómenos solares.", 
"img/cards/stonehenge/stonehenge-4.jpeg", { sizePx: 80 });
createDOMHotspot(-65, -30, 0, "Datos relevantes", "Se piensa que fue un centro de rituales religiosos y observaciones astronómicas, en particular relacionadas con los solsticios y equinoccios.", 
"img/cards/stonehenge/stonehenge-5.jpg", { sizePx: 80 });

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
