# E-Filing Module Documentation

## Overview

The E-Filing Module is a comprehensive electronic filing management system designed following the standards and practices used by the Sindh and Federal Governments of Pakistan. This module provides a complete digital solution for managing government documents, files, and workflows.

## Features

### Core Features

1. **File Management**
   - Create, edit, and track electronic files
   - Automatic file numbering system (DEPT/YEAR/SEQUENTIAL)
   - File categorization and classification
   - Priority and confidentiality level management
   - Link files to work requests

2. **Department Management**
   - Hierarchical department structure
   - Department-specific file categories
   - User assignment by department
   - Department-wise reporting

3. **User Management**
   - Role-based access control
   - Department-specific user assignments
   - Supervisor-subordinate relationships
   - Employee ID management

4. **Workflow Management**
   - File status tracking (Draft, Pending, In Progress, etc.)
   - File movement and forwarding
   - Assignment and reassignment
   - Approval workflows

5. **E-Filing Tools**
   - Digital marker and pencil tools
   - Auto-paragraph generation
   - Digital stamps and signatures
   - Text boxes and shapes
   - Redaction tools

6. **Reporting & Analytics**
   - File status reports
   - Department-wise analytics
   - User activity tracking
   - Timeline reports

## Database Structure

### Core Tables

1. **efiling_departments** - Department hierarchy and information
2. **efiling_roles** - Role definitions with permissions
3. **efiling_users** - Extended user information for e-filing
4. **efiling_file_categories** - File categorization
5. **efiling_file_status** - File status definitions
6. **efiling_files** - Main file records
7. **efiling_documents** - File attachments and documents
8. **efiling_file_movements** - File movement history
9. **efiling_comments** - File comments and notes
10. **efiling_tools** - Available e-filing tools
11. **efiling_user_tools** - User tool permissions
12. **efiling_templates** - File templates

## API Endpoints

### Departments
- `GET /api/efiling/departments` - List all departments
- `POST /api/efiling/departments` - Create new department
- `PUT /api/efiling/departments` - Update department
- `DELETE /api/efiling/departments` - Delete department

### Files
- `GET /api/efiling/files` - List all files with filters
- `POST /api/efiling/files` - Create new file
- `PUT /api/efiling/files` - Update file
- `DELETE /api/efiling/files` - Delete file

### Categories
- `GET /api/efiling/categories` - List file categories
- `POST /api/efiling/categories` - Create category
- `PUT /api/efiling/categories` - Update category
- `DELETE /api/efiling/categories` - Delete category

### Status
- `GET /api/efiling/status` - List file statuses
- `POST /api/efiling/status` - Create status
- `PUT /api/efiling/status` - Update status
- `DELETE /api/efiling/status` - Delete status

### Users
- `GET /api/efiling/users` - List e-filing users
- `POST /api/efiling/users` - Create e-filing user
- `PUT /api/efiling/users` - Update e-filing user
- `DELETE /api/efiling/users` - Delete e-filing user

## File Structure

```
app/efiling/
├── layout.js              # Main layout with sidebar
├── page.js                # Dashboard
├── EFileSidebar.jsx       # Navigation sidebar
├── files/
│   ├── page.js            # Files management
│   └── new/
│       └── page.js        # Create new file
├── assignments/
│   └── page.js            # User assignments
├── departments/
│   ├── manage/
│   │   └── page.js        # Department management
│   └── users/
│       └── page.js        # Department users
├── tools/
│   ├── marker/
│   │   └── page.js        # Marker tool
│   ├── pencil/
│   │   └── page.js        # Pencil tool
│   ├── stamps/
│   │   └── page.js        # Digital stamps
│   ├── signatures/
│   │   └── page.js        # Digital signatures
│   └── templates/
│       └── page.js        # File templates
└── reports/
    ├── file-status/
    │   └── page.js        # File status reports
    ├── department/
    │   └── page.js        # Department reports
    ├── user-activity/
    │   └── page.js        # User activity reports
    └── timeline/
        └── page.js        # Timeline reports
```

## User Roles and Permissions

### E-Filing Roles

1. **File Clerk** - Basic file operations
2. **File Officer** - File management and assignment
3. **Department Head** - Department-wide file oversight
4. **System Administrator** - Full system access

### Permissions Matrix

| Role | Create Files | Edit Files | Delete Files | Assign Files | View Reports | Manage Users |
|------|-------------|------------|--------------|--------------|--------------|--------------|
| File Clerk | ✓ | ✓ | ✗ | ✗ | Limited | ✗ |
| File Officer | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Department Head | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| System Administrator | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## File Numbering System

Files are automatically numbered using the format: `DEPT/YEAR/SEQUENTIAL`

Example:
- `ADMIN/2024/0001` - First file in Admin department for 2024
- `FIN/2024/0005` - Fifth file in Finance department for 2024
- `HR/2024/0010` - Tenth file in HR department for 2024

