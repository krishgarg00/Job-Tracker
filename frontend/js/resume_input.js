// =========================
// 1. LOGIN CHECK
// =========================
const currentUser = JSON.parse(
    sessionStorage.getItem("currentUser") || "null"
);

const isLoggedIn = sessionStorage.getItem("isLoggedIn");
const API_URL = "https://job-tracker-d40a.onrender.com/api/resumes";

if (isLoggedIn !== "true" || !currentUser) {
    window.location.href = "login.html";
}

// =========================
// 2. FORM CONTAINERS
// =========================
const phoneContainer = document.getElementById("phoneContainer");
const educationContainer = document.getElementById("educationContainer");
const experienceContainer = document.getElementById("experienceContainer");
const skillsContainer = document.getElementById("skillsContainer");
const projectsContainer = document.getElementById("projectsContainer");

// =========================
// 3. HELPER FUNCTIONS
// =========================
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function addPhone(value = "") {
    const div = document.createElement("div");
    div.className = "input-group mb-2 phone-item";

    div.innerHTML = `
    <input type="tel"
        class="form-control phone-input"
        placeholder="Enter phone number"
        value="${escapeHtml(value)}"
        required>

    <button type="button"
        class="btn btn-outline-danger"
        onclick="removeItem(this)">
        Remove
    </button>
`;

    phoneContainer.appendChild(div);
}

function addEducation(data = {}) {
    const div = document.createElement("div");
    div.className = "entry-card education-item";

    div.innerHTML = `
    <div class="row g-3">
        <div class="col-12">
            <label class="form-label">College / University</label>
            <input type="text"
                class="form-control education-college"
                placeholder="Enter college or university"
                value="${escapeHtml(data.college || "")}">
        </div>

        <div class="col-md-6">
            <label class="form-label">Degree</label>
            <input type="text"
                class="form-control education-degree"
                placeholder="e.g. B.Tech Computer Science"
                value="${escapeHtml(data.degree || "")}">
        </div>

        <div class="col-md-6">
            <label class="form-label">Graduation Year</label>
            <input type="text"
                class="form-control education-year"
                placeholder="e.g. 2027"
                value="${escapeHtml(data.graduationYear || "")}">
        </div>
    </div>

    <button type="button"
        class="btn btn-outline-danger btn-sm mt-3"
        onclick="removeItem(this)">
        Remove Education
    </button>
`;

    educationContainer.appendChild(div);
}

function addExperience(data = {}) {
    const div = document.createElement("div");
    div.className = "entry-card experience-item";

    div.innerHTML = `
    <div class="row g-3">
        <div class="col-12">
            <label class="form-label">Company</label>
            <input type="text"
                class="form-control experience-company"
                placeholder="Enter company name"
                value="${escapeHtml(data.company || "")}">
        </div>

        <div class="col-md-6">
            <label class="form-label">Job Role</label>
            <input type="text"
                class="form-control experience-role"
                placeholder="e.g. Software Developer"
                value="${escapeHtml(data.jobRole || "")}">
        </div>

        <div class="col-md-6">
            <label class="form-label">Duration</label>
            <input type="text"
                class="form-control experience-duration"
                placeholder="e.g. Jan 2025 - Present"
                value="${escapeHtml(data.duration || "")}">
        </div>
    </div>

    <button type="button"
        class="btn btn-outline-danger btn-sm mt-3"
        onclick="removeItem(this)">
        Remove Experience
    </button>
`;

    experienceContainer.appendChild(div);
}

function addSkill(value = "") {
    const div = document.createElement("div");
    div.className = "input-group mb-2 skill-item";

    div.innerHTML = `
    <input type="text"
        class="form-control skill-input"
        placeholder="e.g. JavaScript"
        value="${escapeHtml(value)}"
        required>

    <button type="button"
        class="btn btn-outline-danger"
        onclick="removeItem(this)">
        Remove
    </button>
`;

    skillsContainer.appendChild(div);
}

function addProject(data = {}) {
    const div = document.createElement("div");
    div.className = "entry-card project-item";

    div.innerHTML = `
    <div class="row g-3">
        <div class="col-12">
            <label class="form-label">Project Name</label>
            <input type="text"
                class="form-control project-name"
                placeholder="Enter project name"
                value="${escapeHtml(data.name || "")}">
        </div>

        <div class="col-12">
            <label class="form-label">Project Details</label>
            <textarea
                class="form-control project-details"
                rows="3"
                placeholder="Describe your project">${escapeHtml(data.details || "")}</textarea>
        </div>
    </div>

    <button type="button"
        class="btn btn-outline-danger btn-sm mt-3"
        onclick="removeItem(this)">
        Remove Project
    </button>
`;

    projectsContainer.appendChild(div);
}

