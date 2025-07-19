/**
 * Handles user login by storing the user type and transitioning the UI.
 * @param {string} userType - The type of user logging in (e.g., "Karyawan GAM", "Mitra Kerja").
 */
function login(userType) {
  localStorage.setItem("userType", userType);
  const loginScreen = document.getElementById("login-screen");
  const appContainer = document.getElementById("app-container");

  loginScreen.style.animation = "fadeOut 0.5s forwards";

  setTimeout(() => {
    loginScreen.style.display = "none";
    appContainer.style.display = "flex";
    appContainer.style.animation = "fadeIn 0.5s";

    document.getElementById("user-greeting").textContent = `Hi, ${userType}!`;

    initCarousel();
  }, 500);
}

/**
 * Logs the user out by removing the stored user type and transitioning the UI.
 */
function logout() {
  localStorage.removeItem("userType");
  const appContainer = document.getElementById("app-container");
  const loginScreen = document.getElementById("login-screen");

  appContainer.style.animation = "fadeOut 0.5s forwards";

  setTimeout(() => {
    appContainer.style.display = "none";
    loginScreen.style.display = "flex";
    loginScreen.style.animation = "fadeIn 0.5s";
  }, 500);
}

/**
 * Displays the registration form and hides the login form.
 */
function showRegisterForm() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("register-screen").style.display = "flex";
}

/**
 * Displays the login form and hides the registration form.
 */
function showLoginForm() {
  document.getElementById("register-screen").style.display = "none";
  document.getElementById("login-screen").style.display = "flex";
}

/**
 * Handles form submission for registration.
 * Gathers form data and sends it to a Google Apps Script endpoint.
 * Provides user feedback during the process.
 * @param {Event} event - The form submission event.
 */
async function handleRegister(event) {
  event.preventDefault();

  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;

  // URL Web App dari Google Apps Script yang sudah di-deploy
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbw2BF-XhU-19kSKn5Wpi3ZE7rrhwsT3YqB6XUx1uYvX1XymdZjbjaF1VbMXIdsTMPGV/exec";

  const formData = {
    nama: document.getElementById("reg-nama").value,
    nik: document.getElementById("reg-nik").value,
    email: document.getElementById("reg-email").value,
    wa: document.getElementById("reg-wa").value,
    perusahaan: document.getElementById("reg-perusahaan").value,
  };

  submitButton.disabled = true;
  submitButton.textContent = "Mendaftar...";

  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 1. Tunggu dan parse respons sebagai JSON.
    const result = await response.json();

    // 2. Periksa apakah responsnya OK DAN isi pesannya adalah 'success'.
    if (response.ok && result.result === "success") {
      alert("Pendaftaran berhasil! Data Anda telah direkam. Silakan login.");
      form.reset(); // Mengosongkan form
      showLoginForm();
    } else {
      // 3. Jika gagal, tampilkan pesan error dari skrip.
      throw new Error(
        result.message || "Gagal mengirim data. Coba lagi nanti."
      );
    }
  } catch (error) {
    console.error("Error:", error);
    alert(
      "Terjadi kesalahan saat mendaftar: " +
        error.message +
        "\n\nPastikan koneksi internet Anda stabil dan coba lagi."
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
}
