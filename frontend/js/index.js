let currentUser = sessionStorage.getItem("currentUser");
let isLoggedIn = sessionStorage.getItem("isLoggedIn");

let applicationsNav = document.getElementById("applicationsNav");
let dashboardNav = document.getElementById("dashboardNav");
let authButtons = document.getElementById("authButtons");
let logoutButton = document.getElementById("logoutButton");
let applicationsFooterLink = document.getElementById("applicationsFooterLink");
let getStartedButton = document.getElementById("getStartedButton");
let startTrackingButton = document.getElementById("startTrackingButton");

if (isLoggedIn === "true" && currentUser) {
  applicationsNav.style.display = "block";
  dashboardNav.style.display = "block";

  authButtons.classList.add("hidden");
  logoutButton.classList.remove("d-none");

  applicationsFooterLink.style.display = "inline";
  getStartedButton.href = "home.html";
  startTrackingButton.href = "home.html";
} else {
  applicationsNav.style.display = "none";
  dashboardNav.style.display = "none";

  authButtons.classList.remove("hidden");
  logoutButton.classList.add("d-none");

  applicationsFooterLink.style.display = "none";
  getStartedButton.href = "signup.html";
  startTrackingButton.href = "signup.html";
}

function logout() {
  sessionStorage.removeItem("currentUser");
  sessionStorage.removeItem("isLoggedIn");
  sessionStorage.removeItem("showWelcome");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("jobVaultResumeId");
  sessionStorage.removeItem("selectedResumeTemplate");

  window.location.href = "index.html";
}
