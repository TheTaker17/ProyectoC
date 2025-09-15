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
camera.position.set(5, 3, 12); // alejamos un poco la cámara para ver mejor

// Renderizador (pantalla completa + fondo transparente)
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0); 
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight); // ocupa todo
document.body.style.margin = "0"; // quitamos margen del body
document.body.appendChild(renderer.domElement);

// Luces
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// Controles de órbita
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// 🔹 Hotspot (un punto blanco en el espacio)
const hotspotGeometry = new THREE.SphereGeometry(0.05, 16, 16);
const hotspotMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const hotspot = new THREE.Mesh(hotspotGeometry, hotspotMaterial);
hotspot.position.set(0, 1, 0); // posición en el modelo
scene.add(hotspot);

// 🔹 Cargar modelo GLB/GLTF
const loader = new GLTFLoader();
loader.load(
  "modelos/big-ben.glb", 
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.3, 0.3, 0.3); 
    model.position.set(0, -6, 0);
    scene.add(model);
    console.log("Modelo cargado con éxito:", model);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total * 100).toFixed(2) + "% cargado");
  },
  (error) => {
    console.error("Error cargando el modelo:", error);
  }
);

// 🔹 Ajuste dinámico al cambiar tamaño de ventana
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Evento click
window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([hotspot]);

  if (intersects.length > 0) {
    showPopup("Coliseo Romano", "Construido en el siglo I en Roma, fue uno de los mayores anfiteatros del Imperio Romano.", "img/coliseo-thumb.jpg");
  }
});

// Función para mostrar popup
function showPopup(title, description, img) {
  const popup = document.getElementById("popup");
  document.getElementById("popup-title").innerText = title;
  document.getElementById("popup-desc").innerText = description;
  document.getElementById("popup-img").src = img;
  popup.style.display = "block";
}

// Animación
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
