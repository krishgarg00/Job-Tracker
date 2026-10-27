const API_URL = "http://localhost:5000/api/resumes";

const currentUser = JSON.parse(
    sessionStorage.getItem("currentUser") || "null"
);

const token = sessionStorage.getItem("token");

let resumes = [];

if (
    sessionStorage.getItem("isLoggedIn") !== "true" ||
    !currentUser ||
    !token
) {
    window.location.replace("login.html");
} else {
    loadResumes();
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function showMessage(message, isError = true) {
    const box = document.getElementById("message");

    box.innerHTML = message
        ? `<div class="${isError ? "error-message" : "alert alert-success"}">
           ${escapeHtml(message)}
       </div>`
        : "";
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(options.headers || {})
        }
    });

    let result = {};

    try {
        result = await response.json();
    } catch {
        // The API response may not contain JSON.
    }

    if (response.status === 401 || response.status === 403) {
        throw new Error("Your session may have expired. Please log in again.");
    }

    if (!response.ok) {
        throw new Error(result.message || "The request failed.");
    }

    return result;
}

async function loadResumes() {
    const loading = document.getElementById("loading");
    const grid = document.getElementById("resumeGrid");
    const empty = document.getElementById("emptyState");

    loading.hidden = false;
    grid.innerHTML = "";
    empty.hidden = true;
    showMessage("");

    try {
        const result = await apiRequest(API_URL);

        resumes = Array.isArray(result.resumes)
            ? result.resumes
            : [];

        loading.hidden = true;

        if (resumes.length === 0) {
            empty.hidden = false;
            return;
        }

        grid.innerHTML = resumes.map(resume => {
            const name = resume.title || "My Resume";
            const template = resume.template || "Template1";
            const updatedAt = resume.updatedAt
                ? new Date(resume.updatedAt).toLocaleDateString()
                : "Not available";

            return `
            <article class="resume-card">
                <div class="resume-card-top">
                    <div class="resume-icon" aria-hidden="true">📄</div>
                    <span class="template-label">
                        ${escapeHtml(template)}
                    </span>
                </div>

                <h2>${escapeHtml(name)}</h2>

                <div class="muted">
                    ${escapeHtml(
                resume.personalInfo?.fullName || "No name added"
            )}
                </div>

                <div class="resume-meta">
                    Last updated: ${escapeHtml(updatedAt)}
                </div>

                <div class="resume-actions">
                    <button class="btn btn-dark"
                        onclick="editResume('${escapeHtml(resume._id)}')">
                        Edit
                    </button>

                    <button
    class="btn btn-outline-primary"
    onclick="previewResume(
'${resume._id}',
'${resume.template || "Template1"}'
    )"
>
    Preview
</button>

                    <button class="btn btn-outline-danger"
                        onclick="deleteResume('${escapeHtml(resume._id)}')">
                        Delete
                    </button>
                </div>
            </article>
        `;
        }).join("");

    } catch (error) {
        loading.hidden = true;
        showMessage(error.message);

        if (/session may have expired/i.test(error.message)) {
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);
        }
    }
}

function createNewResume() {
    sessionStorage.removeItem("jobVaultResumeId");
    sessionStorage.removeItem("selectedResumeTemplate");
    window.location.href = "resume_input.html";
}

function findResume(id) {
    return resumes.find(resume => resume._id === id);
}

function editResume(id) {
    if (!findResume(id)) {
        showMessage("Resume not found. Please refresh the page.");
        return;
    }

    sessionStorage.setItem("jobVaultResumeId", id);
    window.location.href = "resume_input.html";
}

async function previewResume(id) {
    const resume = findResume(id);

    if (!resume) {
        showMessage("Resume not found. Please refresh the page.");
        return;
    }

    /*
      Reuse the existing resume-input loader to map the saved
      MongoDB resume into the format expected by your templates.
      The user can then choose the saved template and preview it.
    */
    sessionStorage.setItem("jobVaultResumeId", id);
    sessionStorage.setItem(
        "selectedResumeTemplate",
        resume.template || "Template1"
    );

    window.location.href = "template.html";
}

async function deleteResume(id) {
    const resume = findResume(id);

    if (!resume) {
        showMessage("Resume not found. Please refresh the page.");
        return;
    }

    const confirmed = confirm(
        `Are you sure you want to delete "${resume.title || "My Resume"}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
        await apiRequest(`${API_URL}/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        if (sessionStorage.getItem("jobVaultResumeId") === id) {
            sessionStorage.removeItem("jobVaultResumeId");
        }

        showMessage("Resume deleted successfully.", false);
        await loadResumes();

    } catch (error) {
        showMessage(error.message);
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

function previewResume(resumeId, templateName) {
    sessionStorage.setItem("jobVaultResumeId", resumeId);
    sessionStorage.setItem(
        "selectedResumeTemplate",
        templateName || "Template1"
    );

    window.location.href = `${templateName || "Template1"}.html`;
}
