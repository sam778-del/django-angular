# Angular Frontend Operational Workflow
## Layer-by-Layer Feature Implementation with Keycloak Authentication

---

## **LAYER 0: Foundation & Project Setup**

### Purpose
Establish the Angular project structure and containerized development environment.

### Activities
1. Clone existing Angular repository (or initialize new Angular project)
2. Verify Angular CLI version compatibility
3. Set up project directory structure (modules, components, services, guards)
4. Configure environment files (environment.ts, environment.prod.ts)
5. Install core dependencies (Angular Router, HTTP Client, Reactive Forms)
6. Create Dockerfile for development (optional, if containerized dev)
7. Create multi-stage Dockerfile for production build
8. Create nginx.conf for production serving
9. Configure .gitignore and version control
10. Set up TypeScript configuration (tsconfig.json)
11. Configure linting and formatting (ESLint, Prettier)

### Deliverables
- Angular project structure established
- Environment configuration files created
- Development and production Dockerfiles ready
- Nginx configuration for production serving
- Build system verified

### Verification
- `ng serve` runs successfully
- Application loads at http://localhost:4200
- No compilation errors
- Docker build completes successfully (if containerized)
- Production build generates dist folder

---

## **LAYER 1: Keycloak Client Integration**

### Purpose
Integrate Keycloak OpenID Connect authentication using Authorization Code Flow with PKCE.

### Activities
1. Install keycloak-angular and keycloak-js libraries
2. Create Keycloak initialization service
3. Configure Keycloak client settings in environment files
4. Implement APP_INITIALIZER for Keycloak initialization
5. Configure Keycloak initialization options (onLoad, checkLoginIframe, PKCE)
6. Set up Keycloak redirect URIs (login, logout callbacks)
7. Configure token refresh mechanism
8. Implement silent refresh strategy
9. Create authentication state service to track login status
10. Configure Keycloak client scope requirements
11. Handle authentication errors and failures
12. Implement logout functionality

### Deliverables
- Keycloak Angular module configured
- Authentication initialization working
- Login/logout flows functional
- Token refresh mechanism active
- Authentication state management

### Verification
- Keycloak initialization completes without errors
- User redirected to Keycloak login when unauthenticated
- Successful login redirects back to application
- Access token stored and accessible
- Token refresh works automatically
- Logout clears tokens and redirects properly

---

## **LAYER 2: Routing & Navigation Structure**

### Purpose
Create application routing structure with authentication guards.

### Activities
1. Define main application routes (public and protected)
2. Create authentication guard (checks if user is authenticated)
3. Create role-based authorization guards (admin, operator, viewer)
4. Implement route guards on protected routes
5. Create public routes (login callback, error pages)
6. Create protected route structure (dashboard, features)
7. Configure default redirects (authenticated vs unauthenticated)
8. Implement route change handling for authentication checks
9. Create unauthorized/forbidden page (403)
10. Create not found page (404)
11. Configure lazy loading for feature modules
12. Implement navigation menu structure

### Deliverables
- Complete routing configuration
- Authentication guards functional
- Role-based guards protecting routes
- Public and protected route separation
- Error pages implemented

### Verification
- Unauthenticated users redirected to login
- Authenticated users can access protected routes
- Role guards block unauthorized access
- Navigation between routes works smoothly
- Lazy loading reduces initial bundle size
- 403 and 404 pages display correctly

---

## **LAYER 3: HTTP Interceptor & API Integration**

### Purpose
Configure HTTP client to automatically include authentication tokens and handle API communication.

### Activities
1. Create HTTP interceptor for adding Bearer tokens to requests
2. Configure base API URL from environment variables
3. Implement automatic token attachment to API calls
4. Create error handling interceptor for API responses
5. Implement 401 Unauthorized handling (trigger re-authentication)
6. Implement 403 Forbidden handling (show error message)
7. Create loading indicator interceptor (optional)
8. Configure retry logic for failed requests (optional)
9. Implement request/response logging for debugging
10. Create API service base class for common functionality
11. Configure HTTP timeout handling
12. Implement network error handling

### Deliverables
- HTTP interceptor adding tokens automatically
- API base URL configurable via environment
- Error responses handled gracefully
- Loading states managed
- API service architecture established

### Verification
- API requests include Authorization header with Bearer token
- 401 responses trigger re-authentication
- 403 responses display appropriate error
- API calls reach Django backend successfully
- Network errors handled with user feedback

---

## **LAYER 4: Authentication State Management**

### Purpose
Centralize authentication state and user information management.

### Activities
1. Create authentication service to manage login state
2. Implement user profile retrieval from /api/me endpoint
3. Store user profile and roles in state management
4. Create observables for authentication state changes
5. Implement role checking methods (hasRole, hasAnyRole, isAdmin)
6. Create user profile model/interface
7. Implement automatic profile loading on login
8. Create login state persistence across page refreshes
9. Implement authentication state broadcast mechanism
10. Handle authentication state cleanup on logout
11. Create authentication helper utilities
12. Implement token expiration monitoring

