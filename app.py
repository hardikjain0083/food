from flask import Flask, request, jsonify
from flask_cors import CORS   # ✅ ADDED
from db import get_db
from datetime import datetime, timedelta
import random
from bson import ObjectId
from pymongo import ReturnDocument

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})   # ✅ ADDED

@app.route("/")
def home():
    return "Backend is running 🚀"


def new_id():
    return str(ObjectId())

# ------------------ SIGNUP ------------------
@app.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")

        db = get_db()

        if db.users.find_one({"email": email}):
            return jsonify({"error": "Email already exists"}), 400

        user_id = new_id()
        db.users.insert_one({
            "user_id": user_id,
            "name": name,
            "email": email,
            "password": password,
            "role": role,
            "created_at": datetime.utcnow()
        })

        if role == "restaurant":
            db.restaurants.insert_one({
                "restaurant_id": new_id(),
                "user_id": user_id,
                "restaurant_name": name,
                "address": None,
                "phone": None
            })

        elif role == "ngo":
            total_capacity = data.get("total_capacity_smu")

            db.ngos.insert_one({
                "ngo_id": new_id(),
                "user_id": user_id,
                "ngo_name": name,
                "address": None,
                "phone": None,
                "total_capacity_smu": int(total_capacity),
                "remaining_capacity_smu": int(total_capacity)
            })

        return jsonify({"message": "User created successfully"})

    except Exception as e:
        return jsonify({"error": str(e)})


# ------------------ LOGIN ------------------
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        db = get_db()

        user = db.users.find_one({"email": email, "password": password}, {"_id": 0})

        if not user:
            return jsonify({"error": "Invalid credentials"})

        if user["role"] == "restaurant":
            res = db.restaurants.find_one({"user_id": user["user_id"]}, {"_id": 0, "restaurant_id": 1})
            user["restaurant_id"] = res["restaurant_id"] if res else None

        elif user["role"] == "ngo":
            res = db.ngos.find_one({"user_id": user["user_id"]}, {"_id": 0, "ngo_id": 1})
            user["ngo_id"] = res["ngo_id"] if res else None

        return jsonify({
            "message": "Login successful",
            "user": user
        })

    except Exception as e:
        return jsonify({"error": str(e)})


# ------------------ ADD FOOD ------------------
@app.route("/add-food", methods=["POST"])
def add_food():
    try:
        data = request.get_json()

        shelf_life = data.get("shelf_life_hours")
        expiry_time = datetime.utcnow() + timedelta(hours=int(shelf_life))

        db = get_db()
        db.food_items.insert_one({
            "food_id": new_id(),
            "restaurant_id": data.get("restaurant_id"),
            "food_name": data.get("food_name"),
            "food_type": data.get("food_type"),
            "shelf_life_hours": int(shelf_life),
            "dry_or_wet": data.get("dry_or_wet"),
            "calorific_value": int(data.get("calorific_value")) if data.get("calorific_value") is not None else None,
            "smu_equivalent": int(data.get("smu_equivalent")),
            "quantity_available_smu": int(data.get("quantity_available_smu")),
            "created_at": datetime.utcnow(),
            "expiry_time": expiry_time
        })

        return jsonify({"message": "Food added successfully"})

    except Exception as e:
        return jsonify({"error": str(e)})


# ------------------ GET FOOD ------------------
@app.route("/get-food", methods=["GET"])
def get_food():
    try:
        db = get_db()
        food_cursor = db.food_items.find(
            {"expiry_time": {"$gt": datetime.utcnow()}},
            {"_id": 0}
        )
        food = list(food_cursor)

        return jsonify(food)

    except Exception as e:
        return jsonify({"error": str(e)})


# ------------------ PLACE ORDER ------------------
@app.route("/place-order", methods=["POST"])
def place_order():
    try:
        data = request.get_json()

        ngo_id = data.get("ngo_id")
        food_id = data.get("food_id")
        requested_smu = int(data.get("quantity_smu"))

        db = get_db()

        ngo = db.ngos.find_one_and_update(
            {
                "ngo_id": ngo_id,
                "remaining_capacity_smu": {"$gte": requested_smu}
            },
            {"$inc": {"remaining_capacity_smu": -requested_smu}},
            return_document=ReturnDocument.AFTER
        )

        if not ngo:
            return jsonify({"error": "SMU limit exceeded"}), 400

        food = db.food_items.find_one_and_update(
            {
                "food_id": food_id,
                "expiry_time": {"$gt": datetime.utcnow()},
                "quantity_available_smu": {"$gte": requested_smu}
            },
            {"$inc": {"quantity_available_smu": -requested_smu}},
            return_document=ReturnDocument.AFTER
        )

        if not food:
            db.ngos.update_one(
                {"ngo_id": ngo_id},
                {"$inc": {"remaining_capacity_smu": requested_smu}}
            )
            return jsonify({"error": "Food unavailable or insufficient quantity"}), 400

        otp = str(random.randint(1000, 9999))
        otp_expiry = datetime.utcnow() + timedelta(minutes=10)

        order_id = new_id()
        db.orders.insert_one({
            "order_id": order_id,
            "ngo_id": ngo_id,
            "food_id": food_id,
            "quantity_smu": requested_smu,
            "otp": otp,
            "otp_expiry": otp_expiry,
            "order_status": "pending",
            "created_at": datetime.utcnow()
        })

        return jsonify({
            "message": "Order placed",
            "order_id": order_id,
            "otp": otp
        })

    except Exception as e:
        return jsonify({"error": str(e)})


# ------------------ VERIFY OTP ------------------
@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    try:
        data = request.get_json()

        order_id = data.get("order_id")
        entered_otp = data.get("otp")

        db = get_db()
        order = db.orders.find_one({"order_id": order_id}, {"_id": 0})

        if not order:
            return jsonify({"error": "Order not found"}), 404

        if order["otp"] != entered_otp:
            return jsonify({"error": "Invalid OTP"}), 400

        if datetime.utcnow() > order["otp_expiry"]:
            return jsonify({"error": "OTP expired"}), 400

        db.orders.update_one(
            {"order_id": order_id},
            {"$set": {"order_status": "collected"}}
        )

        return jsonify({"message": "Pickup verified successfully"})

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)

