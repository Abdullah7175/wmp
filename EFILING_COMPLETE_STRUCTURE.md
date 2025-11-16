EFILING SYSTEM COMPLETE STRUCTURE AND WORKFLOWS
Karachi Water and Sewerage Corporation (KWSC)

TABLE OF CONTENTS
1. System Overview
2. Database Structure
3. File Creation Process
4. Workflow System
5. Stage Progression
6. File Assignment and Mark-To
7. SLA Management
8. CEO Flexibility
9. Document Management
10. E-Signatures
11. Notifications
12. Permissions and Security
13. Complete File Lifecycle

1. SYSTEM OVERVIEW

The e-filing system is a comprehensive digital document management platform for KWSC that automates file processing through structured workflows. It replaces paper-based filing with secure, trackable digital documents that flow through predefined approval stages.

Key Components
- File Management: Create, edit, view, and track files
- Workflow Engine: Automated multi-stage approval process
- Document Editor: Rich text document creation and editing
- E-Signature System: Digital signatures via SMS OTP, Google Auth, or E-Pen
- SLA Tracking: Time-based service level agreement monitoring
- Role-Based Access: Granular permissions based on user roles
- Audit Trail: Complete logging of all file actions

2. DATABASE STRUCTURE

Core Tables
- efiling_files: Main file records
- efiling_file_workflows: Workflow instances for files
- efiling_workflow_templates: Reusable workflow definitions
- efiling_workflow_stages: Individual stages within workflows
- efiling_stage_transitions: Defined paths between stages
- efiling_users: E-filing specific user information
- efiling_roles: Role definitions with permissions
- efiling_departments: Department organization
- efiling_file_types: File type definitions with workflow mappings
- efiling_file_categories: File categorization

Supporting Tables
- efiling_document_pages: Document content storage
- efiling_document_signatures: Digital signatures on documents
- efiling_document_comments: Comments and annotations
- efiling_file_attachments: Supporting file attachments
- efiling_notifications: User notifications
- efiling_user_actions: Audit log of all actions
- efiling_sla_pause_history: SLA pause and resume tracking
- efiling_workflow_stage_instances: Historical stage progression
- efiling_workflow_actions: Action log for workflow transitions

3. FILE CREATION PROCESS

Step-by-Step File Creation

A. User Authentication
- User logs in through /elogin
- Session token authenticated via Next-Auth
- User identity verified from users table

B. File Type Selection
- User selects file type (e.g., Water Bulk, Sewerage Network)
- System checks if user role can create this file type
- File type determines which workflow template applies

C. File Type Validation
- File type must be active
- User role must be in can_create_roles list
- User department must match file type department
- Example: WAT_XEN_* roles can create water bulk files

D. File Metadata Collection
- Subject: File title or description
- Category: File category (from efiling_file_categories)
- Department: User department (cannot be changed)
- Priority: High, Normal, Low
- Confidentiality: Public, Normal, Confidential
- Remarks: Optional notes

E. File Number Generation
Format: DEPT_CODE/YEAR/SEQUENCE
Example: WB/2025/0001
- Department code from efiling_departments
- Current year (YYYY)
- Sequential 4-digit number per department per year
- System ensures uniqueness through MAX query and retry

F. Workflow Template Assignment
- System looks up workflow template by file_type_id
- Each file type can have one active workflow template
- If found, workflow template ID stored
- First stage extracted from workflow stages where stage_order = 1

G. File Record Creation
INSERT INTO efiling_files:
- File number (auto-generated)
- Subject, category, department
- Status ID (defaults to DRAFT)
- Created by (efiling_users.id)
- Assigned to (optional initial assignee)
- File type ID
- Workflow ID and current stage ID (set after workflow creation)

H. Workflow Instance Creation
If workflow template exists:
INSERT INTO efiling_file_workflows:
- File ID
- Template ID
- Current stage ID (first stage)
- Workflow status: IN_PROGRESS
- Current assignee ID
- Created by
- SLA deadline calculated from first stage SLA hours

