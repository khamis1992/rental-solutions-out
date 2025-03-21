
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

**Database Tables**: `profiles` with fields including `id`, `full_name`, `email`, `role`

**Reconstruction Steps**:
1. Create Supabase authentication configuration
2. Implement authentication components (SignIn.tsx, SignUp.tsx)
3. Create AuthProvider context for session management
4. Implement route guards for protected routes

#### 2.1.2 User Profile Management

**Component**: `Profile.tsx`, `ProfileView.tsx`

**Purpose**: Allows users to view and update their profile information.

**Technical Specifications**:
- Implements form validation for profile updates
- Handles file uploads for profile pictures
- Manages user preferences and settings

**Database Tables**: `profiles`, `user_preferences`

**API Endpoints**: 
- `GET /profiles/{id}`: Retrieves profile information
- `PUT /profiles/{id}`: Updates profile information
- `POST /profiles/upload-avatar`: Uploads profile avatar

**Reconstruction Steps**:
1. Create profile management components
2. Implement form validation logic
3. Set up file upload handling for profile pictures
4. Create API endpoints for profile CRUD operations

### 2.2 Customer Management

#### 2.2.1 Customer Dashboard

**Component**: `Customers.tsx`, `CustomersList.tsx`

**Purpose**: Provides an overview of all customers and access to customer management functions.

**Technical Specifications**:
- Uses React Query for data fetching with automatic cache invalidation
- Implements search, filter, and pagination for customer lists
- Provides quick access to customer details and actions

**Database Tables**: `profiles` (with role='customer'), `customer_notes`, `customer_segments`

**API Endpoints**:
- `GET /customers`: Retrieves list of customers
- `GET /customers/count`: Gets total customer count
- `GET /customers/search`: Searches customers by criteria

**Reconstruction Steps**:
1. Create customer dashboard layout and components
2. Implement React Query for data fetching
3. Create search, filter, and pagination functionality
4. Design and implement customer list display

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

**API Endpoints**:
- `GET /customers/{id}`: Retrieves detailed customer information
- `PUT /customers/{id}`: Updates customer information
- `POST /customers/{id}/documents`: Uploads customer documents
- `GET /customers/{id}/agreements`: Retrieves customer's agreements
- `GET /customers/{id}/payments`: Retrieves customer's payment history

**Reconstruction Steps**:
1. Create customer details view with tabbed interface
2. Implement data loading logic for each tab
3. Create document upload functionality
4. Implement customer editing capabilities
5. Add payment history and agreement list views

#### 2.2.3 Customer Onboarding

**Component**: `CustomerOnboarding.tsx`

**Purpose**: Guides staff through the process of onboarding new customers.

**Technical Specifications**:
- Implements a step-by-step wizard interface
- Validates data at each step before proceeding
- Handles document uploads and verification

**Database Tables**: `profiles`, `customer_onboarding`, `document_analysis_results`

**API Endpoints**:
- `POST /customers`: Creates new customer
- `POST /customer-onboarding`: Records onboarding process
- `POST /document-analysis`: Analyzes uploaded documents

**Reconstruction Steps**:
1. Create multi-step form wizard
2. Implement form validation for each step
3. Create document upload and verification system
4. Implement onboarding status tracking

### 2.3 Vehicle Management

#### 2.3.1 Vehicle Inventory

**Component**: `Vehicles.tsx`, `VehicleList.tsx`

**Purpose**: Manages the vehicle fleet inventory with filtering, searching, and status tracking.

**Technical Specifications**:
- Implements status-based filtering of vehicles
- Provides search by make, model, and license plate
- Uses card-based interface for vehicle display

**Database Tables**: `vehicles`, `vehicle_statuses`, `maintenance`

**API Endpoints**:
- `GET /vehicles`: Retrieves list of vehicles
- `GET /vehicles/count`: Gets total vehicle count
- `GET /vehicles/search`: Searches vehicles by criteria

**Reconstruction Steps**:
1. Create vehicle inventory layout and components
2. Implement filter and search functionality
3. Create vehicle card and list display components
4. Add vehicle status tracking and visualization

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

**API Endpoints**:
- `GET /vehicles/{id}`: Retrieves detailed vehicle information
- `PUT /vehicles/{id}`: Updates vehicle information
- `GET /vehicles/{id}/maintenance`: Retrieves maintenance history
- `GET /vehicles/{id}/documents`: Retrieves vehicle documents
- `GET /vehicles/{id}/agreements`: Retrieves vehicle assignment history

