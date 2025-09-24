# GRC Dashboard

A prototype dashboard to optimize common workflows for **GRC (Governance, Risk, and Compliance) professionals**, focused on **evidence management** and **third-party risk management (TPRM)**.  

Built with **Next.js (frontend)**, **Node.js/Express (backend)**, and **MongoDB (database)**. Designed for scalability, modularity, and ease of extension with microservices.

---

## Problem Statement

GRC professionals face two recurring workflow inefficiencies:

1. **Evidence Upload Issue**  
   - Evidence files (e.g., policies, diagrams, documents) must currently be uploaded one by one.  
   - This is inefficient, especially for multiple files belonging to the same category (e.g., "Encryption Policies").

2. **Bulk Upload Issue**  
   - Onboarding multiple third-party organizations requires manual search/entry.  
   - This is time-consuming and error-prone.

---

## Current Status (Achieved So Far)

**Backend:**

- User registration & login with JWT authentication (role-based: admin/client).  
- **Evidence Upload API** supporting multi-file uploads (up to 10 files per request).  
  - Files are stored locally (`/uploads`) with timestamped filenames.  
  - Each file is associated with the uploader.  
- **Get Evidence API**:  
  - Normal users fetch **only their uploaded evidence**.  
  - Pagination, sorting (newest first), and filtering by category are implemented.  
  - Populates `uploadedBy` field for clarity.  
- **Third-Party Bulk Upload API**:  
  - Accepts CSV files, normalizes headers (lowercase/uppercase), validates data, and stores in MongoDB.  
- MongoDB fully connected; collections include `users`, `evidence`, and `thirdparties`.

**Frontend (Planned/Setup):**

- Next.js + React project scaffolded.
- Dashboard layout (sidebar, pages) planned.

**Tested Workflows:**

1. Register a normal user (`client`) and upload multiple evidence files in a single batch.  
2. Get uploaded evidence and verify pagination, sorting, and filtering.  
3. Bulk upload CSV of third-party organizations with proper validation and error reporting.  

---

## Proposed Solution / Next Steps

**Backend Enhancements:**

1. **Admin Endpoint**:
   - Fetch **all users**, **all evidence**, and **all third-party uploads**.  
   - Pagination, sorting, and filtering support.  
2. **Evidence Retrieval Filters**:
   - Allow more granular filtering (category, date range, uploader, etc.).  
3. **RBAC Middleware**:
   - Enforce role-based access control systematically.  
4. **Audit Logging**:
   - Track evidence uploads, downloads, and bulk operations.  
5. **File Validation**:
   - Check type and size before upload.  

**Frontend Goals:**

- Implement **professional dashboard** with:
  - Tables displaying evidence and third-party info.
  - Pagination controls.
  - Filters and sorting.
  - Upload forms (multi-file and CSV).  

---

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, shadcn/ui  
- **Backend:** Node.js, Express  
- **Database:** MongoDB (Mongoose for schemas/models)  
- **Auth:** JWT (role-based), OAuth2 extension planned  
- **File Upload:** Multer for multi-file uploads  
- **CSV Parsing:** csv-parser library  

---

# GRC Dashboard

## Project Structure

```
grc-dashboard/
│
├── frontend/           # Next.js app
├── backend/            # Node.js + Express APIs
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── uploads/
├── db/                 # MongoDB setup & scripts
└── README.md
```

## Testing the APIs

### Register User

**POST** `/api/auth/register`

```json
{
    "email": "normaluser@example.com",
    "password": "StrongPassword123",
    "role": "client"
}
```

---

### Login

**POST** `/api/auth/login` → Receive JWT token

---

### Upload Evidence

**POST** `/api/evidence/upload`

**Headers:**

```
Authorization: Bearer <JWT>
```

**Body:** (form-data)

- `files`: select multiple files (up to 10)
- `title`: "Test Evidence Batch 1"
- `category`: "policy"

---

### Get Evidence

**GET** `/api/evidence`

**Headers:**

```
Authorization: Bearer <JWT>
```

**Query Parameters:**

```
?page=1&limit=10&category=policy
```

---

## Roadmap (MVP)

- ✅ User Authentication (Role-based)
- ✅ Evidence Upload API (multi-file)
- ✅ Bulk Upload API (Third-party orgs)
- ⬜ Dashboard layout (Next.js + React)
- ⬜ Integration: Connect frontend to backend APIs
- ⬜ Admin API (all users, evidence, third-party)
- ⬜ Sorting, filtering, and pagination enhancements
- ⬜ Audit logs and file validation
