# MployChek LoginPage Demo — Single Page Application

> **Login page demo Portal**  
> Full-Stack Angular 17 & Node.js/Express application with XML storage, role-based access control, and async latency simulation.

---

## 1. Project Overview & Accomplishments Till Now

This project is an enterprise-grade full-stack portal built with clean architecture, strict TypeScript typing, and zero external database dependencies. Here is everything implemented and verified across the application:

### Authentication & Authorization (RBAC)
- **Role-Based Access Control**: Strict segregation between **General User** and **Administrator**.
- **JWT Authentication**: Secure tokens signed with HS256, issued upon `/api/auth/login`, and attached to all outgoing requests via Angular `TokenInterceptor`.
- **Role Mismatch Prevention**: Rejects logins (HTTP 401) if a user attempts to log in under an unassigned role.
- **Route Guards**:
  - `AuthGuard`: Blocks unauthenticated users from accessing protected views.
  - `AdminGuard`: Restricts `/admin` routes exclusively to authenticated administrators.
- **Auto-Hydration on Refresh**: `APP_INITIALIZER` fetches current profile via `GET /api/users/me` on browser reload when a token exists.

### Data Layer & Storage Architecture
- **Zero-Config XML Storage**: Custom XML data repository layer (`XmlUserRepository` and `XmlRecordRepository`) utilizing `xml2js` to read and persist records in `data.xml`.
- **Repository Pattern Abstraction**: `IUserRepository` and `IRecordRepository` decouple controllers from the storage implementation.
- **Password Security**: Passwords hashed and validated using `bcryptjs`.
- **Data Isolation & Scoping**:
  - **General Users**: Can only access their personal records (`ownerUserId === user.userId`).
  - **Administrators**: Granted global scope across all organizational records.

### Admin User Management (Full CRUD)
- **User Directory**: Searchable, filterable real-time user directory with role filters (`ALL`, `Administrator`, `General User`).
- **User Creation**: Form modal validating User ID, Full Name, Email, Department, Role, and Password, saving to XML via `POST /api/users` (HTTP 201).
- **User Editing**: Updates user metadata and optional password via `PUT /api/users/:id` (HTTP 200).
- **User Deletion**: Safe modal confirmation and removal via `DELETE /api/users/:id` (HTTP 200).
- **Universal API Normalization**: Smart URL resolution in `UserService`, `AuthService`, and `RecordService` automatically formats `/api/*` endpoints without duplicate `/api` paths across local (`http://localhost:3000/api`) and deployed environments (`https://mploychek-loginpage-demo.onrender.com`).
- **Clear Error Diagnostics**: Comprehensive error extraction for HTTP 400, 401, 403, 404, 409, 500, and network failures (status 0), replacing generic failure toasts with actionable messages.

### UI / UX Design & Async Simulation
- **Custom Design System**: Bespoke dark & light themes styled with vanilla CSS variables and Google Fonts (**Inter**, **Outfit**, **JetBrains Mono**).
- **Async Latency Simulation**: Server-side `delay.middleware.ts` supports `?delay=<ms>` (0ms, 1000ms, 3000ms, 5000ms) to simulate real-world API latency.
- **Responsive Feedback**: Indeterminate top progress bar, shimmering skeleton loaders, and floating toasts showing exact elapsed request times.

---

## 2. Live Deployment & Environments

- **Deployed Backend (Render)**: `https://mploychek-loginpage-demo.onrender.com`
- **Multi-Service Deployment Config**: `vercel.json` routing rules for hosting frontend and serverless API endpoints.

### Environment Configurations
- **Development (`client/src/environments/environment.ts`)**:
  ```typescript
  export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000/api',
  };
  ```
- **Production (`client/src/environments/environment.prod.ts`)**:
  ```typescript
  export const environment = {
    production: true,
    apiUrl: 'https://mploychek-loginpage-demo.onrender.com',
  };
  ```

---

## 3. Quick Start Guide

### Prerequisites
- Node.js 18+ (tested on v20.x)
- npm 9+ (tested on v10.x)

### 1. Start the Backend API
```bash
cd server
npm install
npm run seed      # Initializes data.xml with default users & records
npm run dev       # Starts Express API at http://localhost:3000
```

### 2. Start the Angular Client
```bash
cd client
npm install
npm start         # Starts Angular dev server at http://localhost:4200
```
Navigate to **`http://localhost:4200`** in your browser.

---

## 4. Demo Credentials