**Reconstruction Steps**:
1. Create vehicle details view with tabbed interface
2. Implement maintenance history tracking
3. Create document management functionality
4. Add vehicle status update capabilities
5. Implement agreement tracking for the vehicle

#### 2.3.3 Maintenance Management

**Component**: `MaintenanceScheduler.tsx`, `MaintenanceTasks.tsx`

**Purpose**: Schedules and tracks vehicle maintenance activities.

**Technical Specifications**:
- Implements calendar-based scheduling
- Provides task assignment to staff
- Tracks maintenance costs and history

**Database Tables**: `maintenance`, `maintenance_tasks`, `vehicle_parts`

**API Endpoints**:
- `GET /maintenance`: Retrieves maintenance records
- `POST /maintenance`: Creates new maintenance record
- `PUT /maintenance/{id}`: Updates maintenance status
- `GET /maintenance/vehicle/{id}`: Retrieves maintenance for specific vehicle

**Reconstruction Steps**:
1. Create maintenance scheduler with calendar interface
2. Implement task assignment functionality
3. Create maintenance history tracking
4. Add cost tracking and reporting for maintenance tasks

### 2.4 Agreement Management

#### 2.4.1 Agreement Dashboard

**Component**: `Agreements.tsx`, `AgreementList.tsx`

**Purpose**: Provides an overview of all agreements and access to agreement management functions.

**Technical Specifications**:
- Uses React Query for data fetching
- Implements status-based filtering and search
- Displays key agreement metrics and status indicators

**Database Tables**: `leases`, `profiles`, `vehicles`

**API Endpoints**:
- `GET /agreements`: Retrieves list of agreements
- `GET /agreements/count`: Gets total agreement count
- `GET /agreements/search`: Searches agreements by criteria

**Reconstruction Steps**:
1. Create agreement dashboard layout and components
2. Implement filter and search functionality
3. Create agreement list display components
4. Add agreement status visualization
5. Implement key metric calculations and display

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

**API Endpoints**:
- `GET /agreements/{id}`: Retrieves detailed agreement information
- `PUT /agreements/{id}`: Updates agreement information
- `GET /agreements/{id}/documents`: Retrieves agreement documents
- `GET /agreements/{id}/payments`: Retrieves payment history
- `POST /agreements/{id}/renew`: Renews agreement

**Reconstruction Steps**:
1. Create agreement details view with sections for different data
2. Implement payment history tracking
3. Create document management functionality
4. Add agreement status update capabilities
5. Implement renewal and termination workflows

#### 2.4.3 Agreement Creation

**Component**: `CreateAgreementDialog.tsx`

**Purpose**: Guides staff through the process of creating new agreements.

**Technical Specifications**:
- Implements customer and vehicle selection
- Calculates pricing based on vehicle type and duration
- Generates agreement documents

**Database Tables**: `leases`, `agreement_templates`, `vehicles`, `profiles`

**API Endpoints**:
- `POST /agreements`: Creates new agreement
- `GET /templates`: Retrieves agreement templates
- `POST /agreements/{id}/documents`: Generates agreement documents

**Reconstruction Steps**:
1. Create multi-step agreement creation form
2. Implement customer and vehicle selection
3. Add pricing calculation logic
4. Create document generation functionality
5. Implement agreement validation and submission

### 2.5 Finance Management

#### 2.5.1 Finance Dashboard

**Component**: `FinanceDashboard.tsx`, `FinancialNavigation.tsx`

**Purpose**: Provides an overview of financial metrics and access to financial management functions.

**Technical Specifications**:
- Displays key financial indicators and charts
- Provides access to detailed financial reports
- Implements date range filtering for financial data

**Database Tables**: `unified_payments`, `transaction_amounts`

**API Endpoints**:
- `GET /finance/dashboard`: Retrieves dashboard metrics
- `GET /finance/metrics`: Retrieves financial metrics
- `GET /finance/charts`: Retrieves chart data

**Reconstruction Steps**:
1. Create finance dashboard layout and components
2. Implement financial metric calculations
3. Create chart visualization components
4. Add date range filtering functionality
5. Implement navigation to detailed finance views

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

