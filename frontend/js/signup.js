const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const API_URL = "https://job-tracker-d40a.onrender.com/api/auth";

const handleSubmit = async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }

    // Match the backend's minimum password length
    if (password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
    }

    // Keep the existing password-strength requirements
    if (!/[A-Z]/.test(password)) {
        alert("Password must contain at least one uppercase letter.");
        return;
    }

    if (!/[0-9]/.test(password)) {
        alert("Password must contain at least one number.");
        return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        alert("Password must contain at least one special character.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to create account.");
        }

        // Store the authentication session, not the password
        sessionStorage.setItem("token", result.token);
        sessionStorage.setItem("currentUser", JSON.stringify(result.user));
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("showWelcome", "true");

        alert("Account created successfully!");
        window.location.href = "home.html";

    } catch (error) {
        console.error("Signup error:", error);
        alert(
            error.message ||
            "Unable to create account. Please check that the backend is running."
        );
    }
};
