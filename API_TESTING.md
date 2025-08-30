# 🧪 API Testing Collection

This document provides comprehensive API testing examples using curl commands to demonstrate the working product capabilities.

## 🔧 Setup for Testing

### 1. Start the Application

```bash
# Start both backend and frontend
docker-compose up --build

# Or manually:
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

### 2. Get Authentication Token

1. Visit http://localhost:5173
2. Sign in with Google
3. Open browser DevTools → Network tab
4. Make any API call and copy the `Authorization` header value

## 📝 Authentication API Tests

### Get Current User Profile

```bash
curl -X GET "http://localhost:8787/api/auth/me" \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "profile": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "MEMBER",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update User Profile

```bash
curl -X POST "http://localhost:8787/api/auth/profiles/upsert" \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Updated Doe",
    "avatar_url": "https://example.com/new-avatar.jpg"
  }'
```

## 🏷️ Leave Types Management (Admin)

### Get All Leave Types

```bash
curl -X GET "http://localhost:8787/api/admin/leave-types" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Annual Leave",
    "active": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Sick Leave",
    "active": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Create New Leave Type

```bash
curl -X POST "http://localhost:8787/api/admin/leave-types" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Study Leave"
  }'
```

### Update Leave Type

```bash
curl -X PATCH "http://localhost:8787/api/admin/leave-types/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Annual Vacation Leave",
    "active": true
  }'
```

### Delete Leave Type

```bash
curl -X DELETE "http://localhost:8787/api/admin/leave-types/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

## 👥 User Management (Admin)

### Get All Users

```bash
curl -X GET "http://localhost:8787/api/admin/users" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@example.com",
    "full_name": "Admin User",
    "role": "ADMIN",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "email": "manager@example.com",
    "full_name": "Manager User",
    "role": "MANAGER",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Update User Role

```bash
curl -X PATCH "http://localhost:8787/api/admin/users/550e8400-e29b-41d4-a716-446655440003/role" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "MANAGER"
  }'
```

## 🔗 Leave Type Assignment (Admin)

### Get User Leave Type Assignments

```bash
curl -X GET "http://localhost:8787/api/admin/user-leave-types" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Assign Leave Type to User

```bash
curl -X POST "http://localhost:8787/api/admin/user-leave-types" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440003",
    "leave_type_id": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

### Remove Leave Type Assignment

```bash
curl -X DELETE "http://localhost:8787/api/admin/user-leave-types" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440003",
    "leave_type_id": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

## 🏢 Organization Management (Admin)

### Projects Management

#### Get All Projects

```bash
curl -X GET "http://localhost:8787/api/admin/projects" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Create New Project

```bash
curl -X POST "http://localhost:8787/api/admin/projects" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project Delta"
  }'
```

#### Update Project

```bash
curl -X PATCH "http://localhost:8787/api/admin/projects/550e8400-e29b-41d4-a716-446655440004" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Project Delta",
    "active": true
  }'
```

#### Delete Project

```bash
curl -X DELETE "http://localhost:8787/api/admin/projects/550e8400-e29b-41d4-a716-446655440004" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Regions Management

#### Get All Regions

```bash
curl -X GET "http://localhost:8787/api/admin/regions" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Create New Region

```bash
curl -X POST "http://localhost:8787/api/admin/regions" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "South America"
  }'
```

### Groups Management

#### Get All Groups

```bash
curl -X GET "http://localhost:8787/api/admin/groups" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Create New Group

```bash
curl -X POST "http://localhost:8787/api/admin/groups" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Data Science Team"
  }'
```

## 📝 Leave Management (Members)

### Get My Leaves

```bash
curl -X GET "http://localhost:8787/api/leaves" \
  -H "Authorization: Bearer YOUR_MEMBER_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "user_id": "550e8400-e29b-41d4-a716-446655440003",
    "leave_type_id": "550e8400-e29b-41d4-a716-446655440001",
    "reason": "Family vacation",
    "start_date": "2024-01-15",
    "end_date": "2024-01-20",
    "half_day": false,
    "total_days": 5,
    "status": "APPROVED",
    "approver_required_role": "MANAGER",
    "approved_by": "550e8400-e29b-41d4-a716-446655440000",
    "approved_at": "2024-01-10T10:00:00.000Z",
    "google_event_id": "google_event_123",
    "created_at": "2024-01-01T00:00:00.000Z",
    "leave_types": {
      "name": "Annual Leave"
    }
  }
]
```