I. Stage Instance Creation
INSERT INTO efiling_workflow_stage_instances:
- Workflow ID
- Stage ID (first stage)
- Stage status: IN_PROGRESS
- Assigned to
- Started at timestamp

J. SLA Deadline Calculation
- Read sla_hours from efiling_workflow_stages
- Default: 24 hours if not specified
- Deadline = NOW() + sla_hours hours
- Stored in efiling_file_workflows.sla_deadline
- Also copied to efiling_files.sla_deadline

K. Notification Creation
If file assigned to someone:
INSERT INTO efiling_notifications:
- User ID (assignee)
- File ID
- Type: FILE_ASSIGNED
- Message: Notification text
- Is read: false

L. Action Logging
INSERT INTO efiling_user_actions:
- File ID
- User ID
- Action: FILE_CREATED
- Entity type: efiling_file
- Timestamp
- Details JSON

4. WORKFLOW SYSTEM

Workflow Templates
Currently two active templates:
1. Water Bulk Flow (Template ID: 5)
   - 17 stages from XEN to Finance
   - Used for water bulk maintenance files
2. Sewerage Network Flow (Template ID: 7)
   - 17 stages from XEN to Finance
   - Used for sewerage network files

Workflow Structure
Each workflow template contains:
- Name and description
- Version number
- Active status
- Linked file type ID
- Multiple workflow stages (efiling_workflow_stages)

Workflow Stages
Each stage has:
- Stage name (e.g., "XEN marks to SE")
- Stage code (e.g., "WB_S1_XEN_TO_SE")
- Stage order (1, 2, 3... determines sequence)
- Stage type (APPROVAL, REVIEW, etc.)
- Department ID (which department owns this stage)
- Role ID or Role Group ID (who can act at this stage)
- SLA hours (time limit for this stage)
- Requirements and permissions

Stage Transitions
efiling_stage_transitions table defines:
- From stage ID
- To stage ID
- Transition type (FORWARD, RETURN, etc.)
- Conditions (JSON)
- Active status

Example Flow (Water Bulk):
1. XEN marks to SE (stage_order: 1)
2. SE marks to Consultant (stage_order: 2)
3. Consultant marks to SE (stage_order: 3)
4. SE marks to CE (stage_order: 4)
5. CE marks to COO (stage_order: 5)
6. COO marks to CEO (stage_order: 6)
7. CEO marks to CE (stage_order: 7)
8. CE marks to PC (stage_order: 8)
9. PC marks to IAO II (stage_order: 9)
10. IAO II marks to COO (stage_order: 10)
11. COO marks to CEO (stage_order: 11)
12. CEO marks to CE EXEC (stage_order: 12)
13. CE marks to XEN (stage_order: 13)
14. XEN marks to SE EXEC (stage_order: 14)
15. SE marks to BUDGET (stage_order: 15)
16. BUDGET marks to ADLFA (stage_order: 16)
17. ADLFA marks to FINANCE (stage_order: 17)

5. STAGE PROGRESSION

File Movement Methods

A. Assign Action
Endpoint: POST /api/efiling/files/[id]/assign

Process:
1. Validate user permissions
2. Check user role matches current stage role requirements
3. Find next stage via efiling_stage_transitions
4. Validate target user role matches next stage requirements
5. Update current_stage_id in workflow
6. Update current_assignee_id
7. Complete current stage instance
8. Create new stage instance
9. Calculate new SLA deadline
10. Create notification
11. Log action

Role-Based Transitions:
- System checks efiling_workflow_stage_permissions
- Each stage has allowed roles via role_group_id or role_id
- Transition validates both from and to stage permissions

B. Mark-To Action
Endpoint: POST /api/efiling/files/[id]/mark-to

