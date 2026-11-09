
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

// LITTLE BOX OF CHAOS — CAIXA COM LAÇO

// CENA
const scene = new THREE.Scene();
scene.background = new THREE.Color("#faf7fc");

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(6, 5, 9);

const container = document.getElementById("scene-container");
const hint = document.getElementById("hint");

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

container.appendChild(renderer.domElement);

// LUZES
scene.add(new THREE.HemisphereLight("#ffffff", "#cbb4dc", 1.6));

const light = new THREE.DirectionalLight("#ffffff", 2.5);
light.position.set(5, 9, 7);
light.castShadow = true;
light.shadow.mapSize.set(2048, 2048);
light.shadow.camera.left = -10;
light.shadow.camera.right = 10;
light.shadow.camera.top = 10;
light.shadow.camera.bottom = -10;
scene.add(light);

const fill = new THREE.DirectionalLight("#f5d8ff", 0.8);
fill.position.set(-5, 4, -3);
scene.add(fill);

// MATERIAIS
function material(color, roughness = 0.85) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0
  });
}

const lavender = material("#c7a5e3");
const inside = material("#b896d5");
const lidMat = material("#b894d9");
const lidTop = material("#d4b8ed");
const pink = material("#e9a4c5");
const darkPink = material("#cf719e");
const cream = material("#fff1e8");
const white = material("#fffafc");
const gold = material("#d8b987", 0.55);
const purple = material("#c7a5df");
const coffeeColor = material("#805344");

// FUNÇÕES AUXILIARES
function addMesh(parent, geometry, mat, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function rounded(parent, w, h, d, mat, x, y, z, radius = 0.07) {
  const r = Math.min(
    radius,
    w / 2 - 0.001,
    h / 2 - 0.001,
    d / 2 - 0.001
  );

  return addMesh(
    parent,
    new RoundedBoxGeometry(w, h, d, 4, r),
    mat, x, y, z
  );
}

// CAIXA
const box = new THREE.Group();

rounded(box, 2.5, 0.15, 2.5, lavender, 0, 0.075, 0, 0.06);
rounded(box, 2.5, 1.65, 0.13, lavender, 0, 0.875, 1.185);
rounded(box, 2.5, 1.65, 0.13, lavender, 0, 0.875, -1.185);
rounded(box, 0.13, 1.65, 2.24, lavender, -1.185, 0.875, 0);
rounded(box, 0.13, 1.65, 2.24, lavender, 1.185, 0.875, 0);
rounded(box, 2.22, 0.025, 2.22, inside, 0, 0.165, 0, 0.01);

scene.add(box);

// TAMPA
const lid = new THREE.Group();

rounded(lid, 2.78, 0.26, 2.78, lidMat, 0, 0, 0, 0.09);
rounded(lid, 2.58, 0.035, 2.58, lidTop, 0, 0.145, 0, 0.015);
rounded(lid, 2.35, 0.09, 2.35, lidMat, 0, -0.17, 0, 0.025);

lid.position.set(0, 1.95, 0);

// LAÇO ROSA DE CETIM
const ribbon = new THREE.MeshStandardMaterial({
  color: "#e8a2c7",
  roughness: 0.5,
  metalness: 0.02,
  side: THREE.DoubleSide
});

const ribbonHighlight = new THREE.MeshStandardMaterial({
  color: "#f5c2dc",
  roughness: 0.55,
  side: THREE.DoubleSide
});

// Fitas cruzadas na tampa
rounded(lid, 0.23, 0.026, 2.73, ribbon, 0, 0.177, 0, 0.01);
rounded(lid, 2.73, 0.026, 0.23, ribbon, 0, 0.185, 0, 0.01);

// Grupo do laço
const bow = new THREE.Group();
bow.position.set(0, 0.2, 0);
lid.add(bow);

// Duas voltas arredondadas
function bowLoop(side) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.05, 0),
    new THREE.Vector3(side * 0.22, 0.30, 0),
    new THREE.Vector3(side * 0.57, 0.31, 0),
    new THREE.Vector3(side * 0.61, 0.13, 0),
    new THREE.Vector3(side * 0.30, 0.045, 0),
    new THREE.Vector3(0, 0.05, 0)
  ]);

  addMesh(
    bow,
    new THREE.TubeGeometry(curve, 64, 0.062, 12, false),
    ribbonHighlight
  );
}

