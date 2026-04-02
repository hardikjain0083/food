-- ================= USERS =================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('restaurant','ngo') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= RESTAURANTS =================
CREATE TABLE restaurants (
    restaurant_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    restaurant_name VARCHAR(150) NOT NULL,
    address TEXT,
    phone VARCHAR(15),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ================= NGOS =================
CREATE TABLE ngos (
    ngo_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    ngo_name VARCHAR(150) NOT NULL,
    address TEXT,
    phone VARCHAR(15),

    -- 🔥 CRITICAL FOR YOUR LOGIC
    total_capacity_smu INT NOT NULL,
    remaining_capacity_smu INT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ================= FOOD ITEMS =================
CREATE TABLE food_items (
    food_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,

    food_name VARCHAR(100) NOT NULL,
    food_type ENUM('veg','non-veg','jain') NOT NULL,
    shelf_life_hours INT NOT NULL,
    dry_or_wet ENUM('dry','wet') NOT NULL,
    calorific_value INT,

    smu_equivalent INT NOT NULL,

    -- 🔥 CRITICAL
    quantity_available_smu INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 🔥 REQUIRED FOR /get-food
    expiry_time DATETIME NOT NULL,

    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- ================= ORDERS =================
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,

    ngo_id INT NOT NULL,
    food_id INT NOT NULL,

    quantity_smu INT NOT NULL,

    -- 🔥 OTP SYSTEM
    otp VARCHAR(10),
    otp_expiry DATETIME,

    order_status ENUM('pending','collected','cancelled') DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ngo_id) REFERENCES ngos(ngo_id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES food_items(food_id) ON DELETE CASCADE
);

-- ================= INDEXES =================
CREATE INDEX idx_food_restaurant ON food_items(restaurant_id);
CREATE INDEX idx_orders_ngo ON orders(ngo_id);