### Deliverables
- Centralized authentication service
- User profile loaded from API
- Role checking utilities available
- Authentication state reactive and observable
- Helper methods for common auth operations

### Verification
- User profile loads automatically after login
- Roles accessible throughout application
- Authentication state updates propagate to components
- State persists across page refresh
- Logout clears all authentication state

---

## **LAYER 5: Layout & UI Framework Setup**

### Purpose
Establish core UI framework and application layout structure.

### Activities
1. Choose and install UI component library (Angular Material, PrimeNG, etc.)
2. Configure theme and styling system
3. Create main application shell component
4. Implement header/navigation bar component
5. Create sidebar/menu component
6. Implement footer component
7. Create responsive layout structure
8. Configure mobile-responsive breakpoints
9. Implement user menu (profile, logout)
10. Create breadcrumb navigation component
11. Implement notification/toast system
12. Configure global styles and CSS variables
13. Create loading spinner/progress indicators
14. Implement modal/dialog system

### Deliverables
- UI component library integrated
- Application shell with header, sidebar, content area
- Responsive layout working
- Navigation components functional
- Notification system ready
- Consistent styling across application

### Verification
- Application layout displays correctly
- Navigation menu shows based on user roles
- User menu displays user info and logout option
- Responsive design works on mobile devices
- Notifications display properly
- Modals/dialogs open and close correctly

---

## **LAYER 6: Feature Modules Structure**

### Purpose
Organize application into feature modules aligned with Django backend entities.

### Activities
1. Create feature module for Organizations/Tenants
2. Create feature module for Users management
3. Create feature module for Projects/Workspaces
4. Create feature module for Records/Items (main business objects)
5. Create feature module for Documents/Attachments
6. Create feature module for Audit Logs
7. Create feature module for Notifications
8. Create feature module for Reference Data (categories, tags)
9. Configure lazy loading for each feature module
10. Create shared module for common components/pipes/directives
11. Create core module for singleton services
12. Organize module routing
13. Implement feature module access based on roles

### Deliverables
- Feature modules created for all core entities
- Lazy loading configured
- Module organization clear and maintainable
- Shared and core modules established
- Role-based module access

### Verification
- Feature modules load on demand
- Module routes work correctly
- Shared components available across modules
- Services properly scoped (singleton vs module-level)
- Bundle size optimized with lazy loading

---

## **LAYER 7: Data Services & API Communication**

### Purpose
Create services for CRUD operations and API communication for each entity.

### Activities
1. Create service for each entity (OrganizationService, UserService, etc.)
2. Implement CRUD methods (getAll, getById, create, update, delete)
3. Create TypeScript interfaces/models for each entity
4. Implement API response typing
5. Configure pagination handling
6. Implement filtering and search functionality
7. Create sorting mechanism
8. Implement error handling in services
9. Create caching strategy for reference data
10. Implement optimistic updates (optional)
11. Create data transformation utilities
12. Implement file upload service for documents
13. Create API response wrapper/handler
14. Implement request cancellation for long operations

### Deliverables
- Service layer complete for all entities
- TypeScript models/interfaces defined
- CRUD operations functional
- Pagination, filtering, sorting implemented
- File upload working
- Error handling consistent

### Verification
- API calls return properly typed data
- CRUD operations work for all entities
- Pagination loads data in chunks
- Filtering and search return correct results
- File uploads complete successfully
- Errors handled and displayed to user

---

## **LAYER 8: List/Table Views**

### Purpose
Create list and table views for browsing entity data.

### Activities
1. Create list component for each entity
2. Implement data table with sorting and pagination
3. Add filtering/search UI components
4. Implement column configuration (show/hide columns)
5. Create action buttons (view, edit, delete)
6. Implement bulk selection (select all, select multiple)
7. Add export functionality (CSV, Excel - optional)
8. Implement empty state displays
9. Create loading states for data fetching
10. Add refresh/reload functionality
11. Implement row click navigation to detail view
12. Create custom filters for workflow states
13. Add role-based action visibility (e.g., delete only for admin)
14. Implement responsive table for mobile devices

### Deliverables
- List views for all entities
- Data tables with sorting and pagination
- Search and filtering functional
- Action buttons with proper permissions
- Loading and empty states
- Responsive design

### Verification
- Lists load data from API
- Sorting changes data order
- Pagination navigates through pages
- Search filters results correctly
- Action buttons respect user roles
- Empty states display when no data
- Mobile view is usable

---

## **LAYER 9: Detail/View Components**

### Purpose
Create detailed view components for viewing individual entity records.