**API Endpoints**:
- `GET /transactions`: Retrieves transaction list
- `POST /transactions`: Creates new transaction
- `POST /transactions/import`: Imports transactions from CSV
- `POST /transactions/reconcile`: Reconciles transactions

**Reconstruction Steps**:
1. Create transaction management interface
2. Implement CSV import functionality
3. Create transaction validation and processing
4. Add reconciliation logic
5. Implement transaction reporting

#### 2.5.3 Virtual CFO

**Component**: `VirtualCFO.tsx`

**Purpose**: Provides AI-powered financial insights and recommendations.

**Technical Specifications**:
- Implements financial forecasting algorithms
- Generates cost-saving recommendations
- Provides scenario analysis for financial decisions

**Database Tables**: `business_insights`, `expense_analysis`, `financial_goals`

**API Endpoints**:
- `GET /insights`: Retrieves business insights
- `GET /forecasts`: Retrieves financial forecasts
- `POST /scenarios`: Creates scenario analysis

**Reconstruction Steps**:
1. Create virtual CFO dashboard interface
2. Implement financial forecasting algorithms
3. Create insight generation functionality
4. Add recommendation system
5. Implement scenario analysis tools

#### 2.5.4 Car Installment Management

**Component**: `CarInstallments.tsx`, `CarInstallmentDetails.tsx`

**Purpose**: Manages vehicle installment payments and tracking.

**Technical Specifications**:
- Tracks installment schedules and payments
- Provides overdue payment monitoring
- Generates payment reminders

**Database Tables**: `car_installment_contracts`, `car_installment_payments`

**API Endpoints**:
- `GET /installments`: Retrieves installment contracts
- `GET /installments/{id}`: Retrieves specific contract details
- `POST /installments/reminders`: Generates payment reminders
- `GET /installments/overdue`: Retrieves overdue installments

**Reconstruction Steps**:
1. Create installment management interface
2. Implement payment schedule tracking
3. Create overdue payment monitoring
4. Add reminder generation functionality
5. Implement reporting for installment status

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

**API Endpoints**:
- `GET /traffic-fines`: Retrieves list of traffic fines
- `DELETE /traffic-fines`: Deletes all traffic fines
- `GET /traffic-fines/count`: Gets total traffic fines count

**Reconstruction Steps**:
1. Create traffic fines dashboard layout
2. Implement statistics display components
3. Create confirmation dialog for delete operations
4. Add error handling and loading states

#### 2.6.2 Traffic Fines List

**Component**: `TrafficFinesList.tsx`

**Purpose**: Displays a paginated, sortable, and filterable list of traffic fines.

**Technical Specifications**:
- Uses a responsive table layout with dynamic column sorting
- Implements status badges with contextual colors
- Provides tooltips for additional information
- Features copy-to-clipboard functionality

**Database Tables**: `traffic_fines`, `leases`, `vehicles`, `profiles`

**API Endpoints**:
- `GET /traffic-fines`: Retrieves list of traffic fines with filtering
- `GET /traffic-fines/{id}`: Retrieves specific fine details
- `PUT /traffic-fines/{id}`: Updates traffic fine status

**Reconstruction Steps**:
1. Create traffic fines list component with table layout
2. Implement sorting and filtering functionality
3. Add status badges and visual indicators
4. Create tooltip and copy-to-clipboard features
5. Implement pagination for large datasets

#### 2.6.3 Traffic Fine Import

**Component**: `TrafficFineImport.tsx`

**Purpose**: Provides functionality to import traffic fines from CSV files with validation and correction.

**Technical Specifications**:
- Uses custom hooks for import process management
- Implements CSV template download
- Features analysis of CSV data quality
- Provides filtering and sorting of imported data

**Database Tables**: `traffic_fines`, `import_logs`

**API Endpoints**:
- `POST /traffic-fines/import`: Imports traffic fines from CSV
- `GET /traffic-fines/template`: Downloads CSV template
- `POST /traffic-fines/validate`: Validates CSV data before import

**Reconstruction Steps**:
1. Create file upload component for CSV files
2. Implement CSV data validation and analysis
3. Create data correction interface for invalid entries
4. Add import progress tracking and reporting
5. Create template download functionality

### 2.7 Reporting System

#### 2.7.1 Reports Dashboard

