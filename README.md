# 🏢 Leave Management Application

A comprehensive, enterprise-grade leave management system built with modern web technologies. Features Google OAuth authentication, role-based approval workflows, real-time notifications, and seamless Google Calendar integration.

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Hono](https://img.shields.io/badge/Hono-4.0.0-FF6B35?style=flat&logo=hono)](https://hono.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3FCF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Google Calendar](https://img.shields.io/badge/Google_Calendar-API-4285F4?style=flat&logo=google-calendar)](https://developers.google.com/calendar)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker)](https://www.docker.com/)

## 🎯 Project Overview

This application solves the complex challenge of enterprise leave management by providing:

- **Streamlined Leave Applications** - Intuitive form-based leave requests with smart validation
- **Role-Based Approval Workflows** - Hierarchical approval system (Member → Manager → Admin)
- **Real-Time Notifications** - Email and Slack integration for instant updates
- **Calendar Synchronization** - Automatic Google Calendar event creation/deletion
- **Administrative Control** - Comprehensive admin panel for organizational management
- **Multi-Tenant Support** - Projects, regions, and groups for large organizations

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │    │   Hono.js API   │    │   Supabase DB   │
│                 │    │                 │    │                 │
│ • User Interface│◄──►│ • REST API      │◄──►│ • PostgreSQL    │
│ • State Mgmt    │    │ • Auth Middleware│    │ • RLS Policies  │
│ • Routing       │    │ • Business Logic│    │ • Real-time     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ External APIs   │    │   Integrations  │    │   Notifications │
│                 │    │                 │    │                 │
│ • Google OAuth  │    │ • Google Cal API│    │ • SMTP Email    │
│ • Google Cal    │    │ • OAuth Flow    │    │ • Slack Webhook │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Database Schema Design

```sql
-- Core Tables with Relationships
profiles (1) ──────────► leaves (M)
    │                      │
    └─► user_leave_types ◄─┘
              │
              ▼
        leave_types (1)

-- Organizational Structure
projects, regions, groups (Independent entities)

-- Integration Settings
google_calendar_settings (Admin configuration)
```

### API Architecture

**RESTful Design Principles:**

- Resource-based URLs (`/api/leaves`, `/api/admin/users`)
- HTTP methods mapping to CRUD operations
- Consistent JSON responses with error handling
- JWT-based authentication with Supabase
- Role-based access control middleware

## 🚀 Tech Stack

### Backend Infrastructure

| Component           | Technology                   | Purpose                         |
| ------------------- | ---------------------------- | ------------------------------- |
| **Framework**       | Hono.js                      | Lightweight, fast web framework |
| **Runtime**         | Node.js 18+                  | JavaScript runtime environment  |
| **Database**        | Supabase (PostgreSQL)        | Database with built-in auth     |
| **Authentication**  | Supabase Auth + Google OAuth | Secure user authentication      |
| **API Integration** | Google Calendar API          | Calendar event management       |
| **Notifications**   | Nodemailer + SMTP            | Email notifications             |
| **Real-time**       | Slack Webhooks               | Instant messaging alerts        |

### Frontend Architecture

| Component            | Technology      | Purpose                         |
| -------------------- | --------------- | ------------------------------- |
| **Framework**        | React 18.2      | Component-based UI framework    |
| **Build Tool**       | Vite            | Fast development and build tool |
| **Routing**          | React Router v6 | Client-side routing             |
| **Styling**          | Tailwind CSS    | Utility-first CSS framework     |
| **State Management** | React Hooks     | Local and global state          |
| **HTTP Client**      | Fetch API       | API communication               |

### DevOps & Deployment

| Component              | Technology              | Purpose                       |
| ---------------------- | ----------------------- | ----------------------------- |
| **Containerization**   | Docker + Docker Compose | Local development environment |
| **Environment Config** | dotenv                  | Configuration management      |
| **Version Control**    | Git                     | Source code management        |
| **Code Quality**       | ESM modules             | Modern JavaScript standards   |

## 🛠️ Setup Instructions

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker & Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

### 1. 📁 Clone Repository

```bash
git clone https://github.com/BaibhavSureka/Leave-Management-App.git
cd Leave-Management-App
```

### 2. 🗄️ Database Setup (Supabase)

#### Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Note down:
   - `Project URL`
   - `Anon Key`
   - `Service Role Key`

#### Configure Google OAuth

1. In Supabase Dashboard → Authentication → Providers
2. Enable **Google** provider
3. Add your Google OAuth credentials (see step 4)

#### Run Database Migrations

```sql
-- In Supabase SQL Editor, run these files in order:
-- 1. scripts/db/schema.sql (Creates tables, RLS policies, indexes)
-- 2. scripts/db/seed.sql (Inserts demo data)
```

### 3. 🔧 Environment Configuration

#### Backend Configuration

```bash
# Copy and configure backend environment
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google OAuth (for admin calendar integration)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8787/api/admin/google/oauth/callback

# Optional: Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Optional: Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Optional: Calendar Integration (set to 'true' to enable)
ENABLE_CALENDAR=true

# Server Configuration
PORT=8787
APP_ORIGIN=http://localhost:5173
```

#### Frontend Configuration

```bash
# Copy and configure frontend environment
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL
VITE_BACKEND_URL=http://localhost:8787
```

### 4. 🔐 Google OAuth Setup

#### Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable **Google Calendar API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URI: `http://localhost:8787/api/admin/google/oauth/callback`
7. Copy Client ID and Client Secret to backend `.env`

### 5. 🐳 Docker Deployment (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:8787
```

### 6. 🎯 Manual Setup (Alternative)

#### Backend Setup

```bash
cd backend
npm install
npm run dev  # Runs on http://localhost:8787
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

### 7. 👤 Admin User Setup

1. Open http://localhost:5173
2. Sign in with Google
3. In Supabase Dashboard → Table Editor → `profiles`
4. Find your user record and update `role` to `'ADMIN'`
5. Refresh the application - you'll now see admin features

### 8. 📅 Google Calendar Integration (Optional)

1. Login as admin user
2. Go to **Admin** → **Integrations**
3. Click **Connect Google Account**
4. Complete OAuth flow
5. Set your Calendar ID (e.g., `primary` or `your-calendar@group.calendar.google.com`)

## 📊 Demo Data & Testing

### Sample Users

The application creates profiles automatically on first login. Promote users to different roles:

```sql
-- Make a user Admin
UPDATE profiles SET role = 'ADMIN' WHERE email = 'admin@example.com';

-- Make a user Manager
UPDATE profiles SET role = 'MANAGER' WHERE email = 'manager@example.com';

-- Regular users default to 'MEMBER' role
```

### Sample Leave Types

Pre-seeded leave types include:

- **Annual Leave** - Yearly vacation entitlement
- **Sick Leave** - Medical-related absences
- **Personal Leave** - Personal matters
- **Maternity/Paternity Leave** - Parental leave
- **Comp Off** - Compensatory time off
- **Gift Leave** - Discretionary leave grants
- **Emergency Leave** - Urgent situations

### Sample Organizations

Pre-seeded organizational units:

- **Projects**: Alpha, Beta, Gamma, Internal Operations
- **Regions**: North America, Europe, Asia Pacific, India
- **Groups**: Engineering, Product, Design, Marketing, Sales

### Testing Workflow

1. **User Registration**: Sign in with Google OAuth
2. **Admin Setup**: Promote first user to admin role
3. **Leave Type Assignment**: Admin assigns leave types to users
4. **Leave Application**: Member applies for leave
5. **Approval Process**: Manager/Admin approves request
6. **Calendar Sync**: Event created in Google Calendar
7. **Notifications**: Email/Slack notifications sent
8. **Leave Cancellation**: User cancels approved leave (removes calendar event)

## 📚 API Documentation

### Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer <supabase_access_token>
```

### API Base URL

```
http://localhost:8787/api
```

---

## 🔐 Authentication Endpoints

### GET `/auth/me`

Get current user profile and information

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "profile": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "MEMBER",
    "avatar_url": "https://...",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST `/auth/profiles/upsert`

Create or update user profile (called automatically on first login)

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "full_name": "John Doe",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response:**

```json
{
  "ok": true
}
```

---

## 📝 Leave Management Endpoints

### GET `/leaves`

Get current user's leave requests

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "leave_type_id": "uuid",
    "reason": "Family vacation",
    "start_date": "2024-01-15",
    "end_date": "2024-01-20",
    "half_day": false,
    "total_days": 5,
    "status": "APPROVED",
    "approver_required_role": "MANAGER",
    "approved_by": "uuid",
    "approved_at": "2024-01-10T10:00:00.000Z",
    "google_event_id": "google_event_123",
    "created_at": "2024-01-01T00:00:00.000Z",
    "leave_types": {
      "name": "Annual Leave"
    }
  }
]
```

### POST `/leaves`

Create new leave request

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "leave_type_id": "uuid",
  "reason": "Family vacation",
  "start_date": "2024-01-15",
  "end_date": "2024-01-20",
  "half_day": false,
  "total_days": 5
}
```

**Response:**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "leave_type_id": "uuid",
  "reason": "Family vacation",
  "start_date": "2024-01-15",
  "end_date": "2024-01-20",
  "half_day": false,
  "total_days": 5,
  "status": "PENDING",
  "approver_required_role": "MANAGER",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**

```json
// Leave type not assigned to user
{
  "error": "Leave type not assigned"
}

