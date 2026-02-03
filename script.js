// ===============================
// Backend Base URL (UPDATED)
// ===============================
const BASE_URL = "https://mentoresolutions-devops-backend.vercel.app";

const CERT_API = `${BASE_URL}/api/certificates`;

// Track previously loaded certificate IDs
let prevCertIds = [];

// Load certificates and populate scrollers
async function loadCertificates() {
  try {
    const res = await fetch(CERT_API);
    const certs = await res.json();
    if (!certs || certs.length === 0) return;

    const scroller1 = document.getElementById("certTrack1");
    const scroller2 = document.getElementById("certTrack2");
    if (!scroller1 || !scroller2) return;

    // Filter new certificates only
    const newCerts = certs.filter(c => !prevCertIds.includes(c.id));
    if (newCerts.length === 0) return;

    // Divide new certificates for two scrollers
    const mid = Math.ceil(newCerts.length / 2);
    const firstHalf = newCerts.slice(0, mid);
    const secondHalf = newCerts.slice(mid);

    // Append new certificates
    firstHalf.forEach(c => {
      const img = document.createElement("img");
      img.src = c.image.startsWith("http")
        ? c.image
        : `${BASE_URL}${c.image}`;
      img.alt = c.title || "Certificate";
      img.classList.add("admin-cert");
      scroller1.appendChild(img);
    });

    secondHalf.forEach(c => {
      const img = document.createElement("img");
      img.src = c.image.startsWith("http")
        ? c.image
        : `${BASE_URL}${c.image}`;
      img.alt = c.title || "Certificate";
      img.classList.add("admin-cert");
      scroller2.appendChild(img);
    });

    // Duplicate for seamless scroll
    [scroller1, scroller2].forEach(track => {
      track.innerHTML += track.innerHTML;
      const totalWidth = track.scrollWidth / 2;
      const duration = totalWidth / 40;
      track.style.animationDuration = `${duration}s`;
    });

    // Update previously loaded certificate IDs
    prevCertIds = certs.map(c => c.id);
  } catch (err) {
    console.error("Error loading certificates:", err);
  }
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  loadCertificates();
  setInterval(loadCertificates, 10000);
});

// ===============================
// Banner typing effect
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const el = document.querySelector(".banner-tagline");
  if (!el) return;
  const text = el.textContent.trim();
  el.textContent = "";
  let index = 0;
  const speed = 50;

  function type() {
    if (index < text.length) {
      el.textContent += text.charAt(index);
      index++;
      setTimeout(type, speed);
    }
  }
  type();
});

// ===============================
// Courses Page JS
// ===============================
function toggleFAQ(element) {
  element.parentElement.classList.toggle("active");
}

function toggleTopics(element) {
  element.parentElement.classList.toggle("active");
}

function expandFirstBox() {
  const firstBox = document.getElementById("linux-box");
  if (firstBox && !firstBox.classList.contains("active")) {
    firstBox.classList.add("active");
  }
}

const COURSE_API = `${BASE_URL}/api/courses`;

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toISOString().split("T")[0];
}

async function updateUpcomingBatch() {
  try {
    const res = await fetch(COURSE_API);
    const courses = await res.json();
    if (!courses || courses.length === 0) return;

    const latest = courses[courses.length - 1];
    const courseInfo = document.querySelector("#courses .course-info");
    if (!courseInfo) return;

    const spans = courseInfo.querySelectorAll("span");
    spans[0].innerText = `📅 New Batch Starting On : ${formatDate(latest.start_date)}`;
    spans[1].innerText = `⏱ Duration: ${latest.duration}`;
  } catch (err) {
    console.error("Failed to load upcoming batch info:", err);
  }
}

document.addEventListener("DOMContentLoaded", updateUpcomingBatch);

// ===============================
// Trainings JS
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  const sliderTrack = document.querySelector(".training-track");
  const sliderViewport = document.querySelector(".training-scroll");
  const API_URL = `${BASE_URL}/api/trainings`;

  let moveSpeed = 1.5;
  let currentOffset = 0;

  try {
    const res = await fetch(API_URL);
    const trainings = await res.json();

    trainings.forEach(t => {
      const card = document.createElement("div");
      card.className = "training-card";
      card.innerHTML = `
        <i class="${t.icon}"></i>
        <h4>${t.name}</h4>
      `;
      sliderTrack.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading trainings from DB:", err);
  }

  const baseItems = Array.from(sliderTrack.children);
  baseItems.forEach(item => sliderTrack.appendChild(item.cloneNode(true)));

  let baseWidth = 0;
  baseItems.forEach(item => (baseWidth += item.offsetWidth + 26));

  function runAutoSlider() {
    currentOffset -= moveSpeed;
    if (Math.abs(currentOffset) >= baseWidth) currentOffset = 0;
    sliderTrack.style.transform = `translateX(${currentOffset}px)`;
    requestAnimationFrame(runAutoSlider);
  }
  runAutoSlider();

  sliderViewport.addEventListener("mouseenter", () => (moveSpeed = 0));
  sliderViewport.addEventListener("mouseleave", () => (moveSpeed = 1.5));
});

