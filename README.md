# 🎓 QuickMart

**QuickMart** is a comprehensive, multi-vendor e-commerce platform specifically designed for university communities. It connects students with campus vendors, allowing them to easily order food, snacks, groceries, and services right from their dorms or classrooms.

---

## ✨ Features

### For Customers (Students & Staff)

- **🛍️ Discover Vendors**: Browse vendors by categories (Food, Drinks, Groceries, Services, etc.).
- **🛒 Smart Cart**: Add items from a specific vendor to your cart with quantity management.
- **💳 Checkout & Payment**: Integrated with Paystack for seamless online payments (coming soon in Phase 3).
- **📦 Order Tracking**: Keep track of order status from pending to delivered.
- **⭐ Reviews**: Rate and review vendors and products after a successful order.

### For Vendors

- **🏪 Shop Management**: Create and manage your campus shop profile.
- **🍔 Product Catalog**: Add, edit, and delete products, including pricing and stock quantities.
- **📊 Order Management**: View incoming orders and update their statuses (e.g., pending -> ready -> delivered).

### For Admins

- **🔐 Platform Oversight**: Approve new vendors, monitor platform activity, and manage users.

---

## 🚀 Tech Stack

**Backend**

- **Framework**: FastAPI (Python)
- **Database**: SQLite (Local Dev) / Supabase Postgres (Production Ready)
- **ORM**: SQLModel / SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens) with Password Hashing (bcrypt)

**Frontend**

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand (Auth & Cart state)
- **Data Fetching**: Axios & React Query (@tanstack/react-query)
- **Routing**: React Router DOM

---

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v18+)
- Python (3.10+)
- npm or yarn

### 1. Backend Setup

1. Open a terminal in the root directory of the project.
2. Create and activate a Python virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
3. Install the required Python packages:
   ```bash
   pip install fastapi uvicorn sqlmodel python-jose passlib[bcrypt] python-dotenv httpx python-multipart aiofiles
   ```
4. Configure Environment Variables:
   - Copy `.env.example` to `.env` in the root directory.
   - Update `SECRET_KEY` and any other variables if needed.

   ```bash
   cp .env.example .env
   ```
5. Start the FastAPI Server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```

   > The API documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)
   >

### 2. Frontend Setup

1. Open a **new** terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - Copy `.env.example` to `.env` in the `frontend/` directory.
   - Set your `VITE_HCAPTCHA_SITE_KEY`.
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_HCAPTCHA_SITE_KEY=your_hcaptcha_site_key_here
   ```
4. Start the Vite Dev Server:
   ```bash
   npm run dev
   ```

   > The frontend application will be available at: [http://localhost:5173](http://localhost:5173)
   >

---

## 📂 Project Structure

```
Campus_market/
├── app/                  # FastAPI Backend Application
├── frontend/             # React + Vite Frontend Application
├── uploads/              # Local storage for uploaded files/images
├── .env                  # Backend environment variables
└── .env.example          # Template for backend environment variables
```

---

## 🎨 Premium UI/UX Experience

The platform has been completely refreshed with a modern, high-end **Sunset Orange** aesthetic.

- **Vibrant Aesthetic**: Custom sunset orange and amber color palette with sophisticated slate accents.
- **Bot Protection**: Integrated **hCaptcha** across all authentication entry points to ensure a bot-free environment.
- **Glassmorphism**: Elegant backdrop-blur effects on navigation and interactive popovers.
- **Modern Typography**: Powered by *Plus Jakarta Sans* for maximum readability and style.
- **Data-Driven Dashboards**: Premium Admin and Vendor interfaces featuring interactive charts and real-time activity monitoring.
- **Micro-interactions**: Smooth transitions, hover states, and responsive feedback across all devices.

---

## 🤝 Current Status: Production Ready

We have successfully finalized the platform's production-ready state. Key highlights include:

- **Enterprise Security**: hCaptcha integration for bot mitigation.
- **Refined Aesthetics**: Sunset Orange design system for a premium look and feel.
- **Full E-commerce Cycle**: From product discovery to cart management, checkout, and order fulfillment.
- **Multi-Role Dashboards**: Specialized views for Customers, Vendors, and Administrators.
- **Real-time Updates**: Integrated notification center for order status changes.
- **Secure Payments**: Fully functional checkout flow with Paystack and Flutterwave integration.
- **Bug Fixes**: Resolved the 300 NGN fee discrepancy for a trustworthy checkout experience.
