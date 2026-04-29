# PAF Project — University Resource Management System

A full-stack web application for managing university resources, bookings, and support tickets. Supports role-based access for Users, Admins, and Technicians.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Axios, Recharts |
| Backend | Spring Boot 4, Java 21, Spring Security |
| Database | MySQL (Aiven Cloud) |
| Auth | JWT + OAuth2 (Google & GitHub) |
| Real-time | WebSockets |
| Build Tools | Maven (backend), npm (frontend) |

---

## Project Structure

```
PAF-Project/
├── frontend/          # React application
│   └── src/
│       ├── pages/     # Page components
│       ├── components/# Reusable UI components
│       ├── context/   # Auth & Notification context
│       └── api/       # API integration layer
│
└── backend/           # Spring Boot application
    └── src/main/java/com/university/backend/
        ├── controller/# REST API endpoints
        ├── service/   # Business logic
        ├── repository/# Data access layer
        ├── model/     # JPA entities
        └── config/    # Security & WebSocket config
```

---

## Features

- **Role-Based Access** — User, Admin, and Technician dashboards
- **Resource Booking** — Browse, book, and manage university resources with availability tracking
- **Ticket System** — Submit support tickets, add comments, and track resolution
- **Real-Time Notifications** — Live updates via WebSocket
- **OAuth2 Login** — Sign in with Google or GitHub
- **QR Code Generation** — For resource identification
- **File Attachments** — Upload files to tickets
- **Admin Analytics** — Statistics and charts via Recharts

---

## Getting Started

### Prerequisites

- Node.js 18+
- Java 21
- Maven 3.9+
- MySQL database

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

The API will start on `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npm start
```

The app will open on `http://localhost:3000`.

---

## Environment Configuration

Create `backend/src/main/resources/application.properties` (or `.env`) with:

```properties
spring.datasource.url=jdbc:mysql://<host>:<port>/<database>
spring.datasource.username=<username>
spring.datasource.password=<password>

spring.security.oauth2.client.registration.google.client-id=<google-client-id>
spring.security.oauth2.client.registration.google.client-secret=<google-client-secret>

spring.security.oauth2.client.registration.github.client-id=<github-client-id>
spring.security.oauth2.client.registration.github.client-secret=<github-client-secret>
```

---

## User Roles

| Role | Capabilities |
|---|---|
| **User** | Book resources, submit tickets, view notifications |
| **Admin** | Manage resources, users, bookings, and view analytics |
| **Technician** | Handle assigned tickets, update resolution status |

---

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Open a pull request with a clear description
