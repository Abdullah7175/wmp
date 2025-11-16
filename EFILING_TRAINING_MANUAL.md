EFILING SYSTEM TRAINING MANUAL
Karachi Water and Sewerage Corporation (KWSC)

TABLE OF CONTENTS
1. Introduction to E-Filing System
2. System Access and Login
3. User Interface Overview
4. File Creation and Management
5. Document Editing and Formatting
6. E-Signature System
7. File Workflow and Stage Progression
8. SLA Management and Timer System
9. CEO Flexibility Features
10. Permission System
11. Attachments and Comments
12. Print and PDF Export
13. Reports and Analytics
14. Troubleshooting
15. Best Practices

---

1. INTRODUCTION TO E-FILING SYSTEM

What is E-Filing
E-filing is a digital document management system for KWSC that automates file processing, approval workflows, and tracking. It replaces paper-based filing with secure digital documents.

Key Features
- Digital document creation and editing
- Workflow automation with multi-stage approvals
- E-signature system for authentication
- SLA timer tracking for service level agreements
- Real-time status updates and notifications
- Print and PDF export capabilities
- Comment and attachment support
- Complete audit trail

Benefits
- Eliminates paper usage
- Reduces processing time
- Ensures document security
- Provides audit trail
- Tracks SLA compliance
- Enables remote access
- Centralizes document storage

System Access
The system is accessible at http://202.61.47.29:3000/elogin
Users must have valid credentials with role 1 (Administrator) or role 4 (E-Filing User)

---

2. SYSTEM ACCESS AND LOGIN

Login Process
1. Open web browser (Chrome or Edge recommended)
2. Navigate to the login URL
3. Enter your email address and password
4. Click Login button
5. After successful login, you will be redirected based on your role

User Roles
Role 1 - Administrator (E-Filing Admin)
- Full system access
- Can edit any file
- Manages users, departments, roles
- Configures workflows
- Views all files and reports
- Redirected to /efiling after login

Role 4 - E-Filing User
- Standard user access
- Creates and manages own files
- Can edit only own files
- Adds signatures, comments, attachments
- Views assigned files
- Redirected to /efilinguser after login

Security Features
- Account lockout after failed login attempts
- 30 seconds lockout on 3rd failed attempt
- 1 minute lockout on 4th failed attempt
- 15 minutes lockout on 5th failed attempt
- All login attempts are logged
- Session management for security

Password Requirements
- Minimum 6 characters
- Should contain letters and numbers
- Update password regularly

---

3. USER INTERFACE OVERVIEW

Dashboard (E-Filing User)
The dashboard shows:
- Total files created by you
- Files assigned to you
- Pending actions
- Recent activities
- Statistics overview
- Quick access buttons

Main Sections
Sidebar Navigation
- Dashboard - Overview of files
- My Files - Your created files
- Assigned Files - Files assigned to you
- Pending Actions - Files needing your attention
- Notifications - System alerts
- Reports - Analytics and reports
- Settings - User preferences
- Profile - Personal information

File Status Indicators
- Draft - File not yet submitted
- In Progress - File in workflow
- Pending Approval - Waiting for approval
- Approved - File approved
- Rejected - File rejected
- Completed - Workflow complete

SLA Status Badges
- Active - Timer running normally
- Paused - Timer paused (at CEO)
- Breached - SLA deadline missed
- Completed - File finished within SLA

---

4. FILE CREATION AND MANAGEMENT

Creating a New File
1. Click Create File button on dashboard
2. Fill in the following details:
   - File Number (auto-generated)
   - Subject
   - Department
   - Category
   - Priority (Low, Medium, High, Urgent)
   - File Type
   - Workflow Template
3. Select document template:
   - Official Letter
   - Internal Memo
   - Project Proposal
   - Work Order
   - Custom Document
4. Click Create button
5. System creates file and assigns to you

File Information
Each file contains:
- File Number - Unique identifier
- Subject - File description
- Department - Assigned department
- Category - File category
- Priority - Urgency level
- Status - Current workflow status
- Created Date - When file was created
- Created By - Creator name
- Assigned To - Current handler
- SLA Deadline - Time target

Required Fields
- Subject
- Department
- Category
- Priority
- File Type
- Workflow Template

Optional Fields
- Description
- Remarks
- Tags
- Related Files

