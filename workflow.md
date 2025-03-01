
# Project Workflow Documentation

This document provides a comprehensive overview of all files in the project, their purpose, functionality, and their role within the system.

## Legend
- ✅ Protected file (cannot be modified)
- ⚠️ Copy/duplicate file
- ❌ Critical, non-copy, non-protected file

## Main Application Files

### src/main.tsx
❌ This is the entry point of the React application. It sets up the React root, configures the QueryClient with optimized caching settings, and wraps the application with necessary providers including:
- QueryClientProvider for React Query
- SessionContextProvider for Supabase authentication
- BrowserRouter for routing
- TooltipProvider for tooltips
- ErrorBoundary for error handling

### src/App.tsx
✅ The main application component that defines the routing structure and layout of the application. It contains the navigation sidebar and main content area.

### src/App.css
✅ Contains global CSS styles for the application.

## Routes and Pages

### src/routes/routes.tsx
❌ Defines all the routes for the application using lazy loading for better performance. This file exports route components for all major sections of the application including:
- Authentication
- Dashboard
- Vehicles
- Customers
- Agreements
- Finance
- Maintenance
- Reports
- Legal
- and more specialized sections

## Components

### Agreements Module

#### src/components/agreements/list/AgreementListHeader.tsx
❌ Provides the header section for the agreement list view. Contains search functionality, buttons for processing templates, exporting data, and creating new agreements. It manages the presentation of primary actions available to users in the agreement section.

#### src/components/agreements/CreateAgreementDialog.tsx
✅ Dialog component for creating new agreements. Contains a form with fields for agreement details and handles submission logic.

#### src/components/agreements/ProcessTemplatesDialog.tsx
✅ Dialog component for processing agreement templates. Allows users to select, view, and manage templates.

#### src/components/agreements/search/SearchInput.tsx
✅ Reusable search input component used across the application for filtering and searching through lists of data.

#### src/components/agreements/list/AgreementListContent.tsx
✅ Displays the actual list of agreements, handling the presentation of agreement items, pagination, and empty states.

#### src/components/agreements/list/CustomAgreementList.tsx
✅ A customized version of the agreement list with additional features or styling.

#### src/components/agreements/list/HeaderlessAgreementDemo.tsx
✅ A demonstration component showing agreements without a header, used for showcasing functionality.

#### src/components/agreements/list/HeaderlessAgreementList.tsx
✅ A version of the agreement list without the standard header, for use in contexts where the header is not needed or is provided separately.

#### src/components/agreements/hooks/useAgreements.ts
❌ Custom hook that manages fetching and state for agreements. It handles querying the Supabase database, error handling, and transforms the data for the UI components.

#### src/components/agreements/hooks/useAgreementDetails.ts
❌ Custom hook for fetching detailed information about a specific agreement, including related customer, vehicle, and payment information.

#### src/components/agreements/details/PaymentForm.tsx
❌ Form component for adding new payments to an agreement. Handles calculation of amounts, late fees, and submission to the database.

#### src/components/agreements/form/CustomerInformation.tsx
❌ Form section for customer information in the agreement creation process. Fetches customer details when selected and auto-fills relevant fields.

#### src/components/agreements/templates/AgreementTemplateSelect.tsx
❌ Component for selecting agreement templates. Fetches templates from the database and handles template selection logic.

#### src/components/agreements/form/LeaseToOwnFields.tsx
❌ Form fields specific to lease-to-own agreements. Contains fields for final price and down payment.

#### src/components/agreements/form/VehicleAgreementDetails.tsx
❌ Form section for vehicle and agreement details. Manages the vehicle selection process and related form state.

#### src/components/agreements/form/CustomerSelect.tsx
❌ Dropdown component for selecting customers. Fetches customers from the database and manages selection.

#### src/components/agreements/details/DamageAssessment.tsx
❌ Form component for reporting and assessing vehicle damage within an agreement. Handles submission of damage reports.

#### src/components/agreements/templates/AgreementTemplateManagement.tsx
❌ Management interface for agreement templates. Allows viewing, editing, creating, and deleting templates.

