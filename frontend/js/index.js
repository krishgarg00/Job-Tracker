document.addEventListener("DOMContentLoaded", () => {
  const currentUser = sessionStorage.getItem("currentUser");
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");

  const applicationsNav = document.getElementById("applicationsNav");
  const dashboardNav = document.getElementById("dashboardNav");
  const authButtons = document.getElementById("authButtons");
  const logoutButton = document.getElementById("logoutButton");
  const applicationsFooterLink = document.getElementById("applicationsFooterLink");
  const getStartedButton = document.getElementById("getStartedButton");
  const startTrackingButton = document.getElementById("startTrackingButton");

  const loggedIn = isLoggedIn === "true" && Boolean(currentUser);

  if (applicationsNav) applicationsNav.style.display = loggedIn ? "block" : "none";
  if (dashboardNav) dashboardNav.style.display = loggedIn ? "block" : "none";
  if (applicationsFooterLink) {
    applicationsFooterLink.style.display = loggedIn ? "inline" : "none";
  }

  if (authButtons) {
    authButtons.classList.toggle("hidden", loggedIn);
  }

  if (logoutButton) {
    logoutButton.classList.toggle("d-none", !loggedIn);
  }

  if (getStartedButton) {
    getStartedButton.href = loggedIn ? "home.html" : "signup.html";
  }

  if (startTrackingButton) {
    startTrackingButton.href = loggedIn ? "home.html" : "signup.html";
  }
});

function logout() {
  sessionStorage.removeItem("currentUser");
  sessionStorage.removeItem("isLoggedIn");
  sessionStorage.removeItem("showWelcome");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("jobVaultResumeId");
  sessionStorage.removeItem("selectedResumeTemplate");

  window.location.href = "/";
}
