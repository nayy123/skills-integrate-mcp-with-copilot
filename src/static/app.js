document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm =  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión como profesor para registrar estudiantes");
      return;
    }

    const email = document.getElementById("email").value;
    const activityName = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activityName
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        }
      );ementById("signup-form");
  const messageDiv = document.getElementById("message");
  
  // Elementos de autenticación
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const loginModal = document.getElementById("login-modal");
  const loginForm = document.getElementById("login-form");
  const modalClose = document.getElementById("modal-close");
  const userInfo = document.getElementById("user-info");
  const teacherName = document.getElementById("teacher-name");

  let currentUser = null;
  
  // Verificar si hay un token guardado
  const token = localStorage.getItem("token");
  if (token) {
    fetchCurrentUser(token);
  }
  
  // Event listeners de autenticación
  loginBtn.addEventListener("click", () => loginModal.classList.remove("hidden"));
  modalClose.addEventListener("click", () => loginModal.classList.add("hidden"));
  logoutBtn.addEventListener("click", handleLogout);
  
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    try {
      const response = await fetch("/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        await fetchCurrentUser(data.access_token);
        loginModal.classList.add("hidden");
        loginForm.reset();
      } else {
        alert(data.detail || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error durante el login:", error);
      alert("Error al iniciar sesión");
    }
  });

  async function fetchCurrentUser(token) {
    try {
      const response = await fetch("/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        currentUser = await response.json();
        updateUIForUser(currentUser);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      handleLogout();
    }
  }

  function updateUIForUser(user) {
    if (user) {
      loginBtn.classList.add("hidden");
      userInfo.classList.remove("hidden");
      teacherName.textContent = user.name;
      signupForm.classList.remove("hidden");
    } else {
      loginBtn.classList.remove("hidden");
      userInfo.classList.add("hidden");
      teacherName.textContent = "";
      signupForm.classList.add("hidden");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    currentUser = null;
    updateUIForUser(null);
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft =
          details.max_participants - details.participants.length;

        // Create participants HTML with delete icons instead of bullet points
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
              <h5>Participants:</h5>
              <ul class="participants-list">
                ${details.participants
                  .map(
                    (email) =>
                      `<li><span class="participant-email">${email}</span><button class="delete-btn" data-activity="${name}" data-email="${email}">❌</button></li>`
                  )
                  .join("")}
              </ul>
            </div>`
            : `<p><em>No participants yet</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