### Activities
1. Create detail component for each entity
2. Implement read-only view of entity data
3. Display related entities (nested data)
4. Create tabbed interface for complex entities
5. Show audit trail for the entity
6. Display related documents/attachments
7. Implement entity status/workflow state display
8. Add breadcrumb navigation
9. Create action toolbar (edit, delete, status change)
10. Implement permission-based action visibility
11. Create print view (optional)
12. Add navigation to related entities
13. Implement data refresh mechanism
14. Create collapsible sections for large forms

### Deliverables
- Detail views for all entities
- Related data displayed correctly
- Audit trail visible
- Action toolbar with permissions
- Navigation to related records
- Print-friendly view (optional)

### Verification
- Detail pages load individual records
- All entity fields displayed
- Related entities shown correctly
- Audit trail displays change history
- Actions respect user permissions
- Navigation works to related records

---

## **LAYER 10: Create/Edit Forms**

### Purpose
Implement forms for creating and editing entity records.

### Activities
1. Create form component for each entity
2. Implement reactive forms with validation
3. Add field-level validation (required, pattern, custom)
4. Implement cross-field validation
5. Create form controls for different field types
6. Implement date pickers, dropdowns, autocomplete
7. Add file upload controls for documents
8. Implement dynamic form fields based on conditions
9. Create form submit handling with loading states
10. Implement error display for validation failures
11. Add unsaved changes warning (can deactivate guard)
12. Create form reset/cancel functionality
13. Implement auto-save functionality (optional)
14. Add field help text and tooltips
15. Implement dependent dropdowns (cascade)

### Deliverables
- Create and edit forms for all entities
- Form validation working client-side
- Different input types supported
- File uploads functional
- Unsaved changes detection
- User-friendly error messages

### Verification
- Forms submit data to API successfully
- Client-side validation prevents invalid submissions
- Server-side validation errors displayed
- File uploads attach correctly
- Unsaved changes warning appears
- Form reset clears data properly

---

## **LAYER 11: Workflow & Status Management**

### Purpose
Implement workflow state transitions and status management UI.

### Activities
1. Create workflow visualization component
2. Implement status change actions (approve, reject, submit)
3. Create confirmation dialogs for state transitions
4. Add transition history display
5. Implement permission checks for transitions
6. Create status badge/chip components
7. Add comments/notes on status changes
8. Implement notification on status changes
9. Create workflow progress indicator
10. Add bulk status change functionality
11. Implement workflow rules visualization
12. Create status filter in list views
13. Add workflow-based routing (inbox, pending, completed)

### Deliverables
- Workflow state transitions functional
- Status change UI implemented
- Transition permissions enforced
- Workflow history visible
- Status-based filtering and routing

### Verification
- Status transitions work correctly
- Invalid transitions blocked
- Confirmation required for critical changes
- History shows all transitions
- Notifications sent on status change
- Filters work by workflow state

---

## **LAYER 12: Document Management**

### Purpose
Implement file upload, viewing, and management functionality.

### Activities
1. Create file upload component (drag-and-drop)
2. Implement multi-file upload
3. Add file type validation
4. Implement file size limit checking
5. Create upload progress indicator
6. Implement file preview (images, PDFs)
7. Create file download functionality
8. Add file deletion with confirmation
9. Implement file metadata display (name, size, upload date)
10. Create file version management (optional)
11. Add file search/filtering
12. Implement file categorization/tagging
13. Create thumbnail generation for images (backend dependency)
14. Add file viewer modal

### Deliverables
- File upload component functional
- Multi-file upload working
- File previews available
- Download and delete operations working
- File metadata displayed
- File viewer for common formats

### Verification
- Files upload successfully
- Upload progress displays
- File type validation prevents invalid uploads
- File size limits enforced
- Downloaded files open correctly
- Delete removes files from server
- Preview/viewer displays files properly

---

## **LAYER 13: Search & Filtering**

### Purpose
Implement comprehensive search and filtering across entities.

### Activities
1. Create global search component in header
2. Implement entity-specific search forms
3. Add advanced filter panels (collapsible)
4. Create date range filters
5. Implement multi-select filters
6. Add text search with debounce
7. Create filter tags/chips to show active filters
8. Implement save filter preferences (local storage)
9. Add clear all filters functionality
10. Create search result highlighting
11. Implement search across multiple entities (optional)
12. Add filter presets (e.g., "My items", "Pending approval")
13. Create exportable search results

### Deliverables
- Search functionality working
- Advanced filters functional
- Filter state management
- Saved filter preferences
- Clear filter options
- Filter UI intuitive

### Verification
- Search returns relevant results
- Filters narrow down results correctly
- Multiple filters combine properly (AND logic)
- Filter state persists during session
- Clear filters resets to default view
- Saved filters load correctly

---

## **LAYER 14: Notifications & Alerts**

### Purpose
Implement in-app notification system and user alerts.

