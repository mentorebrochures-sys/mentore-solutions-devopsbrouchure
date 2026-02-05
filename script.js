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

// ============================
// COURSE SECTION - USER PANEL
// ============================

// खात्री करा की BASE_URL आधी डिफाइन केला आहे
const COURSE_USER_API = `${BASE_URL}/api/courses`;

/**
 * तारीख सुंदर फॉरमॅटमध्ये दाखवण्यासाठी (उदा. DD-MM-YYYY)
 */
function formatDisplayDate(dateStr) {
    if (!dateStr) return "TBA";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

/**
 * डेटाबेस मधून कोर्सेस आणून युजर पॅनेलवर अपडेट करणे
 */
async function syncUpcomingBatch() {
    try {
        const res = await fetch(COURSE_USER_API);
        const courses = await res.json();

        // जर डेटा नसेल किंवा एरर असेल तर
        if (!courses || courses.length === 0 || courses.error) {
            console.warn("No courses found for user panel.");
            return;
        }

        // शेवटचा (Latest) ॲड केलेला कोर्स मिळवणे
        const latestCourse = courses[courses.length - 1];

        // युजर पॅनेलवरील कोर्सेस सेक्शनमधील माहितीचे घटक शोधणे
        const courseInfoContainer = document.querySelector("#courses .course-info");
        
        if (courseInfoContainer) {
            const spans = courseInfoContainer.querySelectorAll("span");
            
            if (spans.length >= 2) {
                // पहिली ओळ: तारीख (Format: DD-MM-YYYY)
                spans[0].innerHTML = `📅 <strong>New Batch Starting On :</strong> ${formatDisplayDate(latestCourse.start_date)}`;
                
                // दुसरी ओळ: ड्युरेशन
                spans[1].innerHTML = `⏱ <strong>Duration:</strong> ${latestCourse.duration}`;
            }
        }
    } catch (err) {
        console.error("Failed to sync batch info to user panel:", err);
    }
}

// पेज लोड झाल्यावर फंक्शन रन करा
document.addEventListener("DOMContentLoaded", syncUpcomingBatch);


// ===============================
// Training Js (Updated)
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  const sliderTrack = document.querySelector(".training-track");
  const sliderViewport = document.querySelector(".training-scroll");
  const API_URL = `${BASE_URL}/api/trainings`;
  
  let moveSpeed = 1.5;
  let currentOffset = 0;

  // तारीख DD-MM-YYYY फॉरमॅटमध्ये करण्यासाठी फंक्शन
  function formatDate(dateStr) {
    if (!dateStr) return "TBA";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // ================= BACKEND TRAININGS FETCH =================
  try {
    const res = await fetch(API_URL);
    const trainings = await res.json();
    
    trainings.forEach(t => {
      const card = document.createElement("div");
      card.className = "training-card";
      
      // बदल: इथे t.start_date आणि t.duration वापरले आहे
      card.innerHTML = `
        <i class="${t.icon}"></i>
        <h4>${t.name}</h4>
      `;
      sliderTrack.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading trainings from DB:", err);
  }

  // ================= DUPLICATE CARDS & SLIDER LOGIC =================
  // डेटा लोड झाल्यावर विड्थ मोजण्यासाठी थोडा वेळ (Dely) द्यावा लागतो
  setTimeout(() => {
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
  }, 500); 

  sliderViewport.addEventListener("mouseenter", () => (moveSpeed = 0));
  sliderViewport.addEventListener("mouseleave", () => (moveSpeed = 1.5));
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





