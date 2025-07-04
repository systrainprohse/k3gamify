// Start experience after name input
function startExperience() {
  const name = document.getElementById("username").value.trim();
  const overlay = document.getElementById("intro-overlay");

  if (name) {
    localStorage.setItem("ninjaName", name);
    overlay.classList.add("fade-out");
    setTimeout(() => overlay.style.display = "none", 500);
  } else {
    alert("Masukkan namamu dulu, Ninja!");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const storedName = localStorage.getItem("ninjaName");
  const introOverlay = document.getElementById("intro-overlay");
  const headerTitle = document.querySelector(".k3-header h1");

  // Hide intro if name is already stored
  if (storedName) {
    introOverlay.style.display = "none";
    if (headerTitle) {
      headerTitle.innerHTML = `K3 adalah jalan ninjaku, ${storedName}!`;
    }
  }

  // Highlight active nav item
  document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", () => {
      document.querySelectorAll("nav a").forEach(el => el.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // Ninja animation on scroll
  const ninja = document.querySelector(".ninja-animated");
  const header = document.querySelector(".k3-header");
  const headerBottom = header.offsetTop + header.offsetHeight;

  window.addEventListener("scroll", () => {
    if (window.scrollY > headerBottom / 2) {
      ninja.style.animationPlayState = "running";
    }
  });

  // Ripple effect on button
  const button = document.querySelector("button");
  if (button) {
    button.addEventListener("click", function (e) {
      const circle = document.createElement("span");
      circle.classList.add("ripple");
      this.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  }

  // Load particles.js if available
  if (typeof particlesJS !== "undefined") {
    particlesJS.load('particles-js', 'particles.json', function () {
      console.log('particles.js loaded');
    });
  } else {
    console.warn("particlesJS is not defined. Make sure the library is loaded.");
  }
});

if (typeof particlesJS !== "undefined") {
  particlesJS("particles-js", {
    particles: {
      number: { value: 50 },
      color: { value: "#ffffff" },
      shape: { type: "circle" },
      opacity: { value: 0.5 },
      size: { value: 3 },
      move: { enable: true, speed: 1 }
    },
    interactivity: {
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" }
      },
      modes: {
        repulse: { distance: 100 },
        push: { particles_nb: 4 }
      }
    },
    retina_detect: true
  });
}
