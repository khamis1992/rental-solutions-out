
# System Architecture Documentation

## 1. System Overview

This document provides a comprehensive guide to the system architecture, focusing on the Traffic Fines Management module. The system is built using React with TypeScript, leveraging the following key technologies:

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Supabase Edge Functions
- **PDF Generation**: jsPDF, jspdf-autotable
- **Date Handling**: date-fns
- **Icons**: Lucide React

The architecture follows a component-based approach with clear separation of concerns between UI components, business logic, and data access layers.

## 2. Feature Documentation

### 2.1 Traffic Fines Management Module

#### 2.1.1 Traffic Fines Dashboard

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

#### 2.1.2 Traffic Fines List

**Component**: `TrafficFinesList.tsx`

**Purpose**: Displays a paginated, sortable, and filterable list of traffic fines.

**Technical Specifications**:
- Uses a responsive table layout with dynamic column sorting
- Implements status badges with contextual colors
- Provides tooltips for additional information
- Features copy-to-clipboard functionality

**Input/Output Behavior**:
- Input: 
  - `searchQuery`: String for filtering fines
  - `statusFilter`: Status filter (all, pending, completed, failed, refunded)
  - `sortField`: Field to sort by
  - `sortDirection`: Sort direction (asc/desc)
  - `onSort`: Callback function for sorting
- Output: Tabular display of traffic fines with interactive elements

**Key Functions**:
- `SortableHeader`: Sub-component for managing sortable table headers
- `getStatusBadgeStyle(status: string)`: Returns appropriate styling for status badges
- `copyToClipboard(text: string, type: string)`: Copies text to clipboard with notification

**Edge Cases Handled**:
- Empty state with guidance for the user
- Loading skeleton during data fetching
- Long text handling with truncation
- Responsive design for different screen sizes

#### 2.1.3 Traffic Fine Stats

**Component**: `TrafficFineStats.tsx`

**Purpose**: Displays statistical information about traffic fines, including counts and amounts.

**Technical Specifications**:
- Uses multiple React Query instances for different statistics
- Implements a bulk assignment function for unassigned fines
- Displays monetary values with proper formatting

**Input/Output Behavior**:
- Input: 
  - `agreementId`: Optional ID for filtering stats by agreement
  - `paymentCount`: Count of payments/fines
- Output: Statistical cards with fine counts and amounts

**Key Functions**:
- `handleBulkAssignment()`: Automatically assigns unassigned fines to appropriate leases based on vehicle and date matching

**Edge Cases Handled**:
- Zero count states
- Error handling for database operations
- Loading states during data fetching
- Error reporting for failed assignments

#### 2.1.4 Traffic Fine Import

**Component**: `TrafficFineImport.tsx`

**Purpose**: Provides functionality to import traffic fines from CSV files with AI-assisted validation and correction.

**Technical Specifications**:
- Uses custom hooks for import process management
- Implements CSV template download
- Features AI analysis of CSV data quality
- Provides filtering and sorting of imported data

**Input/Output Behavior**:
- Input: CSV file through file upload
- Output: 
  - Analysis results of the CSV
  - Imported fines in the list view
  - Error reporting for invalid data

**Key Functions**:
- `handleFileUpload(event)`: Processes the uploaded file
- `handleDownloadTemplate()`: Generates and downloads a CSV template
- `startImport()`: Initiates the import process
- `implementChanges()`: Applies the validated data to the database

**Edge Cases Handled**:
- Invalid CSV format detection
- Malformed data repair suggestions
- Loading states during processing
- Error reporting for failed imports

#### 2.1.5 CSV Analysis and Repair

**Utility Files**: 
- `csvAnalyzer.ts`
- `csvParser.ts`
- `dataRepair.ts`
- `repairUtils.ts`

**Purpose**: Analyzes CSV files for data quality issues and provides automatic repair functionality.

**Technical Specifications**:
- Implements sophisticated CSV parsing with quoted value handling
- Features date format detection and normalization
- Provides detailed error reporting
- Supports automatic data repair

**Input/Output Behavior**:
- Input: Raw CSV content
- Output: `CsvAnalysisResult` containing validation results and repair suggestions

**Key Functions**:
- `analyzeCsvContent(content, requiredHeaders)`: Main analysis function
- `parseCSVLine(line)`: Parses a single CSV line with proper handling of quotes and delimiters
- `repairDate(value)`: Attempts to normalize date formats
- `repairQuotes(line)`: Fixes issues with quotation marks in CSV
- `reconstructMalformedRow(currentRow, nextRow, expectedColumns)`: Attempts to fix rows with incorrect column counts

**Edge Cases Handled**:
- Unescaped quotes in CSV
- Inconsistent date formats
- Malformed rows (too few/many columns)
- Split rows due to newlines within quoted fields

#### 2.1.6 Manual Traffic Fine Entry

**Component**: `ManualTrafficFineDialog.tsx`

