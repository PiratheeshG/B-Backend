// frontend/script.js

const API_URL = 'https://your-backend-app.azurewebsites.net'; // Replace with your backend URL

// User Authentication Logic

async function register() {
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    if (!email || !password) {
        alert("Please fill out all fields.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.status === 201) {
            alert("Registration successful! Redirecting to login...");
            window.location.href = "login.html";
        } else {
            alert(data.message || "Registration failed.");
        }
    } catch (err) {
        console.error(err);
        alert("An error occurred.");
    }
}

async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("token", data.token);
            alert("Login successful!");
            window.location.href = "index.html";
        } else {
            alert(data.message || "Login failed.");
        }
    } catch (err) {
        console.error(err);
        alert("An error occurred.");
    }
}

function logout() {
    localStorage.removeItem("token");
    alert("You have been logged out.");
    window.location.href = "login.html";
}

function checkAuth() {
    const token = localStorage.getItem("token");
    const loginLink = document.getElementById("login-link");
    const registerLink = document.getElementById("register-link");
    const logoutLink = document.getElementById("logout-link");

    if (token) {
        loginLink.style.display = "none";
        registerLink.style.display = "none";
        logoutLink.style.display = "inline";
    } else {
        loginLink.style.display = "inline";
        registerLink.style.display = "inline";
        logoutLink.style.display = "none";
    }
}

// Original Workout Management Logic

async function addWorkout() {
    const workout = {
        date: document.getElementById("date").value,
        type: document.getElementById("type").value,
        duration: parseInt(document.getElementById("duration").value),
        distance: parseFloat(document.getElementById("distance").value) || 0,
        avgSpeed: parseFloat(document.getElementById("avg-speed").value) || 0,
        avgHeartRate: parseInt(document.getElementById("avg-heart-rate").value) || 0,
        calories: parseInt(document.getElementById("calories").value) || 0
    };

    if (!workout.date || !workout.type || !workout.duration) {
        alert("Please fill out the required fields (date, type, duration).");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to add a workout.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/workouts`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token 
            },
            body: JSON.stringify(workout)
        });

        const data = await response.json();
        if (response.ok) {
            alert("Workout logged successfully.");
            displayWorkouts();
            document.getElementById("cardio-log-form").reset();
        } else {
            alert(data.message || "Failed to log workout.");
        }
    } catch (err) {
        console.error(err);
        alert("An error occurred.");
    }
}

async function displayWorkouts() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/workouts`, {
            headers: { 'Authorization': token }
        });
        const workouts = await response.json();
        const workoutTable = document.getElementById("workout-table").getElementsByTagName("tbody")[0];
        workoutTable.innerHTML = "";

        workouts.forEach((workout, index) => {
            const row = workoutTable.insertRow();
            row.innerHTML = `
                <td>${new Date(workout.date).toLocaleDateString()}</td>
                <td>${workout.type}</td>
                <td>${workout.duration}</td>
                <td>${workout.distance || "-"}</td>
                <td>${workout.avgSpeed || "-"}</td>
                <td>${workout.avgHeartRate || "-"}</td>
                <td>${workout.calories || "-"}</td>
                <td>
                    <button onclick="editWorkout(${index})">Edit</button>
                    <button onclick="deleteWorkout(${index})">Delete</button>
                </td>
            `;
        });
    } catch (err) {
        console.error(err);
    }
}

async function deleteWorkout(index) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to delete a workout.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/workouts/${index}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });
        const data = await response.json();
        if (response.ok) {
            alert("Workout deleted.");
            displayWorkouts();
        } else {
            alert(data.message || "Failed to delete workout.");
        }
    } catch (err) {
        console.error(err);
        alert("An error occurred.");
    }
}

function editWorkout(index) {
    // Implementation for editing workouts can be added here.
    alert("Edit functionality not implemented.");
}

// Third-Party Authentication
function authenticateWith(provider) {
    window.location.href = `${API_URL}/auth/${provider}`;
}

// Page Protection for Workout Log
function checkAndProtectPage() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to access this page.");
        window.location.href = "login.html";
    } else {
        checkAuth();
        displayWorkouts();
    }
}

// Initial Check
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});




