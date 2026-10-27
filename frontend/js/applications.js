const API_URL = "http://localhost:5000/api/applications";

let editingApplicationId = null;

const currentUser = JSON.parse(
    sessionStorage.getItem("currentUser") || "null"
);

const token = sessionStorage.getItem("token");
const isLoggedIn = sessionStorage.getItem("isLoggedIn");

if (isLoggedIn !== "true" || !currentUser || !token) {
    alert("Your login session has expired. Please log in again.");
    window.location.href = "login.html";
}

const company = document.getElementById("company");
const position = document.getElementById("position");
const jobLocation = document.getElementById("location");
const status = document.getElementById("status");
const date = document.getElementById("date");
const jobLink = document.getElementById("jobLink");
const notes = document.getElementById("notes");

const applicationForm = document.getElementById("applicationForm");
const applicationsContainer = document.getElementById("applicationsContainer");
const noApplications = document.getElementById("noApplications");
const applicationCount = document.getElementById("applicationCount");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

let allMyApplications = [];

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers
        }
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("isLoggedIn");
            sessionStorage.removeItem("currentUser");
            window.location.href = "login.html";
        }

        throw new Error(result.message || "Request failed.");
    }

    return result;
}

// Map MongoDB field names to the existing UI field names.
function toFrontendApplication(item) {
    return {
        ...item,
        id: item._id,
        position: item.role || "",
        date: item.applicationDate
            ? String(item.applicationDate).slice(0, 10)
            : "",
        jobLink: item.jobUrl || ""
    };
}

function getStatusClass(value) {
    if (value === "Applied") return "status-applied";
    if (value === "Interview") return "status-interview";
    if (value === "Offer") return "status-offer";
    if (value === "Rejected") return "status-rejected";
    return "status-default";
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function displayApplications(applications) {
    applicationsContainer.innerHTML = "";
    applicationCount.textContent = applications.length;
    noApplications.style.display = applications.length ? "none" : "block";

    applications.forEach(application => {
        const statusClass = getStatusClass(application.status);

        const card = document.createElement("div");
        card.className = "col-12 col-md-6 col-lg-4";

        card.innerHTML = `
    <div class="card job-card shadow-sm h-100 p-4">
        <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
                <h5 class="fw-bold mb-1">
                    ${escapeHtml(application.company)}
                </h5>
                <p class="text-secondary mb-0">
                    ${escapeHtml(application.position)}
                </p>
            </div>
            <span class="status-badge ${statusClass}">
                ${escapeHtml(application.status)}
            </span>
        </div>

        <div class="mb-3">
            <p class="mb-2">
                <strong>Location:</strong>
                ${escapeHtml(application.location || "Not specified")}
            </p>
            <p class="mb-2">
                <strong>Date:</strong>
                ${escapeHtml(application.date || "Not specified")}
            </p>
        </div>

        <p class="text-secondary mb-3">
            ${escapeHtml(application.notes || "No notes added")}
        </p>

        <div class="mt-auto">
            <div class="d-flex gap-2 flex-wrap">
                ${application.jobLink
                ? `<a href="${escapeHtml(application.jobLink)}"
                        target="_blank" rel="noopener noreferrer"
                        class="btn btn-dark btn-sm">View Job</a>`
                : ""
            }
                <button class="btn btn-outline-dark btn-sm edit-btn">
                    Edit
                </button>
                <button class="btn btn-outline-dark btn-sm delete-btn">
                    Delete
                </button>
            </div>
        </div>
    </div>
`;

        card.querySelector(".edit-btn").addEventListener("click", () => {
            editApplication(application.id);
        });

        card.querySelector(".delete-btn").addEventListener("click", () => {
            deleteApplication(application.id);
        });

        applicationsContainer.appendChild(card);
    });
}

function filterApplications() {
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedStatus = statusFilter.value;

    const filtered = allMyApplications.filter(application => {
        const companyName = (application.company || "").toLowerCase();
        const positionName = (application.position || "").toLowerCase();

        const matchesSearch =
            companyName.includes(searchText) ||
            positionName.includes(searchText);

        const matchesStatus =
            selectedStatus === "all" ||
            application.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    displayApplications(filtered);
}

async function fetchApplications() {
    try {
        const result = await apiRequest(API_URL);

        allMyApplications = (result.applications || [])
            .map(toFrontendApplication);

        filterApplications();
    } catch (error) {
        console.error("Fetch applications error:", error);
        alert("Unable to load applications: " + error.message);
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    const application = {
        company: company.value.trim(),
        role: position.value.trim(),
        location: jobLocation.value.trim(),
        status: status.value,
        applicationDate: date.value || undefined,
        jobUrl: jobLink.value.trim(),
        notes: notes.value.trim()
    };

    const submitButton = applicationForm.querySelector(
        'button[type="submit"]'
    );

    if (submitButton) submitButton.disabled = true;

    try {
        const isEditing = Boolean(editingApplicationId);

        await apiRequest(
            isEditing
                ? `${API_URL}/${editingApplicationId}`
                : API_URL,
            {
                method: isEditing ? "PUT" : "POST",
                body: JSON.stringify(application)
            }
        );

        editingApplicationId = null;
        applicationForm.reset();

        const modalElement = document.getElementById("addApplicationModal");
        bootstrap.Modal.getInstance(modalElement)?.hide();

        document.getElementById("addApplicationModalLabel").textContent =
            "Add Job Application";

        await fetchApplications();
    } catch (error) {
        console.error("Save application error:", error);
        alert("Unable to save application: " + error.message);
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
}

async function editApplication(id) {
    try {
        const result = await apiRequest(`${API_URL}/${id}`);
        const application = toFrontendApplication(result.application);

        editingApplicationId = id;

        company.value = application.company || "";
        position.value = application.position || "";
        jobLocation.value = application.location || "";
        status.value = application.status || "Applied";
        date.value = application.date || "";
        jobLink.value = application.jobLink || "";
        notes.value = application.notes || "";

        document.getElementById("addApplicationModalLabel").textContent =
            "Edit Job Application";

        bootstrap.Modal
            .getOrCreateInstance(document.getElementById("addApplicationModal"))
            .show();
    } catch (error) {
        console.error("Edit application error:", error);
        alert("Unable to load application: " + error.message);
    }
}

async function deleteApplication(id) {
    if (!confirm("Are you sure you want to delete this application?")) {
        return;
    }

    try {
        await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        await fetchApplications();
    } catch (error) {
        console.error("Delete application error:", error);
        alert("Unable to delete application: " + error.message);
    }
}

document.getElementById("addApplicationModal").addEventListener(
    "hidden.bs.modal",
    () => {
        editingApplicationId = null;
        applicationForm.reset();

        document.getElementById("addApplicationModalLabel").textContent =
            "Add Job Application";
    }
);

searchInput.addEventListener("input", filterApplications);
statusFilter.addEventListener("change", filterApplications);
applicationForm.addEventListener("submit", handleSubmit);

function handleLogout() {
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("showWelcome");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("jobVaultResumeId");
    sessionStorage.removeItem("selectedResumeTemplate");

    window.location.href = "login.html";
}

if (isLoggedIn === "true" && currentUser && token) {
    fetchApplications();
}
