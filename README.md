# 🛒 Seller & Product Management System

A professional, full-stack **Management Information System (MIS)** designed for multi-role product ecosystems. This application allows administrators to manage sellers and brands while providing sellers with a robust platform to list, track, and report their inventory.

---

## ✨ Key Features

### 🔐 Security & Access
- **Multi-Role Authentication**: Distinct dashboards for **Admins** and **Sellers**.
- **JWT Protection**: Secure API communication with token-based authorization.
- **Protected Routes**: Middleware-enforced access control on both Frontend and Backend.

### 📦 Product Lifecycle
- **Comprehensive CRUD**: Create, Read, Update, and Delete products with ease.
- **Brand Association**: Link products to multiple brands dynamically.
- **Smart Validation**: 500-character limits and field-level validation for data integrity.

### 📊 Reporting & Media
- **PDF Generation**: Instantly generate professional PDF reports for products including embedded images.
- **Advanced Image Handling**: Multipart/form-data support for high-quality product image uploads.
- **Pagination & Search**: Optimized for large datasets with 5-item-per-page pagination and real-time search.

### 🎨 User Experience
- **Modern Dark UI**: Sleek, glassmorphic dark theme built with Tailwind CSS.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop viewing.
- **Interactive Modals**: In-app PDF previews and image galleries.
- **Live Notifications**: Real-time feedback via `react-hot-toast`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15+, React 19, Tailwind CSS |
| **State/Forms** | Context API, React Hook Form |
| **Icons/UI** | Lucide React, Headless UI |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JSON Web Tokens (JWT), BcryptJS |
| **Files** | Multer, PDFKit |
| **Docs** | Swagger (OpenAPI 3.0) |

---

## 📂 Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Auth & Validation
│   │   ├── config/        # DB connection
│   │   └── utils/         # PDF & Seeder logic
│   └── uploads/           # Product images (gitignored)
├── frontend/
│   ├── app/               # Next.js App Router (Pages & Layouts)
│   ├── components/        # Reusable UI components
│   ├── context/           # Auth & Global State
│   ├── services/          # API Abstraction (Axios)
│   └── public/            # Static assets
└── docs/                  # Documentation assets
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
```
Seed the admin account:
```bash
npm run seed
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env.local` file in the `frontend` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_UPLOADS_URL=http://localhost:5000/uploads
```

### 4. Running the App
**Start Backend:** `cd backend && npm run dev`  
**Start Frontend:** `cd frontend && npm run dev`

---

## 📖 API Documentation
Once the backend is running, access the interactive Swagger documentation at:
🔗 [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## 🔑 Default Admin Credentials
- **Email**: `admin@example.com`
- **Password**: `Admin@123`

---

## 📝 License
Distributed under the ISC License.
