# Type System Documentation

## Overview

Rental Solutions is built using TypeScript with a comprehensive type system that ensures type safety and helps prevent errors. This document outlines the core types used throughout the application, their organization, and how they relate to each other.

## Table of Contents

1. [Type Organization](#type-organization)
2. [Core Type Categories](#core-type-categories)
3. [Database Types](#database-types)
4. [Component Props Types](#component-props-types)
5. [API Response Types](#api-response-types)
6. [Utility Types](#utility-types)
7. [Enum Types](#enum-types)
8. [Type Best Practices](#type-best-practices)

## Type Organization

Types in the Rental Solutions application are organized in several ways:

### By Location

- **Co-located Types**: Defined in the same file as their usage
- **Module-specific Types**: Located in a `types.ts` file within the module directory
- **Global Types**: Located in the `/src/types` directory
- **Database Types**: Located in `/src/types/database` or `/src/integrations/supabase/types.ts`

### By Purpose

- **Database Schema Types**: Represent database tables and views
- **Component Props Types**: Define the props for React components
- **API Types**: Define request and response structures
- **Form Types**: Define form input and validation structures
- **State Types**: Define application state structures
- **Utility Types**: Helper types for transformations

## Core Type Categories

### Business Domain Types

These types represent the core business entities in the application:

```typescript
// Vehicle-related types
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  status: VehicleStatus;
  // ...
}

// Customer-related types
interface Customer {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  email: string | null;
  // ...
}

// Agreement-related types
interface Agreement {
  id: string;
  agreement_number: string;
  customer_id: string;
  vehicle_id: string;
  start_date: string | null;
  end_date: string | null;
  status: LeaseStatus;
  // ...
}

// Payment-related types
interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  // ...
}
```

## Database Types

Database types are defined to match the Supabase database schema:

### Type Sources

- `/src/integrations/supabase/types.ts`: The main database type definitions
- `/src/types/database/`: Directory containing specialized database types

### Key Database Types

```typescript
// Base Database type
export type Database = {
  public: {
    Tables: {
      vehicles: {
        Row: VehicleRow;
        Insert: VehicleInsert;
        Update: VehicleUpdate;
      };
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      leases: {
        Row: LeaseRow;
        Insert: LeaseInsert;
        Update: LeaseUpdate;
      };
      // ...other tables
    };
    Views: {
      // Database views
    };
    Functions: {
      // Database functions
    };
    Enums: {
      // Database enums
      vehicle_status: 'available' | 'rented' | 'maintenance' | 'sold' | 'inactive';
      lease_status: 'pending_payment' | 'active' | 'overdue' | 'closed' | 'terminated' | 'cancelled';
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_paid';
      // ...other enums
    };
  };
};
```

### Specialized Types

```typescript
// Payment-specific types
export interface PaymentHistoryView {
  id: string;
  lease_id: string;
  amount: number;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  status: string;
  description: string;
  customer_id?: string;
  balance?: number;
  days_overdue?: number;
  late_fine_amount?: number;
}

// Agreement-specific types
export interface AgreementWithRelations extends Agreement {
  customer?: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
    email: string | null;
    address: string | null;
    nationality: string | null;
    driver_license: string | null;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    color: string | null;
    license_plate: string;
    vin: string;
  };
  // ...
}
```

## Component Props Types

Component props types define the interface for React components:

```typescript
// Example of component props
interface AgreementCardProps {
  agreement: Agreement;
  onViewDetails?: (agreement: Agreement) => void;
  onDelete?: (agreement: Agreement) => void;
  onSelect?: (agreement: Agreement, selected: boolean) => void;
  isSelected?: boolean;
}

// Example of a form component props
interface AgreementFormProps {
  initialValues?: Partial<AgreementFormData>;
  onSubmit: (data: AgreementFormData) => void;
  isSubmitting?: boolean;
  error?: string;
}
```

### Common Patterns

- **Handler Props**: Functions for handling events, usually prefixed with `on`
- **Data Props**: The main data object passed to the component
- **UI State Props**: Properties that control the UI state (loading, selected, etc.)
- **Customization Props**: Properties that allow customizing the component appearance or behavior

## API Response Types

Types for API responses ensure that the data from the backend is correctly typed:

```typescript
// Example of an API response type
interface FetchVehiclesResponse {
  data: Vehicle[];
  count: number;
  error: string | null;
}

// Example of a paginated response
interface PaginatedResponse<T> {
  data: T[];
  nextPage: number | null;
  prevPage: number | null;
  totalCount: number;
  totalPages: number;
}
```

## Utility Types

Utility types help with common type transformations:

```typescript
// Make all properties optional
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Make all properties required
export type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Pick specific properties
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit specific properties
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
```

## Enum Types

Enums represent fixed sets of allowed values:

```typescript
// Vehicle status enum
export type VehicleStatus = 
  'available' | 
  'rented' | 
  'maintenance' | 
  'sold' | 
  'inactive';

// Agreement status enum
export type LeaseStatus = 
  'pending_payment' | 
  'active' | 
  'overdue' | 
  'closed' | 
  'terminated' | 
  'cancelled';

// Payment status enum
export type PaymentStatus = 
  'pending' | 
  'completed' | 
  'failed' | 
  'refunded' | 
  'partially_paid';

// Payment method enum
export type PaymentMethodType = 
  'cash' | 
  'bank_transfer' | 
  'credit_card' | 
  'debit_card' | 
  'check' | 
  'paypal' | 
  'sadad' | 
  'other';
```

## Type Best Practices

When working with the type system in Rental Solutions, follow these best practices:

### 1. Use Explicit Types

Always declare types explicitly for variables, function returns, and parameters:

```typescript
// Good
const fetchVehicles = async (): Promise<Vehicle[]> => {
  // ...
};

// Avoid
const fetchVehicles = async () => {
  // ...
};
```

### 2. Define Component Props Interfaces

Always define interfaces for component props:

```typescript
// Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  // ...
}

// Avoid
export function Button({ onClick, children, variant = 'primary' }) {
  // ...
}
```

### 3. Use Union Types for Limited Values

When a property can only have specific values, use a union type:

```typescript
// Good
type ButtonVariant = 'primary' | 'secondary' | 'danger';
interface ButtonProps {
  variant: ButtonVariant;
}

// Avoid
interface ButtonProps {
  variant: string;
}
```

### 4. Use Generics for Reusable Components

Use generics to create reusable components that work with different data types:

```typescript
// Good
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  // ...
}

// Usage
<List<User> items={users} renderItem={user => <UserItem user={user} />} />
```

### 5. Use Type Guards for Runtime Type Checking

Use type guards to check types at runtime:

```typescript
// Type guard function
function isVehicle(obj: any): obj is Vehicle {
  return obj && typeof obj === 'object' && 'license_plate' in obj;
}

// Usage
if (isVehicle(data)) {
  // TypeScript knows that data is a Vehicle here
  console.log(data.license_plate);
}
```

### 6. Document Complex Types

Add JSDoc comments to explain complex types:

```typescript
/**
 * Represents a payment with detailed information
 * This is used for displaying payment history with computed fields
 */
export interface PaymentHistoryView {
  // ...fields
}
```

## Conclusion

The type system in Rental Solutions provides a foundation for building a robust and maintainable application. By following the patterns and practices outlined in this document, you can ensure type safety and reduce runtime errors.
