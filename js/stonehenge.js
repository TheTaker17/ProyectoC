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
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = "0";
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

// 🔹 Hotspot como Sprite en lugar de esfera
const textureLoader = new THREE.TextureLoader();
const iconTexture = textureLoader.load("img/ojo.png"); // pon tu icono PNG aquí

const spriteMaterial = new THREE.SpriteMaterial({
  map: iconTexture,
  transparent: true,
  depthTest: false // 👈 asegura que siempre esté visible
});

const hotspot = new THREE.Sprite(spriteMaterial);
hotspot.scale.set(1.5, 1.5, 1.5); // tamaño del icono
hotspot.position.set(0, 3, 0); // posición sobre el modelo
scene.add(hotspot);

// 🔹 Área invisible más grande para clics
const hitAreaGeometry = new THREE.SphereGeometry(2, 16, 16);
const hitAreaMaterial = new THREE.MeshBasicMaterial({ visible: false });
const hitArea = new THREE.Mesh(hitAreaGeometry, hitAreaMaterial);
hitArea.position.copy(hotspot.position);
scene.add(hitArea);


// Cargar modelo GLB/GLTF
const loader = new GLTFLoader();
loader.load(
  "modelos/stonehenge.glb", 
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.7, 0.7, 0.7); 
    model.position.set(0, 0, 0);
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

// Ajuste dinámico al cambiar tamaño de ventana
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Evento click Pop Up
window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([hitArea]); //

  if (intersects.length > 0) {
    showPopup(
      "Coliseo Romano", 
      "Construido en el siglo I en Roma, fue uno de los mayores anfiteatros del Imperio Romano.", 
      "img/stonehenge.jpeg"
    );
  }
});

// Mostrar Pop Up
function showPopup(title, description, img) {
  const popup = document.getElementById("popup");
  document.getElementById("popup-title").innerText = title;
  document.getElementById("popup-desc").innerText = description;
  document.getElementById("popup-img").src = img;

  // Reinicia animación
  popup.classList.remove("show");
  popup.style.display = "block";

  // Delay mínimo para forzar que el navegador procese el cambio
  setTimeout(() => popup.classList.add("show"), 5);
}

// Cerrar Pop Up
function closePopup() {
  const popup = document.getElementById("popup");
  popup.classList.remove("show");

  setTimeout(() => {
    popup.style.display = "none";
  }, 300); // coincide con la transición
}

// Animación
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