bowLoop(-1);
bowLoop(1);

// Pontinhas da fita
for (const side of [-1, 1]) {
  const tail = rounded(
    bow,
    0.20, 0.026, 0.65,
    ribbon,
    side * 0.22, 0.025, 0.39,
    0.01
  );

  tail.rotation.y = side * 0.4;
  tail.rotation.x = -0.1;
}

// Nó central
const knot = addMesh(
  bow,
  new THREE.SphereGeometry(0.14, 24, 24),
  ribbon,
  0, 0.1, 0
);

knot.scale.set(1.2, 0.8, 0.9);

scene.add(lid);

// CHÃO
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.ShadowMaterial({ opacity: 0.11 })
);

floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// PRESENTES
const gifts = [];

function createGift(id, x, y, z, delay) {
  const group = new THREE.Group();

  group.userData = {
    id,
    target: new THREE.Vector3(x, y, z),
    delay,
    phase: gifts.length * 1.6
  };

  group.position.set(0, 0.9, 0);
  group.scale.setScalar(0.001);
  group.visible = false;

  scene.add(group);
  gifts.push(group);

  return group;
}

// CORAÇÃO 3D
function createHeart(parent, size, color, x, y, z) {
  const shape = new THREE.Shape();

  shape.moveTo(0, -0.35);
  shape.bezierCurveTo(-0.7, 0.05, -0.65, 0.55, 0, 0.3);
  shape.bezierCurveTo(0.65, 0.55, 0.7, 0.05, 0, -0.35);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.025,
    bevelThickness: 0.025
  });

  const heart = addMesh(parent, geometry, color, x, y, z);
  heart.scale.setScalar(size);

  return heart;
}

// 1. ENVELOPE
const letter = createGift("letter", -2.4, 2.7, 0.5, 0.15);

rounded(letter, 1.05, 0.72, 0.07, cream, 0, 0, 0, 0.025);

const flapShape = new THREE.Shape();
flapShape.moveTo(-0.48, 0.27);
flapShape.lineTo(0, -0.14);
flapShape.lineTo(0.48, 0.27);

const flapMat = pink.clone();
flapMat.side = THREE.DoubleSide;

addMesh(
  letter,
  new THREE.ShapeGeometry(flapShape),
  flapMat,
  0, 0, 0.05
);

createHeart(letter, 0.3, darkPink, 0, -0.13, 0.1);

// 2. INGRESSO DE CINEMA
const ticket = createGift("ticket", 2.4, 2.75, 0.2, 0.3);

rounded(ticket, 1.25, 0.7, 0.07, purple, 0, 0, 0, 0.035);
rounded(ticket, 0.06, 0.55, 0.08, white, 0.32, 0, 0.01, 0.015);

for (let i = 0; i < 3; i++) {
  rounded(
    ticket,
    0.14, 0.035, 0.08,
    white,
    -0.28, 0.17 - i * 0.16, 0.045,
    0.01
  );
}

// Estrela decorativa
const starShape = new THREE.Shape();

for (let i = 0; i < 10; i++) {
  const angle = i * Math.PI / 5 - Math.PI / 2;
  const radius = i % 2 === 0 ? 0.16 : 0.07;

  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  if (i === 0) starShape.moveTo(x, y);
  else starShape.lineTo(x, y);
}

starShape.closePath();

const starMat = gold.clone();
starMat.side = THREE.DoubleSide;

