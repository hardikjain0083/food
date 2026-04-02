# 🍽️ Smart Surplus Food Distribution System

A web-based platform designed to reduce food wastage by enabling **fair, secure, and efficient distribution of surplus food** from restaurants to verified NGOs.

---

## 📌 Overview

Food wastage is a major issue in urban areas, while many NGOs struggle to meet daily food requirements. This project provides a **centralized system** that connects restaurants with NGOs and ensures **equitable distribution based on actual need**, not speed or size.

The system introduces a **Standard Meal Unit (SMU)** model to enforce fairness and prevent resource hoarding.

---

## 🎯 Key Features

- ✅ **Verified NGO & Restaurant Onboarding**
- ⚖️ **Capacity-Based Distribution (SMU Model)**
- 📍 **Geo-location Based Matching**
- 🔐 **OTP-Based Secure Pickup**
- 🍴 **Menu-Based Surplus Entry (No Repetitive Input)**
- ⏱️ **Automatic Food Expiry Handling**
- 🚫 **Order Limitation to Prevent Hoarding**

---

## 🧠 Core Concept: Standard Meal Unit (SMU)

The system measures food in **Standard Meal Units (SMU)** to ensure fair allocation.

| Category | SMU Value |
| -------- | --------- |
| Adult    | 1.0 SMU   |
| Child    | 0.7 SMU   |
| Elderly  | 0.8 SMU   |

- 1 SMU ≈ 600 kcal
- NGOs are assigned a **fixed SMU capacity**
- Orders exceeding capacity are automatically blocked

---

## ⚙️ System Workflow

```text
Restaurant Login
      ↓
Menu Upload (One-Time)
      ↓
Daily Surplus Entry
      ↓
Food Stored in Database
      ↓
NGO Login
      ↓
SMU Capacity Validation
      ↓
Nearby Food Display
      ↓
Order Placement (Within Limit)
      ↓
OTP Generation
      ↓
Pickup & Verification
      ↓
Food Distribution
