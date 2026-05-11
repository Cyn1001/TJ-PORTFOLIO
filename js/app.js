import * as THREE from "three";

// --- CONFIGURATION ---
const CONFIG = {
  glitchIntensity: 0.05,
  particleCount: 3000,
  accentColor: 0xbc0000,
  baseColor: 0x444444,
  cameraStart: 1000,
  cameraEnd: 200,
};

// --- THREE.JS SETUP ---
const container = document.getElementById("canvas-container");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000,
);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Create Particle System
const geometry = new THREE.BufferGeometry();
const vertices = [];
const originalY = [];
for (let i = 0; i < CONFIG.particleCount; i++) {
  const x = THREE.MathUtils.randFloatSpread(1500);
  const y = THREE.MathUtils.randFloatSpread(1500);
  const z = THREE.MathUtils.randFloatSpread(2000);
  vertices.push(x, y, z);
  originalY.push(y);
}
geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(vertices, 3),
);

const material = new THREE.PointsMaterial({
  color: CONFIG.baseColor,
  size: 2,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending,
});

const points = new THREE.Points(geometry, material);
scene.add(points);

camera.position.z = CONFIG.cameraStart;

// State Variables
let mouseX = 0;
let mouseY = 0;
let scrollPercent = 0;
let targetCameraZ = CONFIG.cameraStart;

// Listeners
window.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
  mouseY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
});

window.addEventListener("scroll", () => {
  const h = document.documentElement;
  const b = document.body;
  const st = "scrollTop";
  const sh = "scrollHeight";

  // Scroll progress percentage
  const maxScroll = (h[sh] || b[sh]) - h.clientHeight || 1;
  scrollPercent = (h[st] || b[st]) / maxScroll;

  // Update progress bar
  const progressBar = document.getElementById("scroll-progress-bar");
  if (progressBar) {
    progressBar.style.width = scrollPercent * 100 + "%";
  }

  // Show/hide back to top button with fade
  const backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    if ((h[st] || b[st]) > 800) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  }

  targetCameraZ =
    CONFIG.cameraStart -
    scrollPercent * (CONFIG.cameraStart - CONFIG.cameraEnd);
});

// --- UI INITIALIZATION ---
function initUI() {
  // Timer Clock
  const timerEl = document.querySelector(".timer");
  if (timerEl) {
    setInterval(() => {
      const now = new Date();
      const timeStr =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0") +
        ":" +
        now.getSeconds().toString().padStart(2, "0") +
        ":" +
        now.getMilliseconds().toString().padStart(3, "0");
      timerEl.innerText = timeStr;
    }, 10);
  }

  // Intersection Observer for Section Reveals
  const observerOptions = { threshold: 0.1 };
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        const tw = entry.target.querySelector(".typewriter");
        if (tw && !tw.classList.contains("typed")) {
          startTypewriter(tw);
        }
      }
    });
  }, observerOptions);

  document.querySelectorAll(".mission-section").forEach((section) => {
    sectionObserver.observe(section);
  });

  // Back to top click
  document.getElementById("back-to-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Typewriter Effect Function
function startTypewriter(el) {
  el.classList.add("typed");
  const text = el.textContent;
  el.textContent = "";
  el.dataset.text = "";
  let i = 0;
  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      el.dataset.text = el.textContent;
      i++;
      setTimeout(type, 30);
    }
  }
  type();
}

// Window Resize Handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start UI logic
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initUI);
} else {
  initUI();
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Smooth camera movement
  camera.position.z += (targetCameraZ - camera.position.z) * 0.05;
  camera.position.x += (mouseX * 100 - camera.position.x) * 0.05;
  camera.position.y += (-mouseY * 100 - camera.position.y) * 0.05;
  camera.lookAt(0, 0, 0);

  // Particle behavior
  const positions = points.geometry.attributes.position.array;
  for (let i = 0; i < CONFIG.particleCount; i++) {
    const i3 = i * 3;
    // Subtle wave effect based on scroll
    positions[i3 + 1] =
      originalY[i] +
      Math.sin(Date.now() * 0.001 + i) * (10 + scrollPercent * 50);
  }
  points.geometry.attributes.position.needsUpdate = true;
  points.rotation.y += 0.001 + scrollPercent * 0.005;

  // Random Glitch Effect
  if (Math.random() < CONFIG.glitchIntensity + scrollPercent * 0.1) {
    points.position.x = THREE.MathUtils.randFloatSpread(5);
    points.position.z = THREE.MathUtils.randFloatSpread(5);
    material.color.setHex(CONFIG.accentColor);
    material.size = 4;
    setTimeout(() => {
      points.position.set(0, 0, 0);
      material.color.setHex(CONFIG.baseColor);
      material.size = 2;
    }, 50);
  }

  renderer.render(scene, camera);
}

animate();