// Admin users cannot apply for leave
{
  "error": "Admins cannot apply for leave"
}
```

### DELETE `/leaves/:id`

Cancel leave request (removes calendar event if approved)

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "ok": true
}
```

---

## ✅ Approval Management Endpoints

### GET `/approvals`

Get leave requests pending approval (Manager/Admin only)

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `status` - Filter by status (PENDING, APPROVED, REJECTED)

**Response:**

```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "leave_type_id": "uuid",
    "reason": "Medical appointment",
    "start_date": "2024-01-15",
    "end_date": "2024-01-15",
    "half_day": true,
    "total_days": 0.5,
    "status": "PENDING",
    "approver_required_role": "MANAGER",
    "created_at": "2024-01-01T00:00:00.000Z",
    "profiles": {
      "full_name": "John Doe",
      "email": "john@example.com",
      "role": "MEMBER"
    },
    "leave_types": {
      "name": "Sick Leave"
    }
  }
]
```

### PUT `/approvals/:id`

Approve or reject leave request

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "decision": "APPROVED", // or "REJECTED"
  "note": "Approved for medical reasons" // optional
}
```

**Response:**

```json
{
  "id": "uuid",
  "status": "APPROVED",
  "approved_by": "uuid",
  "approved_at": "2024-01-10T10:00:00.000Z",
  "google_event_id": "google_event_123",
  "rejection_note": null
}
```

---

## 👥 Admin User Management

### GET `/admin/users`

Get all users (Admin/Manager only)

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "MEMBER",
    "avatar_url": "https://...",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### PATCH `/admin/users/:id/role`

Update user role (Admin only)

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "role": "MANAGER" // ADMIN, MANAGER, or MEMBER
}
```

