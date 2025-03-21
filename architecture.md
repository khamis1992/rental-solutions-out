
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

## 2. Feature Documentation

### 2.1 Authentication & User Management

#### 2.1.1 Authentication

**Components**: `SignIn.tsx`, `SignUp.tsx`, `AuthGuard.tsx`, `AdminGuard.tsx`

**Purpose**: Manages user authentication, authorization, and session management.

**Technical Specifications**:
- Uses Supabase Auth for authentication
- Implements role-based access control with three roles: admin, staff, and customer
- Provides route guards to protect access to sensitive areas

**Input/Output Behavior**:
- Input: User credentials (email/password)
- Output: Authentication tokens, user session data

**Key Functions**:
- `signIn(email, password)`: Authenticates a user and creates a session
- `signUp(email, password, userData)`: Registers a new user
- `signOut()`: Terminates the current user session
- `requireAuth()`: Guards routes requiring authentication
- `requireAdmin()`: Guards routes requiring admin privileges

**Edge Cases Handled**:
- Invalid credentials handling
- Session expiration
- Password reset flow
- Account verification process

#### 2.1.2 User Profile Management

**Component**: `Profile.tsx`, `ProfileView.tsx`

**Purpose**: Allows users to view and update their profile information.

**Technical Specifications**:
- Implements form validation for profile updates
- Handles file uploads for profile pictures
- Manages user preferences and settings

**Database Tables**: `profiles`, `user_preferences`

### 2.2 Customer Management

#### 2.2.1 Customer Dashboard

**Component**: `Customers.tsx`, `CustomersList.tsx`

**Purpose**: Provides an overview of all customers and access to customer management functions.

**Technical Specifications**:
- Uses React Query for data fetching with automatic cache invalidation
- Implements search, filter, and pagination for customer lists
- Provides quick access to customer details and actions

**Database Tables**: `profiles` (with role='customer'), `customer_notes`, `customer_segments`

#### 2.2.2 Customer Details

**Component**: `CustomerDetails.tsx`, `CustomerProfileView.tsx`

**Purpose**: Displays comprehensive information about a customer, including agreements, payments, and documents.

**Technical Specifications**:
- Uses tabbed interface for organizing customer data
- Implements dynamic data loading based on selected tabs
- Provides edit functionality for customer information

**Key Functions**:
- `handleUpdateCustomer(data)`: Updates customer information
- `handleDocumentUpload(file)`: Uploads and processes customer documents
- `calculateCredibilityScore()`: Computes a customer's credibility score based on payment history

**Database Tables**: `profiles`, `customer_notes`, `loyalty_points`, `credit_assessments`

#### 2.2.3 Customer Onboarding

**Component**: `CustomerOnboarding.tsx`

**Purpose**: Guides staff through the process of onboarding new customers.

**Technical Specifications**:
- Implements a step-by-step wizard interface
- Validates data at each step before proceeding
- Handles document uploads and verification

**Database Tables**: `profiles`, `customer_onboarding`, `document_analysis_results`

### 2.3 Vehicle Management

#### 2.3.1 Vehicle Inventory

**Component**: `Vehicles.tsx`, `VehicleList.tsx`

**Purpose**: Manages the vehicle fleet inventory with filtering, searching, and status tracking.

**Technical Specifications**:
- Implements status-based filtering of vehicles
- Provides search by make, model, and license plate
- Uses card-based interface for vehicle display

**Database Tables**: `vehicles`, `vehicle_statuses`, `maintenance`

#### 2.3.2 Vehicle Details

**Component**: `VehicleDetails.tsx`

**Purpose**: Displays and manages detailed information about a specific vehicle.

**Technical Specifications**:
- Tracks vehicle maintenance history
- Manages vehicle documents and their expiry dates
- Monitors vehicle assignments and availability

**Key Functions**:
- `handleUpdateVehicle(data)`: Updates vehicle information
- `scheduleMaintenanceTask(task)`: Creates a new maintenance task
- `uploadVehicleDocument(file, type)`: Processes vehicle documentation

**Database Tables**: `vehicles`, `vehicle_documents`, `maintenance`, `vehicle_insurance`

#### 2.3.3 Maintenance Management

**Component**: `MaintenanceScheduler.tsx`, `MaintenanceTasks.tsx`

**Purpose**: Schedules and tracks vehicle maintenance activities.

**Technical Specifications**:
- Implements calendar-based scheduling
- Provides task assignment to staff
- Tracks maintenance costs and history

**Database Tables**: `maintenance`, `maintenance_tasks`, `vehicle_parts`

### 2.4 Agreement Management

