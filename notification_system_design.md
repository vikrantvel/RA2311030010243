markdown# Notification System Design

## Overview
A full-stack notification system that allows users to create, view, mark as read, and delete notifications. Built with React (TypeScript) frontend and Node.js/Express backend, with a reusable logging middleware.

## Architecture
[React Frontend] <---> [Express Backend] <---> [In-Memory Store]
|                       |
└───── [Logging Middleware] ────> [Affordmed Log Server]

## Components

### 1. Logging Middleware
- Reusable package used by both frontend and backend
- Authenticates with test server and sends structured logs
- Function signature: `Log(stack, level, package, message)`

### 2. Backend (notification_app_be)
- Framework: Node.js + Express
- Port: 3001
- Endpoints:
  - `GET /notifications` — fetch all notifications
  - `POST /notifications` — create a notification
  - `PATCH /notifications/:id/read` — mark as read
  - `DELETE /notifications/:id` — delete a notification
- Storage: In-memory array (no database required)
- Logging integrated at every route

### 3. Frontend (notification_app_fe)
- Framework: React with TypeScript
- Styling: Vanilla CSS (inline styles)
- Features:
  - Create notifications with title, message, type
  - View all notifications with color-coded borders
  - Mark notifications as read
  - Delete notifications
  - Responsive layout for mobile and desktop

## Data Model

```json
{
  "id": "1234567890",
  "title": "Alert Title",
  "message": "Notification message body",
  "type": "info | warning | error | success",
  "read": false,
  "createdAt": "2026-05-02T05:24:02.861Z"
}
```

## Design Decisions

1. **In-memory storage** — Simple and fast for demo purposes. Can be replaced with MongoDB or PostgreSQL for production.
2. **Reusable logging middleware** — Decoupled from app logic, easy to plug into any JS/TS project.
3. **TypeScript on frontend** — Type safety reduces runtime errors and improves maintainability.
4. **REST API** — Simple, stateless, easy to test with Postman/curl.
5. **CORS enabled** — Allows frontend and backend to run on different ports during development.

## Future Improvements
- Add persistent database (MongoDB/PostgreSQL)
- Add WebSocket support for real-time notifications
- Add user authentication
- Add pagination for large notification lists
- Deploy to cloud (AWS/GCP)