## File Status Workflow

1. **Draft** - File is being prepared
2. **Pending** - File is awaiting action
3. **In Progress** - File is being processed
4. **Under Review** - File is under review
5. **Approved** - File has been approved
6. **Rejected** - File has been rejected
7. **Closed** - File has been closed
8. **Archived** - File has been archived

## Integration with Work Requests

The e-filing module integrates with the existing work request system:

- Files can be linked to specific work requests
- Work request information is displayed in file details
- Files can be filtered by work request
- Reports can show file-work request relationships

## Security Features

1. **Role-based Access Control** - Users can only access features based on their role
2. **Department Isolation** - Users can only access files from their department
3. **Audit Trail** - All actions are logged with user details
4. **Confidentiality Levels** - Files can be marked with different confidentiality levels
5. **Session Management** - Secure session handling with automatic logout

## E-Filing Tools

### Available Tools

1. **Highlighter** - Highlight important text in documents
2. **Pencil Tool** - Draw and annotate on documents
3. **Auto Paragraph** - Generate automatic paragraphs
4. **Digital Stamp** - Apply official stamps
5. **Digital Signature** - Apply digital signatures
6. **Text Box** - Add text boxes to documents
7. **Shape Tool** - Add shapes and diagrams
8. **Redaction Tool** - Redact sensitive information

### Tool Permissions

Tools can be assigned to specific users based on their role and department requirements.

## Reporting Features

### Available Reports

1. **File Status Report** - Shows files by status
2. **Department Report** - Department-wise file statistics
3. **User Activity Report** - User activity tracking
4. **Timeline Report** - File movement timeline

### Report Features

- Export to PDF/Excel
- Filter by date range
- Filter by department/user
- Interactive charts and graphs

## Installation and Setup

### Prerequisites

1. Node.js 18+ 
2. PostgreSQL database
3. Existing WMP application

### Installation Steps

1. **Run Database Migration**
   ```sql
   -- Execute the create_efiling_tables.sql file
   psql -d your_database -f create_efiling_tables.sql
   ```

2. **Update User Types**
   - Add 'efiling' as a new user type in the users table
   - Update existing users as needed

3. **Configure Middleware**
   - The middleware has been updated to include e-filing routes
   - Ensure proper role assignments

4. **Set Up Initial Data**
   - Create default departments
   - Create default file categories
   - Set up initial e-filing users

### Configuration

1. **Environment Variables**
   ```env
   # Add any e-filing specific environment variables
   EFILING_UPLOAD_PATH=/uploads/efiling
   EFILING_MAX_FILE_SIZE=10485760
   ```

2. **File Upload Configuration**
   - Configure file upload paths
   - Set file size limits
   - Configure allowed file types

## Usage Guide

### Creating a New File

1. Navigate to `/efiling/files/new`
2. Fill in the required information:
   - Subject
   - Department
   - Category
   - Priority
   - Confidentiality Level
3. Optionally assign to a user
4. Optionally link to a work request
5. Add remarks if needed
6. Click "Create File"

### Managing Files

1. View all files at `/efiling/files`
2. Use filters to find specific files
3. Click on file to view details
4. Use action buttons to edit, forward, or delete files

### Using E-Filing Tools

1. Open a file for editing
2. Select the appropriate tool from the toolbar
3. Apply the tool to the document
4. Save changes

### Generating Reports

1. Navigate to `/efiling/reports`
2. Select the desired report type
3. Set filters and date ranges
4. Generate and export the report

## Troubleshooting

### Common Issues

1. **File Creation Fails**
   - Check database connection
   - Verify department and category exist
   - Ensure user has proper permissions

2. **Tool Not Available**
   - Check user tool permissions
   - Verify tool is active in database
   - Contact administrator for access

3. **Report Generation Fails**
   - Check database connectivity
   - Verify report parameters
   - Ensure sufficient data exists

### Support

For technical support or questions about the e-filing module, please contact the system administrator.

## Future Enhancements

### Planned Features

1. **Advanced Workflow Engine** - Custom workflow definitions
2. **Document Versioning** - Track document versions
3. **Advanced Search** - Full-text search capabilities
4. **Mobile App** - Mobile access to e-filing system
5. **API Integration** - External system integration
6. **Advanced Analytics** - Machine learning insights

### Customization Options

The e-filing module is designed to be customizable:

- Department structure can be modified
- File categories can be customized
- Workflow steps can be adjusted
- Report templates can be modified
- UI themes can be customized

## Conclusion

The E-Filing Module provides a comprehensive solution for digital file management following Pakistani government standards. It offers robust features for file management, user control, and reporting while maintaining security and audit trails.

For additional information or support, please refer to the system documentation or contact the development team. 