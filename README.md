# Aurelia Hotel Management System Frontend

A premium, modern, and minimal enterprise-grade SaaS dashboard frontend for a Hotel Management System. Built using **Angular 19**, **TypeScript**, and **Tailwind CSS**.

---

## 🎨 Design Philosophy & Color Palette
The Aurelia dashboard features a high-contrast, premium, and minimal theme that aligns with modern SaaS systems (like Stripe or Linear):
*   **Palette**: Restrained to **Black, White, and Blue**.
*   **Typography**: Clean, geometric modern sans-serif (Inter) imported from Google Fonts.
*   **Borders & Shadows**: Thin borders (`border-slate-100`) and soft, high-performance web shadows (`shadow-premium`) to maintain a clean layout without visual clutter.
*   **States**: Micro-animations for buttons and cards (smooth transitions), skeleton loading panels for data tables, and distinct empty/error indicators.

---

## 🏗️ Folder Architecture

```bash
src/app/
│
├── core/                   # Singleton core utilities & services
│   ├── interceptors/       # HTTP interceptors (JWT auth injection)
│   ├── guards/             # Route guards (AuthGuard, RoleGuard)
│   ├── services/           # Microservice client services (mock fallback toggled)
│   └── models/             # Shared TS interfaces (Users, Rooms, Invoices)
│
├── shared/                 # Shared widgets & layouts
│   └── ui/                 # Reusable pure UI (Cards, Tables, Modals, Loaders)
│
├── layouts/                # Route shell wrappers
│   ├── auth-layout/        # Layout for register/login paths
│   └── dashboard-layout/   # Layout with sticky header & responsive sidebar
│
├── features/               # Lazily loaded feature modules
│   ├── auth/               # Register & Login pages
│   ├── dashboard/          # Summary metrics & recent actions
│   ├── reservation/        # Guest check-in/out & admin room assignment
│   ├── billing/            # Invoices breakdown & PDF export
│   ├── history/            # Universal stay logs & guest search
│   ├── room-status/        # Visual occupancy grids
│   ├── bookings/           # Check-in queues
│   ├── support/            # Support desk contacts & feedbacks
│   ├── complaints/         # Guest complaint filing & resolve flows
│   └── payment/            # Card checkout panels
│
└── app.routes.ts           # App lazy-loaded routing configuration
```

---

## ⚙️ Technologies & Setup

### Installation
1. Ensure your shell is configured to Node `20.20.2`. (e.g. using NVM: `nvm use 20.20.2`).
2. Run npm install:
   ```bash
   npm install
   ```

### Running Locally
To launch the hot-reloading development server:
```bash
npm run start
```
By default, the application is served on `http://localhost:4200`.

### Production Build
To compile the production bundles:
```bash
npm run build
```
Compiled output will be saved in the `dist/hotel-management-system/browser/` folder.

---

## 🚨 API Configuration & Integration Points

The application connects to a centralized **API Gateway** microservice.
Centralized configuration is located in [environment.ts](src/environments/environment.ts):
```typescript
export const environment = {
  production: false,
  gatewayUrl: 'http://localhost:8080'
};
```

All microservice integrations feature a `🚨 BACKEND PATCH POINT` comment to allow developers to modify endpoint routing easily.

### Microservice Endpoints

#### 1. Authentication Service
*   **Register User**: `POST /auth/register` (creates customer accounts)
*   **Login**: `POST /auth/login` (generates JWT token)
*   *Marker location*: [auth.service.ts](src/app/core/services/auth.service.ts)

#### 2. Reservation Service
*   **Submit Booking**: `POST /reservations`
*   **Get Bookings**: `GET /reservations`
*   **Get Single Booking**: `GET /reservations/{id}`
*   **Approve / Assign Room**: `PUT /reservations/{id}/status`
*   *Marker location*: [reservation.service.ts](src/app/core/services/reservation.service.ts)

#### 3. Room Service
*   **Get Rooms**: `GET /rooms`
*   **Update Clean / Occupancy State**: `PUT /rooms/{id}/status`
*   *Marker location*: [room.service.ts](src/app/core/services/room.service.ts)

#### 4. Billing Service
*   **Get Invoice by Reservation**: `GET /billing/{reservationId}`
*   **Generate Invoice**: `POST /billing/generate`
*   **Process Pay**: `POST /billing/pay`
*   *Marker location*: [billing.service.ts](src/app/core/services/billing.service.ts)

#### 5. Complaint Service
*   **File Incident**: `POST /complaints`
*   **Incident Master Queue**: `GET /complaints`
*   **Resolve Incident**: `PUT /complaints/{id}/resolve`
*   *Marker location*: [complaint.service.ts](src/app/core/services/complaint.service.ts)

#### 6. History Service
*   **Get User Stays**: `GET /history/user/{id}`
*   **Get All Archive Logs**: `GET /history/all`
*   *Marker location*: [history.service.ts](src/app/core/services/history.service.ts)

---

## 🧪 Persisted Frontend Database (Mock Fallback)
For offline development and demonstrations, each service defaults to reading/writing from a persistent mock database in `localStorage` powered by [mock-data.service.ts](src/app/core/services/mock-data.service.ts). 

To connect to a live gateway microservice running on `localhost:8080`, simply set `useMock = false` inside the respective service files.

### Default Accounts for Testing:
*   **Customer Portal**: Username `customer` | Password `any`
*   **Staff/Admin Portal**: Username `admin` | Password `any`
