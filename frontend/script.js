const BASE_URL = "https://food-wa29.onrender.com";

function goBack() {
    window.history.back();
}

function goForward() {
    window.history.forward();
}

function goHome() {
    window.location.href = "/index.html";
}

function logout() {
    sessionStorage.removeItem("user");
    window.location.href = "/login.html";
}

function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem("user"));
}

function requireRole(role) {
    const user = getCurrentUser();
    if (!user || user.role !== role) {
        window.location.href = "/login.html";
        return false;
    }
    return true;
}

function initSignupPage() {
    const roleSelect = document.getElementById("role");
    const capacityWrap = document.getElementById("capacity-wrap");

    if (!roleSelect || !capacityWrap) return;

    const params = new URLSearchParams(window.location.search);
    const roleFromQuery = params.get("role");
    if (roleFromQuery === "restaurant" || roleFromQuery === "ngo") {
        roleSelect.value = roleFromQuery;
    }

    const toggleCapacity = () => {
        capacityWrap.style.display = roleSelect.value === "ngo" ? "block" : "none";
    };

    roleSelect.addEventListener("change", toggleCapacity);
    toggleCapacity();
}

function initNgoPage() {
    if (requireRole("ngo")) {
        loadFood();
    }
}

function initRestaurantPage() {
    requireRole("restaurant");
}

function initOtpPage() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = "/login.html";
    }
}

// ---------------- HELPER FUNCTIONS ----------------
function getRestaurantId(user) {
    return user.restaurant_id;
}

function getNgoId(user) {
    return user.ngo_id;
}

// ---------------- SIGNUP ----------------
async function signup() {
    const role = document.getElementById("role").value;
    const capacityRaw = document.getElementById("capacity").value;

    let data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        role: role
    };

    if (role === "ngo") {
        data.total_capacity_smu = parseInt(capacityRaw);
    }

    const res = await fetch(BASE_URL + "/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
        alert("Signup successful!");
        window.location.href = "/login.html";
    } else {
        alert(result.error);
    }
}

// ---------------- LOGIN ----------------
async function login() {
    const res = await fetch(BASE_URL + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        })
    });

    const data = await res.json();

    if (data.user) {
        sessionStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "restaurant") {
            window.location.href = "/restaurant.html";
        } else {
            window.location.href = "/ngo.html";
        }
    } else {
        alert(data.error);
    }
}

// ---------------- ADD FOOD (RESTAURANT) ----------------
async function addFood() {
    const user = getCurrentUser();

    const res = await fetch(BASE_URL + "/add-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            restaurant_id: getRestaurantId(user),
            food_name: document.getElementById("food_name").value,
            food_type: document.getElementById("food_type").value,
            shelf_life_hours: parseInt(document.getElementById("shelf").value),
            dry_or_wet: document.getElementById("dry").value,
            calorific_value: parseInt(document.getElementById("cal").value),
            smu_equivalent: parseInt(document.getElementById("smu").value),
            quantity_available_smu: parseInt(document.getElementById("qty").value)
        })
    });

    const data = await res.json();

    if (res.ok) {
        alert("Food added successfully!");
    } else {
        alert(data.error);
    }
}

// ---------------- LOAD FOOD (NGO) ----------------
async function loadFood() {
    const res = await fetch(BASE_URL + "/get-food");
    const data = await res.json();

    const container = document.getElementById("food-list");
    container.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = "<p class='muted'>No available food items right now. Please check again in a while.</p>";
        return;
    }

    data.forEach(food => {
        container.innerHTML += `
            <article class="food-card">
                <h3>${food.food_name}</h3>
                <p><strong>Type:</strong> ${food.food_type}</p>
                <p><strong>Dry/Wet:</strong> ${food.dry_or_wet}</p>
                <p><strong>Available SMU:</strong> ${food.quantity_available_smu}</p>
                <button class="btn btn-primary" onclick="placeOrder('${food.food_id}')">Request Pickup</button>
            </article>
        `;
    });
}

// ---------------- PLACE ORDER ----------------
async function placeOrder(food_id) {
    const user = getCurrentUser();

    const qty = prompt("Enter SMU quantity:");

    if (!qty) return;

    const res = await fetch(BASE_URL + "/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ngo_id: getNgoId(user),
            food_id: food_id,
            quantity_smu: parseInt(qty)
        })
    });

    const data = await res.json();

    if (res.ok) {
        alert("Order placed!\nOrder ID: " + data.order_id + "\nOTP: " + data.otp);
        window.location.href = "/otp.html";
    } else {
        alert(data.error);
    }
}

// ---------------- VERIFY OTP ----------------
async function verifyOTP() {
    const order_id = document.getElementById("order_id").value;
    const otp = document.getElementById("otp").value;

    const res = await fetch(BASE_URL + "/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            order_id: order_id,
            otp: otp
        })
    });

    const data = await res.json();

    if (res.ok) {
        alert("Pickup verified successfully!");
    } else {
        alert(data.error);
    }
}
