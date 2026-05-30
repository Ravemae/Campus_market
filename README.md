# 🎓 QuickMart

**QuickMart** is a comprehensive, multi-vendor e-commerce platform specifically designed for university communities. It connects students with campus vendors, allowing them to easily order food, snacks, groceries, and services right from their dorms or classrooms.

> 🌐 **Live Platform**: [quickmartapp.com.ng](https://quickmartapp.com.ng)
> 🔗 **Backend API**: [quickmart-api-op6d.onrender.com](https://quickmart-api-op6d.onrender.com)
> 📖 **API Docs**: [quickmart-api-op6d.onrender.com/docs](https://quickmart-api-op6d.onrender.com/docs)

---

## ✨ Features

### For Customers (Students & Staff)

- **🛍️ Discover Vendors**: Browse vendors by categories (Food, Drinks, Groceries, Services, Second-Hand Items, etc.).
- **🛒 Smart Cart**: Add items from a specific vendor to your cart with quantity management.
- **💳 Checkout & Payment**: Integrated with Paystack and Flutterwave for seamless online payments.
- **📦 Order Tracking**: Keep track of order status from pending to delivered.
- **🏠 Hostel Delivery**: Order delivered directly to any of the 20 supported Babcock University hostels (+₦200).
- **🤖 AI Helpdesk**: 24/7 AI-powered support via OpenAI for instant answers on orders, delivery, and payments.
- **⭐ Reviews**: Rate and review vendors and products after a successful order.

### For Vendors (Campus Shops & Student Vendors)

- **🏪 Shop Management**: Create and manage your campus shop profile.
- **🍔 Product Catalog**: Add, edit, and delete products, including pricing and stock quantities.
- **📊 Order Management**: View incoming orders and update their statuses (e.g., pending → confirmed → ready → delivered).
- **🎓 Student Vendor Support**: Students can register as vendors to sell second-hand textbooks, workbooks, laptops, phones, and devices to fellow students on campus.

### For Admins

- **🔐 Platform Oversight**: Approve new vendors, monitor platform activity, and manage users.
- **📈 Analytics Dashboard**: Real-time stats on users, vendors, orders, revenue, and daily trends.

---

## 🚀 Tech Stack

### Backend

| Technology | Details |
|---|---|
| Framework | FastAPI (Python 3.11) |
| Database | SQLite (Local Dev) / **Supabase PostgreSQL** (Production) |
| ORM | SQLModel / SQLAlchemy |
| Authentication | JWT (JSON Web Tokens) + bcrypt password hashing |
| Email | Resend API (OTP delivery) |
| Payments | Paystack + Flutterwave |
| AI Helpdesk | OpenAI API (GPT-3.5-turbo) |
| Image Storage | Cloudinary |

### Frontend

| Technology | Details |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| State Management | Zustand (Auth & Cart) |
| Data Fetching | Axios + React Query (@tanstack/react-query) |
| Routing | React Router DOM v6 |

### Infrastructure & Deployment

| Service | Provider |
|---|---|
| Live Domain | quickmartapp.com.ng (GO54 + Cloudflare) |
| Frontend Hosting | Netlify (CI/CD from GitHub) |
| Backend Hosting | **Render** (always-on web service, auto-deploy from GitHub) |
| Database | **Supabase PostgreSQL** (persistent, free tier, never sleeps) |
| Uptime Monitoring | **UptimeRobot** (pings backend every 5 mins to prevent sleep) |
| Email Service | Resend (3,000 free emails/month) |
| Version Control | GitHub |

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
   pip install -r requirements.txt
   ```
4. Configure Environment Variables:
   ```bash
   cp .env.example .env
   ```
   Update the following in your `.env`:
   ```env
   DATABASE_URL=postgresql://...        # Supabase connection string
   SECRET_KEY=your-secret-key
   PAYSTACK_SECRET_KEY=sk_test_...
   FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
   OPENAI_API_KEY=sk-...
   RESEND_API_KEY=re_...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   GOOGLE_CLIENT_ID=...
   ```
5. Create database tables:
   ```bash
   python -c "from app.database import create_db; create_db()"
   ```
6. Seed vendors and products:
   ```bash
   python seed.py
   python seed_products.py
   ```
7. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   > API documentation available at: [http://localhost:8000/docs](http://localhost:8000/docs)

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
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_HCAPTCHA_SITE_KEY=your_hcaptcha_site_key_here
   ```
4. Start the Vite Dev Server:
   ```bash
   npm run dev
   ```
   > Frontend available at: [http://localhost:5173](http://localhost:5173)

---

## 📂 Project Structure

```
Campus_market/
├── app/
│   ├── main.py               # FastAPI app, routers, CORS, startup
│   ├── database.py           # DB engine (SQLite local / Supabase production)
│   ├── models/               # SQLModel data models (User, Vendor, Product, Order...)
│   ├── routes/               # All API route handlers
│   ├── schemas/              # Pydantic request/response schemas
│   └── core/                 # Auth, security, OTP, email, config
├── frontend/                 # React + TypeScript frontend (Barnabas)
├── seed.py                   # Seeds 13 BUSA vendors
├── seed_products.py          # Seeds products for all vendors (Adventist-compliant)
├── uploads/                  # Local file storage
├── requirements.txt          # Python dependencies
├── Procfile                  # Render start command
├── .env                      # Backend environment variables (never committed)
└── .env.example              # Environment variable template
```

---

## 🏫 Campus Data

**13 verified vendors** from the BUSA Building, Babcock University — all seeded and approved.

**20 Babcock hostels supported for delivery:**
- **Female (11):** FAD, Queen Esther, Platinum, Ameyo Adadevoh, Sapphire, Diamond, Havilah Gold, Crystal, White, Nyberg, Ogden
- **Male (9):** Gideon Troopers, Winslow, Bethel Splendor, Samuel Akande, Neal Wilson, Nelson Mandela, Welch, Emerald, Topaz

**Fee structure (backend-only, never calculated on frontend):**
- ₦100 service fee on every order
- ₦200 delivery fee for hostel or custom campus delivery

---

## 💰 Payment Testing

| Gateway | Test Card | Expiry | CVV | PIN | OTP |
|---|---|---|---|---|---|
| Paystack | 4084 0840 8408 4081 | 01/27 | 408 | 0000 | 123456 |
| Flutterwave | 5531 8866 5214 2950 | 09/32 | 564 | 3310 | 12345 |

---

## 🔑 Test Credentials

```
Admin:         admin@quickmart.com     / *********
Sample Vendor: jummychi2@campusmarket.com / ******
```

---

## 🎨 Premium UI/UX Experience

- **Vibrant Aesthetic**: Sunset orange and amber color palette with sophisticated slate accents.
- **Bot Protection**: Integrated **hCaptcha** across all authentication entry points.
- **Glassmorphism**: Elegant backdrop-blur effects on navigation and interactive popovers.
- **Modern Typography**: Powered by *Plus Jakarta Sans* for maximum readability and style.
- **Data-Driven Dashboards**: Premium Admin and Vendor interfaces with interactive charts and real-time activity monitoring.
- **Micro-interactions**: Smooth transitions, hover states, and responsive feedback across all devices.

---

## 🗺️ Roadmap

| Phase | Description |
|---|---|
| ✅ Phase 1 | Babcock University campus MVP — 13 vendors, full ordering, payments, hostel delivery, AI helpdesk |
| 🔜 Phase 2 | Student vendor onboarding — sell used textbooks, workbooks, laptops, and devices to fellow students |
| 🔜 Phase 3 | Local expansion — nearby businesses in Ilishan-Remo |
| 🔜 Phase 4 | Map-based discovery, real-time tracking, structured rider network |
| 🔜 Phase 5 | Multi-campus expansion across Nigerian universities |

---

## 🤝 Team

| Name | Role |
|---|---|
| Vera Adaeze M. Ezeanya | Team Lead, Backend Engineer, AI Integration |
| Oboh Barnabas | Frontend Engineer |
| Simeon Victoria | Content Strategist |
| Paul Julius Damina | Quality Assurance |
| Osereimen Merit | Technical Documentation |
| Peter Nkiru Chimuwuayia | Product Research |
| Nwaigwe Anthony | Product Research |
| Akinade Ojumirire | UI/UX Designer |

---

*Built with passion at Babcock University, Nigeria · 2025-2026 · [quickmartapp.com.ng](https://quickmartapp.com.ng)*
