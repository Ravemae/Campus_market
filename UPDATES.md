# QuickMart Backend Updates — Vera (Team Lead)

## Summary

Major backend overhaul since Barnabas's Phase 6. All changes are in the `app/` directory.
Read this carefully before touching any backend files.

---

## BREAKING CHANGES — Read First

1. All IDs are now UUID strings not integers — update any hardcoded integer IDs in frontend
2. Auth uses HTTPBearer — send token as `Bearer <token>` in Authorization header
3. User ID is NEVER sent in request body — always extracted from JWT token automatically
4. Vendor ID is NEVER sent in product creation — extracted from token automatically
5. Order creation does NOT need `user_id` in body — comes from token
6. Paystack callback URL is now `http://localhost:5173/checkout/verify`
7. Service fee of ₦100 is added automatically to every order
8. Delivery fee of ₦200 is added automatically when delivery type is selected

---

## Authentication (`app/routes/auth.py`)

- Split signup into two endpoints:
  - `POST /auth/signup/user` — register as customer
  - `POST /auth/signup/vendor` — register as shop owner (creates vendor profile automatically)
- Removed `role` field from signup — assigned automatically
- Added strong password validation:
  - Minimum 8 characters
  - Must have uppercase, lowercase, number, special character
- Added unique phone number check — one phone per account
- Replaced JWT reset token with 6-digit OTP system:
  - `POST /auth/forgot-password` — sends OTP to user's email via Resend
  - `POST /auth/verify-otp` — user enters OTP code only (no email needed)
  - `POST /auth/reset-password` — email + new password
- Added `PATCH /auth/profile/{user_id}` — update name, phone, email

---

## Models — UUID Migration (`app/models/`)

- All primary keys changed from integer to UUID string
- Affected: User, Vendor, Product, Order, Delivery
- Foreign keys updated across all models
- Database must be reseeded after this change

---

## Products (`app/routes/products.py`)

- `GET /products/` — public, search by name or category
- `GET /products/my-products` — vendor sees only their products (token required)
- `GET /products/vendor/{vendor_id}` — public, see any shop's products
- `GET /products/{product_id}` — public, get single product
- `POST /products/` — vendor adds product, vendor_id from token automatically
- `PATCH /products/{product_id}` — vendor updates own product only
- `DELETE /products/{product_id}` — vendor deletes own product only
- Added `stock_quantity` field to products

---

## Orders (`app/routes/orders.py`)

- `POST /orders/` — create order, user_id from token automatically
- `GET /orders/my-orders` — user sees their own orders
- `GET /orders/vendor-orders` — vendor sees orders for their shop
- `GET /orders/hostels` — returns list of all 20 Babcock hostels for dropdown
- `PATCH /orders/{order_id}/status` — update order status

### Fees added automatically:

- ₦100 service fee — every order
- ₦200 delivery fee — only when delivery_type is "delivery"

### Delivery types supported:

- `pickup` — no extra fields needed
- `delivery` to hostel — needs `hostel_name` + `room_number`
- `delivery` to other location — needs `delivery_address`

### Order request body:

```json
{
  "vendor_id": "shop-uuid",
  "total_amount": 2500,
  "delivery_type": "pickup"
}
```

For hostel delivery:

```json
{
  "vendor_id": "shop-uuid",
  "total_amount": 2500,
  "delivery_type": "delivery",
  "hostel_name": "Sapphire Hall",
  "room_number": "B12"
}
```

For other location:

```json
{
  "vendor_id": "shop-uuid",
  "total_amount": 2500,
  "delivery_type": "delivery",
  "delivery_address": "Block C Classroom, New Horizon"
}
```

---

## Payment (`app/routes/payment.py`)

- `POST /payment/initialize/{order_id}` — initialize Paystack payment
- `GET /payment/verify/{reference}` — verify payment after Paystack callback
- Added `load_dotenv()` to fix key loading issue
- Paystack callback URL: `http://localhost:5173/checkout/verify`
- After deployment update callback to Railway URL

### Paystack test card:

- Card: `4084 0840 8408 4081`
- Expiry: `01/27`
- CVV: `408`
- PIN: `0000`
- OTP: `123456`

---

## Admin (`app/routes/admin.py`)

- All endpoints protected — admin role required
- Dashboard returns: total users, vendors, orders, revenue
- Category breakdown statistics
- Daily order trends (last 7 days)
- Approve/reject vendors
- Activate/deactivate users

---

## OTP System (`app/core/otp.py`)

- New `OTPStore` database table
- 6-digit code, expires after 10 minutes
- Used OTP marked as used — cannot be reused

---

## Email Service (`app/core/email.py`)

- Resend API for OTP emails
- HTML email template with QuickMart branding
- After Railway deployment: change `to: [TEST_EMAIL]` to `to: [email]`

---

## Dependencies (`app/core/dependencies.py`)

- Switched to HTTPBearer authentication
- Three dependency functions:
  - `get_current_user` — any logged in user
  - `get_admin_user` — admin only
  - `get_vendor_user` — vendor or admin only

---

## Seed Script (`seed.py`)

- 13 real Babcock BUSA building vendors
- All auto-approved
- Default password: `Vendor@123`
- Run: `python seed.py`

### Vendors seeded:

1. Ayolayo Enterprises — Fashion & Accessories
2. The Lilly Foods and Bakeries — Food & Bakery
3. B.I.G Store — Provisions & Drinks
4. Big Meals — Food
5. Helena Ventures — Fashion & Skincare
6. God's Favor Limited — Food
7. WholeU — Health & Beauty
8. Jummychi Trendsetters — Food & Snacks
9. Nma's Place — Snacks & Drinks
10. Big Farm Shop — Fresh Produce
11. BU Bookshop — Books & Stationery
12. Mima Ventures — Services
13. ANDY Best — Shop

### Hostels (20 total):

**Female (11):** FAD, Queen Esther, Platinum, Ameyo Adadevoh, Sapphire, Diamond, Havilah Gold, Crystal, White, Nyberg, Ogden

**Male (9):** Gideon Troopers, Winslow, Bethel Splendor, Samuel Akande, Neal Wilson, Nelson Mandela, Welch, Emerald, Topaz

---

## New Files Added

- `app/core/otp.py` — OTP system
- `app/core/email.py` — Resend email service
- `railway.toml` — Railway deployment config
- `Procfile` — Railway process file
- `UPDATES.md` — This file

## Environment Variables Required
