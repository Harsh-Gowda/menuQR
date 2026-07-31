# MenuQR.in — Digital QR Menu for Indian Restaurants

> **QR code → WhatsApp ordering for Indian restaurants**
> Stop paying Swiggy/Zomato 25–35% commission. Pay ₹499/month instead.

---

## 🚀 Setup in 4 Steps

### Step 1 — Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **Anon Key** from Project Settings → API
3. Open `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```

### Step 2 — Run the Database Schema
1. In Supabase → SQL Editor → New Query
2. Paste the entire contents of `supabase_schema.sql`
3. Click **Run** ✓

### Step 3 — Start the Dev Server
```bash
npm run dev
```
Opens at **http://localhost:3000** (or 3001 if 3000 is taken)

### Step 4 — Create Your First Restaurant
1. Go to `http://localhost:3000/signup`
2. Enter restaurant name, WhatsApp number, email, password
3. You'll be redirected to the dashboard

---

## 📱 Testing the Customer Menu

After adding some menu items in the dashboard:

1. Go to `http://localhost:3000/menu/your-slug`  
2. Or with table: `http://localhost:3000/menu/your-slug/table-1`
3. Add items to cart → Tap "Order via WhatsApp"
4. WhatsApp opens with your full order pre-filled ✓

---

## 🗄️ Demo Data — Spice Garden

To seed a demo restaurant for testing/sales demos:

1. Create an account at `/signup`
2. In Supabase → Table Editor → `restaurants`  
   — Note your user ID from the `owner_user_id` column
3. In SQL Editor, run:

```sql
-- Replace YOUR_USER_ID with your actual Supabase user UUID
INSERT INTO menu_categories (restaurant_id, name_en, name_hi, sort_order)
SELECT id, 'Starters', 'स्टार्टर', 1 FROM restaurants WHERE owner_user_id = 'YOUR_USER_ID'
UNION ALL
SELECT id, 'Main Course', 'मुख्य व्यंजन', 2 FROM restaurants WHERE owner_user_id = 'YOUR_USER_ID'
UNION ALL
SELECT id, 'Breads & Rice', 'रोटी और चावल', 3 FROM restaurants WHERE owner_user_id = 'YOUR_USER_ID'
UNION ALL
SELECT id, 'Beverages', 'पेय पदार्थ', 4 FROM restaurants WHERE owner_user_id = 'YOUR_USER_ID';
```

Then add items manually via the Menu Builder in the dashboard.

---

## 📂 Project Structure

```
menuqr-app/
├── app/
│   ├── (auth)/         # login, signup pages
│   ├── (dashboard)/    # restaurant admin dashboard
│   ├── menu/[slug]/    # PUBLIC customer menu (no auth)
│   └── api/            # Menu data, order logging, view tracking
├── components/
│   ├── menu/           # Customer-facing: ItemCard, ItemModal, OrderSummary
│   └── dashboard/      # Admin: ItemForm, CategoryForm
├── lib/
│   ├── supabase/       # Browser + server clients
│   ├── translations/   # en.ts + hi.ts (Hindi)
│   ├── whatsapp.ts     # Builds wa.me deep-link with ₹ + GST
│   └── qr.ts           # QR code generator
├── types/index.ts      # All TypeScript types
├── middleware.ts       # Auth protection for /dashboard
└── supabase_schema.sql # Run this in Supabase SQL Editor
```

---

## 💰 Pricing

| Plan | Price | Features |
|------|-------|---------|
| Trial | Free 14 days | Full access |
| Basic | ₹499/month | 1 restaurant, unlimited items |

**Your cost:** Vercel free tier + Supabase free tier = **₹0/month** until 500+ restaurants.

---

## 🎯 Sales Pitch

> "Your Swiggy/Zomato commission this month — what was it?
> [They say ₹12,000]
> This costs ₹499/month. 14-day free trial, no credit card.
> I can set up your menu right now while you watch."

Target first: **Independent Indian restaurants** already using WhatsApp Business.
