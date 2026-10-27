let currentUser = null;
try {
    currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
} catch (e) {
    currentUser = null;
}


let isLoggedIn =
    sessionStorage.getItem("isLoggedIn");


/*
 * User login nahi hai
 * to Resume Builder open nahi hoga.
 */

if (
    isLoggedIn !== "true" ||
    !currentUser
) {

    window.location.href = "login.html";

}


/*
 * Login hai to Logout button show karo.
 */

else {

    document
        .getElementById("logoutContainer")
        .style.setProperty(
            "display",
            "flex",
            "important"
        );

}


/*
 * Logout function
 */

function handleLogout() {

    sessionStorage.removeItem("currentUser");

    sessionStorage.removeItem("isLoggedIn");

    sessionStorage.removeItem("showWelcome");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("jobVaultResumeId");
    sessionStorage.removeItem("selectedResumeTemplate");


    window.location.href = "index.html";

}