function removeItem(button) {
    const item = button.closest(
        ".phone-item, .education-item, .experience-item, .skill-item, .project-item"
    );

    if (item) {
        item.remove();
    }
}

// =========================
// 4. CONVERT SAVED DATA
// =========================
function convertBackendResume(resume) {
    const personal = resume.personalInfo || {};

    return {
        title: resume.title || "My Resume",
        template: resume.template || "Template1",

        fullName: personal.fullName || "",
        email: personal.email || "",
        linkedin: personal.linkedin || "",

        phones: personal.phone
            ? personal.phone.split(",").map(p => p.trim()).filter(Boolean)
            : [],

        education: resume.education || [],
        experience: resume.experience || [],
        skillsList: resume.skills || [],
        projectList: resume.projects || []
    };
}

function convertLegacyData(data) {
    const result = { ...data };

    result.title = data.title || "My Resume";

    result.phones = data.phones ||
        (data.phone ? [data.phone] : []);

    result.education = data.education || [];

    if (
        !result.education.length &&
        (data.college || data.degree || data.graduationYear)
    ) {
        result.education = [{
            college: data.college || "",
            degree: data.degree || "",
            graduationYear: data.graduationYear || ""
        }];
    }

    result.experience = data.experience || [];

    if (
        !result.experience.length &&
        (data.company || data.jobRole || data.experienceDuration)
    ) {
        result.experience = [{
            company: data.company || "",
            jobRole: data.jobRole || "",
            duration: data.experienceDuration || ""
        }];
    }

    result.skillsList = data.skillsList ||
        (typeof data.skills === "string"
            ? data.skills.split(",").map(s => s.trim()).filter(Boolean)
            : []);

    result.projectList = data.projectList || [];

    if (!result.projectList.length && data.projects) {
        result.projectList = [{
            name: "",
            details: data.projects
        }];
    }

    return result;
}

// =========================
// 5. DISPLAY DATA IN FORM
// =========================
function populateForm(data = {}) {
    const titleInput = document.getElementById("resumeTitle");

    if (titleInput) {
        titleInput.value = data.title || "My Resume";
    }

    document.getElementById("fullName").value = data.fullName || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("linkedin").value = data.linkedin || "";

    phoneContainer.innerHTML = "";
    educationContainer.innerHTML = "";
    experienceContainer.innerHTML = "";
    skillsContainer.innerHTML = "";
    projectsContainer.innerHTML = "";

    (data.phones || []).forEach(phone => addPhone(phone));
    (data.education || []).forEach(item => addEducation(item));
    (data.experience || []).forEach(item => addExperience(item));
    (data.skillsList || []).forEach(skill => addSkill(skill));
    (data.projectList || []).forEach(project => addProject(project));

    if (!phoneContainer.children.length) addPhone();
    if (!educationContainer.children.length) addEducation();
    if (!experienceContainer.children.length) addExperience();
    if (!skillsContainer.children.length) addSkill();
    if (!projectsContainer.children.length) addProject();
}

// =========================
// 6. LOAD RESUME FROM MONGODB
// =========================
async function loadResumeFromBackend() {
    const token = sessionStorage.getItem("token");

    if (!token) {
        alert("Your login session has expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not load resumes.");
        }

        const resumes = Array.isArray(result.resumes)
            ? result.resumes
            : [];

        const savedResumeId =
            sessionStorage.getItem("jobVaultResumeId");

        const resume =
            resumes.find(item => item._id === savedResumeId) ||
            resumes[0];

        if (resume) {
            sessionStorage.setItem("jobVaultResumeId", resume._id);

            const data = convertBackendResume(resume);

            populateForm(data);

            sessionStorage.setItem(
                "selectedResumeTemplate",
                resume.template || "Template1"
            );

            return;
        }

        // No saved resume: start with a clean form.
        // Do not load another account's shared local draft.
        sessionStorage.removeItem("jobVaultResumeId");
        sessionStorage.removeItem("selectedResumeTemplate");


        populateForm({ title: "My Resume" });

    } catch (error) {
        console.error("Resume loading error:", error);

        // Clear shared draft data to avoid showing stale information.

        sessionStorage.removeItem("jobVaultResumeId");
        sessionStorage.removeItem("selectedResumeTemplate");

        populateForm({ title: "My Resume" });

        alert(
            "Could not load your resumes from the backend. " +
            "The form has been cleared to avoid showing stale data. " +
            "Please check your backend connection and try again."
        );
    }
}

