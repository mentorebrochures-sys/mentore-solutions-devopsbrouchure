// Backend Base URL
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
    if (newCerts.length === 0) return; // no updates
    // Divide new certificates for two scrollers
    const mid = Math.ceil(newCerts.length / 2);
    const firstHalf = newCerts.slice(0, mid);
    const secondHalf = newCerts.slice(mid);
    // Append new certificates
    firstHalf.forEach(c => {
      const img = document.createElement("img");
      let imagePath = c.image.startsWith("/") ? c.image : `/uploads/certificates/${c.image}`;
      img.src = `${BASE_URL}${imagePath}`;
      img.alt = c.title || "Certificate";
      img.classList.add("admin-cert");
      scroller1.appendChild(img);
    });
    secondHalf.forEach(c => {
      const img = document.createElement("img");
      let imagePath = c.image.startsWith("/") ? c.image : `/uploads/certificates/${c.image}`;
      img.src = `${BASE_URL}${imagePath}`;
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
  // Auto-refresh every 10 seconds (adjust if needed)
  setInterval(loadCertificates, 10000);
});


document.addEventListener("DOMContentLoaded", () => {
  const el = document.querySelector(".banner-tagline");
  if (!el) return;
  const text = el.textContent.trim();
  el.textContent = ""; // clear initially
  let index = 0;
  const speed = 50; // typing speed (ms)
  function type() {
    if (index < text.length) {
      el.textContent += text.charAt(index);
      index++;
      setTimeout(type, speed);
    }
  }
  type();
});



// ====================
// Courses Page JS
// ====================
function toggleFAQ(element) {
  const faq = element.parentElement;
  faq.classList.toggle("active");
}
function toggleTopics(element) {
  const box = element.parentElement;
  box.classList.toggle("active");
}
/* Expand the first course box (Linux) when cursor is clicked */
function expandFirstBox() {
  const firstBox = document.getElementById("linux-box");
  if (!firstBox.classList.contains("active")) {
    firstBox.classList.add("active");
  }
}


