# 🏢 Leave Management Application

A comprehensive, enterprise-grade leave management system built with modern web technologies. Features Google OAuth authentication, role-based approval workflows, real-time notifications, and seamless Google Calendar integration.

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Hono](https://img.shields.io/badge/Hono-4.0.0-FF6B35?style=flat&logo=hono)](https://hono.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3FCF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Google Calendar](https://img.shields.io/badge/Google_Calendar-API-4285F4?style=flat&logo=google-calendar)](https://developers.google.com/calendar)

## 🎯 Live Demo

**🌐 Frontend:** https://leave-management-app-psi.vercel.app  
**🔧 Backend API:** https://leave-management-app-gvay.onrender.com

### 🚀 Quick Demo Access

**Option 1: Use Demo Accounts (Recommended)**

- **Admin:** `admin@demo.com` / `password123`
- **Manager:** `manager@demo.com` / `password123`
- **Member:** `member@demo.com` / `password123`

**Option 2: Google OAuth**

- Click "Continue with Google" to login with your Google account
- First user gets Member role by default

## 📱 Dashboard Screenshots

**Admin Dashboard View:**
<img width="1898" height="923" alt="Admin Dashboard" src="https://github.com/user-attachments/assets/8afd1089-785c-4acb-be19-fef70a5c3f43" />

**Manager Dashboard View:**
<img width="1898" height="922" alt="Manager Dashboard" src="https://github.com/user-attachments/assets/cbba143f-cc9b-48bc-9c79-9bef243d68af" />

**Member Dashboard View:**
<img width="1919" height="924" alt="Member Dashboard" src="https://github.com/user-attachments/assets/286e838f-be82-44fa-b0be-27148353d823" />

## 🎯 Key Features

- **🔐 Dual Authentication** - Google OAuth + Email/Password login
- **📋 Smart Leave Applications** - Intuitive forms with validation
- **⚡ Role-Based Approvals** - Hierarchical workflow (Member → Manager → Admin)
- **📧 Real-Time Notifications** - Email and Slack integration
- **📅 Calendar Integration** - Automatic Google Calendar sync
- **👑 Admin Control Panel** - Complete user and system management
- **📱 Mobile Responsive** - Works perfectly on all devices

## 🚀 Tech Stack

| **Frontend** | **Backend**  | **Database**            | **Deployment**     |
| ------------ | ------------ | ----------------------- | ------------------ |
| React 18.2   | Hono.js      | Supabase (PostgreSQL)   | Vercel + Render    |
| Vite         | Node.js 18+  | Row Level Security      | Supabase Cloud     |
| Tailwind CSS | Google APIs  | Real-time subscriptions | Environment Config |
| React Router | SMTP + Slack | JWT Authentication      | Git Workflows      |

📖 **[View Detailed System Architecture →](SYSTEM_DESIGN.md)**

## 🛠️ Local Development Setup

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

### 1. Clone & Install

```bash
git clone https://github.com/BaibhavSureka/Leave-Management-App.git
cd Leave-Management-App

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Database Setup

1. Create [Supabase Project](https://supabase.com/dashboard)
2. Copy Project URL, Anon Key, and Service Role Key
3. Run SQL scripts in Supabase SQL Editor:
   ```sql
   -- 1. Copy and run: scripts/schema.sql
   -- 2. Copy and run: scripts/create-demo-accounts.sql
   ```

### 3. Environment Configuration

**Backend (.env):**

```bash
cp backend/.env.example backend/.env
```

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google OAuth (for admin calendar integration)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8787/api/admin/google/oauth/callback

# First Admin Email (for initial setup - optional if using demo accounts)
FIRST_ADMIN_EMAIL=your_email@gmail.com

# Optional: Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com

# Optional: Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Optional: Calendar Integration (set to 'true' to enable)
ENABLE_CALENDAR=true
DEFAULT_CALENDAR_ID=your_calendar_id@group.calendar.google.com

# Server Configuration
PORT=8787
APP_ORIGIN=http://localhost:5173
NODE_ENV=development

# Demo Accounts (created via SQL script):
# Admin: admin@demo.com / password123
# Manager: manager@demo.com / password123  
# Member: member@demo.com / password123
```

**Frontend (.env):**

```bash
cp frontend/.env.example frontend/.env
```

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL
VITE_BACKEND_URL=http://localhost:8787
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API and Calendar API
3. Create OAuth 2.0 credentials
4. Add authorized origins: `http://localhost:5173`, `http://localhost:8787`
5. Add redirect URI: `http://localhost:8787/api/admin/google/oauth/callback`

### 5. Run Application

**Start Backend:**

```bash
cd backend
npm run dev  # http://localhost:8787
```

**Start Frontend:**

```bash
cd frontend
npm run dev  # http://localhost:5173
```

## 🔑 Getting Admin Access

### Option 1: Set Yourself as Admin (Recommended for Local)

1. **Set your email** in `backend/.env`:

   ```env
   FIRST_ADMIN_EMAIL=your_email@gmail.com
   ```

2. **Restart backend server**

   ```bash
   cd backend && npm run dev
   ```

3. **Login with Google OAuth** using that email address
4. **🎉 You'll automatically get admin role!**

### Option 2: Use Demo Admin Account

- Email: `admin@demo.com`
- Password: `password123`
- Immediate admin access

### Option 3: Promote Existing User

1. Login as demo admin (`admin@demo.com`)
2. Go to Admin → Role Management
3. Find your user and change role to "Admin"

## 🎯 User Roles & Features

| Role           | Permissions        | Features                                      |
| -------------- | ------------------ | --------------------------------------------- |
| **👑 Admin**   | Full system access | User management, system config, all approvals |
| **👨‍💼 Manager** | Team management    | Team leave approvals, own leave requests      |
| **👤 Member**  | Personal access    | Apply for leaves, view own history            |

## 📚 Documentation

| Document                | Description                                   | Link                                       |
| ----------------------- | --------------------------------------------- | ------------------------------------------ |
| **🔧 API Reference**    | Complete API documentation with examples      | **[→ API_TESTING.md](API_TESTING.md)**     |
| **🏗️ System Design**    | Architecture, database schema, tech decisions | **[→ SYSTEM_DESIGN.md](SYSTEM_DESIGN.md)** |

## 🐛 Troubleshooting

### Common Issues

| Issue                        | Solution                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Admin access not working** | ✅ Check `FIRST_ADMIN_EMAIL` in backend `.env`<br>✅ Restart backend after env changes<br>✅ Use demo account: `admin@demo.com` |
| **Google OAuth errors**      | ✅ Verify authorized origins in Google Console<br>✅ Check redirect URIs match exactly                                          |
| **Database connection**      | ✅ Verify Supabase URL and keys<br>✅ Check project is active                                                                   |

### Debug Mode

```env
NODE_ENV=development
DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request


## 📞 Support

For support and questions:

- 📧 Email: baibhavsureka1@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/BaibhavSureka/Leave-Management-App/issues)
- 📖 Documentation: This README file

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
---
