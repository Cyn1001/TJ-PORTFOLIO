// --- CONFIGURATION ---
const CONFIG = {
  glitchIntensity: 0.05,
  particleCount: 3000,
  accentColor: 0xbc0000,
  baseColor: 0x444444,
  cameraStart: 1000,
  cameraEnd: 200,
};

let scrollPercent = 0;
let targetCameraZ = CONFIG.cameraStart;

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

  document.getElementById("back-to-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  initLightbox();
}

function initLightbox() {
  const modal = document.getElementById("lightbox-modal");
  const modalImg = document.getElementById("img-modal-target");
  const captionText = document.getElementById("modal-caption");
  const closeBtn = document.querySelector(".close-modal");
  const prevBtn = document.querySelector(".prev-modal");
  const nextBtn = document.querySelector(".next-modal");
  const galleryItems = Array.from(document.querySelectorAll(".gallery-item img"));

  if (
    !modal ||
    !modalImg ||
    !captionText ||
    !closeBtn ||
    !prevBtn ||
    !nextBtn ||
    galleryItems.length === 0
  ) {
    return;
  }

  let currentIndex = 0;

  function updateModalImage() {
    const item = galleryItems[currentIndex];
    if (!item) return;

    modalImg.src = item.currentSrc || item.src;
    modalImg.alt = item.alt || "";
    captionText.innerText = item.alt || "";
  }

  function openModal(index) {
    currentIndex = index;
    updateModalImage();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modalImg.removeAttribute("src");
    document.body.style.overflow = "";
  }

  function showNext(event) {
    event?.preventDefault();
    currentIndex = (currentIndex + 1) % galleryItems.length;
    updateModalImage();
  }

  function showPrev(event) {
    event?.preventDefault();
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    updateModalImage();
  }

  galleryItems.forEach((item, index) => {
    const trigger = item.closest(".gallery-item");
    if (!trigger) return;

    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-label", `Ouvrir ${item.alt || "illustration"}`);
    trigger.addEventListener("click", () => openModal(index));
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(index);
      }
    });
  });

  closeBtn.addEventListener("click", closeModal);
  nextBtn.addEventListener("click", showNext);
  prevBtn.addEventListener("click", showPrev);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  window.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("is-open")) return;

    if (event.key === "Escape") closeModal();
    if (event.key === "ArrowRight") showNext(event);
    if (event.key === "ArrowLeft") showPrev(event);
  });
}

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

function updateScrollState() {
  const h = document.documentElement;
  const b = document.body;
  const scrollTop = h.scrollTop || b.scrollTop;
  const scrollHeight = h.scrollHeight || b.scrollHeight;
  const maxScroll = scrollHeight - h.clientHeight || 1;

  scrollPercent = scrollTop / maxScroll;

  const progressBar = document.getElementById("scroll-progress-bar");
  if (progressBar) {
    progressBar.style.width = `${scrollPercent * 100}%`;
  }

  const backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    backToTop.classList.toggle("visible", scrollTop > 800);
  }

  targetCameraZ =
    CONFIG.cameraStart -
    scrollPercent * (CONFIG.cameraStart - CONFIG.cameraEnd);
}

function initThreeBackground() {
  const container = document.getElementById("canvas-container");
  if (!container) return;

  import("three")
    .then((THREE) => {
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

      let mouseX = 0;
      let mouseY = 0;

      window.addEventListener("mousemove", (event) => {
        mouseX = (event.clientX - window.innerWidth / 2) / window.innerWidth;
        mouseY = (event.clientY - window.innerHeight / 2) / window.innerHeight;
      });

      window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      function animate() {
        requestAnimationFrame(animate);

        camera.position.z += (targetCameraZ - camera.position.z) * 0.05;
        camera.position.x += (mouseX * 100 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 100 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);

        const positions = points.geometry.attributes.position.array;
        for (let i = 0; i < CONFIG.particleCount; i++) {
          const i3 = i * 3;
          positions[i3 + 1] =
            originalY[i] +
            Math.sin(Date.now() * 0.001 + i) * (10 + scrollPercent * 50);
        }

        points.geometry.attributes.position.needsUpdate = true;
        points.rotation.y += 0.001 + scrollPercent * 0.005;

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
    })
    .catch((error) => {
      console.warn("Three.js background disabled:", error);
    });
}

function startApp() {
  initUI();
  updateScrollState();
  initThreeBackground();
}

window.addEventListener("scroll", updateScrollState, { passive: true });

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}
