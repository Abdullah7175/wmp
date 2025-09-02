# E-Filing Workflow System Setup

This document explains how to set up and test the complete workflow system for the e-filing module.

## Overview

The workflow system consists of:
- **Workflow Templates**: Define the stages and flow for different file types
- **Workflow Stages**: Individual steps within a workflow with specific requirements
- **Workflow Instances**: Active workflows for individual files
- **Stage Instances**: Tracking of individual stage progress
- **Workflow Actions**: Logging of all workflow activities

## Database Structure

### Core Tables
1. `efiling_workflow_templates` - Workflow definitions
2. `efiling_workflow_stages` - Stage definitions within templates
3. `efiling_file_workflows` - Active workflow instances
4. `efiling_workflow_stage_instances` - Stage progress tracking
5. `efiling_workflow_actions` - Action logging
6. `efiling_files` - Files with workflow integration

### Key Relationships
- Files → Workflow Instances → Workflow Templates
- Workflow Instances → Stage Instances → Workflow Stages
- File Categories → Workflow Templates (auto-assignment)

## Setup Instructions

### Step 1: Run the Complete Setup
```sql
-- Execute the complete workflow system setup
\i setup_workflow_system.sql
```

This script will:
- Create all necessary workflow tables
- Add missing columns to existing tables
- Insert sample data (departments, roles, users, categories, templates, stages)
- Create proper indexes for performance

### Step 2: Verify the Setup
```sql
-- Test the complete system
\i test_workflow_system.sql
```

This script will:
- Test file creation with workflow auto-assignment
- Verify workflow template retrieval
- Check file category to workflow mapping
- Validate user role assignments
- Confirm database structure integrity

### Step 3: Test File Creation via API
Use the file creation API endpoint to test the complete workflow:

```bash
POST /api/efiling/files
{
  "subject": "Test File for Workflow",
  "category_id": 1,
  "department_id": 1,
  "assigned_to": 2,
  "remarks": "Testing workflow integration"
}
```

## Sample Workflow Templates

### 1. Standard Approval Workflow
- **Stage 1**: Initial Review (24 hours SLA)
- **Stage 2**: Department Approval (48 hours SLA)
- **Stage 3**: Final Approval (24 hours SLA)

### 2. Urgent File Workflow
- **Stage 1**: Urgent Review (4 hours SLA)
- **Stage 2**: Immediate Processing (8 hours SLA)

### 3. Department Review Workflow
- **Stage 1**: Staff Review (24 hours SLA)
- **Stage 2**: Department Head Review (48 hours SLA)
- **Stage 3**: Implementation (72 hours SLA)

## File Categories and Workflow Mapping

| Category | Workflow Template | Description |
|----------|------------------|-------------|
| General Correspondence | Standard Approval | Letters and general correspondence |
| Work Orders | Urgent File | Work assignments requiring quick processing |
| Policy Documents | Department Review | Documents requiring thorough review |

## User Roles and Permissions

| Role | Permissions | Department |
|------|-------------|------------|
| File Clerk | Create, view, route files | All |
| File Officer | Create, view, route, approve files | All |
| Department Head | Full file management + workflow management | Department-specific |
| Finance Officer | Financial file approval | Finance |
| Technical Officer | Technical file approval | IT |

## API Endpoints

### File Management
- `POST /api/efiling/files` - Create new file (auto-assigns workflow)
- `GET /api/efiling/files` - List files with workflow status
- `PUT /api/efiling/files` - Update file details

### Workflow Management
- `GET /api/efiling/workflows` - List active workflows
- `GET /api/efiling/workflows/[id]` - Get workflow details
- `POST /api/efiling/workflows/[id]/actions` - Perform workflow actions

### Workflow Templates
- `GET /api/efiling/workflow-templates` - List workflow templates
- `POST /api/efiling/workflow-templates` - Create new template

## Testing the System

### 1. Database Verification
```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'efiling_%' 
ORDER BY table_name;

-- Check workflow templates
SELECT * FROM efiling_workflow_templates;

-- Check workflow stages
SELECT * FROM efiling_workflow_stages ORDER BY template_id, stage_order;
```

### 2. API Testing
```bash
# Test file creation
curl -X POST http://localhost:3000/api/efiling/files \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test File",
    "category_id": 1,
    "department_id": 1
  }'

# Test workflow retrieval
curl http://localhost:3000/api/efiling/workflows
```

### 3. Workflow Flow Testing
1. Create a file via API
2. Verify workflow is auto-assigned
3. Check workflow instance creation
4. Verify stage instance creation
5. Test workflow actions (approve, reject, forward)

## Troubleshooting

### Common Issues

1. **Workflow Not Auto-Assigned**
   - Check if workflow templates exist
   - Verify file category to template mapping
   - Check if template is active

2. **Database Errors**
   - Ensure all tables exist
   - Check foreign key constraints
   - Verify column data types

3. **API Errors**
   - Check database connection
   - Verify required fields are provided
   - Check user permissions

### Debug Queries
```sql
-- Check workflow assignment
SELECT f.*, wf.id as workflow_id, wf.workflow_status
FROM efiling_files f
LEFT JOIN efiling_file_workflows wf ON f.workflow_id = wf.id
WHERE f.id = [FILE_ID];

-- Check stage instances
SELECT wsi.*, ws.stage_name, ws.stage_code
FROM efiling_workflow_stage_instances wsi
JOIN efiling_workflow_stages ws ON wsi.stage_id = ws.id
WHERE wsi.workflow_id = [WORKFLOW_ID];
```

## Next Steps

After successful setup:

1. **Customize Workflows**: Modify existing templates or create new ones
2. **User Management**: Add real users and assign appropriate roles
3. **Integration**: Connect with frontend components
4. **Monitoring**: Set up workflow monitoring and reporting
5. **Automation**: Implement automated workflow actions and notifications

## Support

For issues or questions:
1. Check the database logs for errors
2. Verify all SQL scripts executed successfully
3. Test individual components step by step
4. Review the API response logs
