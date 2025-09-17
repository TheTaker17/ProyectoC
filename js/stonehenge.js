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

// Raycaster + mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Lista de hotspots
const hotspots = [];

// Crear un hotspot (sprite) con datos
function createHotspot(x, y, z, title, description, img) {
  const textureLoader = new THREE.TextureLoader();
  const iconTexture = textureLoader.load("img/ojo.png");

  const spriteMaterial = new THREE.SpriteMaterial({
    map: iconTexture,
    transparent: true,
    depthTest: false
  });

  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(1.5, 1.5, 1.5);
  sprite.position.set(x, y, z);

  // Guardar info para el popup
  sprite.userData = { title, description, img };

  scene.add(sprite);
  hotspots.push(sprite);
}

// Ejemplo: varios hotspots
createHotspot(5, 3, 0, "Stonehenge",
  "Monumento megalítico en Inglaterra, construido entre el 3000 y el 2000 a.C.",
  "img/stonehenge.jpeg"
);

createHotspot(2, 1, -3, "Otro punto",
  "Descripción de ejemplo para otro hotspot.",
  "img/stonehenge.jpeg"
);

createHotspot(-6, 2, 0, "Stonehenge",
  "Monumento megalítico en Inglaterra, construido entre el 3000 y el 2000 a.C.",
  "img/stonehenge.jpeg"
);

// Fondo Modelo
const geometry = new THREE.SphereGeometry(500, 60, 40);
geometry.scale(-1, 1, 1);
const texture = new THREE.TextureLoader().load("img/stonehenge-blur.png");
const material = new THREE.MeshBasicMaterial({ map: texture });
const sky = new THREE.Mesh(geometry, material);
scene.add(sky);

// ================= INTERACCIÓN =================
// Hover con raycaster
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(hotspots);

  document.body.style.cursor = intersects.length > 0 ? "pointer" : "default";
});

// Click / Touch
function handleInteraction(clientX, clientY) {
  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(hotspots);

  if (intersects.length > 0) {
    const { title, description, img } = intersects[0].object.userData;
    showPopup(title, description, img);
  }
}

window.addEventListener("click", (event) => {
  handleInteraction(event.clientX, event.clientY);
});

window.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];
  handleInteraction(touch.clientX, touch.clientY);
});

// ================= LOADER GLOBAL =================
let totalToLoad = 1;
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
    checkAllLoaded();
  },
  (xhr) => {
    let percent = (xhr.loaded / xhr.total) * 100;
    console.log(percent.toFixed(2) + "% cargado");
  },
  (error) => console.error("Error cargando el modelo:", error)
);

// ================= POPUP =================
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

// ================= RESPONSIVO =================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ================= LOOP =================
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