addMesh(
  ticket,
  new THREE.ShapeGeometry(starShape),
  starMat,
  0.05, 0, 0.055
);

// 3. XÍCARA DE CAFÉ
const coffee = createGift("coffee", -1.5, 3.85, -0.4, 0.45);

// Corpo da xícara
addMesh(
  coffee,
  new THREE.CylinderGeometry(0.34, 0.26, 0.65, 48),
  pink
);

// Borda
addMesh(
  coffee,
  new THREE.TorusGeometry(0.33, 0.035, 12, 48),
  cream,
  0, 0.33, 0
).rotation.x = Math.PI / 2;

// Café visível
addMesh(
  coffee,
  new THREE.CircleGeometry(0.3, 48),
  coffeeColor,
  0, 0.325, 0
).rotation.x = -Math.PI / 2;

// Alça
const handle = addMesh(
  coffee,
  new THREE.TorusGeometry(0.2, 0.055, 12, 48),
  pink,
  0.36, 0, 0
);

handle.rotation.y = Math.PI / 2;

// Coração na xícara
createHeart(coffee, 0.28, cream, 0, -0.06, 0.32);

// 4. PRESENTE MISTERIOSO
const mystery = createGift("mystery", 1.65, 3.85, -0.5, 0.6);

rounded(mystery, 0.85, 0.8, 0.85, pink, 0, 0, 0, 0.07);
rounded(mystery, 0.16, 0.82, 0.87, white, 0, 0, 0, 0.025);
rounded(mystery, 0.87, 0.82, 0.16, white, 0, 0, 0, 0.025);
rounded(mystery, 0.92, 0.16, 0.92, cream, 0, 0.44, 0, 0.035);

// Laço do presente misterioso
for (const side of [-1, 1]) {
  const miniBow = addMesh(
    mystery,
    new THREE.TorusGeometry(0.18, 0.065, 12, 40),
    white,
    side * 0.18, 0.58, 0
  );

  miniBow.rotation.y = side * 0.35;
}

addMesh(
  mystery,
  new THREE.SphereGeometry(0.09, 20, 20),
  white,
  0, 0.58, 0
);

// FINAL SECRETO
const discoveredGifts = new Set();
let secretFinalShown = false;

function registerDiscovery(id) {
  discoveredGifts.add(id);
}

function showSecretFinal() {
  const final = document.getElementById("secretFinal");
  if (final) final.hidden = false;
}

function restartExperience() {
  discoveredGifts.clear();
  secretFinalShown = false;

  document.getElementById("secretFinal").hidden = true;
  document.getElementById("modal").hidden = true;

  window.location.reload();
}

// MENSAGENS DOS PRESENTES
const surprises = {
  letter: {
    icon: "💌",
    title: "uma cartinha pra você",
    text: "Você é uma pessoa incrível. Às vezes insuportável, mas incrível. Não se emocione."
  },

  ticket: {
    icon: "🎟️",
    title: "cupom exclusivo",
    text: "Você ganhou um vale 1 fofoca completa. Válido enquanto eu estiver com vontade de contar."
  },

  coffee: {
    icon: "☕",
    title: "convite especial",
    text: "Você está convidado para tomar um café comigo. O pagamento é por sua conta, obviamente."
  },

  mystery: {
    icon: "🎁",
    title: "presente misterioso",
    text: "Você ganhou absolutamente nada! Mas ganhou com muito carinho."
  }
};

// MODAL
const modal = document.getElementById("modal");

function openModal(id) {
  registerDiscovery(id);

  const gift = surprises[id];
  if (!gift) return;

  document.getElementById("modalIcon").textContent = gift.icon;
  document.getElementById("modalTitle").textContent = gift.title;
  document.getElementById("modalText").textContent = gift.text;

  modal.hidden = false;
}

function closeModal() {
  modal.hidden = true;

  // O final aparece somente depois de fechar
  // a mensagem do quarto presente.
  if (discoveredGifts.size === 4 && !secretFinalShown) {
    secretFinalShown = true;
    showSecretFinal();
  }
}