### Activities
1. Create notification service
2. Implement notification bell/icon in header
3. Create notification dropdown/panel
4. Add notification list with pagination
5. Implement unread count badge
6. Create notification types (info, warning, error, success)
7. Add mark as read functionality
8. Implement mark all as read
9. Create notification preferences (optional)
10. Add real-time notification updates (polling or WebSocket)
11. Implement notification filtering (by type, date)
12. Create notification detail view
13. Add notification actions (e.g., "View item")
14. Implement notification deletion

### Deliverables
- Notification system functional
- Notification UI in header
- Unread count displayed
- Notification actions working
- Mark as read functionality
- Notification preferences (optional)

### Verification
- Notifications display in dropdown
- Unread count updates correctly
- Mark as read changes status
- Notification links navigate to relevant entities
- New notifications appear automatically
- Notification list paginates properly

---

## **LAYER 15: Dashboard & Analytics**

### Purpose
Create dashboard with key metrics and data visualizations.

### Activities
1. Create main dashboard component
2. Implement widget-based layout
3. Add chart library (Chart.js, ng2-charts, etc.)
4. Create KPI cards (counts, summaries)
5. Implement charts (bar, line, pie, donut)
6. Add recent activity feed
7. Create task/action items widget
8. Implement role-based dashboard customization
9. Add date range selector for metrics
10. Create drill-down functionality from charts
11. Implement dashboard refresh
12. Add export dashboard data (optional)
13. Create responsive dashboard layout
14. Implement dashboard widgets configuration (drag-and-drop - optional)

### Deliverables
- Dashboard displaying key metrics
- Charts visualizing data
- Widget-based modular design
- Role-specific dashboard views
- Interactive charts with drill-down
- Responsive layout

### Verification
- Dashboard loads with correct data
- Charts render properly
- KPIs show accurate counts
- Recent activity displays
- Date range filter updates data
- Dashboard adapts to screen size

---

## **LAYER 16: User Profile & Settings**

### Purpose
Implement user profile management and application settings.

### Activities
1. Create user profile page
2. Display user information from Keycloak and /api/me
3. Implement profile edit functionality (if allowed)
4. Create password change redirect to Keycloak
5. Add user preferences settings
6. Implement theme selection (light/dark mode)
7. Create language selection (if multi-language)
8. Add notification preferences
9. Implement timezone selection
10. Create account security settings view
11. Add session management (view active sessions)
12. Implement account deletion request (if applicable)
13. Create user activity log view
14. Add API key management (if applicable)

### Deliverables
- User profile page functional
- Profile edit working (where allowed)
- User preferences saved
- Theme switching operational
- Settings persist across sessions

### Verification
- Profile page displays user data correctly
- Profile updates save successfully
- Password change redirects to Keycloak
- Theme changes apply immediately
- Preferences persist after logout/login

---

## **LAYER 17: Admin Features**

### Purpose
Implement administrative features for system management.

### Activities
1. Create admin module with dedicated routing
2. Implement user management interface
3. Add role assignment UI (via Keycloak admin API)
4. Create organization/tenant management
5. Implement reference data management (CRUD)
6. Add system settings configuration
7. Create audit log viewer with advanced filtering
8. Implement user activity monitoring
9. Add system health dashboard
10. Create backup/restore UI (trigger backend operations)
11. Implement bulk user operations
12. Add user impersonation (for support - optional)
13. Create system announcement/banner management
14. Implement feature flag management (optional)

### Deliverables
- Admin module with restricted access
- User management functional
- Role assignment working
- Reference data CRUD operational
- Audit log viewer functional
- System health monitoring

### Verification
- Only admin role can access admin module
- User management loads Keycloak users
- Role assignment updates in Keycloak
- Reference data changes save to database
- Audit logs display with filtering
- System health shows accurate status

---

## **LAYER 18: Error Handling & User Feedback**

### Purpose
Implement comprehensive error handling and user feedback mechanisms.

### Activities
1. Create global error handler
2. Implement toast/snackbar notification service
3. Add error page templates (400, 401, 403, 404, 500)
4. Create user-friendly error messages
5. Implement retry mechanisms for failed operations
6. Add connection status indicator
7. Create validation error display strategy
8. Implement logging service (client-side errors)
9. Add error reporting to backend (optional)
10. Create offline mode detection
11. Implement graceful degradation for missing features
12. Add confirmation dialogs for destructive actions
13. Create success feedback for operations
14. Implement undo functionality (where applicable)

### Deliverables
- Global error handler catching all errors
- Toast notifications for feedback
- Error pages for HTTP errors
- User-friendly error messages
- Offline detection working
- Confirmation dialogs on critical actions

### Verification
- Errors display user-friendly messages
- Toast notifications appear for actions
- Error pages display for HTTP errors
- Network errors detected and shown
- Confirmations prevent accidental deletions
- Success messages confirm operations

---

## **LAYER 19: Performance Optimization**

### Purpose
Optimize application performance and loading times.

