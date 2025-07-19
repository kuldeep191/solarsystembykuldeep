// =========================
// 🌌 main.js (Updated with Info Popup + Glow Orbits)
// =========================

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 20;
controls.maxDistance = 1000;

const loader = new THREE.TextureLoader();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const infoBox = document.createElement('div');
infoBox.style.position = 'absolute';
infoBox.style.bottom = '20px';
infoBox.style.left = '20px';
infoBox.style.padding = '12px 16px';
infoBox.style.background = 'rgba(0,0,0,0.6)';
infoBox.style.color = '#fff';
infoBox.style.borderRadius = '8px';
infoBox.style.fontFamily = 'sans-serif';
infoBox.style.display = 'none';
document.body.appendChild(infoBox);

function createOrbit(radius) {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
  const points = curve.getPoints(100);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xffffee, transparent: true, opacity: 0.45 });
  const ellipse = new THREE.Line(geometry, material);
  ellipse.rotation.x = Math.PI / 2;
  scene.add(ellipse);
}

scene.background = loader.load("textures/2k_stars.jpg");

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(10, 32, 32),
  new THREE.MeshBasicMaterial({ map: loader.load("textures/2k_sun.jpg") })
);
sun.name = "सूर्य";
scene.add(sun);

scene.add(new THREE.PointLight(0xffffff, 2, 2000));
scene.add(new THREE.AmbientLight(0xffffff, 0.15));

const planetsData = [
  { name: 'बुध', texture: 'textures/2k_mercury.jpg', size: 1.5, distance: 25, speed: 0.02, angle: 0.2, temp: '167°C' },
  { name: 'शुक्र', texture: 'textures/2k_venus_surface.jpg', size: 2.5, distance: 40, speed: 0.018, angle: 1.3, temp: '464°C' },
  { name: 'पृथ्वी', texture: 'textures/2k_earth_daymap.jpg', size: 2.6, distance: 55, speed: 0.015, angle: 2.0, temp: '15°C' },
  { name: 'मंगल', texture: 'textures/2k_mars.jpg', size: 2.2, distance: 70, speed: 0.012, angle: 0.6, temp: '-65°C' },
  { name: 'बृहस्पति', texture: 'textures/2k_jupiter.jpg', size: 6, distance: 95, speed: 0.01, angle: 1.9, temp: '-110°C' },
  { name: 'शनि', texture: 'textures/2k_saturn.jpg', size: 5.5, distance: 125, speed: 0.009, angle: 1.0, temp: '-140°C' },
  { name: 'यूरेनस', texture: 'textures/2k_uranus.jpg', size: 4.5, distance: 150, speed: 0.007, angle: 2.5, temp: '-195°C' },
  { name: 'नेपच्यून', texture: 'textures/2k_neptune.jpg', size: 4.3, distance: 170, speed: 0.006, angle: 0.8, temp: '-200°C' }
];

const planets = [];

planetsData.forEach(data => {
  createOrbit(data.distance);

  const geometry = new THREE.SphereGeometry(data.size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ map: loader.load(data.texture) });
  const mesh = new THREE.Mesh(geometry, material);

  const obj = new THREE.Object3D();
  obj.add(mesh);
  scene.add(obj);

  mesh.position.x = data.distance;
  obj.rotation.y = data.angle;

  data.mesh = mesh;
  data.object = obj;
  planets.push(data);
});

const moonGeo = new THREE.SphereGeometry(0.5, 32, 32);
const moonMat = new THREE.MeshStandardMaterial({ map: loader.load("textures/2k_moon.jpg") });
const moon = new THREE.Mesh(moonGeo, moonMat);
const moonOrbit = new THREE.Object3D();
moon.position.x = 4;
moonOrbit.add(moon);
planets[2].mesh.add(moonOrbit);

const asteroidGroup = new THREE.Group();
for (let i = 0; i < 300; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = 80 + Math.random() * 10;
  const geo = new THREE.SphereGeometry(0.2, 6, 6);
  const mat = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const asteroid = new THREE.Mesh(geo, mat);
  asteroid.position.set(Math.cos(a) * r, (Math.random() - 0.5) * 2, Math.sin(a) * r);
  asteroidGroup.add(asteroid);
}
scene.add(asteroidGroup);

camera.position.set(0, 80, 180);
camera.lookAt(0, 0, 0);

window.addEventListener("keydown", e => {
  if (e.key === "+") camera.position.z -= 10;
  if (e.key === "-") camera.position.z += 10;
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("click", () => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
  if (intersects.length > 0) {
    const target = intersects[0].object;
    const pos = new THREE.Vector3();
    target.getWorldPosition(pos);
    gsap.to(camera.position, { duration: 2, x: pos.x + 10, y: pos.y + 5, z: pos.z + 15, ease: "power3.inOut" });
    gsap.to(controls.target, { duration: 2, x: pos.x, y: pos.y, z: pos.z });

    const found = planets.find(p => p.mesh === target);
    if (found) {
      infoBox.innerHTML = `<strong>${found.name}</strong><br>तापमान: ${found.temp}`;
      infoBox.style.display = 'block';
    }
  } else {
    infoBox.style.display = 'none';
  }
});

window.addEventListener("mousemove", e => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  planets.forEach(p => {
    p.object.rotation.y += delta * p.speed;
  });
  moonOrbit.rotation.y += delta * 0.8;

  controls.update();
  renderer.render(scene, camera);
}
animate();