Process:
1. Validate user permissions
2. Get current workflow and stage
3. Check user role matches current stage
4. Find allowed next roles from efiling_stage_transitions
5. Validate target user role (unless CEO)
6. CEO can mark to anyone (special privilege)
7. Pause SLA if moving to CEO stage
8. Resume SLA if moving from CEO stage
9. Update workflow and file
10. Create movement record
11. Create notification
12. Log action

Role Restrictions:
- Normal users must follow workflow transitions
- CEO bypasses role restrictions
- System enforces role_group matching

C. Forward Action
Similar to assign but typically used for sequential forwarding

6. FILE ASSIGNMENT AND MARK-TO

Assignment Rules
- Only current assignee can assign to next stage
- Next stage must be valid transition
- Target user role must match next stage requirements
- Unless CEO is assigning (CEO bypass)

Mark-To Rules
- Current assignee can mark to anyone in allowed next roles
- CEO can mark to any role
- System validates role compatibility
- Creates efiling_file_movements record

Current Assignee
- Stored in efiling_file_workflows.current_assignee_id
- Also stored in efiling_files.assigned_to
- Updated on every assignment or mark-to
- Used for access control and notifications

7. SLA MANAGEMENT

SLA Calculation
- Each stage has sla_hours (default: 24)
- Deadline = stage start time + sla_hours
- Stored in efiling_file_workflows.sla_deadline
- Also in efiling_files.sla_deadline

SLA Pause (CEO Stage)
When file reaches CEO:
- pauseSLA() function called
- Calculates hours elapsed since workflow start (or last resume)
- Stores accumulated hours in sla_accumulated_hours
- Sets sla_paused = TRUE
- Sets sla_paused_at = NOW()
- Increments sla_pause_count
- Creates efiling_sla_pause_history record
- Timer stops until CEO forwards file

SLA Resume (Leaving CEO)
When CEO forwards file:
- resumeSLA() function called
- Calculates pause duration
- Updates pause history with resumed_at and duration_hours
- Gets next stage SLA hours
- Sets sla_paused = FALSE
- Sets new deadline = NOW() + next_stage_sla_hours
- Timer resumes

SLA Breach Detection
- System compares sla_deadline with NOW()
- If deadline < NOW() and workflow_status = IN_PROGRESS:
  - Sets sla_breached = TRUE
  - Marks file for escalation

SLA Accumulation
- sla_accumulated_hours stores total active time
- Excludes pause periods
- Updated on each pause/resume

8. CEO FLEXIBILITY

Special Privileges
1. Can Mark to Anyone
   - CEO bypasses role restrictions
   - Can assign file to any role
   - System allows any role_code match

2. Can Complete Files
   - POST /api/efiling/files/[id]/complete
   - Can complete file without going through all stages
   - Sets workflow_status = COMPLETED
   - Sets file status to COMPLETED
   - Closes all active stages

3. SLA Pause Control
   - Files automatically pause at CEO stage
   - CEO can hold files indefinitely
   - No SLA breach while with CEO
   - Timer resumes when CEO forwards

Implementation
- isCEORole() checks if role_code = 'CEO'
- Special logic in mark-to and assign routes
- Bypass workflow validation checks
- Maintains audit trail of CEO actions

9. DOCUMENT MANAGEMENT

Document Structure
- Files can have multiple pages (efiling_document_pages)
- Each page has:
  - Page number
  - Page title
  - Page content (rich text HTML)
  - Page type (MAIN, APPENDIX, etc.)

Document Editor
- ProseMirror based rich text editor
- TipTap integration
- Supports:
  - Text formatting (bold, italic, underline)
  - Headings
  - Lists (ordered, unordered)
  - Tables
  - Images
  - Links

Document Storage
- document_content stored as JSONB in efiling_files
- Individual pages in efiling_document_pages table
- Supports versioning through page updates

Page Management
- Add new pages
- Edit existing pages
- Delete pages
- Reorder pages
- Each page independently editable

10. E-SIGNATURES

Signature Types
1. SMS OTP (Default)
   - User receives OTP via SMS
   - Enters OTP to sign
   - OTP stored in efiling_otp_codes