### Activities
1. Implement lazy loading for all feature modules
2. Add OnPush change detection strategy to components
3. Implement virtual scrolling for large lists
4. Add pagination for all data tables
5. Implement image lazy loading
6. Create service worker for caching (optional)
7. Optimize bundle size (analyze with webpack-bundle-analyzer)
8. Implement preloading strategy for routes
9. Add HTTP caching headers configuration
10. Optimize asset loading (compress images, minify CSS/JS)
11. Implement debounce/throttle for search inputs
12. Add trackBy functions for ngFor loops
13. Optimize API calls (reduce redundant requests)
14. Implement state management for shared data (NgRx/Akita - optional)

### Deliverables
- Reduced bundle size
- Faster initial load time
- Improved runtime performance
- Optimized data loading
- Efficient change detection
- Cached resources (if service worker)

### Verification
- Lighthouse score improved
- Initial bundle size reduced
- Time to interactive decreased
- Large lists scroll smoothly
- Search doesn't trigger on every keystroke
- No unnecessary API calls

---

## **LAYER 20: Accessibility (a11y)**

### Purpose
Ensure application is accessible to users with disabilities.

### Activities
1. Add ARIA labels to interactive elements
2. Implement keyboard navigation for all features
3. Ensure proper heading hierarchy (h1, h2, h3)
4. Add focus indicators for keyboard navigation
5. Implement skip navigation links
6. Ensure color contrast meets WCAG standards
7. Add alt text for all images
8. Implement screen reader announcements for dynamic content
9. Create accessible form labels and error messages
10. Ensure modal dialogs trap focus
11. Add ARIA live regions for notifications
12. Implement accessible data tables
13. Test with screen reader (NVDA, JAWS, VoiceOver)
14. Add accessibility testing to CI pipeline (optional)

### Deliverables
- WCAG 2.1 AA compliance
- Full keyboard navigation support
- Screen reader compatible
- Accessible forms and tables
- Focus management proper
- Color contrast compliant

### Verification
- All features accessible via keyboard
- Screen reader announces content correctly
- Focus visible on all interactive elements
- Forms have proper labels
- Color contrast passes WCAG tools
- Accessibility audit (axe, Lighthouse) passes

---

## **LAYER 21: Internationalization (i18n) - Optional**

### Purpose
Support multiple languages and locales.

### Activities
1. Install Angular i18n or ngx-translate
2. Extract translatable strings
3. Create translation files for each language
4. Implement language switcher component
5. Configure default language
6. Implement language persistence (local storage)
7. Translate all UI labels and messages
8. Handle pluralization rules
9. Implement date/time localization
10. Configure number and currency formatting
11. Handle right-to-left (RTL) languages (if needed)
12. Create translation management workflow
13. Implement dynamic language loading
14. Add missing translation handling

### Deliverables
- Multi-language support functional
- Translation files complete
- Language switcher working
- Date/time/number formatting localized
- RTL support (if required)

### Verification
- Language switcher changes app language
- All UI text translates correctly
- Date and time formats change with locale
- Numbers and currency display correctly
- Missing translations handled gracefully
- Language preference persists

---

## **LAYER 22: Testing Strategy**

### Purpose
Implement comprehensive testing for reliability and maintainability.

### Activities
1. Set up unit testing framework (Jasmine/Jest)
2. Create unit tests for services
3. Write unit tests for components
4. Implement tests for pipes and directives
5. Set up integration testing
6. Create tests for HTTP interceptors
7. Implement authentication flow tests
8. Add form validation tests
9. Create routing and guard tests
10. Set up end-to-end testing (Cypress/Playwright)
11. Write E2E tests for critical user flows
12. Implement visual regression testing (optional)
13. Add code coverage reporting
14. Configure CI/CD pipeline for automated testing

### Deliverables
- Unit test coverage >80%
- Integration tests for services
- E2E tests for main workflows
- CI/CD pipeline running tests
- Code coverage reports
- Test documentation

### Verification
- All tests pass
- Coverage meets threshold
- E2E tests complete critical scenarios
- Tests run in CI/CD pipeline
- Failing tests block deployment

---

## **LAYER 23: Production Build & Deployment**

### Purpose
Prepare and deploy production-ready Angular application.

### Activities
1. Configure production environment variables
2. Optimize production build settings
3. Enable Ahead-of-Time (AOT) compilation
4. Configure build optimization (minification, tree-shaking)
5. Set up source maps for debugging (optional)
6. Create multi-stage Dockerfile
7. Configure Nginx for Angular routing (fallback to index.html)
8. Set up Nginx caching headers
9. Configure Nginx compression (gzip)
10. Implement security headers in Nginx (CSP, HSTS, X-Frame-Options)
11. Create docker-compose service for frontend
12. Configure environment variable substitution at runtime
13. Set up CI/CD pipeline for automated builds
14. Implement blue-green or rolling deployment strategy (optional)

