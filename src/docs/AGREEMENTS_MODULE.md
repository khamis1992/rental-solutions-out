
# Agreements Module Documentation

## Overview

The Agreements module is a core component of the Rental Solutions system, handling the creation, management, and processing of rental agreements between customers and vehicles. This module contains all functionality related to contracts, payments, templates, and agreement-related workflows.

## Table of Contents

1. [Directory Structure](#directory-structure)
2. [Key Components](#key-components)
3. [Data Flow](#data-flow)
4. [Core Features](#core-features)
5. [State Management](#state-management)
6. [Database Schema](#database-schema)
7. [Custom Hooks](#custom-hooks)
8. [Common Patterns](#common-patterns)

## Directory Structure

```
src/components/agreements/
├── details/                 # Agreement details components
├── enhanced/                # Enhanced view components
├── form/                    # Agreement creation form components
├── hooks/                   # Agreement-specific hooks
├── list/                    # Agreement listing components
├── payment-import/          # Payment import functionality
├── payments/                # Payment management components
├── previews/                # Agreement preview components
├── print/                   # Print functionality
├── search/                  # Search components
├── services/                # Service layer
├── table/                   # Table components
├── templates/               # Template management
├── utils/                   # Utility functions
└── v2/                      # Version 2 components
```

## Key Components

### Agreement Creation and Management

- **CreateAgreementDialog.tsx**: Dialog for creating new agreements
- **AgreementDetailsDialog.tsx**: Dialog for viewing agreement details
- **DeleteAgreementDialog.tsx**: Dialog for deleting agreements
- **AgreementList.tsx**: List view of agreements

### Agreement Details

- **AgreementHeader.tsx**: Header component for agreement details
- **AgreementStatus.tsx**: Shows and manages agreement status
- **CustomerInfoCard.tsx**: Shows customer information
- **VehicleInfoCard.tsx**: Shows vehicle information
- **DamageAssessment.tsx**: Handles damage assessment

### Payment Processing

- **PaymentForm.tsx**: Form for recording payments
- **PaymentHistory.tsx**: Shows payment history
- **PaymentHistoryDialog.tsx**: Dialog for viewing payment history
- **PaymentImport.tsx**: Handles payment data import
- **PaymentTrackingDialog.tsx**: Dialog for tracking payments

### Templates

- **AgreementTemplateManagement.tsx**: Manages agreement templates
- **AgreementTemplateSelect.tsx**: Component for selecting templates
- **CreateTemplateDialog.tsx**: Dialog for creating templates
- **TemplateList.tsx**: Lists available templates
- **TemplatePreview.tsx**: Previews templates

### Invoice Management

- **InvoiceDialog.tsx**: Dialog for viewing invoices
- **InvoiceView.tsx**: Component for viewing invoice details
- **BatchInvoiceDialog.tsx**: Dialog for batch invoice processing

### Printing

- **PrintAgreement.tsx**: Handles printing agreements
- **PrintButton.tsx**: Button component for printing
- **AgreementEditor.tsx**: Editor for agreements before printing

## Data Flow

1. **Agreement Creation Flow**:
   - User enters customer and vehicle details via form components
   - Template is selected (optional)
   - Agreement is created and stored in the database
   - UI updates to show the new agreement

2. **Payment Processing Flow**:
   - User records payment via PaymentForm
   - Payment is saved to database
   - Agreement payment status is updated
   - Payment history is updated

3. **Template Management Flow**:
   - User creates/edits templates
   - Templates are saved to database
   - Templates are used when creating/viewing agreements

## Core Features

### Agreement Management

- **Agreement Creation**: Creating new rental agreements with customer and vehicle details
- **Agreement Templates**: Using predefined templates for agreements
- **Status Tracking**: Tracking agreement status (active, pending_payment, closed, etc.)
- **Document Generation**: Generating printable agreement documents

### Payment Tracking

- **Payment Recording**: Recording payments against agreements
- **Payment History**: Tracking payment history
- **Payment Import**: Importing payment data from external sources
- **Payment Reconciliation**: Reconciling payments with agreements

### Invoice Management

- **Invoice Generation**: Generating invoices for agreements
- **Invoice Customization**: Customizing invoice templates
- **Invoice Printing**: Printing invoices for distribution

### Reporting

- **Agreement Reports**: Generating reports on agreements
- **Payment Reports**: Generating reports on payments
- **Status Reports**: Generating reports on agreement status

## State Management

The Agreements module uses several state management approaches:

1. **React Query**: For server-side state management
   - Fetching agreements
   - Fetching payment history
   - Fetching templates

2. **Component State**: For UI-specific state
   - Form inputs
   - Dialog open/close state
   - Selection state

3. **URL Parameters**: For persistent state across page refreshes
   - Selected agreement ID
   - Filter parameters
   - Sort parameters

## Database Schema

The main database tables used by the Agreements module:

- **leases**: Stores agreement data
  - `id`: Primary key
  - `agreement_number`: Unique identifier
  - `customer_id`: Foreign key to profiles
  - `vehicle_id`: Foreign key to vehicles
  - `start_date`: Agreement start date
  - `end_date`: Agreement end date
  - `status`: Agreement status
  - `total_amount`: Total agreement amount
  - `rent_amount`: Rent amount
  - `remaining_amount`: Remaining amount
  - `payment_status`: Payment status

- **unified_payments**: Stores payment data
  - `id`: Primary key
  - `lease_id`: Foreign key to leases
  - `amount`: Payment amount
  - `amount_paid`: Amount paid
  - `payment_date`: Payment date
  - `payment_method`: Payment method
  - `status`: Payment status

- **agreement_templates**: Stores agreement templates
  - `id`: Primary key
  - `name`: Template name
  - `content`: Template content
  - `agreement_type`: Agreement type

- **remaining_amounts**: Tracks remaining amounts
  - `id`: Primary key
  - `lease_id`: Foreign key to leases
  - `remaining_amount`: Remaining amount
  - `agreement_number`: Agreement number

## Custom Hooks

The Agreements module uses several custom hooks for data fetching and logic:

- **useAgreements.ts**: Fetches and manages agreements
- **useAgreementDetails.ts**: Fetches and manages agreement details
- **useAgreementForm.ts**: Manages agreement form state
- **usePaymentForm.ts**: Manages payment form state
- **usePaymentHistory.ts**: Fetches and manages payment history
- **useImportProcess.ts**: Manages the import process
- **useOverduePayments.ts**: Fetches and manages overdue payments
- **usePrintableAgreement.ts**: Manages printable agreement state

## Common Patterns

### Agreement Creation Pattern

```tsx
// Using the agreement form hook
const {
  form,
  isLoading,
  handleSubmit,
  errors
} = useAgreementForm();

// Form submission
const onSubmit = async (data) => {
  await createAgreement(data);
  onSuccess();
};

// JSX Structure
return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <CustomerSelect register={form.register} errors={errors} />
    <VehicleSelect register={form.register} errors={errors} />
    <Button type="submit" disabled={isLoading}>Create Agreement</Button>
  </form>
);
```

### Payment Recording Pattern

```tsx
// Using the payment form hook
const {
  form,
  isSubmitting,
  handleSubmit
} = usePaymentForm(agreementId);

// Form submission
const onSubmit = async (data) => {
  await recordPayment(data);
  refetchPaymentHistory();
};

// JSX Structure
return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <Input {...form.register('amount')} />
    <Select {...form.register('paymentMethod')}>
      {/* Payment method options */}
    </Select>
    <Button type="submit" disabled={isSubmitting}>Record Payment</Button>
  </form>
);
```

### Agreement Listing Pattern

```tsx
// Using the agreements hook
const {
  agreements,
  isLoading,
  filters,
  setFilters,
  sortConfig,
  setSortConfig
} = useAgreements();

// JSX Structure
return (
  <div>
    <AgreementFilters filters={filters} onChange={setFilters} />
    {isLoading ? (
      <LoadingSpinner />
    ) : (
      <AgreementList 
        agreements={agreements}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
      />
    )}
  </div>
);
```

## Integration Points

The Agreements module integrates with other modules:

1. **Customers Module**: For customer selection and information
2. **Vehicles Module**: For vehicle selection and information
3. **Finance Module**: For financial aspects of agreements
4. **Legal Module**: For legal aspects of agreements
5. **Reporting Module**: For generating reports on agreements

## Conclusion

The Agreements module is a central part of the Rental Solutions system, managing the core business of rental agreements between customers and vehicles. Its robust architecture allows for flexibility in handling different agreement types, payment methods, and reporting needs.
