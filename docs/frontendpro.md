You are a senior frontend engineer. Build a modern frontend application for a project called **Smart Task & Productivity Manager** using **Next.js (App Router), TypeScript, and TailwindCSS**.

The frontend will communicate with a FastAPI backend using REST APIs.

## Tech Stack

* Next.js (App Router)
* TypeScript
* TailwindCSS
* React Query or Axios
* JWT authentication
* Role-Based UI Access
* Chart library for productivity analytics

## User Roles

The system supports:

1. Admin
2. Manager
3. User

The UI must change based on the logged-in user's role.

### Admin UI

* View all users
* Manage users
* View all tasks
* System analytics dashboard

### Manager UI

* View team tasks
* Assign tasks
* Track team productivity

### User UI

* Create tasks
* Edit personal tasks
* View personal dashboard

## Folder Structure

frontend/
src/
app/
layout.tsx
page.tsx
login/
page.tsx
register/
page.tsx
dashboard/
page.tsx
tasks/
page.tsx
components/
Navbar.tsx
Sidebar.tsx
TaskCard.tsx
TaskForm.tsx
ProtectedRoute.tsx
features/
auth/
LoginForm.tsx
RegisterForm.tsx
authService.ts
tasks/
TaskList.tsx
CreateTask.tsx
taskService.ts
services/
api.ts
hooks/
useAuth.ts
useTasks.ts
context/
AuthContext.tsx
types/
user.ts
task.ts
utils/
roleGuard.ts

## Features

Authentication

* Login page
* Register page
* Store JWT token
* Logout functionality

Dashboard

* Task statistics
* Productivity charts
* Role-based content

Task Management

* Create task
* Update task
* Delete task
* Task priority
* Task deadlines

Role-Based Access Control

Implement a system where:

* Admin routes are restricted
* Manager routes are restricted
* Users can only access allowed pages

Example:

Admin Routes
/dashboard/admin
/users

Manager Routes
/dashboard/team

User Routes
/dashboard/my-tasks

## API Integration

Use Axios or React Query.

Example endpoints:

POST /auth/login
POST /auth/register

GET /tasks
POST /tasks
PUT /tasks/{id}
DELETE /tasks/{id}

## UI Requirements

* Responsive layout
* Sidebar navigation
* Role-based menu
* Task cards
* Dashboard charts
* Loading states
* Error handling

## Output

Generate:

1. Complete Next.js folder structure
2. Authentication system
3. API service layer
4. Role-based routing
5. Dashboard UI
6. Task management UI
7. Reusable components
8. Clean TypeScript types
9. Example environment configuration

Write clean, scalable code following modern React architecture.