document.getElementById("closeModal").onclick = closeModal;
document.getElementById("okayBtn").onclick = closeModal;

modal.addEventListener("click", event => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

// CONTROLES DA CÂMERA
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 14;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.target.set(0, 1.7, 0);
controls.update();

// CLIQUES
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clock = new THREE.Clock();

let isOpen = false;
let openedAt = 0;
let pointerDown = null;

renderer.domElement.addEventListener("pointerdown", event => {
  pointerDown = {
    x: event.clientX,
    y: event.clientY
  };
});

renderer.domElement.addEventListener("pointerup", event => {
  if (!pointerDown) return;

  const distance = Math.hypot(
    event.clientX - pointerDown.x,
    event.clientY - pointerDown.y
  );

  pointerDown = null;
  if (distance > 6) return;

  const rect = renderer.domElement.getBoundingClientRect();

  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  if (isOpen) {
    for (const gift of gifts) {
      if (!gift.visible || gift.scale.x < 0.5) continue;

      const hits = raycaster.intersectObjects(gift.children, true);

      if (hits.length) {
        openModal(gift.userData.id);
        return;
      }
    }
  }

  // O laço também faz parte da tampa clicável.
  const lidHits = raycaster.intersectObjects(lid.children, true);

  if (lidHits.length) {
    isOpen = !isOpen;

    if (isOpen) {
      openedAt = clock.getElapsedTime();
    }

    hint.textContent = isOpen
      ? "clique nos presentinhos para descobrir"
      : "clique na tampa para abrir";
  }
});

// RESPONSIVIDADE
function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

window.addEventListener("resize", resize);
resize();

// ANIMAÇÕES
function smooth(current, target, speed, delta) {
  return THREE.MathUtils.lerp(
    current,
    target,
    1 - Math.exp(-speed * delta)
  );
}

function easeOutBack(t) {
  const c = 1.70158;

  return 1
    + (c + 1) * Math.pow(t - 1, 3)
    + c * Math.pow(t - 1, 2);
}

let previousTime = 0;

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();
  const delta = Math.min(time - previousTime, 0.05);
  previousTime = time;

  // TAMPA E LAÇO
  lid.position.y = smooth(
    lid.position.y,
    isOpen ? 4.6 : 1.95,
    3.5,
    delta
  );

  lid.rotation.z = smooth(
    lid.rotation.z,
    isOpen ? -0.16 : 0,
    3,
    delta
  );

  lid.rotation.y = smooth(
    lid.rotation.y,
    isOpen ? 0.12 : 0,
    3,
    delta
  );

  // PRESENTES FLUTUANTES
  gifts.forEach(gift => {
    const data = gift.userData;
    const elapsed = time - openedAt - data.delay;

    const progress = isOpen
      ? THREE.MathUtils.clamp(elapsed / 1.15, 0, 1)
      : 0;

    const eased = easeOutBack(progress);
    const float = Math.sin(time * 1.5 + data.phase) * 0.1;

    gift.position.x = smooth(
      gift.position.x,
      data.target.x * eased,
      4,
      delta
    );

    gift.position.y = smooth(
      gift.position.y,
      0.9 + (data.target.y - 0.9) * eased
        + (isOpen ? float * progress : 0),
      4,
      delta
    );

    gift.position.z = smooth(
      gift.position.z,
      data.target.z * eased,
      4,
      delta
    );

    const targetScale = isOpen ? progress : 0;

    const scale = smooth(
      gift.scale.x,
      targetScale,
      5,
      delta
    );

    gift.scale.setScalar(Math.max(scale, 0.001));
    gift.visible = scale > 0.01;

    if (isOpen && progress > 0) {
      gift.rotation.y =
        Math.sin(time * 0.8 + data.phase) * 0.12;
    }
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();
