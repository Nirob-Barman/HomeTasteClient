# HomeTaste Client

The React frontend for the **HomeTaste** food delivery platform. Supports three user roles — Admin, Customer, and Delivery Personnel — each with their own dashboard and feature set.

## Tech Stack

| Concern | Library |
|---------|---------|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| State | Redux Toolkit + RTK Query |
| Forms | React Hook Form + Zod |
| Payments | Stripe.js + React Stripe.js |
| Toasts | Sonner |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (see [`HomeTaste`](../../HomeTaste))

### Setup

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_BASE_URL=https://localhost:7082
```

### Development

```bash
npm run dev       # start dev server (http://localhost:5173)
npm run build     # type-check + production build
npm run lint      # ESLint
npm run preview   # preview production build
```

## Project Structure

```
src/
├── app/            # Redux store, RTK base API, hooks
├── components/     # Shared UI components
├── config/         # Role-based menu config
├── constants/      # Roles, enums
├── features/       # RTK Query API slices (auth, meals, orders, …)
├── hooks/          # Custom hooks (usePageTitle, …)
├── layouts/        # PublicLayout, DashboardLayout, AuthLayout
├── pages/
│   ├── admin/      # Admin-only pages
│   ├── customer/   # Customer-only pages
│   ├── delivery/   # Delivery personnel pages
│   ├── payment/    # Stripe checkout flow
│   └── shared/     # Profile, NotFound, etc.
├── routes/         # Route definitions, ProtectedRoute, RoleRoute
├── types/          # TypeScript interfaces
└── utils/          # cn(), formatters, etc.
```

## Pages by Role

### Public
| Path | Page |
|------|------|
| `/` | Home — hero, featured meals, stats, testimonials, CTA |
| `/login` | Login |
| `/register` | Register |

### Admin (`/admin/*`)
| Path | Page |
|------|------|
| `/admin/dashboard` | KPI overview |
| `/admin/users` | User management |
| `/admin/meals` | Meal CRUD (image, discount, availability) |
| `/admin/categories` | Meal categories |
| `/admin/ingredients` | Ingredient library |
| `/admin/units` | Units of measurement |
| `/admin/meal-ingredients` | Meal–ingredient mapping |
| `/admin/meal-customization` | Add-ons, removals, substitutions |
| `/admin/orders` | All orders + status updates |
| `/admin/deliveries` | Delivery personnel + assignments |
| `/admin/payments` | Transaction history + refunds |
| `/admin/payment-gateway` | Gateway configuration |
| `/admin/coupons` | Coupon management |
| `/admin/inventory` | Stock levels + transactions |
| `/admin/loyalty` | Loyalty account + point adjustments |
| `/admin/analytics` | Revenue charts, top meals/customers |
| `/admin/support` | Support ticket queue |
| `/admin/departments` | Departments |
| `/admin/category-types` | Support ticket categories |
| `/admin/tasks` | Internal tasks |

### Customer (`/customer/*`)
| Path | Page |
|------|------|
| `/customer/dashboard` | Welcome + quick links |
| `/customer/meals` | Browse meals (search, category filter, pagination) |
| `/customer/meals/:mealId` | Meal detail (customization, reviews, add to cart) |
| `/customer/checkout` | Cart + coupon + loyalty redemption |
| `/customer/orders` | Order history + live status |
| `/customer/addresses` | Delivery address book |
| `/customer/loyalty` | Points balance, tier, transaction history |
| `/customer/support` | Submit and track support tickets |
| `/customer/reviews` | Submit and manage meal reviews |

### Delivery Personnel (`/delivery/*`)
| Path | Page |
|------|------|
| `/delivery/dashboard` | Overview |
| `/delivery/assignments` | Active and past delivery assignments |

## Auth Flow

- JWT stored in Redux + persisted to `localStorage` as `ht_auth`
- Refresh token handled automatically via RTK Query base query
- `ProtectedRoute` redirects unauthenticated users to `/login`
- `RoleRoute` redirects users to their role-appropriate dashboard

## Backend

API documentation available at `https://localhost:7082/swagger` when the backend is running. See the [backend README](https://github.com/Nirob-Barman/HomeTaste) for setup.
