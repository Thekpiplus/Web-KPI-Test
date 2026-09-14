const navToggle = document.getElementById("nav-toggle");
const primaryNav = document.getElementById("primary-nav");
const backTop = document.querySelector(".back-top");
const toast = document.getElementById("toast");
const contactForm = document.getElementById("contact-form");

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.add("hidden"), 2600);
}

navToggle?.addEventListener("click", () => {
  const open = primaryNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".nav-link-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const parent = button.closest(".nav-dropdown");
    parent?.classList.toggle("open");
    button.setAttribute("aria-expanded", String(parent?.classList.contains("open")));
  });
});

primaryNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    primaryNav.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

window.addEventListener("scroll", () => {
  backTop?.classList.toggle("show", window.scrollY > 500);
}, { passive: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const hotel = String(data.get("hotel") || "").trim();
  showToast(`รับข้อมูลจาก ${hotel || "คุณ"} แล้ว ทีมจะติดต่อกลับเร็วๆ นี้`);
  contactForm.reset();
});

document.querySelector(".lang-btn")?.addEventListener("click", () => {
  showToast("โหมดภาษาไทยพร้อมใช้งานแล้ว");
});