#### 2.4.1 Agreement Dashboard

**Component**: `Agreements.tsx`, `AgreementList.tsx`

**Purpose**: Provides an overview of all agreements and access to agreement management functions.

**Technical Specifications**:
- Uses React Query for data fetching
- Implements status-based filtering and search
- Displays key agreement metrics and status indicators

**Database Tables**: `leases`, `profiles`, `vehicles`

#### 2.4.2 Agreement Details

**Component**: `AgreementDetails.tsx`, `AgreementDetailsDialog.tsx`

**Purpose**: Displays comprehensive information about a specific agreement.

**Technical Specifications**:
- Tracks agreement status and payment history
- Manages agreement documents
- Provides actions for agreement lifecycle management

**Key Functions**:
- `handleUpdateAgreement(data)`: Updates agreement information
- `generateInvoice()`: Creates a new invoice for the agreement
- `renewAgreement(duration)`: Extends an existing agreement

**Database Tables**: `leases`, `unified_payments`, `agreement_documents`

#### 2.4.3 Agreement Creation

**Component**: `CreateAgreementDialog.tsx`

**Purpose**: Guides staff through the process of creating new agreements.

**Technical Specifications**:
- Implements customer and vehicle selection
- Calculates pricing based on vehicle type and duration
- Generates agreement documents

**Database Tables**: `leases`, `agreement_templates`, `vehicles`, `profiles`

### 2.5 Finance Management

#### 2.5.1 Finance Dashboard

**Component**: `FinanceDashboard.tsx`, `FinancialNavigation.tsx`

**Purpose**: Provides an overview of financial metrics and access to financial management functions.

**Technical Specifications**:
- Displays key financial indicators and charts
- Provides access to detailed financial reports
- Implements date range filtering for financial data

**Database Tables**: `unified_payments`, `transaction_amounts`

#### 2.5.2 Transaction Management

**Component**: `FinanceTransactions.tsx`, `TransactionImportTool.tsx`

**Purpose**: Manages financial transactions with import capabilities and reconciliation.

**Technical Specifications**:
- Implements CSV import for bulk transaction processing
- Provides manual transaction entry
- Supports transaction categorization and reporting

**Key Functions**:
- `handleFileUpload(file)`: Processes uploaded transaction CSV files
- `implementChanges()`: Applies validated transactions to the database
- `reconcileTransactions()`: Matches imported transactions with expected payments

**Database Tables**: `unified_payments`, `financial_imports`, `transaction_imports`

#### 2.5.3 Virtual CFO

**Component**: `VirtualCFO.tsx`

**Purpose**: Provides AI-powered financial insights and recommendations.

**Technical Specifications**:
- Implements financial forecasting algorithms
- Generates cost-saving recommendations
- Provides scenario analysis for financial decisions

**Database Tables**: `business_insights`, `expense_analysis`, `financial_goals`

#### 2.5.4 Car Installment Management

**Component**: `CarInstallments.tsx`, `CarInstallmentDetails.tsx`

**Purpose**: Manages vehicle installment payments and tracking.

**Technical Specifications**:
- Tracks installment schedules and payments
- Provides overdue payment monitoring
- Generates payment reminders

**Database Tables**: `car_installment_contracts`, `car_installment_payments`

### 2.6 Traffic Fines Management

#### 2.6.1 Traffic Fines Dashboard

**Component**: `TrafficFinesDashboard.tsx`

**Purpose**: Serves as the main entry point for the Traffic Fines module, providing an overview of all traffic fines and access to management functions.

**Technical Specifications**:
- Uses React Query for data fetching with automatic cache invalidation
- Implements a confirmation dialog for destructive actions
- Features a gradient header with contextual information
- Provides a statistical overview of fines

**Input/Output Behavior**:
- Input: User interactions (search, filter, sort, deletion)
- Output: Displays aggregated statistics and a list of traffic fines

**Key Functions**:
- `handleSort(field: string)`: Manages the sorting of traffic fines by different fields
- `handleDeleteAllFines()`: Performs a bulk deletion of all traffic fines with error handling

**Edge Cases Handled**:
- Empty state when no fines exist
- Error handling for database operations
- Confirmation for destructive actions
- Loading states during data fetching

**Database Tables**: `traffic_fines`, `leases`, `vehicles`

#### 2.6.2 Traffic Fines List

**Component**: `TrafficFinesList.tsx`

**Purpose**: Displays a paginated, sortable, and filterable list of traffic fines.

**Technical Specifications**:
- Uses a responsive table layout with dynamic column sorting
- Implements status badges with contextual colors
- Provides tooltips for additional information
- Features copy-to-clipboard functionality

