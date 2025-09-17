import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"; 

// ================= ESCENA =================
const scene = new THREE.Scene();

// ================= CÁMARA =================
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 3, 12);

// ================= RENDER =================
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0); 
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = "0";
document.body.appendChild(renderer.domElement);

// ================= LUCES =================
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// ================= CONTROLES =================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ================= RAYCASTER =================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// ================= HOTSPOTS =================
const clickableObjects = [];
const hotspots = [];

// Función para crear un hotspot
function createHotspot(position, title, description, img) {
  const textureLoader = new THREE.TextureLoader();
  const iconTexture = textureLoader.load("img/ojo.png");

  const spriteMaterial = new THREE.SpriteMaterial({
    map: iconTexture,
    transparent: true,
    depthTest: false // siempre visible
  });

  const hotspot = new THREE.Sprite(spriteMaterial);
  hotspot.scale.set(1.5, 1.5, 1.5);
  hotspot.position.copy(position);

  // Guardamos info dentro del objeto
  hotspot.userData = { title, description, img };

  scene.add(hotspot);
  clickableObjects.push(hotspot);
  hotspots.push(hotspot);
}

// Ejemplos de hotspots
createHotspot(
  new THREE.Vector3(5, 3, 0),
  "Stonehenge",
  "Monumento megalítico en Inglaterra, construido entre el 3000 y el 2000 a.C.",
  "img/stonehenge.jpeg"
);

createHotspot(
  new THREE.Vector3(-3, 2, 2),
  "Pirámide de Giza",
  "La pirámide más antigua y grande de Egipto.",
  "img/piramide.jpeg"
);

createHotspot(
  new THREE.Vector3(0, 4, -5),
  "Machu Picchu",
  "Antigua ciudad inca ubicada en los Andes peruanos.",
  "img/machu.jpeg"
);

// ================= FONDO ESFÉRICO =================
const geometry = new THREE.SphereGeometry(500, 60, 40);
geometry.scale(-1, 1, 1); // Invertir normales para ver desde dentro
const texture = new THREE.TextureLoader().load("img/stonehenge-blur.png");
const material = new THREE.MeshBasicMaterial({ map: texture });
const sky = new THREE.Mesh(geometry, material);
scene.add(sky);

// ================= INTERACCIÓN =================
// Hover (PC)
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableObjects);

  document.body.style.cursor = intersects.length > 0 ? "pointer" : "default";
});

// Click o toque
function handleInteraction(x, y) {
  mouse.x = (x / window.innerWidth) * 2 - 1;
  mouse.y = -(y / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableObjects);

  if (intersects.length > 0) {
    const hotspotData = intersects[0].object.userData;
    showPopup(hotspotData.title, hotspotData.description, hotspotData.img);
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

// ================= CARGA MODELO =================
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

// ================= ANIMACIÓN =================
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
