# HomeTasteClient — Development Plan

## Project Overview

React frontend for the **HomeTaste** food delivery platform.
API: `g:\Office\00RanDom\HomeTaste` (ASP.NET Core, do not modify without permission)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM |
| State / API | Redux Toolkit + RTK Query |
| Forms | React Hook Form + Zod |
| Notifications | Sonner |
| Icons | Lucide React |
| Auth decode | jwt-decode |

---

## User Roles (from HomeTaste API)

| Role | Access |
|---|---|
| `Admin` | Full system: users, meals, orders, deliveries, analytics, support |
| `Customer` | Browse meals, place orders, addresses, loyalty rewards |
| `DeliveryPersonnel` | View and update assigned deliveries |

Default admin: `admin@HomeTaste.com` / `Admin@123`

---

## Folder Structure

```
src/
├── app/                # Redux store, RTK Query base API, typed hooks
├── features/
│   └── auth/           # Auth slice, auth API endpoints, auth types
├── routes/             # Router, ProtectedRoute, RoleRoute, path constants
├── layouts/            # AuthLayout, DashboardLayout, PublicLayout
├── components/
│   ├── ui/             # Reusable primitives (Button, Input, …)
│   └── shared/         # Sidebar, Topbar, Logo
├── config/             # menuConfig.tsx — role → sidebar items map
├── pages/
│   ├── auth/           # LoginPage, RegisterPage
│   ├── admin/          # Admin feature pages
│   ├── customer/       # Customer feature pages
│   └── delivery/       # Delivery feature pages
├── types/              # Global TypeScript interfaces
├── constants/          # Role constants
└── utils/              # tokenUtils, cn helper
```

---

## Phase Roadmap

### Phase 1 — Scaffold + Auth Integration (DONE)
- [x] Project structure + Tailwind v4 + path aliases
- [x] Redux Toolkit store + RTK Query base API
- [x] JWT auth: login, register, refresh token, logout
- [x] Auth state persisted to `localStorage`
- [x] Protected routes + role-based route guards
- [x] DashboardLayout with collapsible sidebar + topbar
- [x] Dynamic sidebar menu driven by user role
- [x] Placeholder pages for all three role dashboards
- [x] Login and Register pages with Zod validation
- [x] HttpOnly cookie support (`credentials: "include"` on all requests)
- [x] Token-first flow: access token stored before `GET /api/auth/me` is called
- [x] Auto token refresh on 401 via re-auth middleware (no body — cookie-based)
- [x] Register redirects to login (API returns no tokens on register)
- [x] Correct API response types (`RegisterResponse`, `AuthResponse`, `ApiResponse`)

---

### Phase 2 — Admin Features
- [x] Users list page with search + pagination (`GET /api/admin/users`)
- [x] Ban / Unban user inline from the list
- [x] User detail page with profile info
- [x] Assign / remove role from detail page
- [x] Meals management (create, list, delete)
- [x] Orders overview
- [ ] Deliveries management + assign delivery
- [ ] Analytics dashboard
- [ ] Support tickets

### Phase 3 — Customer Features
- [ ] Browse meals (`GET /api/meals`)
- [ ] Meal detail page
- [ ] Place order (`POST /api/orders`)
- [ ] My orders list + detail
- [ ] Address management
- [ ] Loyalty rewards

### Phase 4 — Delivery Personnel Features
- [ ] My assignments (`GET /api/delivery/my-assignments`)
- [ ] Update delivery status
- [ ] GPS location update

### Phase 5 — Polish
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Responsive audit (mobile)
- [ ] Notification center
- [ ] Profile / account settings page

---

## Key Architecture Rules

1. **No Context API for auth state** — use Redux Toolkit only
2. **No Axios** — RTK Query `fetchBaseQuery` handles all HTTP
3. **No package installs without approval** — list packages + reason first
4. **Do not modify HomeTaste API** — frontend-only changes unless explicitly agreed
5. **Feature-based folders** — new features go inside `pages/<role>/` and `features/<feature>/`
6. **Route paths** are centralized in `src/routes/paths.ts` — never hardcode strings

---

## Environment

```
VITE_API_BASE_URL=https://localhost:7082
```

Copy `.env.example` to `.env` and set the API URL before running.

---

## Run Commands

```bash
npm run dev      # start dev server (http://localhost:5173)
npm run build    # production build (tsc + vite)
npm run lint     # ESLint check
npm run preview  # preview production build locally
```
