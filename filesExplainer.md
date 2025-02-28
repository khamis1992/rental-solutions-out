
# Project Files Explainer

This document provides an overview of all files in the project, organized by their folder structure. Each file includes a brief description and an importance indicator:

- 🟢 (Green): Highly important file, frequently imported/used across the project
- 🟡 (Yellow): Moderately important file, used in several places
- 🔴 (Red): Less critical file, used in limited contexts or utility functions

## Root Files

- `index.html` 🟢 - Main entry HTML file for the application
- `package.json` 🟢 - Node.js package configuration with dependencies and scripts
- `tsconfig.json` 🟢 - TypeScript configuration for the project
- `vite.config.ts` 🟢 - Vite build tool configuration
- `README.md` 🟡 - Project documentation and setup instructions
- `CHANGELOG.md` 🟡 - Tracks changes made to the project over time

## /src

### Root Files

- `main.tsx` 🟢 - Application entry point that renders the root React component
- `App.tsx` 🟢 - Main application component that sets up routing
- `App.css` 🟡 - Global CSS styles for the application
- `vite-env.d.ts` 🔴 - Type declarations for Vite environment

### /components

#### /agreements
- `AgreementDetailsDialog.tsx` 🟢 - Dialog showing detailed view of an agreement
- `AgreementFilters.tsx` 🟡 - Filters for agreements list view
- `AgreementHeader.tsx` 🟡 - Header component for agreement sections
- `AgreementImport.tsx` 🟡 - Handles importing agreements from external sources
- `AgreementList.tsx` 🟢 - Displays list of agreements
- `AgreementPDFImport.tsx` 🟡 - Handles PDF document import for agreements
- `AgreementStats.tsx` 🟡 - Shows statistics about agreements
- `BatchInvoiceDialog.tsx` 🟡 - Dialog for handling batch invoice creation
- `CreateAgreementDialog.tsx` 🟢 - Dialog for creating new agreements
- `CustomerDocuments.tsx` 🟡 - Manages documents related to customers
- `DeleteAgreementDialog.tsx` 🟡 - Confirmation dialog for deleting agreements
- `EnhancedAgreementList.tsx` 🟢 - Enhanced version of the agreement list with additional features
- `InvoiceDialog.tsx` 🟢 - Dialog for viewing and managing invoices
- `InvoiceView.tsx` 🟢 - Component for displaying invoice details
- `PaymentHistoryDialog.tsx` 🟡 - Shows payment history for an agreement
- `PaymentImport.tsx` 🟡 - Handles importing payment records
- `PaymentTrackingDialog.tsx` 🟡 - Dialog for tracking payments
- `ProcessTemplatesDialog.tsx` 🟡 - Manages agreement templates processing

##### /v2
- `AdvancedFilters.tsx` 🟢 - Enhanced filtering options for agreements
- `AgreementCard.tsx` 🟢 - Card component to display agreement summary
- `AgreementSummary.tsx` 🟢 - Summary view of agreement details
- `BulkOperations.tsx` 🟡 - Handles bulk actions on multiple agreements
- `EnhancedAgreementListV2.tsx` 🟢 - Version 2 of enhanced agreement list
- `EnhancedAgreementListV2Wrapper.tsx` 🟢 - Wrapper for enhanced agreement list v2
- `EnhancedViewToggle.tsx` 🟡 - Toggle between different view modes
- `ViewToggle.tsx` 🟢 - Component to switch between different view modes
- `types.ts` 🟢 - Type definitions for agreement components
- `utils.ts` 🟢 - Utility functions for agreement components

##### /v2-extended
- `AgreementCardExtended.tsx` 🟢 - Extended version of agreement card with more features
- `CustomAgreementSummary.tsx` 🟡 - Customizable agreement summary component
- `CustomBulkOperations.tsx` 🟡 - Customizable bulk operations for agreements
- `CustomFilters.tsx` 🟡 - Custom filtering options for agreements
- `EnhancedAgreementListApplication.tsx` 🟢 - Application-wide enhanced agreement list
- `ExtendedAgreementListWrapper.tsx` 🟢 - Wrapper for extended agreement list
- `index.ts` 🟢 - Exports from extended agreement components

##### /details
- `AgreementHeader.tsx` 🟡 - Header for agreement detail view
- `AgreementStatus.tsx` 🟡 - Displays and manages agreement status
- `AgreementStatusSelect.tsx` 🟡 - Dropdown for selecting agreement status
- `CustomerInfoCard.tsx` 🟡 - Displays customer information
- `DamageAssessment.tsx` 🟡 - Handles vehicle damage assessment
- `DocumentUpload.tsx` 🟡 - Component for uploading documents
- `InvoiceList.tsx` 🟡 - Displays list of invoices
- `LateFineActions.tsx` 🟡 - Actions for managing late fines
- `PaymentForm.tsx` 🟢 - Form for recording payments
- `PaymentHistory.tsx` 🟢 - Shows payment history
- `RentManagement.tsx` 🟡 - Manages rent payments and schedules
- `TrafficFines.tsx` 🟡 - Handles traffic fines associated with agreements
- `VehicleInfoCard.tsx` 🟡 - Displays vehicle information