// =========================
// 7. COLLECT FORM DATA
// =========================
function collectResumeData() {
    const phones = [...document.querySelectorAll(".phone-input")]
        .map(input => input.value.trim())
        .filter(Boolean);

    const education = [...document.querySelectorAll(".education-item")]
        .map(item => ({
            college: item.querySelector(".education-college").value.trim(),
            degree: item.querySelector(".education-degree").value.trim(),
            graduationYear: item.querySelector(".education-year").value.trim()
        }))
        .filter(item =>
            item.college || item.degree || item.graduationYear
        );

    const experience = [...document.querySelectorAll(".experience-item")]
        .map(item => ({
            company: item.querySelector(".experience-company").value.trim(),
            jobRole: item.querySelector(".experience-role").value.trim(),
            duration: item.querySelector(".experience-duration").value.trim()
        }))
        .filter(item =>
            item.company || item.jobRole || item.duration
        );

    const skillsList = [...document.querySelectorAll(".skill-input")]
        .map(input => input.value.trim())
        .filter(Boolean);

    const projectList = [...document.querySelectorAll(".project-item")]
        .map(item => ({
            name: item.querySelector(".project-name").value.trim(),
            details: item.querySelector(".project-details").value.trim()
        }))
        .filter(item => item.name || item.details);

    return {
        title:
            document.getElementById("resumeTitle").value.trim() ||
            "My Resume",

        fullName: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        phones,
        linkedin: document.getElementById("linkedin").value.trim(),

        education,
        experience,
        skillsList,
        projectList,

        // Legacy fields used by existing template pages.
        phone: phones[0] || "",
        college: education[0]?.college || "",
        degree: education[0]?.degree || "",
        graduationYear: education[0]?.graduationYear || "",
        company: experience[0]?.company || "",
        jobRole: experience[0]?.jobRole || "",
        experienceDuration: experience[0]?.duration || "",
        skills: skillsList.join(", "),

        projects: projectList
            .map(project =>
                `${project.name}${project.details ? " - " + project.details : ""}`
            )
            .join("\n")
    };
}

// =========================
// 8. SAVE RESUME TO MONGODB
// =========================
document.getElementById("resumeForm").addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        const token = sessionStorage.getItem("token");

        if (!token) {
            alert("Please log in again.");
            window.location.href = "login.html";
            return;
        }

        const resumeData = collectResumeData();

        const payload = {
            title: resumeData.title,
            template:
                sessionStorage.getItem("selectedResumeTemplate") ||
                "Template1",

            personalInfo: {
                fullName: resumeData.fullName,
                email: resumeData.email,
                phone: resumeData.phones.join(", "),
                linkedin: resumeData.linkedin
            },

            education: resumeData.education,
            experience: resumeData.experience,
            skills: resumeData.skillsList,
            projects: resumeData.projectList
        };

        const resumeId =
            sessionStorage.getItem("jobVaultResumeId");

        const isUpdating = Boolean(resumeId);

        const submitButton = document.querySelector(
            '#resumeForm button[type="submit"]'
        );

        const originalButtonText = submitButton
            ? submitButton.textContent
            : "Save Resume";

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Saving...";
        }

        try {
            const response = await fetch(
                isUpdating ? `${API_URL}/${resumeId}` : API_URL,
                {
                    method: isUpdating ? "PUT" : "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify(payload)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to save resume."
                );
            }

            if (result.resume?._id) {
                sessionStorage.setItem(
                    "jobVaultResumeId",
                    result.resume._id
                );
            }

            sessionStorage.setItem(
                "selectedResumeTemplate",
                payload.template
            );

            alert("Resume saved successfully!");

            window.location.href = "template.html";

        } catch (error) {
            console.error("Resume save error:", error);

            alert(
                "Could not save your resume to the backend. " +
                "Please check your backend connection and try again."
            );

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    }
);

// =========================
// 9. LOGOUT
// =========================
function handleLogout() {
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("showWelcome");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("jobVaultResumeId");
    sessionStorage.removeItem("selectedResumeTemplate");

    window.location.href = "login.html";
}

// =========================
// 10. LOAD SAVED RESUME
// =========================
loadResumeFromBackend();
