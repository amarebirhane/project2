You are a senior backend engineer. Build a production-ready backend API for a project called **Smart Task & Productivity Manager** using **FastAPI, PostgreSQL, and SQLAlchemy**.

## Tech Stack

* Python
* FastAPI
* PostgreSQL
* SQLAlchemy ORM
* Alembic for migrations
* JWT Authentication
* Pydantic
* Docker support
* Role-Based Access Control (RBAC)

## Project Requirements

This is a task management system where users can create and manage tasks and track productivity.

The system must support **three roles**:

1. **Admin**
2. **Manager**
3. **User**

### Role Permissions

Admin:

* Manage all users
* View all tasks
* Delete any task
* View system analytics

Manager:

* Manage team tasks
* Assign tasks to users
* View team productivity

User:

* Create tasks
* Update their own tasks
* Delete their own tasks
* View personal dashboard

## Database Design

Users Table

* id (UUID primary key)
* name
* email
* hashed_password
* role (admin | manager | user)
* created_at

Tasks Table

* id (UUID)
* title
* description
* priority
* status (pending | in_progress | completed)
* deadline
* user_id (foreign key)
* category_id
* created_at

Categories Table

* id (UUID)
* name
* user_id

## Folder Structure

backend/
app/
main.py
core/
config.py
security.py
db/
database.py
models/
user.py
task.py
category.py
schemas/
user_schema.py
task_schema.py
crud/
user_crud.py
task_crud.py
services/
auth_service.py
task_service.py
api/
routes/
auth.py
users.py
tasks.py
categories.py
middleware/
rbac.py
utils/
hash.py
jwt.py

## API Requirements

Authentication
POST /auth/register
POST /auth/login

Users
GET /users
GET /users/{id}
DELETE /users/{id} (admin only)

Tasks
GET /tasks
POST /tasks
PUT /tasks/{id}
DELETE /tasks/{id}

Categories
GET /categories
POST /categories

## RBAC Requirements

Implement middleware or dependency that checks the user role before allowing access.

Example:

* Only admin can delete users
* Manager can assign tasks
* User can only modify their own tasks

## Additional Features

* JWT authentication
* Password hashing using bcrypt
* Alembic migrations
* Environment configuration using .env
* Clean service-layer architecture
* Error handling
* Input validation
* Dockerfile and docker-compose for backend + postgres

## Output

Generate:

1. Complete backend folder structure
2. All FastAPI models
3. Pydantic schemas
4. CRUD operations
5. RBAC implementation
6. API routes
7. Database connection
8. Example environment file
9. Docker setup

Write clean, production-ready code with comments.