**Database Tables**: `traffic_fines`, `leases`, `vehicles`, `profiles`

#### 2.6.3 Traffic Fine Import

**Component**: `TrafficFineImport.tsx`

**Purpose**: Provides functionality to import traffic fines from CSV files with validation and correction.

**Technical Specifications**:
- Uses custom hooks for import process management
- Implements CSV template download
- Features analysis of CSV data quality
- Provides filtering and sorting of imported data

**Database Tables**: `traffic_fines`, `import_logs`

### 2.7 Reporting System

#### 2.7.1 Reports Dashboard

**Component**: `ReportsDashboard.tsx`

**Purpose**: Provides access to various system reports and analytics.

**Technical Specifications**:
- Implements report generation with multiple formats (PDF, CSV)
- Provides scheduling for automated reports
- Features customizable report templates

**Database Tables**: `report_schedules`

#### 2.7.2 Pending Payments Report

**Component**: `PendingPaymentsReport.tsx`

**Purpose**: Generates reports on pending payments across the system.

**Technical Specifications**:
- Filters payments by status, date range, and customer
- Calculates overdue amounts and days overdue
- Provides export functionality for follow-up

**Database Tables**: `unified_payments`, `leases`, `profiles`

#### 2.7.3 Traffic Fines Report

**Component**: `TrafficFinesReport.tsx`

**Purpose**: Generates detailed reports on traffic fines.

**Technical Specifications**:
- Groups fines by vehicle, customer, or time period
- Calculates fine statistics and trends
- Provides export functionality with detailed breakdowns

**Database Tables**: `traffic_fines`, `leases`, `vehicles`, `profiles`

### 2.8 Legal Module

#### 2.8.1 Legal Case Management

**Component**: `Legal.tsx`, `LegalCasesList.tsx`

**Purpose**: Manages legal cases related to agreements, collections, and disputes.

**Technical Specifications**:
- Implements case status tracking and updates
- Provides document generation for legal communications
- Features reminder system for case follow-ups

**Database Tables**: `legal_cases`, `legal_communications`, `legal_documents`

#### 2.8.2 Legal Workflow Automation

**Component**: `WorkflowBuilder.tsx`, `AutomationSettings.tsx`

**Purpose**: Builds and manages automated workflows for legal processes.

**Technical Specifications**:
- Implements drag-and-drop workflow builder
- Provides template-based automation
- Features condition-based workflow branching

**Database Tables**: `workflow_templates`, `workflow_instances`, `workflow_automation_logs`

### 2.9 Settings & Configuration

#### 2.9.1 System Settings

**Component**: `Settings.tsx`

**Purpose**: Manages system-wide settings and configurations.

**Technical Specifications**:
- Implements settings categories and organization
- Provides user permissions management
- Features API integration configuration

**Database Tables**: `system_settings`, `permissions`

#### 2.9.2 Templates Management

**Component**: `AgreementTemplateManagement.tsx`, `WordTemplateManagement.tsx`

**Purpose**: Manages document templates for agreements and communications.

**Technical Specifications**:
- Implements template editing and versioning
- Provides variable mapping for dynamic content
- Features preview functionality for templates

**Database Tables**: `agreement_templates`, `word_templates`, `email_templates`

## 3. Component Interaction Map

### 3.1 Authentication Flow

```
SignIn.tsx / SignUp.tsx
└── AuthProvider.tsx (Context)
    ├── AuthGuard.tsx (Route protection)
    ├── AdminGuard.tsx (Role-based protection)
    └── Layout.tsx (Main application shell)
```

### 3.2 Customer Management Flow

```
Customers.tsx (Page)
└── DashboardLayout
    ├── CustomersList
    │   ├── CustomerCard / CustomerRow
    │   └── CustomerFilters
    ├── CreateCustomerDialog
    └── CustomerImportTool
```

### 3.3 Vehicle Management Flow

```
Vehicles.tsx (Page)
└── DashboardLayout
    ├── VehicleList
    │   ├── VehicleCard
    │   └── VehicleFilters
    ├── CreateVehicleDialog
    └── MaintenanceScheduler
```

### 3.4 Agreement Management Flow

```
Agreements.tsx (Page)
└── DashboardLayout
    ├── AgreementList
    │   ├── AgreementListHeader
    │   ├── AgreementListContent
    │   └── AgreementFilters
    ├── CreateAgreementDialog
    ├── AgreementDetailsDialog
    ├── PaymentTrackingDialog
    └── DeleteAgreementDialog
```

### 3.5 Finance Management Flow