### Deliverables
- Production build optimized
- Multi-stage Dockerfile functional
- Nginx configuration complete
- Security headers implemented
- Deployment automation ready
- Environment variables configurable

### Verification
- Production build completes successfully
- Docker image builds without errors
- Nginx serves application correctly
- All routes work (no 404 on refresh)
- Security headers present in responses
- Environment variables load correctly
- Application loads in production mode

---

## **LAYER 24: Documentation & Knowledge Transfer**

### Purpose
Create comprehensive documentation for developers and users.

### Activities
1. Create README.md with project overview
2. Document environment setup instructions
3. Write development guidelines and standards
4. Create component documentation with examples
5. Document API integration patterns
6. Write deployment procedures
7. Create user guide/manual
8. Document troubleshooting common issues
9. Create architecture diagrams
10. Write contribution guidelines
11. Document testing procedures
12. Create changelog and version history
13. Write security guidelines
14. Document accessibility features

### Deliverables
- Comprehensive README.md
- Developer documentation
- User manual
- Deployment guide
- Architecture documentation
- Contribution guidelines

### Verification
- New developers can set up project from README
- All features documented
- Deployment procedures tested
- User guide covers main workflows
- Documentation up-to-date with code

---

## **Implementation Sequence Summary**

```
Layer 0: Foundation (Project setup)
   ↓
Layer 1: Keycloak Integration (Authentication)
   ↓
Layer 2: Routing & Guards (Navigation)
   ↓
Layer 3: HTTP Interceptor (API communication)
   ↓
Layer 4: Auth State Management (User state)
   ↓
Layer 5: Layout & UI Framework (Shell)
   ↓
Layer 6: Feature Modules (Structure)
   ↓
Layer 7: Data Services (API layer)
   ↓
Layer 8: List Views (Browse data)
   ↓
Layer 9: Detail Views (View records)
   ↓
Layer 10: Forms (Create/Edit)
   ↓
Layer 11: Workflow Management (State transitions)
   ↓
Layer 12: Document Management (File handling)
   ↓
Layer 13: Search & Filtering (Data discovery)
   ↓
Layer 14: Notifications (User alerts)
   ↓
Layer 15: Dashboard (Analytics)
   ↓
Layer 16: User Profile (Settings)
   ↓
Layer 17: Admin Features (Management)
   ↓
Layer 18: Error Handling (UX)
   ↓
Layer 19: Performance (Optimization)
   ↓
Layer 20: Accessibility (a11y)
   ↓
Layer 21: i18n (Localization) - Optional
   ↓
Layer 22: Testing (Quality)
   ↓
Layer 23: Production Build (Deployment)
   ↓
Layer 24: Documentation (Knowledge transfer)
```

---

## **Key Integration Points**

### Angular ↔ Keycloak Flow
1. Application initializes Keycloak in APP_INITIALIZER
2. Keycloak checks authentication status (checkSSO or login-required)
3. If not authenticated, redirect to Keycloak login page
4. User enters credentials in Keycloak
5. Keycloak redirects back with authorization code
6. Keycloak-angular exchanges code for tokens (PKCE flow)
7. Access token stored in memory (or sessionStorage)
8. Token automatically attached to API calls via interceptor
9. Token refreshed automatically before expiration
10. On logout, Keycloak session terminated

### Angular ↔ Django API Flow
1. User action triggers API call (e.g., fetch records)
2. Service method called (e.g., recordService.getAll())
3. HTTP interceptor adds Bearer token to Authorization header
4. Request sent to Django API endpoint
5. Django validates token and checks permissions
6. Django returns data or error response
7. Interceptor handles response (success or error)
8. Service transforms data and returns Observable
9. Component subscribes and updates UI
10. Error interceptor shows user-friendly message if failed

### Component Communication Patterns
```
Parent Component
    ↓ @Input()
Child Component
    ↑ @Output() EventEmitter
Parent Component

Service (Shared State)
    ↓ Observable
Component A    Component B
```

---

## **Directory Structure**