const COURSE_API = "${BASE_URL}/api/courses";
// ------------------------------------
// Format date → YYYY-MM-DD
// ------------------------------------
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toISOString().split("T")[0];
}
// ------------------------------------
// Update Upcoming Batch Info
// ------------------------------------
async function updateUpcomingBatch() {
  try {
    const res = await fetch(COURSE_API);
    const courses = await res.json();
    if (!courses || courses.length === 0) return;
    // Latest course
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
// ------------------------------------
// Load on page open
// ------------------------------------
document.addEventListener("DOMContentLoaded", updateUpcomingBatch);

// ===============================
// Training Section JS (Final Fix)
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  const sliderTrack = document.querySelector(".training-track");
  const sliderViewport = document.querySelector(".training-scroll");
  
  // खात्री करा की BASE_URL ग्लोबल फाईलमध्ये डिफाइन आहे
  const API_URL = `${BASE_URL}/api/trainings`;
  
  let moveSpeed = 1.5;
  let currentOffset = 0;

  // तारीख DD-MM-YYYY फॉरमॅटमध्ये करण्यासाठी फंक्शन
  function formatDate(dateStr) {
    if (!dateStr) return "TBA";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "TBA"; // Invalid date चेक
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // ================= BACKEND मधून डेटा लोड करणे =================
  async function fetchAndDisplayTrainings() {
    try {
      const res = await fetch(API_URL);
      const trainings = await res.json();
      
      if (!sliderTrack) return;
      sliderTrack.innerHTML = ""; // जुना डमी डेटा काढण्यासाठी

      if (!trainings || trainings.length === 0) {
        sliderTrack.innerHTML = "<p>No training sessions available.</p>";
        return;
      }

      trainings.forEach(t => {
        const card = document.createElement("div");
        card.className = "training-card";
        
        // Admin Panel मधून आलेला 'icon' आणि 'name' इथे वापरला आहे
        // जर Database मध्ये start_date नसेल तर 'formatDate' "TBA" दाखवेल
        card.innerHTML = `
          <i class="${t.icon || 'fas fa-graduation-cap'}"></i>
          <h4>${t.name}</h4>
          <div class="training-info">
            <span>📅 ${formatDate(t.start_date)}</span>
            <span>⏱ ${t.duration || 'Flexible'}</span>
          </div>
        `;
        sliderTrack.appendChild(card);
      });

      // डेटा लोड झाल्यावर स्लाइडर सुरू करा
      initializeSlider();

    } catch (err) {
      console.error("Database मधून ट्रेनिंग लोड करताना एरर आली:", err);
    }
  }

  // ================= SLIDER LOGIC =================
  function initializeSlider() {
    // कार्ड्स लोड व्हायला थोडा वेळ देणे (offsetWidth मोजण्यासाठी)
    setTimeout(() => {
      const baseItems = Array.from(sliderTrack.children);
      if (baseItems.length === 0) return;

      // लूप दिसण्यासाठी कार्ड्स डबल (Clone) करणे
      baseItems.forEach(item => {
        const clone = item.cloneNode(true);
        sliderTrack.appendChild(clone);
      });

      let baseWidth = 0;
      // प्रत्येक ओरिजिनल कार्डची विड्थ मोजणे
      baseItems.forEach(item => {
        baseWidth += item.offsetWidth + 26; // 26 हा तुमचा margin/gap आहे
      });

      function runAutoSlider() {
        currentOffset -= moveSpeed;
        if (Math.abs(currentOffset) >= baseWidth) {
          currentOffset = 0;
        }
        sliderTrack.style.transform = `translateX(${currentOffset}px)`;
        requestAnimationFrame(runAutoSlider);
      }
      
      runAutoSlider();
    }, 800); 
  }

  // Mouse Control
  if (sliderViewport) {
    sliderViewport.addEventListener("mouseenter", () => (moveSpeed = 0));
    sliderViewport.addEventListener("mouseleave", () => (moveSpeed = 1.5));
  }

  // फंक्शन रन करा
  fetchAndDisplayTrainings();
});

//PLACEMENT JS
/* ===============================
   USER PANEL – Placements Scroll
================================ */
async function loadPlacementsFromBackend() {
  const scrollDown = document.getElementById("scrollDown");
  const scrollUp = document.getElementById("scrollUp");
  if (!scrollDown || !scrollUp) return;
  try {
    const res = await fetch(`${BASE_URL}/api/placements`);
    const data = await res.json();
    // Sort ascending by student name
    data.sort((a, b) => a.name.localeCompare(b.name));
    const scrollDownContent = scrollDown.querySelector(".scroll-content");
    const scrollUpContent = scrollUp.querySelector(".scroll-content");
    // Helper to create card HTML
    const createCard = (p) => `
      <div class="placement-card">
        <img src="${BASE_URL}${p.image}" alt="${p.name}">
        <div class="card-info">
          <h4>${p.name}</h4>
          <span>${p.role}</span>
          <p>${p.company}</p>
          <strong>${p.package}</strong>
        </div>
      </div>
    `;
    // Split half-half
    const half = Math.ceil(data.length / 2);
    data
      .slice(0, half)
      .forEach((p) => (scrollDownContent.innerHTML += createCard(p)));
    data
      .slice(half)
      .forEach((p) => (scrollUpContent.innerHTML += createCard(p)));
  } catch (err) {
    console.error("Error fetching placements:", err);
  }
}
/* ===============================
   Scroll + Pause Logic
================================ */
window.addEventListener("load", async () => {
  // Load backend placements
  await loadPlacementsFromBackend();
  const scrollDown = document.getElementById("scrollDown");
  const scrollUp = document.getElementById("scrollUp");
  const speed = 1; // scroll speed
  let pauseDown = false;
  let pauseUp = false;
  // Duplicate content for seamless scroll
  const duplicate = (scroller) => {
    const content = scroller.querySelector(".scroll-content");
    content.innerHTML += content.innerHTML;
  };
  duplicate(scrollDown);
  duplicate(scrollUp);
  // Pause events
  [
    { el: scrollDown, flag: (val) => (pauseDown = val) },
    { el: scrollUp, flag: (val) => (pauseUp = val) },
  ].forEach(({ el, flag }) => {
    el.addEventListener("mouseenter", () => flag(true));
    el.addEventListener("mouseleave", () => flag(false));
    el.addEventListener("click", () => flag(!flag)); // toggle on click
    el.addEventListener("touchstart", () => flag(true));
    el.addEventListener("touchend", () => flag(false));
  });
  // Animation loop
  function animate() {
    const isDesktop = window.innerWidth > 768;
    if (isDesktop) {
      if (!pauseDown) scrollDown.scrollTop += speed;
      if (!pauseUp) scrollUp.scrollTop -= speed;
      if (scrollDown.scrollTop >= scrollDown.scrollHeight / 2)
        scrollDown.scrollTop = 0;
      if (scrollUp.scrollTop <= 0)
        scrollUp.scrollTop = scrollUp.scrollHeight / 2;
    } else {
      if (!pauseDown) scrollDown.scrollLeft += speed;
      if (!pauseUp) scrollUp.scrollLeft -= speed;
      if (scrollDown.scrollLeft >= scrollDown.scrollWidth / 2)
        scrollDown.scrollLeft = 0;
      if (scrollUp.scrollLeft <= 0)
        scrollUp.scrollLeft = scrollUp.scrollWidth / 2;
    }
    requestAnimationFrame(animate);
  }
  animate();
});
// CONTACT JS
// ===============================
// USER PANEL – CONTACT (FOOTER) JS
// ===============================
const CONTACT_API = `${BASE_URL}/api/contacts`;
async function loadFooterContact() {
  try {
    const res = await fetch(CONTACT_API);
    const data = await res.json();
    if (!data || !data.length) return;
    // Always take latest contact
    const contact = data[data.length - 1];
    // Update footer phone & email
    const footerMobile = document.getElementById("footerMobile");
    const footerEmail = document.getElementById("footerEmail");
    if (footerMobile)
      footerMobile.innerHTML = `<i class="fas fa-phone"></i> ${contact.mobile || ""}`;
    if (footerEmail)
      footerEmail.innerHTML = `<i class="fas fa-envelope"></i> ${contact.email || ""}`;
    // Update social links
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
// ------------------------------
// INITIAL LOAD
// ------------------------------
document.addEventListener("DOMContentLoaded", loadFooterContact);
// ------------------------------
// OPTIONAL: live refresh after admin update
// call loadFooterContact() from admin JS
// ------------------------------





