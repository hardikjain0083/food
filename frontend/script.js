const BASE_URL = "https://food-wa29.onrender.com";

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

    let data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        role: role
    };

    if (role === "ngo") {
        data.total_capacity_smu = parseInt(document.getElementById("capacity").value);
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
    const user = JSON.parse(sessionStorage.getItem("user"));

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

    data.forEach(food => {
        container.innerHTML += `
            <div style="border:1px solid black; padding:10px; margin:10px;">
                <h3>${food.food_name}</h3>
                <p>Type: ${food.food_type}</p>
                <p>Available SMU: ${food.quantity_available_smu}</p>
                <button onclick="placeOrder('${food.food_id}')">Request</button>
            </div>
        `;
    });
}

// ---------------- PLACE ORDER ----------------
async function placeOrder(food_id) {
    const user = JSON.parse(sessionStorage.getItem("user"));

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
        alert("Order placed! OTP: " + data.otp);
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