// ===============================
// Placements JS
// ===============================
async function loadPlacementsFromBackend() {
  const scrollDown = document.getElementById("scrollDown");
  const scrollUp = document.getElementById("scrollUp");
  if (!scrollDown || !scrollUp) return;

  try {
    const res = await fetch(`${BASE_URL}/api/placements`);
    const data = await res.json();

    data.sort((a, b) => a.name.localeCompare(b.name));

    const scrollDownContent = scrollDown.querySelector(".scroll-content");
    const scrollUpContent = scrollUp.querySelector(".scroll-content");

    const createCard = (p) => `
      <div class="placement-card">
        <img src="${p.image.startsWith("http") ? p.image : BASE_URL + p.image}" alt="${p.name}">
        <div class="card-info">
          <h4>${p.name}</h4>
          <span>${p.role}</span>
          <p>${p.company}</p>
          <strong>${p.package}</strong>
        </div>
      </div>
    `;

    const half = Math.ceil(data.length / 2);
    data.slice(0, half).forEach(p => scrollDownContent.innerHTML += createCard(p));
    data.slice(half).forEach(p => scrollUpContent.innerHTML += createCard(p));
  } catch (err) {
    console.error("Error fetching placements:", err);
  }
}

window.addEventListener("load", async () => {
  await loadPlacementsFromBackend();

  const scrollDown = document.getElementById("scrollDown");
  const scrollUp = document.getElementById("scrollUp");

  const speed = 1;
  let pauseDown = false;
  let pauseUp = false;

  const duplicate = (scroller) => {
    const content = scroller.querySelector(".scroll-content");
    content.innerHTML += content.innerHTML;
  };

  duplicate(scrollDown);
  duplicate(scrollUp);

  [
    { el: scrollDown, flag: (v) => (pauseDown = v) },
    { el: scrollUp, flag: (v) => (pauseUp = v) },
  ].forEach(({ el, flag }) => {
    el.addEventListener("mouseenter", () => flag(true));
    el.addEventListener("mouseleave", () => flag(false));
    el.addEventListener("touchstart", () => flag(true));
    el.addEventListener("touchend", () => flag(false));
  });

  function animate() {
    const isDesktop = window.innerWidth > 768;
    if (isDesktop) {
      if (!pauseDown) scrollDown.scrollTop += speed;
      if (!pauseUp) scrollUp.scrollTop -= speed;
      if (scrollDown.scrollTop >= scrollDown.scrollHeight / 2) scrollDown.scrollTop = 0;
      if (scrollUp.scrollTop <= 0) scrollUp.scrollTop = scrollUp.scrollHeight / 2;
    } else {
      if (!pauseDown) scrollDown.scrollLeft += speed;
      if (!pauseUp) scrollUp.scrollLeft -= speed;
      if (scrollDown.scrollLeft >= scrollDown.scrollWidth / 2) scrollDown.scrollLeft = 0;
      if (scrollUp.scrollLeft <= 0) scrollUp.scrollLeft = scrollUp.scrollWidth / 2;
    }
    requestAnimationFrame(animate);
  }
  animate();
});

// ===============================
// Contact (Footer) JS
// ===============================
const CONTACT_API = `${BASE_URL}/api/contacts`;

async function loadFooterContact() {
  try {
    const res = await fetch(CONTACT_API);
    const data = await res.json();
    if (!data || !data.length) return;

    const contact = data[data.length - 1];

    const footerMobile = document.getElementById("footerMobile");
    const footerEmail = document.getElementById("footerEmail");

    if (footerMobile)
      footerMobile.innerHTML = `<i class="fas fa-phone"></i> ${contact.mobile || ""}`;
    if (footerEmail)
      footerEmail.innerHTML = `<i class="fas fa-envelope"></i> ${contact.email || ""}`;

    const insta = document.getElementById("footerInstagram");
    const linkedin = document.getElementById("footerLinkedIn");

    if (insta) {
      insta.href = contact.instagram || "#";
      insta.style.visibility = contact.instagram ? "visible" : "hidden";
    }
    if (linkedin) {
      linkedin.href = contact.linkedin || "#";
      linkedin.style.visibility = contact.linkedin ? "visible" : "hidden";
    }
  } catch (err) {
    console.error("Footer contact load failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadFooterContact);