---

5. DOCUMENT EDITING AND FORMATTING

Document Editor
The editor provides rich text formatting capabilities:
- Bold, Italic, Underline text
- Font size and color options
- Bullet and numbered lists
- Alignment options (left, center, right, justify)
- Insert headers and footers
- Add page numbers
- Insert images
- Tables
- Hyperlinks

Editing Features
Header Section
- Organization logo
- Date field
- Reference number
- Subject line

Body Content
- Rich text editor
- Paragraph formatting
- Line spacing
- Indentation

Footer Section
- Signature area
- Page number
- Footer text

Adding Content
1. Click in the editor area
2. Type your content
3. Use formatting toolbar for styling
4. Insert images by clicking image icon
5. Add tables by clicking table icon
6. Save changes automatically

Multiple Pages
- Click Add Page button
- Each page is independent
- Pages can be reordered
- Delete pages with delete button

Saving Changes
- Changes save automatically
- No manual save button needed
- Real-time sync
- Version history maintained

---

6. E-SIGNATURE SYSTEM

About E-Signatures
Digital signatures authenticate documents and confirm the signer's identity and approval.

Signature Types
Image Signature
- Hand-drawn signature using drawing canvas
- Converted to image format
- Permanent and immutable

Text Signature
- Text-based signature using your name
- Simulates handwriting
- Can be customized with fonts

Adding E-Signature
1. Open the file
2. Scroll to Signatures section
3. Click Add Signature button
4. Choose signature type:
   - Draw on canvas (draw signature with mouse/touch)
   - Type text signature
5. Click Save Signature
6. Signature appears in signature list

Signature Requirements
- File creator must sign before marking file to others
- Mark-to button disabled until creator signs
- Signature cannot be deleted after marking
- All signatures are timestamped
- Signature history is maintained

Viewing Signatures
- All signatures visible in file view
- Shows signer name and timestamp
- Displays signature image or text
- Indicates signature type

Signature Workflow
1. Creator creates and edits file
2. Creator adds e-signature
3. Creator marks file to next user
4. Next user reviews and signs
5. Process continues through workflow
6. Final approver signs
7. File completion

---

7. FILE WORKFLOW AND STAGE PROGRESSION

Understanding Workflows
A workflow defines the path a file takes through different stages to completion.

Workflow Stages
Each workflow has multiple stages:
1. Creation Stage - File is created
2. Review Stage - Initial review
3. Approval Stage - Approval required
4. Execution Stage - Action taken
5. Completion Stage - File closed

Typical Flow
XEN → SE → CONSULTANT → CE → COO → CEO → PC → IAO_II → COMPLETE

Stage Details
- Stage Name - Current workflow stage
- Assigned To - User handling the file
- Stage Status - In Progress, Approved, Rejected
- SLA Hours - Allotted time for stage
- Started At - When stage began
- Deadline - When stage should complete

Mark To Function
Used to forward file to next user in workflow:
1. Click Mark To button
2. Select target user from dropdown
3. Add remarks if needed
4. Click Mark button
5. File moves to next stage
6. Target user receives notification

Forward Function
For sending file to specific user:
1. Click Forward button
2. Search for user
3. Select recipient
4. Add message
5. Click Forward
6. User gets notification

Assign Function
For assigning file to specific user:
1. Admin opens file
2. Clicks Assign button
3. Selects target user
4. File assigned to user
5. User receives notification

CEO Flexibility
CEO has special privileges:
- Can mark file to anyone regardless of workflow
- Can complete file anytime without full workflow
- SLA timer pauses when file reaches CEO
- Can override normal progression
- Can skip stages if needed

---

8. SLA MANAGEMENT AND TIMER SYSTEM

What is SLA
Service Level Agreement (SLA) is the time allocated for file processing from start to completion.

SLA Configuration
Different roles have different SLA hours:
- SE (Superintending Engineer) - 0 hours
- CONSULTANT - 48 hours (2 days)
- IAO_II (Internal Audit Officer) - 24 hours
- PROCUREMENT_COMMITTEE - 168 hours (7 days)
- Default for other roles - 24 hours

SLA Timer Behavior
Normal Operation
- Timer starts when file is created
- Timer runs continuously
- Shows remaining time
- Alerts when deadline approaching
- Breaches if deadline missed