```
FinanceDashboard.tsx (Page)
└── DashboardLayout
    ├── FinancialNavigation
    ├── VirtualCFO
    │   ├── QuickInsights
    │   ├── ProfitabilityTracking
    │   └── CashFlowMonitoring
    └── TransactionImportTool
        ├── FileUploadSection
        └── ImportedTransactionsTable
```

### 3.6 Traffic Fines Flow

```
TrafficFines.tsx (Page)
└── DashboardLayout
    └── TrafficFinesDashboard
        ├── TrafficFineStats
        │   └── StatsDisplay (UI Component)
        ├── TrafficFineImport
        │   ├── FileUploadSection (UI Component)
        │   ├── AIAnalysisCard (shared component)
        │   ├── TrafficFineFilters
        │   └── TrafficFinesList
        └── TrafficFinesList
            └── SortableHeader (Internal component)
```

## 4. Database Schema

The database schema is organized around core entities with relationships that support the system's functionality. Below are the key tables and their relationships.

### 4.1 Primary Tables

#### profiles (users and customers)
- `id`: UUID (Primary Key)
- `full_name`: Text
- `phone_number`: Text
- `email`: Text
- `address`: Text
- `role`: Enum ('customer', 'staff', 'admin')
- `nationality`: Text
- `driver_license`: Text
- `document_verification_status`: Text
- `status`: Enum ('active', 'inactive', 'suspended', 'pending_review', 'blacklisted')

#### vehicles
- `id`: UUID (Primary Key)
- `make`: Text
- `model`: Text
- `year`: Integer
- `color`: Text
- `license_plate`: Text
- `vin`: Text
- `status`: Enum ('available', 'rented', 'maintenance', 'retired')
- `mileage`: Integer
- `location`: Text
- `insurance_company`: Text

#### leases (agreements)
- `id`: UUID (Primary Key)
- `agreement_number`: Text
- `customer_id`: UUID (Foreign Key to profiles)
- `vehicle_id`: UUID (Foreign Key to vehicles)
- `start_date`: Timestamp
- `end_date`: Timestamp
- `status`: Enum ('pending_payment', 'pending_deposit', 'active', 'closed')
- `agreement_type`: Enum ('lease_to_own', 'short_term')
- `total_amount`: Numeric
- `rent_amount`: Numeric
- `daily_late_fee`: Numeric
- `template_id`: UUID (Foreign Key to agreement_templates)

#### unified_payments
- `id`: UUID (Primary Key)
- `lease_id`: UUID (Foreign Key to leases)
- `amount`: Numeric
- `amount_paid`: Numeric
- `balance`: Numeric
- `payment_date`: Timestamp
- `due_date`: Timestamp
- `status`: Enum ('pending', 'completed', 'failed', 'refunded')
- `payment_method`: Text
- `type`: Text
- `description`: Text
- `days_overdue`: Integer
- `late_fine_amount`: Numeric

#### traffic_fines
- `id`: UUID (Primary Key)
- `lease_id`: UUID (Foreign Key to leases)
- `vehicle_id`: UUID (Foreign Key to vehicles)
- `license_plate`: Text
- `serial_number`: Text
- `violation_number`: Text
- `violation_date`: Timestamp
- `fine_location`: Text
- `fine_type`: Text
- `fine_amount`: Numeric
- `violation_points`: Integer
- `payment_status`: Enum ('pending', 'completed', 'failed', 'refunded')
- `assignment_status`: Enum ('pending', 'assigned')

#### legal_cases
- `id`: UUID (Primary Key)
- `customer_id`: UUID (Foreign Key to profiles)
- `case_type`: Text
- `status`: Enum ('pending_reminder', 'in_progress', 'escalated', 'resolved')
- `description`: Text
- `amount_owed`: Numeric
- `created_at`: Timestamp
- `resolution_date`: Timestamp

### 4.2 Support Tables

#### agreement_templates
- `id`: UUID (Primary Key)
- `name`: Text
- `agreement_type`: Enum ('lease_to_own', 'short_term')
- `content`: Text
- `variable_mappings`: JSONB

#### maintenance
- `id`: UUID (Primary Key)
- `vehicle_id`: UUID (Foreign Key to vehicles)
- `service_type`: Text
- `status`: Enum ('scheduled', 'in_progress', 'completed', 'cancelled')
- `scheduled_date`: Timestamp
- `cost`: Numeric

#### car_installment_contracts
- `id`: UUID (Primary Key)
- `car_type`: Text
- `model_year`: Integer
- `number_of_cars`: Integer
- `price_per_car`: Numeric
- `total_contract_value`: Numeric
- `total_installments`: Integer
- `installment_value`: Numeric
- `remaining_installments`: Integer

