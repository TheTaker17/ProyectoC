import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"; 

// Escena
const scene = new THREE.Scene();

// Cámara
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 3, 12);

// Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0); 
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = "0";
document.body.appendChild(renderer.domElement);

// Luces
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// Controles
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Raycaster y mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Lista de objetos interactivos
const clickableObjects = [];

// Hotspot como Sprite
const textureLoader = new THREE.TextureLoader();
const iconTexture = textureLoader.load("img/ojo.png");

const spriteMaterial = new THREE.SpriteMaterial({
  map: iconTexture,
  transparent: true,
  depthTest: false // siempre visible
});

const hotspot = new THREE.Sprite(spriteMaterial);
hotspot.scale.set(1.5, 1.5, 1.5);
hotspot.position.set(5, 3, 0);
scene.add(hotspot);

// Área invisible para clics
const hitAreaGeometry = new THREE.SphereGeometry(1.2, 16, 16);
const hitAreaMaterial = new THREE.MeshBasicMaterial({ visible: false });
const hitArea = new THREE.Mesh(hitAreaGeometry, hitAreaMaterial);
hitArea.position.copy(hotspot.position);

// Sincronizar tamaño con sprite
hitArea.scale.set(hotspot.scale.x, hotspot.scale.y, hotspot.scale.x);
scene.add(hitArea);

// Añadir a lista de clickeables
clickableObjects.push(hitArea);

// 🔹 Detectar hover en PC
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableObjects);

  document.body.style.cursor = intersects.length > 0 ? "pointer" : "default";
});

// 🔹 Función común para clicks y toques
function handleInteraction(x, y) {
  mouse.x = (x / window.innerWidth) * 2 - 1;
  mouse.y = -(y / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableObjects);

  if (intersects.length > 0) {
    showPopup(
      "Stonehenge", 
      "Monumento megalítico en Inglaterra, construido entre el 3000 y el 2000 a.C.",
      "img/stonehenge.jpeg"
    );
  }
}

// Evento click (PC)
window.addEventListener("click", (event) => {
  handleInteraction(event.clientX, event.clientY);
});

// Evento touch (Móviles)
window.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];
  handleInteraction(touch.clientX, touch.clientY);
});

// ================= LOADER GLOBAL (solo modelo) =================

// Contador de recursos iniciales
let totalToLoad = 1; // solo el modelo
let loaded = 0;
let loaderClosed = false;

function checkAllLoaded() {
  if (loaderClosed) return;
  loaded++;
  if (loaded >= totalToLoad) {
    document.getElementById("global-loader").classList.add("hidden");
    loaderClosed = true;
  }
}

// Cargar modelo GLB/GLTF
const loader = new GLTFLoader();
loader.load(
  "modelos/stonehenge.glb", 
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.7, 0.7, 0.7);
    scene.add(model);
    console.log("Modelo cargado");
    checkAllLoaded(); // ✅ modelo listo
  },
  (xhr) => {
    // opcional: progreso de carga
    let percent = (xhr.loaded / xhr.total) * 100;
    console.log(percent.toFixed(2) + "% cargado");
  },
  (error) => console.error("Error cargando el modelo:", error)
);

// Popup
function showPopup(title, description, img) {
  const popup = document.getElementById("popup");
  const popupImg = document.getElementById("popup-img");

  document.getElementById("popup-title").innerText = title;
  document.getElementById("popup-desc").innerText = description;

  popup.classList.remove("show");
  popup.style.display = "block";

  popupImg.src = img;

  setTimeout(() => popup.classList.add("show"), 5);
}

function closePopup() {
  const popup = document.getElementById("popup");
  popup.classList.remove("show");
  setTimeout(() => (popup.style.display = "none"), 300);
}

// Responsivo
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animación
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