CEO Pause Feature
- Timer pauses when file reaches CEO
- No time counted during CEO review
- Accumulated time saved separately
- Timer resumes when CEO forwards
- New deadline calculated from resume point
- Can pause multiple times if file returns to CEO

SLA Status Display
Active Status
- Timer running normally
- Shows countdown
- Green badge
- Remaining hours visible

Paused Status
- Timer stopped at CEO
- Shows pause reason
- Blue badge
- Accumulated time shown

Breached Status
- Deadline missed
- Red badge
- Overdue hours shown
- Alert sent to admin

Completed Status
- File finished within SLA
- Green checkmark
- Success message

Monitoring SLA
- Dashboard shows overdue files
- Filter by SLA status
- Reports available
- Alerts sent before breach

---

9. CEO FLEXIBILITY FEATURES

Special CEO Privileges
The CEO role has unique capabilities beyond normal workflow:

Mark to Anyone
- CEO can assign file to any user
- Not restricted by workflow stages
- Can send file directly to any department
- Useful for urgent cases

Complete File Anytime
- CEO can mark file as complete
- Bypasses remaining workflow stages
- Use when decision is final
- Saves time for urgent matters

Override Workflow
- CEO is not bound by standard workflow
- Can skip stages if needed
- Can create custom path
- Maintains audit trail

SLA Control
- CEO can pause SLA when needed
- Can extend deadlines if justified
- Can expedite urgent files
- Full control over timing

Using CEO Features
Mark File to Specific User
1. Open file in CEO dashboard
2. Click Mark To button
3. Select any user from list (not restricted)
4. Add remarks if needed
5. Click Mark button
6. File moves to selected user

Complete File
1. Open file that needs completion
2. Review file content
3. Click Complete File button
4. Add remarks explaining completion
5. Confirm completion
6. File status changes to Completed
7. Workflow ends

When to Use CEO Privileges
- Emergency situations
- Direct decisions
- Policy clarifications
- Bypass unnecessary stages
- Expedite critical matters

---

10. PERMISSION SYSTEM

Permission Levels
System has three permission levels:

Admin Permissions
- Can view all files
- Can edit any file
- Can delete files (with restrictions)
- Can assign files to anyone
- Can manage users and roles
- Can configure workflows
- Can bypass signature requirements
- Full system access

Creator Permissions
- Can edit only own files
- Can add e-signature
- Can mark file to others
- Can add comments
- Can add attachments
- Can print and export
- Cannot delete after marking
- Cannot edit after marking to others

Marked User Permissions
- Can view file
- Can add e-signature
- Can add comments
- Can add attachments
- Cannot edit file content
- Cannot change file metadata
- Can forward to others
- Can only append, not modify

Permission Matrix

Action                | Admin | Creator | Marked User
----------------------|-------|---------|------------
View File             | Yes   | Yes     | Yes
Edit Own File         | Yes   | Yes     | No
Edit Any File         | Yes   | No      | No
Add Signature         | Yes   | Yes     | Yes
Add Comment           | Yes   | Yes     | Yes
Add Attachment        | Yes   | Yes     | Yes
Mark To Others        | Yes   | Yes     | Yes
Assign File           | Yes   | No      | No
Delete File           | Yes   | No      | No
Print/Export          | Yes   | Yes     | Yes

Editing Restrictions
Creator Can Edit:
- Only before marking file
- Only own files
- Only while file is in draft or assigned to them
- Cannot edit after marking to others

Marked User Cannot Edit:
- File content is read-only
- Can only add signatures, comments, attachments
- Preserves document integrity
- Prevents unauthorized changes

Admin Override
- Admins can always edit any file
- Useful for corrections
- Maintains system flexibility
- Use responsibly

---

11. ATTACHMENTS AND COMMENTS

Adding Attachments
Purpose:
- Supporting documents
- Related files
- Reference materials
- Images and photos
- PDF documents
- Spreadsheets

Supported File Types
- Images (JPG, PNG, GIF)
- Documents (PDF, DOC, DOCX)
- Spreadsheets (XLS, XLSX)
- Text files (TXT)
- Other file types

File Size Limits
- Maximum file size: 10MB per file
- No limit on number of attachments
- Total storage monitored

Adding Attachments
1. Open the file
2. Scroll to Attachments section
3. Click Add Attachment button
4. Browse and select file
5. File uploads automatically
6. Appears in attachments list