### Apply for Leave

```bash
curl -X POST "http://localhost:8787/api/leaves" \
  -H "Authorization: Bearer YOUR_MEMBER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leave_type_id": "550e8400-e29b-41d4-a716-446655440001",
    "reason": "Family vacation",
    "start_date": "2024-02-15",
    "end_date": "2024-02-20",
    "half_day": false,
    "total_days": 5
  }'
```

**Expected Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "user_id": "550e8400-e29b-41d4-a716-446655440003",
  "leave_type_id": "550e8400-e29b-41d4-a716-446655440001",
  "reason": "Family vacation",
  "start_date": "2024-02-15",
  "end_date": "2024-02-20",
  "half_day": false,
  "total_days": 5,
  "status": "PENDING",
  "approver_required_role": "MANAGER",
  "created_at": "2024-01-01T12:00:00.000Z"
}
```

### Apply for Half-Day Leave

```bash
curl -X POST "http://localhost:8787/api/leaves" \
  -H "Authorization: Bearer YOUR_MEMBER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leave_type_id": "550e8400-e29b-41d4-a716-446655440002",
    "reason": "Medical appointment",
    "start_date": "2024-01-25",
    "end_date": "2024-01-25",
    "half_day": true,
    "total_days": 0.5
  }'
```

### Cancel Leave Request

```bash
curl -X DELETE "http://localhost:8787/api/leaves/550e8400-e29b-41d4-a716-446655440005" \
  -H "Authorization: Bearer YOUR_MEMBER_JWT_TOKEN"
```

**Expected Response:**

```json
{
  "ok": true
}
```

## ✅ Approval Management (Managers/Admin)

### Get Pending Approvals

```bash
curl -X GET "http://localhost:8787/api/approvals" \
  -H "Authorization: Bearer YOUR_MANAGER_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440006",
    "user_id": "550e8400-e29b-41d4-a716-446655440003",
    "leave_type_id": "550e8400-e29b-41d4-a716-446655440001",
    "reason": "Family vacation",
    "start_date": "2024-02-15",
    "end_date": "2024-02-20",
    "half_day": false,
    "total_days": 5,
    "status": "PENDING",
    "approver_required_role": "MANAGER",
    "created_at": "2024-01-01T12:00:00.000Z",
    "profiles": {
      "full_name": "John Doe",
      "email": "john@example.com",
      "role": "MEMBER"
    },
    "leave_types": {
      "name": "Annual Leave"
    }
  }
]
```

### Approve Leave Request

```bash
curl -X PUT "http://localhost:8787/api/approvals/550e8400-e29b-41d4-a716-446655440006" \
  -H "Authorization: Bearer YOUR_MANAGER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "APPROVED",
    "note": "Approved for family vacation"
  }'
```

**Expected Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "status": "APPROVED",
  "approved_by": "550e8400-e29b-41d4-a716-446655440000",
  "approved_at": "2024-01-01T15:00:00.000Z",
  "google_event_id": "google_calendar_event_789",
  "rejection_note": null
}
```

### Reject Leave Request

```bash
curl -X PUT "http://localhost:8787/api/approvals/550e8400-e29b-41d4-a716-446655440006" \
  -H "Authorization: Bearer YOUR_MANAGER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "REJECTED",
    "note": "Insufficient staffing during requested period"
  }'
```

**Expected Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "status": "REJECTED",
  "approved_by": "550e8400-e29b-41d4-a716-446655440000",
  "approved_at": "2024-01-01T15:00:00.000Z",
  "google_event_id": null,
  "rejection_note": "Insufficient staffing during requested period"
}
```

## 📅 Google Calendar Integration (Admin)

### Get Google OAuth URL

```bash
curl -X GET "http://localhost:8787/api/admin/google/oauth/url" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "url": "https://accounts.google.com/oauth/authorize?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar&response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http%3A%2F%2Flocalhost%3A8787%2Fapi%2Fadmin%2Fgoogle%2Foauth%2Fcallback"
}
```

### Get Google Calendar Settings

```bash
curl -X GET "http://localhost:8787/api/admin/google/settings" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "calendar_id": "primary",
  "access_token": "ya29.a0AfH6SMC...",
  "refresh_token": "1//04D...",
  "expiry_date": "2024-01-01T01:00:00.000Z"
}
```

### Update Calendar Settings

```bash
curl -X POST "http://localhost:8787/api/admin/google/settings" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "calendar_id": "company-leaves@group.calendar.google.com"
  }'
