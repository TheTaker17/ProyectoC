import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* ------------------- Escena ------------------- */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
camera.position.set(12, 5, 10);

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
const skyTex = new THREE.TextureLoader().load("img/big-ben-blur.png");
const skyMat = new THREE.MeshBasicMaterial({ map: skyTex });
const sky = new THREE.Mesh(skyGeo, skyMat);
sky.rotation.y = Math.PI / 0.1;
sky.rotation.z = Math.PI / 0.1;
scene.add(sky);

/* ------------------- GLTF loader ------------------- */
const gltfLoader = new GLTFLoader();
const loaderDiv = document.getElementById("global-loader");

gltfLoader.load("modelos/big-ben.glb",
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.4,0.4,0.4);
    model.position.set(-2,-13,0);
    model.rotation.set(0,95,0);
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
createDOMHotspot(1, 8, 0, "Cómo se desarrolló", "La torre del reloj del Palacio de Westminster (Londres, Reino Unido))se completó en 1859 como parte de la reconstrucción del Palacio de Westminster tras un incendio en 1834. Su construcción duró 13 años.", 
"img/cards/big-ben/big-ben-1.jpg", { sizePx: 90 });
createDOMHotspot(-18, 4, 0, "Autor", "El diseño general fue obra del arquitecto Charles Barry, con detalles neogóticos aportados por Augustus Pugin. El mecanismo del reloj fue desarrollado por Edmund Beckett Denison y George Airy.", 
"img/cards/big-ben/big-ben-2.jpg", { sizePx: 90});
createDOMHotspot(4, 2, 0, "Definición artística", "Se enmarca en el estilo neogótico victoriano, caracterizado por su ornamentación, verticalidad y referencias a la Edad Media.", 
"img/cards/big-ben/big-ben-3.jpg", { sizePx: 90 });
createDOMHotspot(-18,-8,0, "Técnica", "La torre mide 96 metros y combina piedra, ladrillo y hierro fundido. El reloj tiene cuatro esferas de siete metros de diámetro cada una, accionadas por un mecanismo de gran precisión.", 
"img/cards/big-ben/big-ben-4.png", { sizePx: 90 });
createDOMHotspot(4,-4,0, "Datos relevantes", "“Big Ben” es en realidad el nombre de la gran campana de 13,7 toneladas, aunque con el tiempo se ha convertido en el apodo de toda la torre.", 
"img/cards/big-ben/big-ben-5.jpeg", { sizePx: 90 });


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