Viewing Attachments
- Click attachment to download
- Images display inline in print view
- File type icon shown
- File size displayed
- Upload date shown

Managing Attachments
- Delete own attachments (before marking)
- View all attachments
- Download attachments
- Attachments persist through workflow

Adding Comments
Purpose:
- Clarifications
- Discussions
- Feedback
- Questions
- Notes for next user

Adding Comments
1. Open file
2. Scroll to Comments section
3. Click Add Comment button
4. Type your comment
5. Click Post button
6. Comment appears in list

Comment Features
- Shows author name and date
- Timestamped automatically
- Cannot be edited after posting
- Cannot be deleted
- Visible to all users

Viewing Comments
- All comments visible
- Sorted by date (newest first)
- Shows commenter name
- Shows timestamp
- Thread of conversation visible

Best Practices
Comments:
- Be clear and concise
- Use professional language
- Address specific points
- Ask questions when needed
- Respond to queries promptly

Attachments:
- Upload relevant files only
- Keep file sizes reasonable
- Use descriptive filenames
- Include necessary context
- Remove outdated attachments

---

12. PRINT AND PDF EXPORT

Print Feature
Generate physical copies of files for archiving and record keeping.

What Gets Printed
- File information header
- All document pages
- E-signatures (if any)
- Attachments (if any)
- Comments (if any)
- Complete file details

Print Format
- A4 size pages
- KWSC letterhead
- Professional formatting
- Page numbers
- Headers and footers
- Proper margins

Printing Process
1. Open file
2. Click Print button
3. Browser print dialog opens
4. Select printer
5. Choose settings
6. Click Print button

Print Settings
- Page size: A4
- Orientation: Portrait
- Margins: 20mm all sides
- Color or B&W
- Number of copies
- Page range

PDF Export Feature
Generate PDF files for digital archiving and sharing.

What Gets Exported
- Same content as print
- All pages included
- Signatures included
- Attachments included
- Comments included
- Complete file information

Export Format
- Standard PDF format
- A4 page size
- Searchable text
- Embedded images
- Readable in any PDF viewer
- Suitable for archival

Export Process
1. Open file
2. Click Export PDF button
3. Browser print dialog opens
4. Select Save as PDF
5. Filename auto-suggested
6. Choose save location
7. Click Save

Auto-Naming Convention
- Format: EFile_[FileNumber]_[Date].pdf
- Example: EFile_KWSC-2024-001_2025-10-21.pdf
- Descriptive and unique
- Easy to organize
- Chronologically ordered

PDF Features
- Searchable text
- Print-ready format
- Can be emailed
- Can be stored digitally
- Can be shared easily
- Professional appearance

---

13. REPORTS AND ANALYTICS

Dashboard Statistics
Quick overview of system performance:
- Total files created
- Files in progress
- Pending approvals
- Completed files
- User activity

File Reports
Available Reports:
- Files by status
- Files by department
- Files by priority
- Files by date range
- Files by user
- SLA compliance

User Reports
- Files created
- Files assigned
- Files completed
- Average processing time
- Pending tasks
- Activity history

Department Reports
- Files per department
- Average processing time
- SLA compliance rate
- Pending files
- Completed files
- User productivity

Generating Reports
1. Navigate to Reports section
2. Select report type
3. Set date range
4. Apply filters
5. Click Generate button
6. Report displays on screen
7. Export to PDF or Excel

Report Features
- Date range filtering
- Status filtering
- Department filtering
- User filtering
- Priority filtering
- Export capabilities

SLA Reports
- Files within SLA
- Files breached SLA
- Average processing time
- Pause duration analysis
- CEO review time
- Stage-wise breakdown

---

14. TROUBLESHOOTING

Common Issues and Solutions

Login Problems
Issue: Cannot login
Solutions:
- Verify email and password
- Check for account lockout
- Wait for lockout period to expire
- Contact administrator
- Clear browser cache

Issue: Forgot password
Solutions:
- Contact administrator
- Use password reset if available
- Check email for reset link

Issue: Session expired
Solutions:
- Log in again
- Check internet connection
- Clear browser cookies

File Creation Problems
Issue: Cannot create file
Solutions:
- Verify required fields filled
- Check role permissions
- Contact administrator
- Refresh page and retry

