# System Architecture Documentation

## 1. System Overview

This document provides a comprehensive guide to the system architecture, detailing all major modules and features. The system is built using React with TypeScript, leveraging the following key technologies:

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Supabase Edge Functions
- **PDF Generation**: jsPDF, jspdf-autotable
- **Date Handling**: date-fns
- **Icons**: Lucide React

The architecture follows a component-based approach with clear separation of concerns between UI components, business logic, and data access layers. The system is organized into several modules:

1. **Authentication & User Management**
2. **Customer Management**
3. **Vehicle Management**
4. **Agreement Management**
5. **Finance Management**
6. **Traffic Fines Management**
7. **Reporting System**
8. **Legal Module**
9. **Settings & Configuration**

[... existing content ...]

## 22. API Contract Documentation

### 22.1 API Overview

The application uses a well-defined API contract system to ensure consistent communication between the frontend and backend. This section outlines the complete API contract specifications.

### 22.2 API Structure

#### 22.2.1 Request/Response Format

All API endpoints follow a consistent request and response format:

**Standard Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data specific to the endpoint
  }
}
```

**Standard Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {} // Optional additional information
  }
}
```

#### 22.2.2 Error Handling

The API uses consistent error codes across all endpoints:

| Error Code | Description | HTTP Status |
|------------|-------------|-------------|
| `authentication_required` | User is not authenticated | 401 |
| `insufficient_permissions` | User lacks required permissions | 403 |
| `resource_not_found` | Requested resource doesn't exist | 404 |
| `validation_error` | Input validation failed | 400 |
| `operation_not_allowed` | Operation cannot be performed | 400 |
| `server_error` | Server-side error occurred | 500 |
| `rate_limit_exceeded` | Too many requests | 429 |
| `service_unavailable` | Service is temporarily unavailable | 503 |

### 22.3 Authentication & Authorization

#### 22.3.1 Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User login with credentials |
| `/auth/register` | POST | Register new user account |
| `/auth/logout` | POST | End user session |
| `/auth/refresh` | POST | Refresh authentication token |
| `/auth/reset-password` | POST | Initiate password reset |

#### 22.3.2 Authorization

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer {jwt_token}
```

#### 22.3.3 Role-Based Access

API endpoints enforce role-based access control with three primary roles:
- `admin`: Full system access
- `staff`: Operational access with limited configuration rights
- `customer`: Self-service portal access

### 22.4 Core API Endpoints

#### 22.4.1 Customer Management API

**GET /api/v1/customers**

Retrieves a paginated list of customers.

*Query Parameters:*
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20, max: 100)
- `searchQuery`: Search term for customer name, phone, email
- `status`: Filter by customer status

*Response:*
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "uuid",
        "full_name": "string",
        "phone_number": "string",
        "email": "string",
        "address": "string",
        "driver_license": "string",
        "id_document_url": "string",
        "license_document_url": "string",
        "contract_document_url": "string",
        "created_at": "string",
        "role": "customer"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 195,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

[... rest of the existing content remains the same ...]