**Purpose**: Allows manual entry of traffic fines with agreement lookup.

**Technical Specifications**:
- Uses a modal dialog for data entry
- Implements real-time agreement lookup
- Features form validation

**Input/Output Behavior**:
- Input: Manual entry of fine details with agreement number
- Output: New traffic fine record in the database

**Key Functions**:
- `handleSubmit(e)`: Validates and submits the form data
- Agreement lookup query for vehicle and customer information

**Edge Cases Handled**:
- Invalid agreement numbers
- Form validation for required fields
- Loading states during submission
- Error reporting for failed submissions

### 2.2 Reporting Module

#### 2.2.1 Traffic Fines Report Utilities

**Utility File**: `trafficFinesReportUtils.ts`

**Purpose**: Provides utilities for generating and exporting traffic fines reports in various formats.

**Technical Specifications**:
- Implements CSV and PDF export functionality
- Features data aggregation by vehicle and customer
- Uses jsPDF for PDF generation with styling
- Generates summary statistics

**Input/Output Behavior**:
- Input: Database query results
- Output: Formatted reports in CSV or PDF format

**Key Functions**:
- `fetchVehicleTrafficFinesReport()`: Fetches and aggregates report data
- `exportVehicleTrafficFinesToCSV(vehicleReports, unassignedFines)`: Exports summary report to CSV
- `exportDetailedTrafficFinesToCSV(vehicleReports, unassignedFines)`: Exports detailed report to CSV
- `exportTrafficFinesToPDF(vehicleReports, unassignedFines, summary)`: Exports comprehensive report to PDF

**Edge Cases Handled**:
- Empty report handling
- Data formatting for different report types
- Multi-page PDF generation
- Section-based report organization

## 3. Component Interaction Map

### 3.1 Traffic Fines Module Flow

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

### 3.2 Data Flow

1. **User Interactions**:
   - Search/Filter/Sort: Updates state in `TrafficFinesDashboard` → Passed to `TrafficFinesList` → Triggers new query
   - File Upload: `FileUploadSection` → `useImportProcess` hook → Edge function → Database → Query invalidation
   - Bulk Assignment: `TrafficFineStats` → Database operations → Query invalidation
   - Manual Entry: `ManualTrafficFineDialog` → Database insertion → Query invalidation

2. **Data Fetching**:
   - React Query hooks in each component fetch data independently
   - Query keys ensure proper cache invalidation
   - Cache invalidation triggers re-renders with fresh data

3. **Edge Function Integration**:
   - CSV processing is offloaded to Edge Functions for scalability
   - Communication via Supabase Functions API
   - Data validation happens server-side

## 4. Database Schema

### 4.1 Primary Tables

#### traffic_fines
- `id`: UUID (Primary Key)
- `lease_id`: UUID (Foreign Key to leases)
- `serial_number`: Text
- `violation_number`: Text
- `violation_date`: Timestamp
- `license_plate`: Text
- `fine_location`: Text
- `fine_type`: Text
- `fine_amount`: Numeric
- `violation_points`: Integer
- `payment_status`: Enum ('pending', 'completed', 'failed', 'refunded')
- `assignment_status`: Enum ('pending', 'assigned')
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### leases
- `id`: UUID (Primary Key)
- `agreement_number`: Text
- `customer_id`: UUID (Foreign Key to profiles)
- `vehicle_id`: UUID (Foreign Key to vehicles)
- `start_date`: Timestamp
- `end_date`: Timestamp
- `status`: Enum

#### vehicles
- `id`: UUID (Primary Key)
- `make`: Text
- `model`: Text
- `year`: Integer
- `license_plate`: Text

#### profiles (customers)
- `id`: UUID (Primary Key)
- `full_name`: Text
- `phone_number`: Text
- `email`: Text
- `role`: Enum ('customer', 'staff', 'admin')

#### traffic_fine_imports
- `id`: UUID (Primary Key)
- `file_name`: Text
- `total_fines`: Integer
- `unassigned_fines`: Integer
- `processed_by`: UUID (Foreign Key to profiles)
- `import_errors`: JSONB
- `created_at`: Timestamp

### 4.2 Key Relationships

- Traffic Fines → Leases: Many-to-One relationship through `lease_id`
- Leases → Vehicles: Many-to-One relationship through `vehicle_id`
- Leases → Customers (Profiles): Many-to-One relationship through `customer_id`
- Traffic Fine Imports → Profiles: Many-to-One relationship through `processed_by`

## 5. Edge Functions

### 5.1 process-traffic-fine-import

**Purpose**: Processes uploaded CSV files for traffic fine imports.

**Components**:
- `index.ts`: Main entry point handling HTTP requests
- `dataProcessor.ts`: Handles CSV processing and database insertion
- `validators.ts`: Validates data against schema
- `csvParser.ts`: Parses and validates CSV lines

**Input**: CSV file content from storage
**Output**: Processing result with counts and error details