Issue: File not saved
Solutions:
- Check internet connection
- Wait for auto-save
- Refresh page
- Contact support

Issue: Missing workflow options
Solutions:
- Verify department assignment
- Check file type configuration
- Contact administrator

Editing Problems
Issue: Cannot edit file
Solutions:
- Check if you are creator
- Verify file status
- Check if file already marked
- Contact administrator

Issue: Editor not loading
Solutions:
- Refresh page
- Clear browser cache
- Try different browser
- Check JavaScript enabled

Issue: Changes not saving
Solutions:
- Check internet connection
- Wait for auto-save indicator
- Refresh page
- Contact support

Signature Problems
Issue: Cannot add signature
Solutions:
- Check user permissions
- Verify signature method
- Try drawing signature again
- Contact support

Issue: Signature not visible
Solutions:
- Refresh page
- Check if signature saved
- Try adding again
- Contact administrator

Issue: Cannot mark without signature
Solutions:
- Add e-signature first
- This is by design
- Signature required for creator
- Normal behavior

Workflow Problems
Issue: Cannot mark to user
Solutions:
- Check user permissions
- Verify workflow stages
- Check user availability
- Contact administrator

Issue: File stuck in stage
Solutions:
- Check assigned user
- Verify workflow configuration
- Contact admin to reassign
- Check system status

Issue: SLA not updating
Solutions:
- Wait for page refresh
- Check system logs
- Contact administrator
- Report technical issue

Print/Export Problems
Issue: Print not working
Solutions:
- Check printer connected
- Verify print permissions
- Try Print Preview first
- Use different browser

Issue: PDF export failing
Solutions:
- Check browser compatibility
- Update browser
- Clear browser cache
- Try Chrome browser

Issue: Missing content in print
Solutions:
- Wait for all images to load
- Check CSS enabled
- Try different browser
- Contact support

General Troubleshooting
Browser Issues:
- Use Chrome or Edge
- Update browser
- Clear cache and cookies
- Disable browser extensions

Network Issues:
- Check internet connection
- Verify server status
- Try network reset
- Contact IT support

Performance Issues:
- Close unnecessary tabs
- Clear browser cache
- Restart browser
- Check system resources

Data Loss Prevention
- System auto-saves frequently
- Changes saved automatically
- Version history maintained
- Contact admin for recovery

Getting Help
Support Channels:
- Contact system administrator
- Submit support ticket
- Check user manual
- Review training materials
- Ask colleagues

Emergency Support
- For critical issues, contact IT immediately
- Provide file number when reporting
- Include error screenshots
- Describe steps to reproduce

---

15. BEST PRACTICES

File Creation Best Practices
- Use clear and descriptive subjects
- Select appropriate priority
- Choose correct department
- Fill all required fields
- Use consistent naming
- Add detailed descriptions
- Attach relevant documents
- Review before submission

Document Writing Best Practices
- Use professional language
- Be clear and concise
- Follow organizational format
- Include necessary details
- Proofread before signing
- Use proper headers and footers
- Maintain consistency
- Follow guidelines

Signature Best Practices
- Sign before marking
- Use unique signature
- Verify signature before posting
- Keep signature consistent
- Never share account
- Sign in timely manner
- Respond to signatures promptly

Workflow Best Practices
- Review file before forwarding
- Add remarks when marking
- Respond to assigned files promptly
- Monitor SLA deadlines
- Communicate clearly
- Follow workflow stages
- Don't skip steps unnecessarily
- Complete tasks on time

Attachment Best Practices
- Upload only relevant files
- Use descriptive filenames
- Compress large files
- Remove outdated attachments
- Keep attachments organized
- Verify file content
- Don't upload sensitive data
- Follow file size limits

Comment Best Practices
- Use professional tone
- Be specific and relevant
- Ask questions clearly
- Provide timely responses
- Use for clarifications
- Don't spam comments
- Maintain thread context
- Be respectful

SLA Management Best Practices
- Monitor deadlines regularly
- Prioritize by deadline
- Alert when approaching deadline
- Don't let files breach SLA
- Escalate when needed
- Update status promptly
- Communicate delays
- Plan workload

Security Best Practices
- Never share login credentials
- Logout when not in use
- Use strong passwords
- Report suspicious activity
- Don't access unauthorized files
- Respect privacy
- Follow data protection
- Keep system secure