**Response:**

```json
{
  "ok": true
}
```

---

## 🏷️ Admin Leave Type Management

### GET `/admin/leave-types`

Get all leave types

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "Annual Leave",
    "active": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST `/admin/leave-types`

Create new leave type

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Study Leave"
}
```

**Response:**

```json
{
  "id": "uuid",
  "name": "Study Leave",
  "active": true,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### PATCH `/admin/leave-types/:id`

Update leave type

**Request Body:**

```json
{
  "name": "Updated Leave Type",
  "active": false
}
```

### DELETE `/admin/leave-types/:id`

Delete leave type

**Response:**

```json
{
  "ok": true
}
```

---

## 🏢 Admin Organization Management

### Projects, Regions, Groups APIs

Each organizational unit (projects, regions, groups) follows the same pattern:

#### GET `/admin/{projects|regions|groups}`

List all organizational units

#### POST `/admin/{projects|regions|groups}`

Create new organizational unit

**Request Body:**

```json
{
  "name": "New Project Alpha"
}
```

#### PATCH `/admin/{projects|regions|groups}/:id`

Update organizational unit

**Request Body:**

```json
{
  "name": "Updated Project Name",
  "active": true
}
```

#### DELETE `/admin/{projects|regions|groups}/:id`

Delete organizational unit

---

## 🔗 Leave Type Assignment

### GET `/admin/user-leave-types`

Get all user-leave type assignments

**Response:**

```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "leave_type_id": "uuid",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST `/admin/user-leave-types`

Assign leave type to user

**Request Body:**

```json
{
  "user_id": "uuid",
  "leave_type_id": "uuid"
}
```

### DELETE `/admin/user-leave-types`

Remove leave type assignment

**Request Body:**

```json
{
  "user_id": "uuid",
  "leave_type_id": "uuid"
}
```

---

## 📅 Google Calendar Integration

### GET `/admin/google/oauth/url`

Get Google OAuth URL for admin calendar connection

**Response:**

```json
{
  "url": "https://accounts.google.com/oauth/authorize?..."
}
```

### GET `/admin/google/oauth/callback`

OAuth callback endpoint (redirects to frontend)

### GET `/admin/google/settings`

Get current Google Calendar settings

**Response:**

```json
{
  "calendar_id": "primary",
  "access_token": "ya29...",
  "refresh_token": "1//...",
  "expiry_date": "2024-01-01T01:00:00.000Z"
}
```

### POST `/admin/google/settings`

Update Google Calendar settings

**Request Body:**

```json
{
  "calendar_id": "your-calendar@group.calendar.google.com"
}
```

---

## 🔒 Error Responses

### Standard Error Format

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Authentication Errors

```json
{
  "error": "unauthorized" // Missing or invalid token
}
```

### Authorization Errors

```json
{
  "error": "forbidden" // Insufficient permissions
}
```

### Validation Errors

```json
{
  "error": "Leave type not assigned" // Business logic validation
}
```

## 🎛️ Features & Capabilities

### 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Row Level Security** - Database-level access control
- **Role-Based Permissions** - Hierarchical access control
- **OAuth Integration** - Google SSO for secure login
- **Input Validation** - Server-side request validation
- **CORS Protection** - Cross-origin request security

### 📱 User Experience

- **Responsive Design** - Mobile-first responsive UI
- **Dark Mode Support** - System preference detection
- **Real-time Updates** - Live status changes
- **Loading States** - Smooth user feedback
- **Error Handling** - Graceful error management
- **Accessibility** - WCAG compliant interface

### 🔄 Integration Capabilities

- **Google Calendar Sync** - Automated event management
- **Email Notifications** - SMTP-based email alerts
- **Slack Integration** - Real-time team notifications
- **Webhook Support** - Extensible notification system
- **REST API** - Standard API for integrations
- **Database Triggers** - Automated data processing

### 📊 Administrative Tools

- **User Management** - Role assignment and control
- **Leave Type Management** - Flexible leave categories
- **Organization Management** - Projects, regions, groups
- **Analytics Dashboard** - Usage and approval metrics
- **Integration Settings** - External service configuration
- **Audit Trails** - Complete activity logging

## 🚀 Production Considerations

### Performance Optimization

- **Database Indexing** - Optimized query performance
- **Connection Pooling** - Efficient database connections
- **Caching Strategy** - Redis for session management
- **CDN Integration** - Static asset delivery
- **Bundle Optimization** - Code splitting and minification

### Scalability Architecture

- **Horizontal Scaling** - Load balancer ready
- **Microservices Ready** - Modular service design
- **Database Sharding** - Multi-tenant support
- **Message Queues** - Async processing capability
- **Container Orchestration** - Kubernetes deployment

### Monitoring & Observability

- **Application Logging** - Structured log format
- **Error Tracking** - Comprehensive error monitoring
- **Performance Metrics** - Response time tracking
- **Health Checks** - Service availability monitoring
- **Database Monitoring** - Query performance analysis

### Security Hardening

- **Environment Variables** - Secure config management
- **Rate Limiting** - API abuse prevention
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Input sanitization
- **HTTPS Enforcement** - Secure communication

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards

- **ESLint Configuration** - JavaScript linting
- **Prettier Formatting** - Consistent code style
- **Commit Conventions** - Conventional commit messages
- **Documentation** - Inline code documentation
- **Testing Requirements** - Unit and integration tests

## 🐛 Troubleshooting

### Common Issues

#### 1. Google OAuth Errors

```bash
# Error: redirect_uri_mismatch
# Solution: Verify redirect URI in Google Cloud Console
GOOGLE_REDIRECT_URI=http://localhost:8787/api/admin/google/oauth/callback
```

#### 2. Database Connection Issues

```bash
# Error: Invalid database credentials
# Solution: Verify Supabase keys in .env file
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 3. Calendar API Errors

```bash
# Error: Calendar API not enabled
# Solution: Enable Google Calendar API in Google Cloud Console
```

#### 4. Email Notification Issues

```bash
# Error: SMTP authentication failed
# Solution: Use app-specific password for Gmail
SMTP_PASS=your_app_specific_password
```

### Debug Mode

Enable debug logging:

```env
NODE_ENV=development
DEBUG=true
```

### Health Check Endpoints

```bash
# Backend health check
curl http://localhost:8787/health

# Database connectivity
curl http://localhost:8787/api/health/db
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** - Database and authentication platform
- **Hono.js** - Fast and lightweight web framework
- **React Team** - UI component framework
- **Google Cloud** - OAuth and Calendar API services
- **Tailwind CSS** - Utility-first CSS framework

---

## 📞 Support

For support and questions:

- 📧 Email: baibhavsureka1@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/BaibhavSureka/Leave-Management-App/issues)
- 📖 Documentation: This README file
