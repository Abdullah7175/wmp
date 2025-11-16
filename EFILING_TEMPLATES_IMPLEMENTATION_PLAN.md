# E-Filing Templates System Implementation Plan

## Overview
This document outlines the implementation plan for the e-filing templates system, allowing users to create, manage, and use document templates based on their department and role.

## Requirements Summary

### 1. Template Structure
- **Title**: Template title (e.g., "NOTESHEET")
- **Subject**: Template subject line
- **Main Content**: Main document content (rich text)
- **Template Type**: Type of template (e.g., "notesheet(I)", "notesheet(II)", "letter", "memo")

### 2. Access Control
- **Admin**: Can create templates for any department/role, can delete any template
- **Users**: Can create templates (auto-populated with their department/role), can edit their own templates, cannot delete templates

### 3. Template Filtering
Templates are filtered based on:
- User's department (`department_id`)
- User's role (`role_id`)
- Template type (optional filter)

### 4. Template Application
When a user selects a template in the edit page:
- Title field is populated
- Subject field is populated
- Main content field (TipTap editor) is populated
- User can then edit as needed

## Database Schema

### Table: `efiling_templates` (Extended)
```sql
- id (PK)
- name (template name)
- template_type (notesheet(I), notesheet(II), etc.)
- title (template title)
- subject (template subject)
- main_content (main document content)
- category_id (FK to efiling_file_categories)
- department_id (FK to efiling_departments) - NULL = all departments
- role_id (FK to efiling_roles) - NULL = all roles in department
- created_by (FK to efiling_users)
- is_system_template (boolean) - true for admin, false for user
- is_active (boolean)
- usage_count (integer) - track usage
- last_used_at (timestamp)
- created_at, updated_at
```

## Implementation Phases

### Phase 1: Database Migration ✅
- [x] Extend `efiling_templates` table with new columns
- [x] Add indexes for performance
- [x] Create view for filtered templates
- [x] Create function to track template usage
- [x] Add constraints and triggers

### Phase 2: Backend API
- [ ] Create API endpoint: `GET /api/efiling/templates`
  - Filter by department_id, role_id, template_type
  - Return templates accessible to current user
- [ ] Create API endpoint: `POST /api/efiling/templates`
  - Admin: Can create for any department/role
  - User: Auto-populate department/role from user profile
- [ ] Create API endpoint: `PUT /api/efiling/templates/[id]`
  - Admin: Can edit any template
  - User: Can only edit their own templates
- [ ] Create API endpoint: `DELETE /api/efiling/templates/[id]`
  - Admin only
- [ ] Create API endpoint: `POST /api/efiling/templates/[id]/use`
  - Increment usage count when template is applied

### Phase 3: Admin UI
- [ ] Create admin page: `/efiling/templates`
  - List all templates
  - Filter by department, role, type
  - Create new template (admin can select department/role)
  - Edit template
  - Delete template (admin only)
- [ ] Add to sidebar: "Templates" under Departments section

### Phase 4: User Template Management
- [ ] Create user page: `/efilinguser/templates`
  - List user's templates
  - Create new template (department/role auto-populated)
  - Edit own templates
  - View template usage stats
- [ ] Add to sidebar: "My Templates"

### Phase 5: Template Selection in Edit Page
- [ ] Update `/efilinguser/files/[id]/edit-document/page.js`
  - Add template selector dropdown
  - Filter templates based on user's department/role
  - On template selection:
    - Populate title field
    - Populate subject field
    - Populate main content (TipTap editor)
  - Track template usage

### Phase 6: Template Preview
- [ ] Add preview functionality
  - Show template preview before applying
  - Display title, subject, and formatted content

## API Endpoints Specification

### GET /api/efiling/templates
**Query Parameters:**
- `department_id` (optional): Filter by department
- `role_id` (optional): Filter by role
- `template_type` (optional): Filter by template type
- `user_id` (optional): Filter templates created by user
- `include_system` (optional, default: true): Include system templates

