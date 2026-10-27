// ==========================================
// 1. AUTHENTICATION AND USER SESSION
// ==========================================

let currentUser = null;

try {
    currentUser = JSON.parse(
        sessionStorage.getItem("currentUser") || "null"
    );
} catch (error) {
    console.error("Unable to read current user:", error);
}

const isLoggedIn = sessionStorage.getItem("isLoggedIn");
const showWelcome = sessionStorage.getItem("showWelcome");

const token = sessionStorage.getItem("token");

const API_URL = "https://job-tracker-d40a.onrender.com/api/applications";

if (isLoggedIn !== "true" || !currentUser || !token) {
    window.location.href = "login.html";
} else {
    document.getElementById("userName").textContent =
        currentUser.name || "User";

    document.getElementById("toastUserName").textContent =
        currentUser.name || "User";

    if (showWelcome === "true") {
        const toastElement = document.getElementById("welcomeToast");
        const toast = new bootstrap.Toast(toastElement);

        toast.show();
        sessionStorage.removeItem("showWelcome");
    }
}

// ==========================================
// 2. LOGOUT
// ==========================================

const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("showWelcome");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authToken");

    localStorage.removeItem("token");
    localStorage.removeItem("authToken");

    window.location.href = "index.html";
};

// Make the function accessible to the HTML onclick.
window.handleLogout = handleLogout;

// ==========================================
// 3. STATUS CSS CLASS
// ==========================================

const getStatusClass = (status) => {
    const classes = {
        Applied: "status-applied",
        Interview: "status-interview",
        Offer: "status-offer",
        Rejected: "status-rejected",
        Selected: "status-offer"
    };

    return classes[status] || "";
};

// Escape user-provided values before inserting them into HTML.
const escapeHTML = (value) => {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
};

// ==========================================
// 4. APPLICATION STATUS PIE CHART
// ==========================================

let statusChart = null;