```

## 🔍 Error Testing Scenarios

### 401 Unauthorized - Missing Token

```bash
curl -X GET "http://localhost:8787/api/auth/me" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "error": "unauthorized"
}
```

### 403 Forbidden - Insufficient Permissions

```bash
# Member trying to access admin endpoint
curl -X GET "http://localhost:8787/api/admin/users" \
  -H "Authorization: Bearer YOUR_MEMBER_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "error": "forbidden"
}
```

### 400 Bad Request - Validation Error

```bash
curl -X POST "http://localhost:8787/api/leaves" \
  -H "Authorization: Bearer YOUR_MEMBER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leave_type_id": "invalid-uuid",
    "start_date": "invalid-date"
  }'
```

**Expected Response:**

```json
{
  "error": "Leave type not assigned"
}
```

### 404 Not Found - Resource Not Found

```bash
curl -X DELETE "http://localhost:8787/api/leaves/non-existent-uuid" \
  -H "Authorization: Bearer YOUR_MEMBER_JWT_TOKEN"
```

**Expected Response:**

```json
{
  "error": "not found"
}
```

## 🚀 Load Testing Examples

### Basic Load Test with curl

```bash
# Test 100 concurrent requests to get user profile
for i in {1..100}; do
  curl -X GET "http://localhost:8787/api/auth/me" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" &
done
wait
```

### Load Test with Apache Bench

```bash
# Install Apache Bench (ab)
# Ubuntu: sudo apt-get install apache2-utils
# macOS: brew install httpd

# Test 1000 requests with 10 concurrent users
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8787/api/auth/me
```

### Performance Test with wrk

```bash
# Install wrk
# Ubuntu: sudo apt-get install wrk
# macOS: brew install wrk

# Test with custom script
wrk -t12 -c400 -d30s -s script.lua http://localhost:8787/api/auth/me
```

## 🧪 Integration Test Scenarios

### Complete Leave Application Workflow

```bash
#!/bin/bash

# 1. Apply for leave (Member)
LEAVE_ID=$(curl -s -X POST "http://localhost:8787/api/leaves" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leave_type_id": "'$LEAVE_TYPE_ID'",
    "reason": "Test leave",
    "start_date": "2024-02-15",
    "end_date": "2024-02-20",
    "total_days": 5
  }' | jq -r '.id')

echo "Created leave request: $LEAVE_ID"

# 2. Check pending approvals (Manager)
curl -s -X GET "http://localhost:8787/api/approvals" \
  -H "Authorization: Bearer $MANAGER_TOKEN" | jq

# 3. Approve leave (Manager)
curl -s -X PUT "http://localhost:8787/api/approvals/$LEAVE_ID" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "APPROVED",
    "note": "Approved for testing"
  }' | jq

# 4. Verify calendar event was created
curl -s -X GET "http://localhost:8787/api/leaves" \
  -H "Authorization: Bearer $MEMBER_TOKEN" | jq '.[] | select(.id == "'$LEAVE_ID'")'

# 5. Cancel leave (Member)
curl -s -X DELETE "http://localhost:8787/api/leaves/$LEAVE_ID" \
  -H "Authorization: Bearer $MEMBER_TOKEN" | jq

echo "Workflow test completed"
```

## 📊 Health Check Endpoints

### Application Health

```bash
curl -X GET "http://localhost:8787/health" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

### Database Health

```bash
curl -X GET "http://localhost:8787/api/health/db" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

## 📝 Notes for Testing

1. **Replace Tokens**: Replace `YOUR_*_JWT_TOKEN` with actual JWT tokens from your authenticated sessions
2. **Replace UUIDs**: Replace example UUIDs with actual IDs from your database
3. **Environment**: Ensure both backend (port 8787) and frontend (port 5173) are running
4. **Database**: Ensure database is seeded with sample data
5. **Permissions**: Test with users having appropriate roles (ADMIN, MANAGER, MEMBER)

This comprehensive API testing collection demonstrates the working product's capabilities across all major features and integration points.