2. Google Authentication
   - Uses Google OAuth
   - Validates Google email against user record

3. E-Pen (Drawn)
   - User draws signature on canvas
   - Stored as image (base64 or file)
   - Saved to efiling_user_signatures

Signature Storage
- efiling_user_signatures: User signature templates
- efiling_document_signatures: Signatures applied to documents
  - File ID
  - User ID
  - User name and role
  - Signature type
  - Signature content (text or image)
  - Position on document (JSON)
  - Timestamp

Signature Flow
1. User clicks sign on document
2. System prompts for signature method
3. User authenticates (OTP, Google, or draws)
4. Signature applied to document
5. Signature saved to efiling_document_signatures
6. Document updated with signature position
7. Action logged

11. NOTIFICATIONS

Notification Types
- FILE_ASSIGNED: File assigned to user
- WORKFLOW_ACTION: Workflow action taken
- SLA_ALERT: SLA deadline approaching or breached
- FILE_RETURNED: File returned for changes
- COMMENT_ADDED: Comment added to file

Notification Storage
- efiling_notifications table
- Fields:
  - User ID (recipient)
  - File ID (related file)
  - Type (notification type)
  - Message (notification text)
  - Priority (low, normal, high, urgent)
  - Action required (boolean)
  - Expires at (optional)
  - Metadata (JSON with additional data)
  - Is read, read_at
  - Is dismissed, dismissed_at

Notification Creation
- Created on file assignment
- Created on workflow transitions
- Created on SLA breaches
- Created on comments
- Created on file returns

12. PERMISSIONS AND SECURITY

Role-Based Access Control
- efiling_roles: Role definitions
- efiling_role_permissions: Role-permission mapping
- efiling_workflow_stage_permissions: Stage-specific permissions

Permission Types
- Create files
- Read/view files
- Update files
- Delete files
- Approve files
- Reject files
- Return files
- Forward files
- Escalate files
- Sign files
- Comment files
- Attach files

Stage Permissions
Each stage has:
- Can approve
- Can reject
- Can return
- Can forward
- Can escalate
- Can comment
- Can attach files
- Can sign
- Approval level required

Access Control
- File access restricted to:
  - File creator
  - Current assignee
  - System administrators
- Workflow actions restricted by stage permissions
- Role-based validation on all actions

13. COMPLETE FILE LIFECYCLE

Phase 1: File Creation
1. User logs in
2. Selects file type
3. Fills file metadata
4. System validates permissions
5. File created with DRAFT status
6. Workflow instance created
7. First stage activated
8. SLA timer starts
9. Notification sent to initial assignee

Phase 2: Stage Progression
1. Current assignee reviews file
2. Can edit document content
3. Can add attachments
4. Can add comments
5. Can sign document
6. Takes action (assign, mark-to, or forward)
7. System validates transition
8. Updates to next stage
9. New assignee notified
10. SLA deadline recalculated

Phase 3: CEO Review (Special)
1. File reaches CEO stage
2. SLA timer pauses automatically
3. CEO reviews file
4. CEO can:
   - Mark to anyone
   - Complete file
   - Forward normally
5. When CEO forwards: SLA resumes

Phase 4: Completion
1. File goes through all required stages
2. Final stage completed
3. Workflow status = COMPLETED
4. File status = COMPLETED
5. All stages closed
6. Final notification sent

File States
- DRAFT: Just created, not yet in workflow
- PENDING: In workflow, waiting for action
- IN_PROGRESS: Actively being processed
- UNDER_REVIEW: Being reviewed
- APPROVED: Approved at current stage
- REJECTED: Rejected and returned
- COMPLETED: Workflow finished
- CLOSED: File closed
- ARCHIVED: Archived for storage

Audit Trail
Every action logged in efiling_user_actions:
- Action type
- User ID and details
- File ID
- Timestamp
- IP address
- User agent
- Details JSON

This complete structure ensures transparency, accountability, and efficient file processing throughout the organization.