const renderStatusPieChart = (applications) => {
    const counts = {
        Applied: 0,
        Interview: 0,
        Offer: 0,
        Rejected: 0
    };

    applications.forEach(application => {
        if (Object.prototype.hasOwnProperty.call(
            counts,
            application.status
        )) {
            counts[application.status]++;
        }
    });

    const total = Object.values(counts).reduce(
        (sum, count) => sum + count,
        0
    );

    const pieCanvas = document.getElementById("statusPieChart");
    const emptyState = document.getElementById("statusPieEmpty");

    // Update breakdown even when there are no applications.
    document.getElementById("chartAppliedCount").textContent =
        counts.Applied;

    document.getElementById("chartInterviewCount").textContent =
        counts.Interview;

    document.getElementById("chartOfferCount").textContent =
        counts.Offer;

    document.getElementById("chartRejectedCount").textContent =
        counts.Rejected;

    const updateProgress = (id, count) => {
        document.getElementById(id).style.width =
            total ? (count / total * 100) + "%" : "0%";
    };

    updateProgress("chartAppliedProgress", counts.Applied);
    updateProgress("chartInterviewProgress", counts.Interview);
    updateProgress("chartOfferProgress", counts.Offer);
    updateProgress("chartRejectedProgress", counts.Rejected);

    if (statusChart) {
        statusChart.destroy();
        statusChart = null;
    }

    if (total === 0) {
        pieCanvas.style.display = "none";
        emptyState.style.display = "block";
    } else {
        pieCanvas.style.display = "block";
        emptyState.style.display = "none";

        statusChart = new Chart(pieCanvas, {
            type: "pie",
            data: {
                labels: [
                    "Applied",
                    "Interview",
                    "Offer",
                    "Rejected"
                ],
                datasets: [{
                    data: [
                        counts.Applied,
                        counts.Interview,
                        counts.Offer,
                        counts.Rejected
                    ],
                    backgroundColor: [
                        "#ffc107",
                        "#0d6efd",
                        "#198754",
                        "#dc3545"
                    ],
                    borderWidth: 2,
                    borderColor: "#ffffff"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            padding: 18,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    // Dashboard insight
    const insight = document.getElementById("statusInsight");

    if (counts.Offer > 0) {
        insight.textContent =
            `Great! You already have ${counts.Offer} offer` +
            (counts.Offer > 1 ? "s" : "") +
            ". Keep up the momentum.";
    } else if (counts.Interview > 0) {
        insight.textContent =
            `You have ${counts.Interview} application` +
            (counts.Interview > 1 ? "s" : "") +
            " in the interview stage. Focus on your preparation.";
    } else if (counts.Applied > 0) {
        insight.textContent =
            `You have ${counts.Applied} active application` +
            (counts.Applied > 1 ? "s" : "") +
            ". Keep applying to increase your chances.";
    } else if (counts.Rejected > 0) {
        insight.textContent =
            "Keep applying and tracking your progress. Every application is a learning opportunity.";
    } else {
        insight.textContent =
            "Keep applying and track your progress here.";
    }
};

// ==========================================
// 5. RECENT APPLICATIONS
// ==========================================

const renderRecentApplications = (applications) => {
    const container = document.getElementById(
        "recentApplicationsContainer"
    );

    const emptyState = document.getElementById(
        "recentApplicationsEmpty"
    );

    container.innerHTML = "";

    if (applications.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    // Prefer creation time to find the most recently added records.
    const sortedApplications = [...applications].sort((a, b) => {
        const dateA = new Date(
            a.createdAt || a.applicationDate || 0
        ).getTime();

        const dateB = new Date(
            b.createdAt || b.applicationDate || 0
        ).getTime();

        return dateB - dateA;
    });

    sortedApplications.slice(0, 4).forEach(application => {
        const company = escapeHTML(application.company);
        const position = escapeHTML(application.role);
        const status = escapeHTML(application.status);
        const statusClass = getStatusClass(application.status);

        // Show the application date, falling back to creation date.
        const dateValue =
            application.applicationDate || application.createdAt;

        let formattedDate = "Date unavailable";

        if (dateValue) {
            const parsedDate = new Date(dateValue);

            if (!isNaN(parsedDate.getTime())) {
                formattedDate = parsedDate.toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );
            }
        }

        const item = document.createElement("div");
        item.className = "recent-application";

        item.innerHTML = `
        <div class="row align-items-center g-3">
            <div class="col-md-5">
                <div class="recent-company">${company}</div>
                <div class="recent-position">${position}</div>
            </div>

            <div class="col-md-3">
                <span class="status-badge ${statusClass}">
                    ${status}
                </span>
            </div>

            <div class="col-md-4 text-md-end">
                <div class="recent-date">
                    Added on ${escapeHTML(formattedDate)}
                </div>
            </div>
        </div>
    `;

        container.appendChild(item);
    });
};

// ==========================================
// 6. FETCH APPLICATIONS FROM EXPRESS API
// ==========================================

const fetchApplicationStats = async () => {
    if (isLoggedIn !== "true" || !currentUser || !token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        let result;

        try {
            result = await response.json();
        } catch {
            throw new Error(
                "The backend returned an invalid response."
            );
        }

        if (response.status === 401) {
            alert("Your session has expired. Please log in again.");
            handleLogout();
            return;
        }

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to fetch applications."
            );
        }

        // The protected backend endpoint returns only the
        // authenticated user's applications.
        const applications = (result.applications || []).map(app => ({
            ...app,
            role: app.role || "",
            company: app.company || "",
            status: app.status || "Applied",
            applicationDate: app.applicationDate || ""
        }));

        // Update dashboard statistics.
        document.getElementById("totalApplications").textContent =
            applications.length;

        document.getElementById("appliedApplications").textContent =
            applications.filter(
                app => app.status === "Applied"
            ).length;

        document.getElementById("interviewApplications").textContent =
            applications.filter(
                app => app.status === "Interview"
            ).length;

        document.getElementById("offerApplications").textContent =
            applications.filter(
                app => app.status === "Offer"
            ).length;

        renderStatusPieChart(applications);
        renderRecentApplications(applications);

    } catch (error) {
        console.error("Dashboard applications error:", error);

        document.getElementById(
            "recentApplicationsContainer"
        ).innerHTML = `
        <div class="alert alert-danger">
            Unable to load your applications. Please check that
            the backend is running and refresh the page.
        </div>
    `;
    }
};

// ==========================================
// 7. INITIALIZE DASHBOARD
// ==========================================

if (isLoggedIn === "true" && currentUser && token) {
    fetchApplicationStats();
}
