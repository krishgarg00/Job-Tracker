function esc(v) { return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") }
async function getData() {
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
async function render() {
    try {
        const d = await getData();
        const first = d.experience[0] || {};
        document.getElementById("resumeName").textContent = d.fullName || "Your Name";
        document.getElementById("experienceRole").textContent = first.jobRole || "Job Role";
        let contact = []; if (d.email) contact.push(esc(d.email)); if (d.phones.length) contact.push(d.phones.map(esc).join(" | "));
        document.getElementById("resumeContact").innerHTML = contact.length ? contact.join("<br>") : "your@email.com<br>+91 XXXXX XXXXX";
        const li = document.getElementById("resumeLinkedin"); li.textContent = d.linkedin || ""; li.style.display = d.linkedin ? "block" : "none";
        document.getElementById("experienceContainer").innerHTML = d.experience.length ? d.experience.map(x => `<div class="item"><div class="item-title">${esc(x.jobRole)}</div><div>${esc(x.company)}</div><div class="item-muted">${esc(x.duration)}</div></div>`).join("") : '<span class="item-muted">Experience information not added.</span>';
        document.getElementById("educationContainer").innerHTML = d.education.length ? d.education.map(x => `<div class="item"><div class="item-title">${esc(x.degree)}</div><div>${esc(x.college)}</div><div class="item-muted">${esc(x.graduationYear)}</div></div>`).join("") : '<span class="item-muted">Education information not added.</span>';
        document.getElementById("resumeSkills").innerHTML = d.skills.length ? d.skills.map(x => `<span class="skill-entry">${esc(x)}</span>`).join("") : '<span class="item-muted">Skills not added.</span>';
        document.getElementById("resumeProjects").innerHTML = d.projects.length ? d.projects.map(x => { const name = x.name || "Project", details = x.details || x.description || ""; return `<div class="item"><div class="item-title">${esc(name)}</div>${details ? `<div class="item-text">${esc(details).replace(/\n/g, "<br>")}</div>` : ""}</div>` }).join("") : '<span class="item-muted">Projects not added.</span>';
    } catch (error) {
        console.error("Resume preview error:", error);
        alert(error.message);
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
let currentUser = null;
try {
    currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
} catch (e) {
    currentUser = null;
}
const logged = sessionStorage.getItem("isLoggedIn");
const token = sessionStorage.getItem("token");

if (logged !== "true" || !currentUser || !token) {
    window.location.href = "login.html";
} else {
    render();
}

function downloadResume() {
    window.print();
}