## 5. Edge Functions

### 5.1 process-traffic-fine-import

**Purpose**: Processes uploaded CSV files for traffic fine imports.

**API Endpoint**: `/functions/v1/process-traffic-fine-import`

**Input**: CSV file content from storage
**Output**: Processing result with counts and error details

### 5.2 process-agreement-import

**Purpose**: Processes uploaded agreement data for batch imports.

**API Endpoint**: `/functions/v1/process-agreement-import`

**Input**: CSV or JSON data with agreement details
**Output**: Import results with success/failure counts

### 5.3 payment-service

**Purpose**: Handles payment processing, calculations, and reconciliation.

**API Endpoint**: `/functions/v1/payment-service`

**Input**: Payment data and operation type
**Output**: Processed payment result or calculation results

## 6. Feature Recreation Guide

### 6.1 Authentication System

**Database Requirements**:
- `profiles` table with role field

**Implementation Steps**:
1. Set up Supabase Auth with email and password authentication
2. Implement SignIn and SignUp components with form validation
3. Create AuthProvider context for managing authentication state
4. Implement route guards with AuthGuard and AdminGuard
5. Set up profile management for user information

### 6.2 Customer Management

**Database Requirements**:
- `profiles` table with customer fields
- `customer_notes` table for storing notes
- `credit_assessments` table for risk assessment

**Implementation Steps**:
1. Implement CustomersList component with search and filtering
2. Create CustomerDetails view with tabbed interface
3. Implement document upload and verification system
4. Create customer onboarding workflow
5. Implement credibility scoring system

### 6.3 Vehicle Management

**Database Requirements**:
- `vehicles` table with all vehicle fields
- `vehicle_documents` table for certificates, insurance
- `maintenance` table for service records

**Implementation Steps**:
1. Create VehicleList component with filtering and search
2. Implement VehicleDetails view with maintenance history
3. Create maintenance scheduling system
4. Implement document management for vehicles
5. Create vehicle status tracking system

### 6.4 Agreement Management

**Database Requirements**:
- `leases` table for agreement data
- `agreement_templates` table for document templates
- `unified_payments` table for payment tracking

**Implementation Steps**:
1. Implement AgreementList with filtering and search
2. Create agreement creation workflow with customer and vehicle selection
3. Implement document generation using templates
4. Create payment tracking and scheduling
5. Implement agreement renewal and termination flows

### 6.5 Finance Management

**Database Requirements**:
- `unified_payments` table for all financial transactions
- `transaction_imports` table for import tracking
- `car_installment_contracts` and related tables

**Implementation Steps**:
1. Create finance dashboard with key metrics
2. Implement transaction import and reconciliation
3. Create Virtual CFO with financial insights
4. Implement car installment tracking system
5. Create financial reporting system

### 6.6 Traffic Fines Management

**Database Requirements**:
- `traffic_fines` table with all fine details
- `import_logs` table for tracking imports

**Implementation Steps**:
1. Create TrafficFinesDashboard component
2. Implement fine listing with search and filtering
3. Create import system with CSV validation
4. Implement fine assignment to agreements
5. Create reporting system for fine analytics

### 6.7 Legal Module

**Database Requirements**:
- `legal_cases` table for case tracking
- `legal_communications` for interactions
- `workflow_templates` for process automation

**Implementation Steps**:
1. Implement legal case management system
2. Create workflow builder for process automation
3. Implement document generation for legal communications
4. Create reminder system for case follow-ups
5. Implement reporting for legal metrics

## 7. Best Practices and Standards

### 7.1 Code Organization
- Component-based architecture with clear separation of concerns
- Utility files for reusable logic
- Type definitions for TypeScript safety
- React Query for data fetching and caching

### 7.2 State Management
- Local component state for UI-specific state
- React Query for server state
- Proper cache invalidation on mutations

### 7.3 Error Handling
- Consistent error handling patterns
- Toast notifications for user feedback
- Error boundary components for UI resilience
- Console logging for debugging

### 7.4 Performance Considerations
- Efficient database queries with proper joins
- Pagination for large data sets
- Optimistic UI updates
- Batch processing for bulk operations

### 7.5 Security Best Practices
- Server-side validation in Edge Functions
- Proper database access control
- Input sanitization
- Rate limiting for sensitive operations

This architecture document provides a comprehensive guide to the system structure, covering all major modules. Follow the implementation steps and database requirements to recreate the functionality while maintaining the established patterns and best practices.