**Component**: `ReportsDashboard.tsx`

**Purpose**: Provides access to various system reports and analytics.

**Technical Specifications**:
- Implements report generation with multiple formats (PDF, CSV)
- Provides scheduling for automated reports
- Features customizable report templates

**Database Tables**: `report_schedules`

**API Endpoints**:
- `GET /reports`: Retrieves available reports
- `POST /reports/generate`: Generates a specific report
- `GET /reports/schedules`: Retrieves scheduled reports
- `POST /reports/schedules`: Creates a new report schedule

**Reconstruction Steps**:
1. Create reports dashboard layout
2. Implement report generation functionality
3. Add export options for different formats
4. Create scheduling interface for automated reports
5. Implement report template customization

#### 2.7.2 Pending Payments Report

**Component**: `PendingPaymentsReport.tsx`

**Purpose**: Generates reports on pending payments across the system.

**Technical Specifications**:
- Filters payments by status, date range, and customer
- Calculates overdue amounts and days overdue
- Provides export functionality for follow-up

**Database Tables**: `unified_payments`, `leases`, `profiles`

**API Endpoints**:
- `GET /reports/pending-payments`: Retrieves pending payments data
- `POST /reports/pending-payments/export`: Exports report to PDF/CSV
- `POST /reports/pending-payments/reminders`: Generates payment reminders

**Reconstruction Steps**:
1. Create pending payments report interface
2. Implement filtering and sorting capabilities
3. Add calculation logic for overdue metrics
4. Create export functionality to different formats
5. Implement reminder generation for pending payments

#### 2.7.3 Traffic Fines Report

**Component**: `TrafficFinesReport.tsx`

**Purpose**: Generates detailed reports on traffic fines.

**Technical Specifications**:
- Groups fines by vehicle, customer, or time period
- Calculates fine statistics and trends
- Provides export functionality with detailed breakdowns

**Database Tables**: `traffic_fines`, `leases`, `vehicles`, `profiles`

**API Endpoints**:
- `GET /reports/traffic-fines`: Retrieves traffic fines data
- `POST /reports/traffic-fines/export`: Exports report to PDF/CSV
- `GET /reports/traffic-fines/statistics`: Retrieves statistical data

**Reconstruction Steps**:
1. Create traffic fines report interface
2. Implement grouping and aggregation functionality
3. Add chart and visualization components
4. Create export functionality to different formats
5. Implement trend analysis and projections

### 2.8 Legal Module

#### 2.8.1 Legal Case Management

**Component**: `Legal.tsx`, `LegalCasesList.tsx`

**Purpose**: Manages legal cases related to agreements, collections, and disputes.

**Technical Specifications**:
- Implements case status tracking and updates
- Provides document generation for legal communications
- Features reminder system for case follow-ups

**Database Tables**: `legal_cases`, `legal_communications`, `legal_documents`

**API Endpoints**:
- `GET /legal/cases`: Retrieves list of legal cases
- `GET /legal/cases/{id}`: Retrieves specific case details
- `POST /legal/cases`: Creates a new legal case
- `POST /legal/communications`: Creates legal communication
- `GET /legal/documents`: Retrieves legal documents

**Reconstruction Steps**:
1. Create legal case management interface
2. Implement case status tracking workflow
3. Create document generation for legal notices
4. Add reminder system for case follow-ups
5. Implement communication logging and tracking

#### 2.8.2 Legal Workflow Automation

**Component**: `WorkflowBuilder.tsx`, `AutomationSettings.tsx`

**Purpose**: Builds and manages automated workflows for legal processes.

**Technical Specifications**:
- Implements drag-and-drop workflow builder
- Provides template-based automation
- Features condition-based workflow branching

**Database Tables**: `workflow_templates`, `workflow_instances`, `workflow_automation_logs`

**API Endpoints**:
- `GET /workflows`: Retrieves workflow templates
- `POST /workflows`: Creates a new workflow template
- `GET /workflows/instances`: Retrieves workflow instances
- `POST /workflows/execute`: Executes a workflow instance

**Reconstruction Steps**:
1. Create workflow builder interface with drag-and-drop
2. Implement workflow template management
3. Create condition-based branching logic
4. Add workflow execution and monitoring
5. Implement workflow instance tracking

### 2.9 Settings & Configuration

