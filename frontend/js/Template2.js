function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function getResumeData() {
    const token = sessionStorage.getItem("token");
    const resumeId = sessionStorage.getItem("jobVaultResumeId");

    if (!token || !resumeId) {
        throw new Error("Resume session missing. Please reopen My Resumes.");
    }

    const response = await fetch(
        `http://localhost:5000/api/resumes/${resumeId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const result = await response.json();

    if (!response.ok || !result.resume) {
        throw new Error(result.message || "Could not load resume.");
    }

    const resume = result.resume;
    const personal = resume.personalInfo || {};

    return {
        fullName: personal.fullName || "",
        email: personal.email || "",
        linkedin: personal.linkedin || "",
        phones: personal.phone
            ? personal.phone.split(",").map(p => p.trim()).filter(Boolean)
            : [],
        education: resume.education || [],
        experience: resume.experience || [],
        skills: resume.skills || [],
        projects: resume.projects || []
    };
}

function renderPersonal(data) {
    document.getElementById("resumeName").textContent =
        data.fullName || "Your Name";

    const contact = [];

    if (data.email) {
        contact.push(data.email);
    }

    data.phones.forEach(phone => {
        contact.push(phone);
    });

    document.getElementById("resumeContact").textContent =
        contact.length
            ? contact.join(" | ")
            : "+91 XXXXX XXXXX";

    const linkedin =
        document.getElementById("resumeLinkedin");

    if (data.linkedin) {
        linkedin.textContent = data.linkedin;
        linkedin.style.display = "block";
    } else {
        linkedin.textContent = "";
        linkedin.style.display = "none";
    }
}

function renderExperience(experience) {
    const container =
        document.getElementById("experienceContainer");

    if (!experience.length) {
        container.innerHTML =
            '<span class="resume-muted">Experience information not added.</span>';
        return;
    }

    container.innerHTML =
        experience.map(item => `
            <div class="resume-entry">

                <div class="resume-subtitle">
                    ${escapeHtml(item.jobRole)}
                </div>

                <div class="resume-main">
                    ${escapeHtml(item.company)}
                </div>

                <div class="resume-muted">
                    ${escapeHtml(item.duration)}
                </div>

            </div>
        `).join("");
}

function renderEducation(education) {
    const container =
        document.getElementById("educationContainer");

    if (!education.length) {
        container.innerHTML =
            '<span class="resume-muted">Education information not added.</span>';
        return;
    }

    container.innerHTML =
        education.map(item => `
            <div class="resume-entry">

                <div class="resume-subtitle">
                    ${escapeHtml(item.degree)}
                </div>

                <div class="resume-main">
                    ${escapeHtml(item.college)}
                </div>

                <div class="resume-muted">
                    ${escapeHtml(item.graduationYear)}
                </div>

            </div>
        `).join("");
}

function renderSkills(skills) {
    const container =
        document.getElementById("resumeSkills");

    if (!skills.length) {
        container.innerHTML =
            '<span class="resume-muted">Skills not added.</span>';
        return;
    }

    container.innerHTML =
        skills.map(skill => `
            <span class="skill-entry">
                ${escapeHtml(skill)}
            </span>
        `).join("");
}

function renderProjects(projects) {
    const container =
        document.getElementById("resumeProjects");

    if (!projects.length) {
        container.innerHTML =
            '<span class="resume-muted">Projects not added.</span>';
        return;
    }

    container.innerHTML =
        projects.map(project => {

            const name =
                project.name || "Project";

            const details =
                project.details ||
                project.description ||
                "";

            return `
                <div class="resume-entry">

                    <div class="resume-subtitle">
                        ${escapeHtml(name)}
                    </div>

                    ${details
                    ? `
                                <div class="resume-content">
                                    ${escapeHtml(details)
                        .replace(/\n/g, "<br>")}
                                </div>
                            `
                    : ""
                }

                </div>
            `;
        }).join("");
}

async function renderResume() {
    try {
        const data = await getResumeData();

        renderPersonal(data);
        renderEducation(data.education);
        renderExperience(data.experience);
        renderSkills(data.skills);
        renderProjects(data.projects);
    } catch (error) {
        console.error("Resume preview error:", error);
        alert(error.message);
    }
}

function downloadResume() {
    window.print();
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

let currentUser = null;
try {
    currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
} catch (e) {
    currentUser = null;
}

const isLoggedIn =
    sessionStorage.getItem("isLoggedIn");

if (isLoggedIn !== "true" || !currentUser) {
    window.location.href = "login.html";
} else {
    renderResume();
}