Data Management Best Practices
- Organize files properly
- Use appropriate categories
- Tag files correctly
- Archive completed files
- Maintain version control
- Backup important data
- Follow retention policies
- Dispose properly

Communication Best Practices
- Provide clear messages
- Use remarks effectively
- Communicate delays promptly
- Set expectations
- Ask questions when unsure
- Respond professionally
- Maintain documentation
- Keep records

System Efficiency Best Practices
- Batch similar tasks
- Use shortcuts efficiently
- Learn keyboard shortcuts
- Organize dashboard
- Use filters effectively
- Create templates
- Reuse when possible
- Stay organized

---

APPENDIX A: QUICK REFERENCE

Keyboard Shortcuts
Not currently implemented - may be added in future updates.

Status Codes
DRAFT - File not yet submitted
IN_PROGRESS - Being processed
PENDING_APPROVAL - Awaiting approval
APPROVED - Approved
REJECTED - Rejected
COMPLETED - Workflow finished

Priority Levels
LOW - Non-urgent, flexible timeline
MEDIUM - Normal priority, standard timeline
HIGH - Urgent, faster processing
URGENT - Critical, immediate attention

Workflow Templates
Each template defines:
- Required stages
- User roles involved
- SLA hours per stage
- Approval requirements
- Completion criteria

Common Tasks

Creating a File
1. Click Create File
2. Fill required fields
3. Select template
4. Click Create
5. Start editing

Marking a File
1. Open file
2. Click Mark To
3. Select user
4. Add remarks
5. Click Mark

Adding Signature
1. Scroll to Signatures
2. Click Add Signature
3. Draw or type signature
4. Click Save

Printing File
1. Open file
2. Click Print button
3. Select printer
4. Click Print

---

APPENDIX B: GLOSSARY

Term Definitions
File: Digital document in the system
Workflow: Path file takes through stages
Stage: Step in workflow process
SLA: Service Level Agreement time
Mark To: Forward file to next user
Forward: Send file to specific user
Assign: Allocate file to user
E-Signature: Digital authentication
Attachment: Supporting file
Comment: User note or remark
Admin: System administrator
Creator: File originator
Marked User: File recipient
Assignee: Currently handling file
Deadline: SLA target date
Breach: Missed deadline
Pause: Timer stopped temporarily
Resume: Timer restarted
Priority: Urgency level
Status: Current state
Template: Predefined format
Role: User position
Department: Organizational unit
Category: File classification

---

APPENDIX C: FREQUENTLY ASKED QUESTIONS

FAQ Section
Q: Can I edit a file after marking it to someone?
A: No, only admins can edit after marking. You can only add signatures, comments, and attachments.

Q: What happens if I miss the SLA deadline?
A: The file status changes to Breached, and administrators are notified.

Q: Can I delete a file?
A: Only administrators can delete files. Regular users cannot delete files after creation.

Q: How long are files kept in the system?
A: Files are stored permanently unless manually deleted by administrators.

Q: Can I access the system from mobile?
A: Yes, the system is responsive and works on mobile devices, though desktop is recommended.

Q: What if I forget my password?
A: Contact your system administrator for password reset.

Q: Can I reassign a file to someone else?
A: Only administrators can reassign files. Regular users must use Mark To function.

Q: What browsers are supported?
A: Chrome, Edge, Firefox, and Safari are all supported. Chrome is recommended.

Q: Can I export multiple files at once?
A: Currently, files must be exported one at a time.

Q: What happens to signatures if I edit a file?
A: Signatures are preserved and remain associated with the file.

Q: Can I undo a mark to action?
A: No, mark to actions cannot be undone. Contact administrator if change needed.

Q: How is the file number generated?
A: File numbers are auto-generated by the system in sequential format.

Q: Can I attach files of any size?
A: Maximum file size is 10MB per attachment. Multiple attachments allowed.

Q: What if a file gets stuck in a stage?
A: Contact your administrator to reassign or advance the file.

Q: Can I see who has viewed my file?
A: Currently, view tracking is available to administrators only.

---

END OF TRAINING MANUAL

For additional support or questions, contact your system administrator at KWSC IT Department.

System Version: 2.0
Last Updated: October 2025
Document Version: 1.0

