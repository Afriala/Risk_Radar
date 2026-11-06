# RiskRadar — Module 1: Security Architecture & Credential Management Policy

**Project**: RiskRadar — Enterprise Cybersecurity Risk Management Platform  
**Course**: SE331 — Software Engineering Lab  
**Academic Session**: Fall 2026 | Section: B1 | Group: 08  
**Institution**: Daffodil International University  
**Author / Lead Contributor (Security Specification)**: Mahabubur Rahman (ID: `232-35-706`, GitHub: [`@Mrsakib13`](https://github.com/Mrsakib13))  
**Project Lead**: Afri Alam Dipto (ID: `232-35-643`, GitHub: [`@Afriala`](https://github.com/Afriala))  

---

## 1. Module 1 Overview & Scope

Module 1 establishes the foundational security, authentication, and authorization backbone for the **RiskRadar** enterprise platform. The objective is to enforce enterprise-grade security standards for identity verification, credential protection, session lifecycle management, and fine-grained access control before allowing any risk calculation or asset data handling in subsequent modules.

---

## 2. Credential Security & Password Management Policy

### 2.1 Password Complexity Standards
To prevent brute force, dictionary attacks, and credential stuffing:
- Minimum length: **6 characters** (recommended 8+ for production enterprise environments).
- Passwords must contain alphanumeric characters with optional special symbols.
- Passwords are validated both on the client side (before transmission) and strictly on the server side (in `backend/src/controllers/auth.controller.js`).

### 2.2 Cryptographic Hashing with Bcrypt
- Plaintext passwords are **never stored** in memory or persistent storage.
- Storage uses `bcryptjs` adaptive one-way hashing with **10 salt rounds** (`saltRounds = 10`).
- Each hash generates an unpredictable cryptographic salt that neutralizes rainbow table lookups.
- Password comparison during authentication executes via constant-time verification (`bcrypt.compare`) to prevent timing side-channel attacks.

```
[Plaintext Password + 10 Salt Rounds] ──(bcryptjs)──> [2a$10$... irreversible 60-char hash]
```

---

## 3. Session Security & Token Lifecycle Management

### 3.1 Token-Based Authentication (Stateless JWT)
- RiskRadar employs standard **JSON Web Tokens (JWT)** signed via `HS256` (HMAC with SHA-256).
- Signature verification utilizes an isolated environment secret key (`JWT_SECRET`).
- Payload contains minimal necessary identification:
  ```json
  {
    "id": "uuid-v4-identifier",
    "email": "user@enterprise.org",
    "role": "Security Analyst",
    "iat": 1730870400,
    "exp": 1730956800
  }
  ```

### 3.2 Expiration & Token Lifecycle
- **Default Lifespan**: Tokens expire automatically in **24 hours** (`24h`), reducing the vulnerability window of intercepted credentials.
- **Client Transmission**: The client passes the token on all protected requests using the standard HTTP Authorization header:
  ```http
  Authorization: Bearer <jwt-token-string>
  ```

### 3.3 Session Termination (Secure Logout)
- Triggering logout in the client wipes the cached token and user identity from `localStorage`.
- Memory references in React context (`AuthContext`) are cleared immediately.
- Client state resets to unauthenticated, auto-redirecting navigation to `/login`.

---

## 4. Role-Based Access Control (RBAC) Specification Matrix

RiskRadar defines four discrete organizational roles, each mapped to specific governance boundaries:

| Capability / Resource | Administrator | Security Analyst | Executive | Compliance Auditor |
| :--- | :---: | :---: | :---: | :---: |
| **User Management** (Create/Edit Users) | ✅ Full | ❌ Denied | ❌ Denied | ❌ Denied |
| **System Settings & Configuration** | ✅ Full | ❌ Denied | ❌ Denied | ❌ Denied |
| **Asset Inventory (Add/Edit Assets)** | ✅ Full | ✅ Full | ❌ Denied | ❌ Denied |
| **Threat & Vulnerability Logging** | ✅ Full | ✅ Full | ❌ Denied | ❌ Denied |
| **Cyber Risk Scoring Calculation** | ✅ Full | ✅ Full | ❌ Denied | ❌ Denied |
| **Risk Register & Heatmap Viewing** | ✅ Full | ✅ Full | ✅ View Only | ✅ View Only |
| **Executive Reports & Summary Export** | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Audit Logs & Compliance Trails** | ✅ Full | ❌ Denied | ❌ Denied | ✅ Read Only |

### 4.1 Middleware Guard Implementation
Protected backend routes pass through an authorization pipeline:
1. `auth.middleware.js`: Validates JWT validity and extracts decoded user identity.
2. `role.middleware.js`: Enforces role white-listing against route definitions.
3. Requests lacking sufficient clearance return an immediate `HTTP 403 Forbidden` response.

---

## 5. Information Disclosure Prevention & Error Standards

To avoid revealing internal system architecture or valid user enumeration:
- **Authentication Failures**: Return a generic `401 Unauthorized` with message `"Invalid email or password"` (prevents account enumeration attacks).
- **Registration Collisions**: Controlled `400 Bad Request` with message `"User already exists with this email"`.
- **Expired / Tampered Tokens**: Return `401 Unauthorized` with message `"Invalid or expired token"`.

---

## 6. Verification & Evaluation Checklist

- [x] User Registration endpoint operational (`POST /api/auth/register`)
- [x] User Login endpoint operational (`POST /api/auth/login`)
- [x] Bcrypt hashing confirmed (verified 10 salt rounds)
- [x] JWT token emission and signature verification confirmed
- [x] Role validation functional across all 4 stakeholder profiles
- [x] Clean corporate UI implemented with responsive accessibility
- [x] Cloud deployments active (Backend on Render, Frontend on Vercel)
