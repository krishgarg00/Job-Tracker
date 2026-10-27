const currentUser = JSON.parse(
    sessionStorage.getItem("currentUser") || "null"
);

const isLoggedIn = sessionStorage.getItem("isLoggedIn");

if (isLoggedIn !== "true" || !currentUser) {
    window.location.replace("login.html");
}

const API_URL = "http://localhost:5000/api/resumes";

async function selectTemplate(templateName, button) {
    const token = sessionStorage.getItem("token");
    const resumeId = sessionStorage.getItem("jobVaultResumeId");

    if (!token) {
        alert("Your login session has expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    if (!resumeId) {
        alert("Please save your resume information first.");
        window.location.href = "resume_input.html";
        return;
    }

    const originalText = button.textContent.trim();
    button.disabled = true;
    button.textContent = "Saving...";

    try {
        const response = await fetch(`${API_URL}/${resumeId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                template: templateName
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to save the template.");
        }

        sessionStorage.setItem("selectedResumeTemplate", templateName);

        window.location.href = `${templateName}.html`;
    } catch (error) {
        console.error("Template selection error:", error);
        alert(error.message || "Could not save your template choice. Check your backend.");
        button.disabled = false;
        button.textContent = originalText;
    }
}

function handleLogout() {
    [
        "currentUser",
        "isLoggedIn",
        "showWelcome",
        "token",
        "jobVaultResumeId",
        "selectedResumeTemplate"
    ].forEach(key => sessionStorage.removeItem(key));

    window.location.href = "index.html";
}
