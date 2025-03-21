
# API Contracts Documentation

This documentation outlines the API contracts for the vehicle rental management system. It serves as the authoritative source for frontend-backend communication patterns, ensuring consistency across the application.

## Table of Contents

- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Versioning](#versioning)
- [Endpoints](#endpoints)
  - [Customer Management](#customer-management)
  - [Vehicle Management](#vehicle-management)
  - [Agreement Management](#agreement-management)
  - [Payment Processing](#payment-processing)
  - [Reporting](#reporting)
  - [Maintenance](#maintenance)
  - [Legal](#legal)

## Authentication

All API endpoints except for public routes (login, register, password reset) require authentication using JWT tokens.

### Headers

```
Authorization: Bearer {jwt_token}
```

### Token Expiry and Refresh

- Access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- When an access token expires, use the refresh token endpoint to get a new access token

## Error Handling

All API responses follow a consistent error format:

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

### Standard Error Codes

| Code | Description |
|------|-------------|
| `authentication_required` | User is not authenticated |
| `insufficient_permissions` | User does not have required permissions |
| `invalid_request` | The request is malformed or contains invalid data |
| `resource_not_found` | The requested resource does not exist |
| `validation_error` | Request data failed validation |
| `rate_limit_exceeded` | Too many requests in a given time period |
| `server_error` | An unexpected server error occurred |

## Versioning

API versioning is handled through the URL path:

```
/api/v1/resource
```

## Endpoints

### Customer Management

#### GET /api/v1/customers

Retrieves a paginated list of customers.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| pageSize | number | No | Items per page (default: 20, max: 100) |
| searchQuery | string | No | Search term for customer name, phone, email |
| status | string | No | Filter by customer status |

**Response:**

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

#### GET /api/v1/customers/:id

Retrieves a specific customer by ID.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | uuid | Yes | Customer ID |

**Response:**

```json
{
  "success": true,
  "data": {
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
}
```

#### POST /api/v1/customers

Creates a new customer.

**Request Body:**

```json
{
  "full_name": "string",
  "phone_number": "string",
  "email": "string",
  "address": "string",
  "driver_license": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "full_name": "string",
    "phone_number": "string",
    "email": "string",
    "address": "string",
    "driver_license": "string",
    "created_at": "string",
    "role": "customer"
  }
}
```

#### PUT /api/v1/customers/:id

Updates an existing customer.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | uuid | Yes | Customer ID |

**Request Body:**

```json
{
  "full_name": "string",
  "phone_number": "string",
  "email": "string",
  "address": "string",
  "driver_license": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "full_name": "string",
    "phone_number": "string",
    "email": "string",
    "address": "string",
    "driver_license": "string",
    "created_at": "string",
    "updated_at": "string",
    "role": "customer"
  }
}
```

#### DELETE /api/v1/customers/:id

Deletes a customer.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | uuid | Yes | Customer ID |

**Response:**

```json
{
  "success": true,
  "data": null
}
```

### Vehicle Management

#### GET /api/v1/vehicles

Retrieves a paginated list of vehicles.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| pageSize | number | No | Items per page (default: 20, max: 100) |
| searchQuery | string | No | Search term for vehicle details |
| status | string | No | Filter by vehicle status |
| make | string | No | Filter by vehicle make |
| model | string | No | Filter by vehicle model |

**Response:**

```json
{
  "success": true,
  "data": {
    "vehicles": [
      {
        "id": "uuid",
        "make": "string",
        "model": "string",
        "year": "number",
        "license_plate": "string",
        "vin": "string",
        "color": "string",
        "status": "available",
        "mileage": "number",
        "created_at": "string"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 98,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

#### GET /api/v1/vehicles/:id

Retrieves a specific vehicle by ID.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | uuid | Yes | Vehicle ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "make": "string",
    "model": "string",
    "year": "number",
    "license_plate": "string",
    "vin": "string",
    "color": "string",
    "status": "available",
    "mileage": "number",
    "registration_date": "string",
    "insurance_expiry": "string",
    "created_at": "string",
    "updated_at": "string"
  }
}
```

### Agreement Management

#### GET /api/v1/agreements

Retrieves a paginated list of rental agreements.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| pageSize | number | No | Items per page (default: 20, max: 100) |
| searchQuery | string | No | Search term for agreements |
| status | string | No | Filter by agreement status |
| customerId | uuid | No | Filter by customer ID |
| vehicleId | uuid | No | Filter by vehicle ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "agreements": [
      {
        "id": "uuid",
        "agreement_number": "string",
        "customer_id": "uuid",
        "vehicle_id": "uuid",
        "start_date": "string",
        "end_date": "string",
        "status": "active",
        "rent_amount": "number",
        "total_amount": "number",
        "created_at": "string",
        "customer": {
          "id": "uuid",
          "full_name": "string"
        },
        "vehicle": {
          "id": "uuid",
          "make": "string",
          "model": "string",
          "license_plate": "string"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalItems": 150,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### Payment Processing

#### GET /api/v1/payments

Retrieves a paginated list of payments.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| pageSize | number | No | Items per page (default: 20, max: 100) |
| agreementId | uuid | No | Filter by agreement ID |
| startDate | string | No | Filter by payment date (from) |
| endDate | string | No | Filter by payment date (to) |
| status | string | No | Filter by payment status |

**Response:**

```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "uuid",
        "lease_id": "uuid",
        "amount": "number",
        "amount_paid": "number",
        "balance": "number",
        "payment_date": "string",
        "payment_method": "string",
        "status": "completed",
        "description": "string",
        "created_at": "string"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 15,
      "totalItems": 285,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

#### POST /api/v1/payments

Creates a new payment.

**Request Body:**

```json
{
  "lease_id": "uuid",
  "amount": "number",
  "payment_method": "string",
  "payment_date": "string",
  "description": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "lease_id": "uuid",
    "amount": "number",
    "amount_paid": "number",
    "balance": "number",
    "payment_date": "string",
    "payment_method": "string",
    "status": "completed",
    "description": "string",
    "created_at": "string"
  }
}
```

## Implementation Details

### Rate Limiting

API endpoints are subject to rate limiting:

- Normal users: 100 requests per minute
- Admin users: 300 requests per minute

### Caching Strategy

- GET requests for non-sensitive data are cached for 5 minutes
- Cache is invalidated when related resources are updated

### Pagination

All list endpoints support pagination using the following query parameters:

- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20, max: 100)

### Filtering and Sorting

- Most list endpoints support filtering via query parameters
- Sort direction can be specified using the `sort` parameter with the format `field:direction` (e.g., `createdAt:desc`)

### Bulk Operations

For operations involving multiple resources, use the bulk endpoints:

- POST /api/v1/customers/bulk
- PUT /api/v1/vehicles/bulk
- DELETE /api/v1/agreements/bulk

## Supabase Specific Implementation

This API is implemented using Supabase with the following components:

1. Database tables and views
2. Row-level security policies
3. Serverless functions for complex business logic
4. Real-time subscriptions for live updates

### Example Supabase Function Implementation

```typescript
// Example of a Supabase Edge Function for customer creation
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  try {
    const { full_name, email, phone_number, address, driver_license } = await req.json()
    
    // Validate input
    if (!full_name || !email || !phone_number) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'validation_error',
            message: 'Missing required fields'
          }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Create customer
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        full_name,
        email,
        phone_number,
        address,
        driver_license,
        role: 'customer'
      })
      .select()
      .single()
    
    if (error) throw error
    
    return new Response(
      JSON.stringify({
        success: true,
        data
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'server_error',
          message: error.message
        }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```