#### src/components/agreements/templates/TemplateList.tsx
❌ Component that displays a list of agreement templates with actions for previewing, editing, and deleting.

### Customer Module

#### src/components/customers/CustomerContent.tsx
❌ Main content component for the customer page. Manages view state (grid or table) and renders the appropriate view component.

#### src/components/customers/CustomerGrid.tsx
✅ Grid view for displaying customers as cards. Used for a more visual representation of customer data.

#### src/components/customers/ViewSwitcher.tsx
⚠️ Component for switching between grid and table views. This appears to be a copy of src/components/maintenance/ViewSwitcher.tsx, though both may be in use for different sections.

#### src/components/customers/table/CustomerTableHeader.tsx
✅ Defines the header row for the customer table view.

#### src/components/customers/table/CustomerTableRow.tsx
✅ Component for rendering individual customer rows in the table view.

#### src/components/customers/types/customer.ts
✅ TypeScript type definitions for customer data structures.

### Vehicle Module

#### src/components/vehicles/table/VehicleTableContent.tsx
❌ Renders the content of the vehicle table with editable cells for location and insurance information.

### Maintenance Module

#### src/components/maintenance/ViewSwitcher.tsx
❌ Toggle component for switching between grid and table views in the maintenance section.

#### src/components/maintenance/inspection/VehicleInspectionDialog.tsx
❌ Dialog for vehicle inspection workflow. Contains forms for recording inspection details, damage markers, fuel levels, and signatures.

### Legal Module

#### src/components/legal/document/DocumentHeader.tsx
❌ Header component for legal documents. Contains title, actions for printing and downloading.

#### src/components/legal/workflow/types/workflow.types.ts
❌ TypeScript type definitions for workflow templates and steps.

#### src/components/legal/workflow/hooks/useWorkflowTemplates.ts
❌ Custom hook for fetching workflow templates from the database.

#### src/components/legal/workflow/components/WorkflowForm.tsx
❌ Form component for creating or editing workflow templates.

#### src/components/legal/workflow/components/ExistingWorkflows.tsx
❌ Component for displaying existing workflow templates with options to select and edit.

### Finance Module

#### src/components/finance/car-installments/components/SinglePaymentForm.tsx
❌ Form component for adding a single payment installment. Includes AI analysis of payment details.

### UI Components

#### src/components/ui/button.tsx
✅ Reusable button component with various style variants and sizes. Used throughout the application.

#### src/components/ui/label.tsx
✅ Reusable label component for form fields.

#### src/components/ui/separator.tsx
✅ Component for creating visual separators between sections.

#### src/components/ui/card.tsx
✅ Reusable card component with header, title, description, content, and footer sections.

## Integration and Services

#### src/integrations/supabase/client.ts
❌ Configuration for the Supabase client that connects to the backend database. Contains the API URL and key.

## Configuration Files

### package.json
✅ Defines the project dependencies, scripts, and configuration.

### tsconfig.json
✅ TypeScript configuration file defining compiler options.

### tailwind.config.js
✅ Configuration for Tailwind CSS, including theme extensions and plugins.

### vite.config.ts
✅ Configuration for the Vite build tool.

## Public Assets

### public/favicon.ico
✅ The website favicon.

### public/manifest.json
✅ Web app manifest file for PWA functionality.

### public/service-worker.js
✅ Service worker for offline functionality and caching.

## Additional Notes

This project appears to be a comprehensive vehicle rental and management system with the following key features:

1. Customer management
2. Vehicle inventory and tracking
3. Agreement/contract management
4. Financial tracking and payments
5. Maintenance scheduling and reporting
6. Legal document processing
7. Workflow management

The architecture follows a React-based frontend with Supabase as the backend service. Component organization is modular, with separate sections for each major feature area. The application uses React Query for data fetching and state management, with custom hooks providing abstraction over the data layer.

Critical files (marked with ❌) are those that contain core business logic, data access patterns, or unique functionality that would be difficult to recreate if lost. Protected files (marked with ✅) are system files that should not be modified directly. Copy files (marked with ⚠️) contain duplicated functionality that appears in multiple places in the codebase.