#### 2.9.1 System Settings

**Component**: `Settings.tsx`

**Purpose**: Manages system-wide settings and configurations.

**Technical Specifications**:
- Implements settings categories and organization
- Provides user permissions management
- Features API integration configuration

**Database Tables**: `system_settings`, `permissions`

**API Endpoints**:
- `GET /settings`: Retrieves system settings
- `PUT /settings`: Updates system settings
- `GET /permissions`: Retrieves user permissions
- `PUT /permissions`: Updates user permissions

**Reconstruction Steps**:
1. Create settings interface with categories
2. Implement settings storage and retrieval
3. Create permissions management interface
4. Add API integration configuration
5. Implement settings validation logic

#### 2.9.2 Templates Management

**Component**: `AgreementTemplateManagement.tsx`, `WordTemplateManagement.tsx`

**Purpose**: Manages document templates for agreements and communications.

**Technical Specifications**:
- Implements template editing and versioning
- Provides variable mapping for dynamic content
- Features preview functionality for templates

**Database Tables**: `agreement_templates`, `word_templates`, `email_templates`

**API Endpoints**:
- `GET /templates`: Retrieves document templates
- `POST /templates`: Creates a new template
- `PUT /templates/{id}`: Updates existing template
- `GET /templates/{id}/preview`: Generates template preview

**Reconstruction Steps**:
1. Create template management interface
2. Implement template editor with variable insertion
3. Create template preview functionality
4. Add versioning for template changes
5. Implement variable mapping and substitution

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

### 4.3 Relationships

The database uses foreign keys to establish relationships between tables:

1. `profiles` is related to:
   - `leases` through the `customer_id` field
   - `legal_cases` through the `customer_id` field
   - `loyalty_points` through the `customer_id` field

2. `vehicles` is related to:
   - `leases` through the `vehicle_id` field
   - `maintenance` through the `vehicle_id` field
   - `traffic_fines` through the `vehicle_id` field

3. `leases` is related to:
   - `profiles` through the `customer_id` field
   - `vehicles` through the `vehicle_id` field
   - `unified_payments` through the `lease_id` field
   - `traffic_fines` through the `lease_id` field
   - `agreement_templates` through the `template_id` field

4. `agreement_templates` is related to:
   - `leases` through the `template_id` field

5. `car_installment_contracts` is related to:
   - `car_installment_payments` through the `contract_id` field

## 5. Edge Functions

### 5.1 process-traffic-fine-import

**Purpose**: Processes uploaded CSV files for traffic fine imports.

**API Endpoint**: `/functions/v1/process-traffic-fine-import`

**Input**: CSV file content from storage
**Output**: Processing result with counts and error details

**Implementation Details**:
- Parses CSV data using a streaming approach
- Validates each row against required fields
- Attempts to correct common errors in the data
- Creates traffic fine records in the database
- Returns detailed processing results including errors

### 5.2 process-agreement-import

**Purpose**: Processes uploaded agreement data for batch imports.

**API Endpoint**: `/functions/v1/process-agreement-import`

**Input**: CSV or JSON data with agreement details
**Output**: Import results with success/failure counts

**Implementation Details**:
- Supports both CSV and JSON import formats
- Validates agreement data against business rules
- Creates customer profiles if they don't exist
- Links agreements to vehicles and customers
- Handles duplicate agreement numbers
- Returns detailed import statistics

### 5.3 payment-service

**Purpose**: Handles payment processing, calculations, and reconciliation.

**API Endpoint**: `/functions/v1/payment-service`

**Input**: Payment data and operation type
**Output**: Processed payment result or calculation results

**Implementation Details**:
- Supports multiple payment methods
- Calculates late fees and penalties
- Updates agreement balances
- Reconciles imported payments with agreements
- Generates payment receipts and notifications
- Handles payment failures and retries

### 5.4 process-payment-reconciliation

**Purpose**: Reconciles payment records with agreements.

**API Endpoint**: `/functions/v1/process-payment-reconciliation`

**Input**: Payment ID to reconcile
**Output**: Reconciliation result with status

**Implementation Details**:
- Retrieves payment and agreement details
- Creates reconciliation record
- Updates payment status
- Returns detailed reconciliation result

### 5.5 process-overdue-payments

**Purpose**: Processes overdue payments and applies late fees.

