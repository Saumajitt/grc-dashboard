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

## API Documentation

### Authentication APIs

#### Register User

**POST** `/api/auth/register`

```json
{
    "email": "normaluser@example.com",
    "password": "StrongPassword123",
    "role": "client"
}
```

#### Login

**POST** `/api/auth/login` → Receive JWT token

---

## 📄 Evidence API Documentation

**Base URL:** `/api/evidence`  
**Authentication:** JWT (Bearer Token) required  
**Roles:** `client` (normal user), `admin`

### 1. Upload Evidence

**Endpoint:** `POST /api/evidence/upload`  
**Description:** Upload multiple evidence files at once.  
**Access:** Authenticated users (`client` and `admin`)

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Body (form-data):**

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| files | File[] | Yes | One or more evidence files (max 10) |
| title | String | Yes | Common title for the batch |
| category | String | Optional | One of `policy`, `diagram`, `doc`, `other` |

**Response:** `201 Created`

```json
{
  "message": "Evidence uploaded successfully",
  "count": 4,
  "files": [
    {
      "_id": "evidence_id",
      "title": "Test Evidence Batch 1",
      "category": "policy",
      "filename": "file_name.pdf",
      "path": "path/to/file",
      "uploadedBy": "user_id",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}
```

**Errors:**

- `400` → No files uploaded
- `401` → Unauthorized

---

### 2. Get User Evidence

**Endpoint:** `GET /api/evidence`  
**Description:** Fetch a paginated list of evidence uploaded by the authenticated user.  
**Access:** Normal users (`client`) only; admins are redirected to `/admin/dashboard`.

**Query Parameters (Optional):**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 10 | Number of records per page |
| category | str | - | Filter by category (`policy`, `diagram`, `doc`, `other`) |

**Response:** `200 OK`

```json
{
  "page": 1,
  "totalPages": 1,
  "total": 3,
  "count": 3,
  "evidences": [
    {
      "_id": "evidence_id",
      "title": "Test Evidence Batch 1",
      "category": "policy",
      "filename": "file_name.pdf",
      "path": "path/to/file",
      "uploadedBy": {
        "_id": "user_id",
        "email": "user@example.com",
        "role": "client"
      },
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}
```

**Errors:**

- `401` → Unauthorized
- `403` → Admins cannot use this endpoint

---

### 3. Update Evidence

**Endpoint:** `PUT /api/evidence/:id`  
**Description:** Update metadata of an existing evidence file (title or category).  
**Access:**

- Admin: Can update any evidence
- Client: Can update only their own uploads

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| title | String | Optional | New title for the evidence |
| category | String | Optional | New category (`policy`, `diagram`, `doc`, `other`) |

**Response:** `200 OK`

```json
{
  "message": "Evidence updated successfully",
  "evidence": {
    "_id": "evidence_id",
    "title": "Updated Quarterly Report",
    "category": "doc",
    "filename": "file_name.pdf",
    "path": "path/to/file",
    "uploadedBy": "user_id",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

**Errors:**

- `401` → Unauthorized
- `403` → Forbidden if trying to update evidence not owned by the client
- `404` → Evidence not found
- `400` → Invalid category value

---

### 4. Delete Evidence

**Endpoint:** `DELETE /api/evidence/:id`  
**Description:** Delete an evidence record and its corresponding file from the server.  
**Access:**

- Admin: Can delete any evidence
- Client: Can delete only their own uploads

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Response:** `200 OK`

```json
{
  "message": "Evidence deleted successfully",
  "deletedId": "evidence_id"
}
```

**Errors:**

- `401` → Unauthorized
- `403` → Forbidden if trying to delete evidence not owned by the client
- `404` → Evidence not found

---

### 🔹 Notes

- All endpoints use **JWT authentication** via the `Authorization` header
- File uploads are restricted to **max 10 files per request**
- `category` field is restricted to **enum values**: `policy`, `diagram`, `doc`, `other`

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