```
src/
├── app/
│   ├── core/                          # Singleton services, guards, interceptors
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   ├── role.guard.ts
│   │   │   └── can-deactivate.guard.ts
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts
│   │   │   ├── error.interceptor.ts
│   │   │   └── loading.interceptor.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── theme.service.ts
│   │   └── core.module.ts
│   │
│   ├── shared/                        # Shared components, pipes, directives
│   │   ├── components/
│   │   │   ├── confirm-dialog/
│   │   │   ├── file-upload/
│   │   │   └── loading-spinner/
│   │   ├── pipes/
│   │   │   ├── date-format.pipe.ts
│   │   │   └── role-label.pipe.ts
│   │   ├── directives/
│   │   │   └── has-role.directive.ts
│   │   └── shared.module.ts
│   │
│   ├── features/                      # Feature modules
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── dashboard-routing.module.ts
│   │   │   └── dashboard.module.ts
│   │   ├── organizations/
│   │   │   ├── components/
│   │   │   │   ├── organization-list/
│   │   │   │   ├── organization-detail/
│   │   │   │   └── organization-form/
│   │   │   ├── services/
│   │   │   │   └── organization.service.ts
│   │   │   ├── models/
│   │   │   │   └── organization.model.ts
│   │   │   ├── organizations-routing.module.ts
│   │   │   └── organizations.module.ts
│   │   ├── projects/
│   │   ├── records/
│   │   ├── documents/
│   │   ├── audit-logs/
│   │   ├── users/
│   │   └── admin/
│   │
│   ├── layout/                        # Layout components
│   │   ├── header/
│   │   ├── sidebar/
│   │   ├── footer/
│   │   └── main-layout/
│   │
│   ├── app-routing.module.ts
│   ├── app.component.ts
│   └── app.module.ts
│
├── assets/                            # Static assets
│   ├── images/
│   ├── icons/
│   └── i18n/
│
├── environments/
│   ├── environment.ts                 # Development config
│   └── environment.prod.ts            # Production config
│
└── styles/                            # Global styles
    ├── _variables.scss
    ├── _themes.scss
    └── styles.scss
```

---

## **Environment Configuration**

### Development (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'app-realm',
    clientId: 'angular-frontend'
  },
  features: {
    enableNotifications: true,
    enableAnalytics: false
  }
};
```

### Production (environment.prod.ts)
```typescript
export const environment = {
  production: true,
  apiUrl: '/api',  // Same domain, served by Nginx
  keycloak: {
    url: 'https://yourdomain.com/auth',
    realm: 'app-realm',
    clientId: 'angular-frontend'
  },
  features: {
    enableNotifications: true,
    enableAnalytics: true
  }
};
```

### Runtime Environment Variables (for Docker)
```javascript
// Runtime configuration loaded from /assets/config.json
// Generated at container startup from environment variables
{
  "apiUrl": "${API_URL}",
  "keycloakUrl": "${KEYCLOAK_URL}",
  "keycloakRealm": "${KEYCLOAK_REALM}",
  "keycloakClientId": "${KEYCLOAK_CLIENT_ID}"
}
```

---

## **Docker Configuration**

### Multi-stage Dockerfile
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/app-name /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Angular routing - all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker Entrypoint (for runtime config)
```bash
#!/bin/sh
# Replace environment variables in config.json
envsubst < /usr/share/nginx/html/assets/config.template.json > /usr/share/nginx/html/assets/config.json
exec "$@"
```

### Docker Compose Service
```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  ports:
    - "80:80"
  environment:
    - API_URL=http://backend:8000/api
    - KEYCLOAK_URL=http://keycloak:8080
    - KEYCLOAK_REALM=app-realm
    - KEYCLOAK_CLIENT_ID=angular-frontend
  depends_on:
    - backend
    - keycloak
```

---

## **Authentication Implementation Details**

### Keycloak Initialization (app.module.ts)
```typescript
function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html',
        checkLoginIframe: false,
        pkceMethod: 'S256'
      },
      enableBearerInterceptor: true,
      bearerPrefix: 'Bearer',
      bearerExcludedUrls: ['/assets', '/api/health']
    });
}

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    }
  ]
})
export class AppModule { }
```

### Authentication Guard
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private keycloak: KeycloakService,
    private router: Router
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const authenticated = await this.keycloak.isLoggedIn();
    
    if (!authenticated) {
      await this.keycloak.login({
        redirectUri: window.location.origin + route.url.join('/')
      });
      return false;
    }
    
    return true;
  }
}
```

### Role Guard
```typescript
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private keycloak: KeycloakService,
    private router: Router,
    private notification: NotificationService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const requiredRoles = route.data['roles'] as string[];
    const userRoles = this.keycloak.getUserRoles();
    
    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      this.notification.error('You do not have permission to access this page');
      this.router.navigate(['/forbidden']);
      return false;
    }
    
    return true;
  }
}
```

### HTTP Interceptor
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private keycloak: KeycloakService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip for health check and public endpoints
    if (req.url.includes('/health') || req.url.includes('/assets')) {
      return next.handle(req);
    }

    const token = this.keycloak.getKeycloakInstance().token;
    
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }
    
    return next.handle(req);
  }
}
```

---

## **State Management Strategy**

### Simple Service-Based State (Recommended for Small-Medium Apps)
```
AuthService - Authentication state, user profile
NotificationService - Notification state
ThemeService - UI theme state
ConfigService - Application configuration
```

### Advanced State Management (NgRx/Akita - for Large Apps)
```
Store
├── Auth State
│   ├── user profile
│   ├── roles
│   └── authentication status
├── Entities State
│   ├── organizations
│   ├── projects
│   └── records
└── UI State
    ├── theme
    ├── sidebar collapsed
    └── notification preferences