**API Endpoint**: `/functions/v1/process-overdue-payments`

**Input**: None (scheduled execution)
**Output**: Processing results with counts

**Implementation Details**:
- Identifies active leases without payments
- Calculates late fees based on days overdue
- Creates payment records for late fees
- Returns detailed processing statistics

### 5.6 process-raw-financial-import

**Purpose**: Processes uploaded financial data for import.

**API Endpoint**: `/functions/v1/process-raw-financial-import`

**Input**: CSV file with financial transactions
**Output**: Import results with processing statistics

**Implementation Details**:
- Parses CSV financial data
- Normalizes field names and data types
- Creates financial import records
- Returns detailed import statistics

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

**Key Considerations**:
- Ensure proper session management and token storage
- Implement secure password handling
- Add forgotten password and account recovery flows
- Create role-based access control for different user types

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

**Key Considerations**:
- Design efficient customer search with multiple criteria
- Implement document scanning and verification
- Create secure storage for customer documents
- Design customer scoring algorithm based on payment history
- Implement duplicate detection and prevention

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

**Key Considerations**:
- Design efficient vehicle search with multiple criteria
- Implement maintenance reminder system
- Create document expiry tracking for vehicle documents
- Design vehicle availability calendar
- Implement vehicle location tracking integration

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

**Key Considerations**:
- Design efficient agreement search with multiple criteria
- Implement template-based document generation
- Create payment scheduling and tracking
- Design agreement status workflow management
- Implement renewal and extension processes

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

**Key Considerations**:
- Design comprehensive financial dashboard with KPIs
- Implement transaction import with validation
- Create financial forecast and analysis algorithms
- Design installment tracking and reminder system
- Implement financial reporting with export options

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

**Key Considerations**:
- Design efficient fine search with multiple criteria
- Implement CSV import with validation and error correction
- Create fine assignment workflow to agreements
- Design fine status tracking system
- Implement fine reporting and analysis

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

**Key Considerations**:
- Design case management workflow
- Implement document generation with templates
- Create reminder and notification system
- Design workflow automation with conditions
- Implement legal reporting and analytics

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

## 8. Data Flow and Integration Points

### 8.1 Data Flow Architecture

The system follows a layered architecture with clear data flow paths:

1. **User Interface Layer**:
   - React components for user interaction
   - Form handling and validation
   - UI state management

2. **Application Logic Layer**:
   - Business logic implementation
   - Data processing and transformation
   - Service communication

3. **Data Access Layer**:
   - API calls using React Query
   - Database operations through Supabase
   - Data caching and synchronization

4. **External Integration Layer**:
   - Third-party service integration
   - File import/export handling
   - External API communication

### 8.2 Key Integration Points

The system includes several integration points with external systems:

1. **Payment Gateways**:
   - Integration with payment processors
   - Transaction verification and reconciliation
   - Payment status tracking

2. **Document Processing**:
   - Integration with document scanning services
   - OCR for document text extraction
   - Document verification services

3. **Communication Services**:
   - Email notification integration
   - SMS alert services
   - Push notification systems

4. **Mapping and Location**:
   - Integration with mapping providers
   - Location tracking services
   - Geofencing capabilities

## 9. Deployment and Environment Configuration

### 9.1 Environment Variables

The system requires the following environment variables:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
API_BASE_URL=https://your-api-endpoint
```

### 9.2 Build and Deployment Process

The application is built and deployed using the following process:

1. **Development**:
   - Local development using npm/yarn start
   - Testing using Jest and React Testing Library
   - Code linting with ESLint

2. **Build**:
   - Static asset generation using Vite build
   - Environment-specific configuration
   - Bundle optimization

3. **Deployment**:
   - Static site hosting on Vercel/Netlify
   - Edge functions deployment to Supabase
   - Database migrations and seeding

### 9.3 Required Services

The application requires the following services:

1. **Supabase**:
   - Database storage
   - Authentication services
   - Edge function hosting
   - File storage

2. **Hosting Provider**:
   - Web application hosting
   - CDN for static assets
   - SSL certificate management

3. **Third-Party Services**:
   - Email service provider
   - Payment gateway integration
   - Document processing API

This architecture document provides a comprehensive guide to the system structure, covering all major modules. Follow the implementation steps and database requirements to recreate the functionality while maintaining the established patterns and best practices.
