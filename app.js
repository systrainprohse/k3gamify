// --- Global Variables & State ---
let calendarInstance = null;
let calendarRendered = false;
let kompetensiInitialized = false;
let lastScrollTop = 0;
let carouselInterval;

/**
 * Initializes the application.
 * Sets up the PWA, event listeners, and initial UI state.
 */
function initializeApp() {
  setupPWA();
  // --- App Initialization ---
  window.addEventListener("DOMContentLoaded", () => {
    // Setup connection listener after DOM is loaded
    setupConnectionListener();

    // Register Service Worker for offline functionality
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) =>
            console.log("Service Worker: Registered with scope", reg.scope)
          )
          .catch((err) =>
            console.error("Service Worker: Registration Failed", err)
          );
      });
    }

    const storedUserType = localStorage.getItem("userType");
    const loginScreen = document.getElementById("login-screen");
    const appContainer = document.getElementById("app-container");
    const header = document.querySelector(".app-header");
    const scrollableContent = document.querySelector(".scrollable-content");

    if (storedUserType) {
      loginScreen.style.display = "none";
      appContainer.style.display = "flex";
      document.getElementById(
        "user-greeting"
      ).textContent = `Hi, ${storedUserType}!`;
    } else {
      loginScreen.style.display = "flex";
      appContainer.style.display = "none";
    }
    showPage("page-home");

    // Hide header on scroll down
    scrollableContent.addEventListener(
      "scroll",
      function () {
        var st = scrollableContent.scrollTop;
        if (st > lastScrollTop && st > 50) {
          header.classList.add("hidden");
        } else {
          header.classList.remove("hidden");
        }
        lastScrollTop = st <= 0 ? 0 : st;
      },
      false
    );
  });
}

// --- Page Navigation ---
/**
 * Shows a specific page by its ID and manages header visibility and page-specific initialization.
 * @param {string} pageId - The ID of the page to display.
 */
function showPage(pageId) {
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));
  const targetPage = document.getElementById(pageId);
  if (targetPage) targetPage.classList.add("active");

  const modernHeaderElements = document.querySelectorAll(
    ".user-profile, .main-tabs"
  );
  if (pageId === "page-home") {
    modernHeaderElements.forEach((el) => (el.style.display = "flex"));
    initCarousel();
  } else {
    modernHeaderElements.forEach((el) => (el.style.display = "none"));
    clearInterval(carouselInterval);
  }

  if (pageId === "page-jadwal" && !calendarRendered) initCalendar();
  if (pageId === "page-kartudigital") initDigitalCard();
  if (pageId === "page-kompetensi" && !kompetensiInitialized)
    initKompetensiPage();
  if (pageId === "page-induksi") updateInductionAction(); // Set initial state for induction page

  updateFooterNav(pageId);
  document.querySelector(".scrollable-content").scrollTo(0, 0);
}

/**
 * Updates the active state of the footer navigation based on the current page.
 * @param {string} pageId - The ID of the current page.
 */
function updateFooterNav(pageId) {
  document
    .querySelectorAll(".footer-nav li")
    .forEach((li) => li.classList.remove("active"));
  let navId = "nav-home"; // Default to home
  if (pageId.startsWith("page-")) {
    const pageName = pageId.split("-")[1];
    const navItem = document.getElementById("nav-" + pageName);
    if (navItem) {
      // Check if a direct nav item exists
      navId = "nav-" + pageName;
    }
  }
  const activeNav = document.getElementById(navId);
  if (activeNav) activeNav.classList.add("active");
}

// Initialize the application
initializeApp();

// --- User Profile ---
/**
 * Fetches user profile data from the server based on the provided NIK.
 * @param {string} nik - The user's NIK.
 */
async function fetchUserProfile(nik) {
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbzw6HJKP8xBIsAZPll3ProZlJEf4k0EVg0eXH6pR7tejMj9qAV_uIr0aLjcq-u5Ghpz/exec"; // Ganti dengan URL Web App Anda
  if (!nik) {
    console.error("NIK is required to fetch user profile.");
    return null; // Return null or handle the error as needed
  }
  try {
    const response = await fetch(scriptURL + "?nik=" + nik, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (response.ok && result.result === "success") {
      console.log("Profil ditemukan:", result.profile);
      return result.profile;
    } else {
      throw new Error(
        result.message || "Profil tidak ditemukan atau terjadi kesalahan."
      );
    }
  } catch (error) {
    console.error("Gagal mengambil data profil:", error);
    // Handle error appropriately in your UI (e.g., show an error message)
    return null; // Or you can return a default/empty profile
  }
}

/**
 * Displays the user profile information on the page.
 * @param {object} profile - The user's profile data.
 */
function displayUserProfile(profile) {
  if (profile) {
    // Update the elements in your profile page with the profile data.
    // Example (you'll need to adjust these selectors to match your actual elements):
    // document.getElementById("profile-name").textContent = profile.nama;
    // document.getElementById("profile-email").textContent = profile.email;
    // ... etc.

    console.log("Profil ditampilkan:", profile);
  } else {
    // Handle the case where profile data is not available.
    console.log("Profil tidak tersedia");
  }
}

// --- Connection Status ---
/**
 * Manages the display of an "offline" notification banner by listening to browser events.
 */
function setupConnectionListener() {
  const updateOnlineStatus = () => {
    const notificationEl = document.getElementById("offline-notification");
    if (!notificationEl) return;

    if (navigator.onLine) {
      notificationEl.classList.remove("show");
    } else {
      notificationEl.classList.add("show");
    }
  };

  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);

  // Set initial status
  updateOnlineStatus();
}