**Response:**
```json
{
  "templates": [
    {
      "id": 1,
      "name": "Notesheet Type I",
      "template_type": "notesheet(I)",
      "title": "NOTESHEET",
      "subject": "REQUEST FOR ADMINISTRATIVE PRIOR APPROVAL...",
      "main_content": "The existing 15\" dia RCC sewerage line...",
      "department_id": 1,
      "department_name": "Water & Sewerage",
      "role_id": 5,
      "role_name": "Executive Engineer",
      "role_code": "WAT_XEN_SAF",
      "created_by": 10,
      "created_by_name": "John Doe",
      "is_system_template": true,
      "usage_count": 15,
      "last_used_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### POST /api/efiling/templates
**Body:**
```json
{
  "name": "Notesheet Type I",
  "template_type": "notesheet(I)",
  "title": "NOTESHEET",
  "subject": "REQUEST FOR ADMINISTRATIVE PRIOR APPROVAL...",
  "main_content": "The existing 15\" dia RCC sewerage line...",
  "category_id": 1,
  "department_id": 1,  // Optional for admin, auto-filled for users
  "role_id": 5,        // Optional for admin, auto-filled for users
  "is_system_template": false  // Auto-set based on user role
}
```

### PUT /api/efiling/templates/[id]
**Body:** Same as POST

### DELETE /api/efiling/templates/[id]
**Authorization:** Admin only

### POST /api/efiling/templates/[id]/use
**Purpose:** Track template usage
**Response:**
```json
{
  "success": true,
  "usage_count": 16
}
```

## Template Filtering Logic

### For Admin:
- Can see all templates
- Can filter by department, role, type

### For Regular Users:
- See templates where:
  - `department_id` matches user's department OR `department_id` IS NULL
  - `role_id` matches user's role OR `role_id` IS NULL
  - `is_active = true`
- See their own created templates regardless of department/role

## UI Components

### 1. Template Selector (Edit Page)
- Dropdown/Select component
- Grouped by template type
- Search/filter capability
- Preview option

### 2. Template Management (Admin)
- Table view with filters
- Create/Edit modal
- Delete confirmation

### 3. My Templates (User)
- List view
- Create/Edit forms
- Usage statistics

## Example Template Data

```json
{
  "name": "Notesheet Type I - Administrative Approval",
  "template_type": "notesheet(I)",
  "title": "NOTESHEET",
  "subject": "REQUEST FOR ADMINISTRATIVE PRIOR APPROVAL UNDER Rule-16 (a) (i) (ii) (A) of SPPRA Rule-2010 (Amended-Till to Date)",
  "main_content": "The existing 15\" dia RCC sewerage line has sunk at the subject location, causing severe overflow and miserable conditions for residents. Despite efforts to unclog the line, it has been confirmed that the line has sunk.\n\nThe situation poses a risk of infectious diseases, including polio virus, due to severe sewage overflows. Area representatives and the public have requesting emergency execution of the work.\n\nAforementioned, the matter was brought to the notice of the Chief Engineer (Sew) and Superintending Engineer (District East-A), who decided to execute the subject work on an emergency basis through (Special Quotation) to protect public health.\n\nIn this connection an estimate amounting to Rs. 7,22,111 /= to cover the costs was prepared and sent to M/s- TCI for checking and assessment, that was duly reviewed for amounting to Rs. 7,22,111 /=.\n\nThe case is hereby forwarded for obtaining administrative approval in accordance of Rule-16 (a) (i) (ii) (A) of SPPRA Rule-2010 (Amended-Till to Date) from the competent authority of KW&SC.\n\nThe expenditure shall be charged from B.G No. ______________ for the current financial year 2025-2026.\n\nSubmitted for approval please.",
  "department_id": 1,
  "role_id": 5
}
```

## Testing Scenarios

1. **Admin creates template for specific department/role**
2. **User creates template (auto-populated department/role)**
3. **User views templates filtered by their department/role**
4. **User applies template to file (fields populated)**
5. **User edits their own template**
6. **User cannot delete template (admin only)**
7. **Admin deletes template**
8. **Template usage tracking**

## Security Considerations

1. **Authorization checks**:
   - Users can only edit their own templates
   - Only admins can delete templates
   - Template filtering based on user's department/role

2. **Input validation**:
   - Validate template content
   - Sanitize HTML content
   - Limit template size

3. **Audit logging**:
   - Log template creation/editing/deletion
   - Track template usage

## Future Enhancements

1. Template variables/placeholders (e.g., {date}, {amount})
2. Template versioning
3. Template sharing between departments
4. Template categories/tags
5. Template import/export
6. Template approval workflow

