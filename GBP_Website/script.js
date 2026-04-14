const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");
const revealItems = document.querySelectorAll(".reveal");
const contactForm = document.getElementById("contactForm");
const feedbackForm = document.getElementById("feedbackForm");
const feedbackWall = document.getElementById("feedbackWall");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active");
    navLinks.classList.toggle("open");
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
  });

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navToggle.classList.remove("active");
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    alert("Thank you for contacting Mind Path Career. We will get back to you soon.");
    contactForm.reset();
  });
}

if (feedbackForm && feedbackWall) {
  feedbackForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("feedbackName").value.trim();
    const type = document.getElementById("feedbackType").value;
    const message = document.getElementById("feedbackMessage").value.trim();

    const feedbackCard = document.createElement("article");
    feedbackCard.className = "testimonial-card visible";
    feedbackCard.innerHTML = `
      <p>"${message}"</p>
      <h3>${type} - ${name}</h3>
    `;

    feedbackWall.prepend(feedbackCard);
    feedbackForm.reset();
    alert("Thank you for sharing your feedback.");
  });
}
