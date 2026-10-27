const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const API_URL = "http://localhost:5000/api/auth";

const handleLogin = async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Login failed.");
        }

        // Save the JWT and logged-in user's details
        sessionStorage.setItem("token", result.token);
        sessionStorage.setItem("currentUser", JSON.stringify(result.user));
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("showWelcome", "true");

        window.location.href = "home.html";

    } catch (error) {
        console.error("Login error:", error);
        alert(
            error.message ||
            "Unable to log in. Please check that the backend is running."
        );
    }
};
