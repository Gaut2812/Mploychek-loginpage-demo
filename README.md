# MployChek — Single Page Application

> **Enterprise Access Governance & Record Management Portal**
> Built for a coding challenge evaluated on:
> 1. Effective use of the Angular framework and libraries
> 2. Knowledge of APIs and cloud frameworks
> 3. UI quality and creativity (custom design system)
> 4. Original code with clean architecture

---

## 1. Quick Start

### Prerequisites
- Node.js 18+ (tested on v20.19.6)
- npm 9+ (tested on v10.8.2)

### Start Backend API
```bash
cd server
npm install
npm run seed      # Populates seed data (users & records)
npm run dev       # Starts Express API at http://localhost:3000
```

### Start Angular Frontend
```bash
cd client
npm install
npm start         # Starts Angular dev server at http://localhost:4200
```

Navigate to **`http://localhost:4200`** in your browser.

---

## 2. Demo Credentials

The database is seeded with credentials for testing both roles:

| Role | User ID | Password | Access Level & Scope |
|------|---------|----------|----------------------|
| **General User** | `user01` | `User@123` | Individual scope: sees own records (3 records) |
| **General User** | `user02` | `User@456` | Individual scope: sees own records (2 records) |
| **Admin** | `admin01` | `Admin@123` | Global scope: sees all organization records (7 records) + access to User Management CRUD |

*Convenient 1-click **Quick Login** buttons are also available directly on the login card.*

---

## 3. Evaluation Criteria Mapping

### Criterion 1: Angular Framework & Libraries
- **Lazy-Loaded Feature Modules**: `AuthModule` (`/auth`), `DashboardModule` (`/dashboard`), and `AdminModule` (`/admin`) load strictly on-demand.
- **Modular Architecture**: Clean separation into `CoreModule` (singletons, interceptors, guards), `SharedModule` (reusable components, pipes, directives), and `LayoutModule` (shell with sidebar & topbar).
- **Route Guards**:
  - `AuthGuard`: Prevents unauthenticated access to application routes.
  - `RoleGuard`: Restricts `/admin` exclusively to users with the `admin` role.
- **HTTP Interceptors**:
  - `TokenInterceptor`: Injects `Authorization: Bearer <token>` into outgoing API calls.
  - `LoadingInterceptor`: Triggers the global top progress bar and manages request lifecycle.
  - `ErrorInterceptor`: Catches 401/403/500 responses and surfaces toast alerts.
- **Reactive Forms**: Form validation in Login, User Creation, and User Editing with error state hints.
- **RxJS Patterns**: Extensive usage of `BehaviorSubject`, `switchMap`, `debounceTime`, `catchError`, `finalize`, and the `async` pipe.
- **Change Detection**: `ChangeDetectionStrategy.OnPush` across components for performance.
- **Custom Directives & Pipes**:
  - `*hasRole`: Structural directive conditionally displaying elements based on current role.
  - `statusBadge`: Pure pipe mapping status strings (`approved`, `pending`, `confidential`, etc.) to design classes.
  - `roleLabel`: Pure pipe formatting internal role strings (`general_user` -> `General User`).
- **APP_INITIALIZER**: Automatically hydrates user profile (`/api/users/me`) on page reload when a valid JWT token exists.

### Criterion 2: API & Cloud Frameworks
- **RESTful Endpoints**: Clean HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`) with appropriate status codes (`200`, `201`, `401`, `403`, `404`).
- **Authentication**: JWT generation with role payload and password hashing using `bcryptjs`.
- **Role-Based Authorization Middleware**: Enforces authorization at the server boundary (`authMiddleware` and `roleMiddleware('admin')`).
- **Storage Abstraction (Repository Pattern)**:
  - `IUserRepository` and `IRecordRepository` interfaces.
  - `XmlUserRepository` / `XmlRecordRepository`: Fast local zero-config XML file persistence.
  - `DynamoUserRepository` / `DynamoRecordRepository`: AWS DynamoDB repository for AWS deployment.
  - Switchable via `STORAGE_TYPE=xml` or `STORAGE_TYPE=dynamodb` in `server/.env`.
- **AWS DynamoDB Single-Table Schema**:
  - Partition Key (`PK`): `USER#<userId>`
  - Sort Key (`SK`): `PROFILE` for users, `RECORD#<recordId>` for document records
  - Global Secondary Index (`GSI_Role`): Partition Key `role`, Sort Key `createdAt` for admin directory queries.

### Criterion 3: UI Quality & Creativity
- **Original Design System**: Not a Material or Bootstrap template. Custom typography using Google Fonts **Inter** and **Outfit**, and **JetBrains Mono** for IDs.
- **Dual Theme Support**: Dark (default) and Light mode toggle with CSS custom properties and smooth transitions.
- **Async Latency Simulator**: Built-in control (`0ms`, `1000ms`, `3000ms`, `5000ms`) to showcase async processing.
- **Skeleton Shimmer Loaders**: Shimmer placeholder bars and cards replace content during pending states.
- **Global Indeterminate Progress Bar**: Fluid top bar indicator during HTTP activity.
- **Floating Toast System**: Auto-dismissing alerts for actions and errors.
- **Responsive Layout**: Sidebar and top bar navigation with status indicators.

### Criterion 4: Clean Architecture
- **Layered Backend**: `Routes` -> `Controllers` -> `Services` -> `Repositories`.
- **Smart/Dumb Component Split**: Smart container pages handle data orchestration; dumb UI components handle presentation with `OnPush`.
- **Strict TypeScript**: Complete type coverage without `any`.
- **State Management**: `UserService` centralized state using `BehaviorSubject<User | null>`.

---

## 4. API Endpoints

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| `POST` | `/api/auth/login` | Public | Validate credentials & role, returns JWT and user profile |
| `GET` | `/api/users/me` | Authenticated | Return profile of currently authenticated user |
| `GET` | `/api/records` | Authenticated | Get records scoped to role (General User: own; Admin: all) |
| `GET` | `/api/users` | Admin Only | List directory users |
| `POST` | `/api/users` | Admin Only | Add a new user to the database |
| `PUT` | `/api/users/:id` | Admin Only | Update an existing user |
| `DELETE` | `/api/users/:id` | Admin Only | Remove a user from the database |
| `GET` | `/api/health` | Public | Server health & active storage driver check |

> **Query Parameter `?delay=<ms>`**: Supported on all endpoints to simulate latency (e.g. `GET /api/records?delay=3000`).

---

## 5. How the Delay Demonstration Works

1. In either the **Dashboard** or **Admin Panel**, select **3000ms (Async Demo)**.
2. Click **Reload** or perform a CRUD action (Add/Edit/Delete User).
3. The server's `delay.middleware.ts` intercepts the request, holds execution for 3000ms via `setTimeout`, then forwards to the controller.
4. While the request is in-flight:
   - The top progress bar pulses across the viewport.
   - Table rows and user card display animated shimmer skeleton loaders.
   - The status meter indicates `Async request in progress...`.
5. Upon arrival:
   - Skeleton loaders disappear, and live data populates instantly.
   - A success toast confirms completion with the exact elapsed milliseconds.