##### /form
- `AgreementBasicInfo.tsx` 🟢 - Form section for basic agreement information
- `AgreementTemplateSelect.tsx` 🟡 - Component to select agreement templates
- `AgreementTypeSelect.tsx` 🟡 - Dropdown for selecting agreement types
- `CustomerInformation.tsx` 🟡 - Displays and collects customer information
- `CustomerSelect.tsx` 🟢 - Component for selecting customers
- `LateFeesPenaltiesFields.tsx` 🟡 - Form fields for late fees and penalties
- `LeaseToOwnFields.tsx` 🟡 - Form fields specific to lease-to-own agreements
- `VehicleAgreementDetails.tsx` 🟡 - Form section for vehicle details
- `VehicleSelect.tsx` 🟢 - Component for selecting vehicles

##### /hooks
- `useAgreementDetails.ts` 🟢 - Hook for fetching agreement details
- `useAgreementForm.ts` 🟢 - Hook for managing agreement form state
- `useAgreements.ts` 🟢 - Hook for fetching agreements list
- `useImportProcess.ts` 🟡 - Hook for managing import processes
- `useOverduePayments.ts` 🟡 - Hook for handling overdue payments
- `usePaymentForm.ts` 🟢 - Hook for managing payment form state
- `usePaymentHistory.ts` 🟢 - Hook for fetching payment history
- `usePaymentReconciliation.ts` 🟡 - Hook for reconciling payments
- `usePullAgreementData.ts` 🟡 - Hook for pulling agreement data

##### /search
- `AgreementSearchProvider.tsx` 🟡 - Context provider for agreement search
- `SearchInput.tsx` 🟢 - Input component for searching 
- `SearchableAgreements.tsx` 🟡 - Agreements list with search capability

##### /utils
- `agreementCalculations.ts` 🟢 - Utility functions for agreement calculations
- `csvUtils.ts` 🟡 - Utilities for handling CSV data
- `importUtils.ts` 🟡 - Utilities for import functions
- `invoiceUtils.ts` 🟢 - Utilities for invoice handling
- `paymentCalculations.ts` 🟢 - Utilities for payment calculations
- `retryUtils.ts` 🔴 - Utility functions for retry logic

#### /ui
- `accordion.tsx` 🟢 - Expandable accordion component
- `alert-dialog.tsx` 🟢 - Dialog for alerting users
- `button.tsx` 🟢 - Button component with various styles
- `calendar.tsx` 🟡 - Calendar component for date selection
- `card.tsx` 🟢 - Card container component
- `dialog.tsx` 🟢 - Modal dialog component
- `form.tsx` 🟢 - Form components and validation
- `input.tsx` 🟢 - Input field component
- `label.tsx` 🟢 - Label component for form fields
- `select.tsx` 🟢 - Select dropdown component
- `sidebar.tsx` 🟢 - Sidebar navigation component
- `table.tsx` 🟢 - Table component for data display
- `tabs.tsx` 🟢 - Tabbed interface component
- `toast.tsx` 🟢 - Toast notification component

#### /layout
- `DashboardHeader.tsx` 🟢 - Header component for dashboard
- `DashboardLayout.tsx` 🟢 - Main layout for dashboard views
- `DashboardSidebar.tsx` 🟢 - Sidebar navigation for dashboard
- `NotificationsButton.tsx` 🟡 - Button for displaying notifications
- `RouteWrapper.tsx` 🟡 - Wrapper for route components
- `SearchBox.tsx` 🟡 - Search component for global search

#### /dashboard
- `AlertDetailsDialog.tsx` 🟡 - Dialog showing detailed alerts
- `DashboardAlerts.tsx` 🟢 - Displays alerts on dashboard
- `DashboardStats.tsx` 🟢 - Statistical overview on dashboard
- `QuickActions.tsx` 🟢 - Quick action buttons on dashboard
- `RecentActivity.tsx` 🟡 - Shows recent activity
- `StatsCard.tsx` 🟢 - Card displaying statistics
- `VehicleStatusList.tsx` 🟢 - List showing vehicle statuses
- `WelcomeHeader.tsx` 🟡 - Welcome message header