```

---

## **Routing Structure**

```typescript
const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'organizations',
        loadChildren: () => import('./features/organizations/organizations.module').then(m => m.OrganizationsModule),
        canActivate: [RoleGuard],
        data: { roles: ['admin', 'operator'] }
      },
      {
        path: 'projects',
        loadChildren: () => import('./features/projects/projects.module').then(m => m.ProjectsModule)
      },
      {
        path: 'records',
        loadChildren: () => import('./features/records/records.module').then(m => m.RecordsModule)
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule)
      }
    ]
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];
```

---

## **Common Patterns & Best Practices**

### Component Communication
1. **Parent to Child**: Use `@Input()` decorator
2. **Child to Parent**: Use `@Output()` with EventEmitter
3. **Sibling Components**: Use shared service with BehaviorSubject/Observable
4. **Distant Components**: Use state management or event bus

### HTTP Error Handling
```
Error Interceptor
    ↓
├─ 401 → Trigger re-authentication
├─ 403 → Show "Access Denied" message
├─ 404 → Show "Not Found" message
├─ 500 → Show "Server Error" message
└─ Network Error → Show "Connection Failed" message
```

### Form Validation Strategy
1. Client-side validation for immediate feedback
2. Server-side validation for security
3. Display errors below fields
4. Disable submit until valid
5. Show success message on successful save

### Loading States
```
Initial → Loading → Success
                 → Error (with retry option)
```

### Lazy Loading Strategy
```
Immediate Load: Core, Shared, Layout
Lazy Load: All feature modules
Preload: Dashboard (after initial load)
```

---

## **Performance Best Practices**

1. **Use OnPush change detection** for presentational components
2. **Implement trackBy** in ngFor loops
3. **Lazy load** feature modules
4. **Virtual scrolling** for long lists
5. **Debounce** search inputs
6. **Cache** reference data
7. **Pagination** instead of loading all data
8. **Optimize images** (compress, lazy load)
9. **Bundle size** analysis and optimization
10. **Avoid memory leaks** (unsubscribe from Observables)

---

## **Security Best Practices**

1. **Never store sensitive data** in localStorage (use memory or sessionStorage for tokens)
2. **Sanitize user input** (Angular does this by default)
3. **Use HTTPS** in production
4. **Implement CSP headers** via Nginx
5. **Validate on server** (never trust client validation alone)
6. **Check permissions** on both client and server
7. **Handle token expiration** gracefully
8. **Logout on sensitive actions** (optional)
9. **Clear sensitive data** on logout
10. **Regular dependency updates** for security patches

---

## **Testing Checklist**

### Unit Testing
- [ ] All services have unit tests
- [ ] All components have unit tests
- [ ] All pipes have unit tests
- [ ] All guards have unit tests
- [ ] Code coverage >80%

### Integration Testing
- [ ] HTTP interceptors tested
- [ ] Form validation tested
- [ ] Routing tested
- [ ] Guards tested with mock auth

### E2E Testing
- [ ] Login flow tested
- [ ] CRUD operations tested for main entities
- [ ] Workflow transitions tested
- [ ] File upload tested
- [ ] Search and filtering tested
- [ ] Admin operations tested

### Accessibility Testing
- [ ] Keyboard navigation tested
- [ ] Screen reader tested
- [ ] Color contrast verified
- [ ] ARIA labels verified

### Performance Testing
- [ ] Lighthouse score >90
- [ ] Bundle size within limits
- [ ] Load time <3 seconds
- [ ] No memory leaks

---

## **Deployment Checklist**

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Environment variables configured
- [ ] Production build successful
- [ ] Security headers configured
- [ ] SSL certificates ready (if HTTPS)
- [ ] API endpoints verified
- [ ] Keycloak realm configured

### Deployment
- [ ] Build Docker image
- [ ] Push to registry (if using)
- [ ] Deploy to server
- [ ] Verify services running
- [ ] Test login flow
- [ ] Test critical workflows
- [ ] Verify API connectivity

### Post-Deployment
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify SSL working (if HTTPS)
- [ ] Test from different browsers
- [ ] Test on mobile devices
- [ ] Notify users of deployment

---

## **Maintenance Tasks**

### Daily
- Monitor error logs
- Check user feedback
- Verify login functionality

### Weekly
- Review and triage bug reports
- Update dependencies (minor versions)
- Check performance metrics
- Review accessibility reports

### Monthly
- Security audit
- Performance optimization review
- User analytics review
- Update documentation
- Dependency updates (major versions)

### Quarterly
- Architecture review
- Code quality audit
- User survey
- Feature planning
- Security penetration testing

---

This comprehensive workflow ensures systematic development of a production-ready Angular application with proper authentication, authorization, and integration with the Django backend via Keycloak.