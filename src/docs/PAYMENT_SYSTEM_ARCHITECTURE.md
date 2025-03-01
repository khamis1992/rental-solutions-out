
# Payment System Architecture

## Overview

The payment system in Rental Solutions is designed to handle all financial transactions related to vehicle rentals, including payments, installments, remaining amounts, and reporting. This document provides a comprehensive overview of the payment architecture, components, and workflows.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Components](#components)
3. [Data Flow](#data-flow)
4. [Database Schema](#database-schema)
5. [Import/Export System](#importexport-system)
6. [Reconciliation Process](#reconciliation-process)
7. [Reporting](#reporting)
8. [Integration Points](#integration-points)

## System Architecture

The payment system follows a layered architecture:

1. **UI Layer**: Components for payment entry, display, and management
2. **Business Logic Layer**: Hooks and services for payment processing
3. **Data Access Layer**: Database interactions via Supabase
4. **Integration Layer**: Connections to external payment systems

### Key Design Principles

- **Unified Payment System**: All payments flow through a single system
- **Audit Trail**: Comprehensive logging of all payment activities
- **Reconciliation**: Tools for matching payments with agreements
- **Flexibility**: Support for various payment methods and types
- **Reporting**: Detailed financial reporting capabilities

## Components

### UI Components

- **PaymentForm**: For entering payment information
- **PaymentHistoryTable**: For displaying payment history
- **PaymentImport**: For importing payment data
- **PaymentReconciliation**: For reconciling payments
- **InvoiceView**: For viewing invoices
- **RemainingAmountImport**: For importing remaining amount data

### Business Logic

- **usePaymentForm**: Hook for payment form management
- **usePaymentHistory**: Hook for fetching payment history
- **usePaymentImport**: Hook for payment import processing
- **useRemainingAmountImport**: Hook for remaining amount import processing
- **invoiceUtils**: Utilities for invoice generation

### Services

- **paymentService**: Core payment processing service
- **importService**: Import processing service
- **reconciliationService**: Payment reconciliation service

## Data Flow

### Payment Recording Flow

1. User enters payment details in PaymentForm
2. Form is validated (amount, payment method, etc.)
3. Payment is submitted to the server via Supabase
4. Payment is recorded in unified_payments table
5. Agreement payment status is updated
6. Payment history is refreshed
7. UI is updated to reflect changes

### Payment Import Flow

1. User uploads payment data file
2. File is validated for format and content
3. Data is processed and mapped to agreements
4. Payments are created in the database
5. Import results are displayed to the user
6. Unmatched payments are flagged for reconciliation

### Reconciliation Flow

1. User views unreconciled payments
2. System suggests potential matches based on agreement numbers, amounts, etc.
3. User manually assigns payments to agreements
4. Payment records are updated with correct agreement IDs
5. Agreement payment statuses are updated

## Database Schema

### Core Payment Tables

- **unified_payments**: Central payment repository
  - `id`: UUID primary key
  - `lease_id`: Reference to agreement
  - `amount`: Payment amount
  - `amount_paid`: Amount paid
  - `payment_date`: Date of payment
  - `payment_method`: Method of payment
  - `status`: Payment status
  - `description`: Payment description
  - `type`: Payment type (Income, Expense, etc.)

- **remaining_amounts**: Tracks remaining amounts on agreements
  - `id`: UUID primary key
  - `lease_id`: Reference to agreement
  - `agreement_number`: Agreement number
  - `remaining_amount`: Remaining amount
  - `final_price`: Final price
  - `amount_paid`: Amount paid

- **payment_audit_logs**: Audit trail for payments
  - `id`: UUID primary key
  - `payment_id`: Reference to payment
  - `action`: Action performed
  - `previous_state`: Previous payment state
  - `new_state`: New payment state
  - `performed_by`: User who performed action

### Import/Export Tables

- **unified_import_tracking**: Tracks payment imports
  - `id`: UUID primary key
  - `transaction_id`: Transaction ID
  - `agreement_number`: Agreement number
  - `customer_name`: Customer name
  - `amount`: Payment amount
  - `status`: Import status
  - `validation_status`: Validation status
  - `error_details`: Error details

## Import/Export System

The payment system includes robust import/export capabilities:

### Import Features

- **CSV Import**: Import payments from CSV files
- **Validation**: Validate imported data for correctness
- **Error Handling**: Detailed error reporting
- **Auto-matching**: Automatically match payments to agreements
- **Batch Processing**: Process imports in batches

### Export Features

- **CSV Export**: Export payment data to CSV
- **Report Generation**: Generate payment reports
- **Filtering**: Export filtered subsets of payment data

## Reconciliation Process

The payment reconciliation process helps ensure that all payments are correctly matched to agreements:

1. **Automatic Matching**: System attempts to match payments automatically
2. **Match Scoring**: Calculates confidence scores for potential matches
3. **Manual Assignment**: Interface for manually assigning payments
4. **Bulk Operations**: Tools for batch reconciliation
5. **Audit Trail**: Logs all reconciliation activities

## Reporting

The payment system provides comprehensive reporting capabilities:

### Financial Reports

- **Revenue Reports**: Overall revenue tracking
- **Payment Method Reports**: Breakdown by payment method
- **Agreement Payment Reports**: Payments by agreement
- **Customer Payment Reports**: Payments by customer
- **Aging Reports**: Overdue payment tracking

### Analytical Reports

- **Payment Trends**: Payment trend analysis
- **Late Payment Analysis**: Analysis of late payments
- **Revenue Forecasting**: Forecasting future revenue

## Integration Points

The payment system integrates with several other modules:

1. **Agreement Module**: Links payments to agreements
2. **Customer Module**: Associates payments with customers
3. **Vehicle Module**: Connects payments to specific vehicles
4. **Financial Module**: Provides data for financial analysis
5. **Reporting Module**: Supplies data for reports

### External Integrations

The payment system can integrate with external systems:

- **Accounting Software**: Export data to accounting systems
- **Banking Systems**: Import data from banking systems
- **Payment Processors**: Process payments through external providers

## Conclusion

The Rental Solutions payment system provides a comprehensive solution for managing all financial aspects of the vehicle rental business. Its unified approach ensures consistency, auditability, and flexibility while providing powerful tools for reconciliation and reporting.