**API Endpoint**: `/functions/v1/process-traffic-fine-import`

**Key Functions**:
- `processCSVContent()`: Extracts headers and rows from CSV
- `insertTrafficFines()`: Inserts valid fines into the database
- `parseCSVRow()`: Parses individual CSV rows with proper handling
- `validateRow()`: Validates row structure
- `validateDate()`, `validateNumeric()`: Type-specific validators

## 6. Feature Recreation Guide

### 6.1 Traffic Fines Dashboard

**Database Requirements**:
- `traffic_fines` table with all required fields
- `leases` table with vehicle and customer relationships
- `vehicles` table with vehicle details
- `profiles` table with customer information

**Implementation Steps**:
1. Create the `TrafficFinesDashboard` component as the main container
2. Implement statistics display with `TrafficFineStats` and `StatsDisplay`
3. Add import functionality with `TrafficFineImport`
4. Create the fines list display with `TrafficFinesList`
5. Implement search, filter, and sort capabilities
6. Add the delete all confirmation dialog

**Key Database Queries**:
```typescript
// Count query
const { count } = await supabase
  .from('traffic_fines')
  .select('*', { count: 'exact', head: true });

// List query with filters and sorting
let query = supabase
  .from("traffic_fines")
  .select(`
    *,
    lease:leases(
      customer_id,
      vehicle:vehicles(make, model, year, license_plate)
    )
  `);

if (searchQuery) {
  query = query.or(`license_plate.ilike.%${searchQuery}%,violation_number.ilike.%${searchQuery}%`);
}

if (statusFilter !== "all") {
  query = query.eq("payment_status", statusFilter);
}

if (sortField) {
  query = query.order(sortField, { ascending: sortDirection === "asc" });
}
```

### 6.2 Traffic Fine Import

**Database Requirements**:
- `traffic_fines` table for storing imported fines
- `traffic_fine_imports` table for tracking import history
- Storage bucket for temporary CSV files

**Implementation Steps**:
1. Create the Edge Function for processing imports
2. Implement the CSV analysis utilities
3. Create the file upload component
4. Implement the import process hook
5. Add the AI analysis card for data quality feedback
6. Create the data repair utilities

**Key Database Operations**:
```typescript
// Insert fines in batches
for (const batch of batches) {
  const { error: insertError } = await supabase
    .from('traffic_fines')
    .insert(batch)
    .select();
}

// Log import results
const { error: logError } = await supabase
  .from('traffic_fine_imports')
  .insert({
    file_name: 'import_file',
    total_fines: fines.length,
    unassigned_fines: fines.length,
    processed_by: null,
    import_errors: errors.length > 0 ? errors : null,
  });
```

### 6.3 Traffic Fine Assignment

**Database Requirements**:
- `traffic_fines` table with `assignment_status` and `lease_id` fields
- `leases` table with date ranges and vehicle relationships
- `vehicles` table with license plate information

**Implementation Steps**:
1. Create bulk assignment functionality in `TrafficFineStats`
2. Implement license plate matching logic
3. Add date-based lease matching
4. Implement status updates for assigned fines

**Key Database Queries**:
```typescript
// Find vehicle by license plate
const { data: vehicles } = await supabase
  .from('vehicles')
  .select('id')
  .eq('license_plate', fine.license_plate)
  .limit(1);

// Find matching lease by date and vehicle
let query = supabase
  .from('leases')
  .select('id');

if (fine.vehicle_id) {
  query = query.eq('vehicle_id', fine.vehicle_id);
}

if (fine.violation_date) {
  query = query
    .lte('start_date', fine.violation_date)
    .gte('end_date', fine.violation_date);
}

// Update fine assignment
const { error: updateError } = await supabase
  .from('traffic_fines')
  .update({ 
    lease_id: leases[0].id,
    assignment_status: 'assigned'
  })
  .eq('id', fine.id);
```

### 6.4 Reporting Module

**Database Requirements**:
- All tables listed in section 4.1
- Proper relationships between tables for report aggregation

**Implementation Steps**:
1. Create the report utilities in `trafficFinesReportUtils.ts`
2. Implement data aggregation functions
3. Create CSV export utilities
4. Implement PDF generation with jsPDF
5. Add report UI components

**Key Database Queries**:
```typescript
// Fetch all traffic fines with relationships for reporting
const { data: fines, error } = await supabase
  .from('traffic_fines')
  .select(`
    *,
    lease:lease_id(
      id,
      agreement_number,
      customer_id,
      vehicle_id,
      customer:customer_id(
        id, 
        full_name
      ),
      vehicle:vehicle_id(
        id,
        make,
        model,
        year,
        license_plate
      )
    )
  `)
  .order('violation_date', { ascending: false });
```

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

This architecture document provides a comprehensive guide to the system structure, focusing on the Traffic Fines module. Follow the implementation steps and database requirements to recreate the functionality while maintaining the established patterns and best practices.
