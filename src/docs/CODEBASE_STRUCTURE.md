
# Rental Solutions Codebase Structure Documentation

This documentation provides a comprehensive overview of the Rental Solutions application structure, architecture, and key components. Use this as a guide to understand how the application is organized and how different modules interact with each other.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Architecture](#core-architecture)
3. [Directory Structure](#directory-structure)
4. [Key Modules](#key-modules)
5. [Data Flow](#data-flow)
6. [State Management](#state-management)
7. [Database Integration](#database-integration)
8. [UI Component System](#ui-component-system)
9. [Authentication System](#authentication-system)
10. [Common Patterns](#common-patterns)

## Project Overview

Rental Solutions is a comprehensive vehicle rental management system built with React, TypeScript, and Vite. The application provides functionality for managing vehicles, customers, agreements, payments, maintenance, and more. It uses a modular architecture to separate concerns and promote code reusability.

### Technology Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **CSS Framework**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Query (Tanstack Query)
- **Routing**: React Router
- **Backend Integration**: Supabase
- **Authentication**: Supabase Auth

## Core Architecture

The application follows a component-based architecture with a clear separation of concerns. Key architectural principles include:

1. **Module-based Organization**: Code is organized by business domain (vehicles, customers, agreements, etc.)
2. **Container/Component Pattern**: UI is separated from business logic
3. **Custom Hooks**: For reusable logic and data fetching
4. **Type-driven Development**: Comprehensive TypeScript types and interfaces
5. **Responsive Design**: Mobile-first approach using Tailwind CSS

## Directory Structure

```
src/
├── components/           # UI components organized by domain
│   ├── agreements/       # Agreement-related components
│   ├── customers/        # Customer-related components
│   ├── vehicles/         # Vehicle-related components
│   ├── finance/          # Financial components
│   ├── legal/            # Legal management components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   └── ...
├── contexts/             # React context providers
├── features/             # Feature-specific code (alternative organization)
├── hooks/                # Custom React hooks
├── integrations/         # Third-party integrations
│   └── supabase/         # Supabase client and types
├── lib/                  # Utility functions and helpers
├── pages/                # Page components (route entries)
├── routes/               # Routing configuration
├── types/                # TypeScript type definitions
│   └── database/         # Database-related types
└── docs/                 # Documentation files
```

## Key Modules

### 1. Vehicle Management System

The vehicle management system handles all aspects of vehicle operations including inventory, maintenance, and status tracking.

**Key Components**:
- `components/vehicles/` - Contains all vehicle-related UI components
- `components/maintenance/` - Vehicle maintenance components
- `pages/Vehicles.tsx` - Main vehicles listing page
- `pages/VehicleDetails.tsx` - Individual vehicle details page

**Key Features**:
- Vehicle inventory management
- Maintenance scheduling and tracking
- QR code generation for vehicles
- Status management (available, rented, maintenance)

### 2. Customer Management

Customer management handles all customer-related functionality including profiles, documents, and history.

**Key Components**:
- `components/customers/` - Customer UI components
- `components/customers/profile/` - Profile-specific components
- `pages/Customers.tsx` - Customer listing page
- `pages/CustomerProfile.tsx` - Individual customer profile page

**Key Features**:
- Customer profile management
- Document storage and verification
- Credit assessment
- Customer history tracking

### 3. Agreement Management

Agreement management handles rental contracts and agreements between customers and vehicles.

**Key Components**:
- `components/agreements/` - Agreement UI components
- `components/agreements/form/` - Agreement creation forms
- `components/agreements/details/` - Agreement detail components
- `pages/Agreements.tsx` - Agreements listing page
- `pages/AgreementDetails.tsx` - Individual agreement details page

**Key Features**:
- Agreement creation and management
- Template-based agreement generation
- Payment tracking
- Status management

### 4. Financial Management

Financial management handles all payment-related functionality.

**Key Components**:
- `components/finance/` - Financial UI components
- `components/payments/` - Payment-specific components
- `components/remaining-amount/` - Components for tracking remaining amounts
- `pages/Finance.tsx` - Financial dashboard
- `pages/RemainingAmount.tsx` - Remaining amount tracking page

**Key Features**:
- Payment processing
- Invoice generation
- Financial reporting
- Payment reconciliation
- Virtual CFO features

### 5. Legal Management

Legal management handles legal cases, documents, and workflows.

**Key Components**:
- `components/legal/` - Legal UI components
- `components/legal/case-details/` - Case detail components
- `components/legal/workflow/` - Legal workflow components
- `pages/Legal.tsx` - Legal dashboard

**Key Features**:
- Case management
- Document templates
- Workflow automation
- Settlement tracking

## Data Flow

### Request Flow

1. User interacts with a component
2. Component calls custom hook (often using React Query)
3. Hook makes API request to Supabase
4. Data is returned and cached by React Query
5. Component re-renders with data

### State Management

The application uses a combination of:

1. **Local Component State**: For UI-specific state
2. **React Query**: For server state management
3. **React Context**: For global application state
4. **URL Parameters**: For shareable state

## Database Integration

The application integrates with Supabase for backend functionality:

### Key Database Tables:

- `vehicles` - Vehicle inventory
- `profiles` - Customer information
- `leases` - Rental agreements
- `unified_payments` - Payment records
- `legal_cases` - Legal case management
- `maintenance` - Vehicle maintenance records

### Integration Points:

- `integrations/supabase/client.ts` - Supabase client configuration
- `integrations/supabase/types.ts` - Database type definitions

## UI Component System

The application uses shadcn/ui for consistent UI components:

- `components/ui/` - Contains all shadcn/ui components
- Tailwind CSS for styling
- Responsive design patterns

## Authentication System

Authentication is handled by Supabase Auth:

- `components/auth/` - Authentication UI components
- `hooks/use-auth.ts` - Authentication custom hook
- Protected routes via `components/auth/ProtectedRoute.tsx`

## Common Patterns

### Custom Hooks Pattern

Most data-fetching logic is encapsulated in custom hooks:

```typescript
// Example of a custom hook pattern
export const useVehicles = (filters) => {
  return useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => fetchVehicles(filters),
  });
};
```

### Component Structure Pattern

Components typically follow this structure:

```typescript
// Interface for component props
interface ComponentProps {
  prop1: string;
  prop2: number;
}

// Component with explicit typing
export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks at the top
  const [state, setState] = useState();
  
  // Event handlers
  const handleEvent = () => {
    // Logic
  };
  
  // Return JSX
  return (
    <div>
      {/* JSX structure */}
    </div>
  );
}
```

### Form Handling Pattern

Forms typically use react-hook-form:

```typescript
// Example form pattern
const { register, handleSubmit, formState: { errors } } = useForm();

const onSubmit = (data) => {
  // Submit logic
};

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <Input {...register('fieldName', { required: true })} />
    {errors.fieldName && <p>Error message</p>}
    <Button type="submit">Submit</Button>
  </form>
);
```

### API Integration Pattern

Supabase queries follow this pattern:

```typescript
// Example API pattern
const fetchData = async () => {
  const { data, error } = await supabase
    .from('table')
    .select('*')
    .eq('column', 'value');
    
  if (error) throw error;
  return data;
};
```

## Conclusion

This documentation provides a high-level overview of the Rental Solutions codebase. As the application continues to evolve, this document should be updated to reflect architectural changes and new patterns.

For more detailed information about specific modules, refer to the code comments and related documentation in the `/docs` directory.