#### /vehicles
- `CreateVehicleDialog.tsx` 🟢 - Dialog for creating new vehicles
- `DeleteVehicleDialog.tsx` 🟡 - Confirmation dialog for deleting vehicles
- `ImportVehicles.tsx` 🟡 - Handles importing vehicle data
- `VehicleDetails.tsx` 🟢 - Detailed view of vehicle information
- `VehicleDetailsDialog.tsx` 🟢 - Dialog showing vehicle details
- `VehicleGrid.tsx` 🟢 - Grid view of vehicles
- `VehicleList.tsx` 🟢 - List view of vehicles
- `VehicleStats.tsx` 🟡 - Shows statistics about vehicles

#### /customers
- `CreateCustomerDialog.tsx` 🟢 - Dialog for creating new customers
- `CustomerContent.tsx` 🟢 - Main content for customer view
- `CustomerDetailsDialog.tsx` 🟢 - Dialog showing customer details
- `CustomerDocumentUpload.tsx` 🟡 - Handles uploading customer documents
- `CustomerFilters.tsx` 🟡 - Filters for customer list
- `CustomerFormFields.tsx` 🟢 - Form fields for customer data
- `CustomerGrid.tsx` 🟢 - Grid view of customers
- `CustomerHeader.tsx` 🟡 - Header for customer views
- `CustomerList.tsx` 🟢 - List view of customers
- `CustomerStats.tsx` 🟡 - Shows statistics about customers

#### /finance
- `FinancialDashboard.tsx` 🟢 - Dashboard for financial overview
- `QuickActionsPanel.tsx` 🟡 - Panel with quick financial actions
- `charts/ExpenseBreakdownChart.tsx` 🟡 - Chart showing expense breakdown
- `charts/ProfitLossChart.tsx` 🟡 - Chart showing profit and loss
- `charts/RevenueChart.tsx` 🟡 - Chart showing revenue
- `payments/PaymentManagement.tsx` 🟢 - Management of payments
- `utils/paymentUtils.ts` 🟢 - Utilities for payment processing

#### /legal
- `CaseManagementHeader.tsx` 🟡 - Header for legal case management
- `CreateLegalCaseDialog.tsx` 🟡 - Dialog for creating legal cases
- `LegalCasesList.tsx` 🟢 - List of legal cases
- `LegalDocumentDialog.tsx` 🟡 - Dialog for managing legal documents
- `ViewLegalCaseDialog.tsx` 🟢 - Dialog for viewing legal case details

### /hooks
- `use-auth.ts` 🟢 - Authentication hook
- `use-customer-portal.ts` 🟡 - Hook for customer portal functionality
- `use-customer-stats.ts` 🟡 - Hook for customer statistics
- `use-debounce.ts` 🟡 - Hook for debouncing functions
- `use-touch-gestures.ts` 🟡 - Hook for handling touch gestures
- `use-view-mode.ts` 🟡 - Hook for managing view modes

### /lib
- `dateUtils.ts` 🟢 - Date formatting and manipulation utilities
- `formHelpers.ts` 🟡 - Helper functions for forms
- `paymentUtils.ts` 🟢 - Utility functions for payments
- `utils.ts` 🟢 - General utility functions

### /integrations
- `/supabase/client.ts` 🟢 - Supabase client configuration
- `/supabase/types.ts` 🟢 - Type definitions for Supabase

### /pages
- `AgreementCreate.tsx` 🟢 - Page for creating agreements
- `AgreementDetails.tsx` 🟢 - Page showing agreement details
- `Agreements.tsx` 🟢 - Main agreements listing page
- `Dashboard.tsx` 🟢 - Main dashboard page
- `Customers.tsx` 🟢 - Customers listing page
- `Finance.tsx` 🟢 - Financial management page
- `Legal.tsx` 🟡 - Legal management page
- `Settings.tsx` 🟡 - Application settings page
- `Vehicles.tsx` 🟢 - Vehicles listing page

### /types
- `agreement.types.ts` 🟢 - Type definitions for agreements
- `customer.ts` 🟢 - Type definitions for customers
- `vehicle.ts` 🟢 - Type definitions for vehicles
- `payment.types.ts` 🟢 - Type definitions for payments
- `json.types.ts` 🟡 - Type definitions for JSON structures

### /services
- `payment/paymentService.ts` 🟢 - Service for payment processing
- `supabase-api.ts` 🟢 - API service for Supabase interactions

### /routes
- `routes.tsx` 🟢 - Application route definitions
- `agreements.tsx` 🟡 - Routes specific to agreements

### /features
- `/agreements/AgreementsPage.tsx` 🟢 - Main page component for agreements
- `/agreements/components/AgreementCard.tsx` 🟢 - Agreement card component
- `/agreements/components/AgreementList.tsx` 🟢 - Agreement list component
- `/agreements/utils.ts` 🟡 - Utilities for agreement features