The database is pre-seeded with test accounts for each role:

| Role | User ID | Password | Scope & Permissions |
|------|---------|----------|---------------------|
| **General User** | `user01` | `User@123` | Scoped to own records (3 personal records) |
| **General User** | `user02` | `User@456` | Scoped to own records (2 personal records) |
| **Administrator** | `admin01` | `Admin@123` | Global view (all organization records) + Admin User CRUD |

*Convenient 1-click **Quick Login** buttons are available on the login page.*

---

## 5. API Endpoints Specification

All backend endpoints are prefixed with `/api`:

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| `POST` | `/api/auth/login` | Public | Validates credentials & role; issues JWT and user profile |
| `GET` | `/api/users/me` | Authenticated | Returns profile of currently authenticated user |
| `GET` | `/api/records` | Authenticated | Returns records scoped to role (User: own; Admin: all) |
| `GET` | `/api/users` | Admin Only | Lists all registered users in the directory |
| `POST` | `/api/users` | Admin Only | Creates a new user in the XML database (201 Created) |
| `PUT` | `/api/users/:id` | Admin Only | Updates an existing user's details |
| `DELETE` | `/api/users/:id` | Admin Only | Deletes user from the XML database |
| `GET` | `/api/health` | Public | Healthcheck and active storage driver status |

> **Latency Simulation Parameter**: Append `?delay=<ms>` to any endpoint (e.g. `POST /api/users?delay=3000`) to test non-blocking latency handling.

---

## 6. Project Structure

```
mploychek-login-page/
├── vercel.json                 # Multi-service routing configuration
├── README.md                   # Project documentation
├── client/                     # Angular 17 Single Page Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Singletons, tokens, services, interceptors, guards
│   │   │   │   ├── guards/     # auth.guard.ts, admin.guard.ts
│   │   │   │   ├── interceptors/ # token.interceptor.ts, loading.interceptor.ts, error.interceptor.ts
│   │   │   │   ├── services/   # auth.service.ts, user.service.ts, record.service.ts, toast.service.ts
│   │   │   │   └── tokens/     # api.token.ts
│   │   │   ├── features/       # Lazy-loaded feature modules
│   │   │   │   ├── auth/       # Login component with quick-fill role toggles
│   │   │   │   ├── dashboard/  # User profile & scoped record view
│   │   │   │   └── admin/      # Admin directory, delay toggles, user CRUD modals
│   │   │   ├── layout/         # Topbar, sidebar, shell layout
│   │   │   └── shared/         # Reusable directives (*hasRole), pipes, shimmer skeletons
│   │   └── environments/       # environment.ts & environment.prod.ts
│   └── package.json
└── server/                     # Express & TypeScript Backend API
    ├── src/
    │   ├── config/             # Environment variables & constants
    │   ├── middleware/         # auth.middleware, role.middleware, delay.middleware, error.middleware
    │   ├── modules/            # Domain modules (auth, users, records)
    │   │   ├── auth/           # auth.routes, auth.controller, auth.service
    │   │   ├── users/          # users.routes, users.controller, users.service
    │   │   └── records/        # records.routes, records.controller, records.service
    │   ├── repositories/       # IUserRepository, IRecordRepository, XmlUserRepository, XmlRecordRepository
    │   ├── seed/               # seed.ts and data.xml
    │   └── app.ts              # Express application factory
    ├── test-endpoints.js       # Standalone endpoint test script
    ├── test-e2e-flows.js       # Complete 9-flow automated verification suite
    └── package.json
```

---

## 7. Testing & Quality Assurance

### Automated End-to-End Test Suite
The backend includes a comprehensive 9-point verification script validating all business logic and security policies:

```bash
# Terminal 1: Run the backend server
cd server
npm run dev

# Terminal 2: Execute the test suite
cd server
node test-e2e-flows.js
```

**Test Coverage Verified:**
1. General User Login & JWT issuance.
2. Hydrating profile via `GET /api/users/me`.
3. Strict personal record scoping for General User.
4. Role mismatch rejection (401 Unauthorized).
5. Administrator Login.
6. Organization-wide records visibility for Administrator.
7. Role restriction enforcement (403 Forbidden on `/api/users` for General User).
8. Admin User Management CRUD cycle (`POST`, `PUT`, `DELETE /api/users`).
9. Non-blocking latency simulation (`?delay=3000`).

### Frontend Compilation
```bash
cd client
npm run build
```
Production build bundles compile cleanly with zero errors or warnings.
