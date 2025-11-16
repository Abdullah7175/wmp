TECH STACK OVERVIEW - KWSC WORK MANAGEMENT PORTAL

FRONTEND
- Next.js 14 (App Router)
- React 18
- JavaScript/JSX
- Tailwind CSS (styling)
- Shadcn UI (component library)
- Lucide React (icons)
- React PDF (document handling)
- React Signature Canvas (digital signatures)
- ProseMirror (document editor like MS Word)
- TipTap (rich text editor)
- Leaflet (maps)

BACKEND
- Next.js API Routes
- Node.js server
- PostgreSQL database
- pg library (database connection)
- Multer (file uploads)
- Sharp (image processing)
- bcrypt (password hashing)

AUTHENTICATION
- Next-Auth (session management)
- JWT tokens
- Role-based access control
- Session persistence

DATABASE
- PostgreSQL
- Tables: users, work_requests, images, videos, files, workflow_stages, etc.
- Foreign keys for data integrity
- Transactions for data consistency

DEPLOYMENT
- PM2 (process manager)
- Standalone build mode
- Production server on 202.61.47.29:3000
- File storage on local disk

SYSTEM WORKFLOW

FILE UPLOAD SYSTEM
- Images and videos uploaded through API
- Files stored in public/uploads directory
- Filename sanitization for security
- Supports multiple file formats
- Automatic path resolution for standalone mode

E-FILING WORKFLOW
1. User creates file ticket
2. Assign to department and role
3. Document editing (MS Word-like editor)
4. Add attachments and signatures
5. Mark to next user in workflow
6. Stage-based progression (XEN to SE to CONSULTANT to CE to COO to CEO)
7. SLA tracking per stage
8. CEO can pause/resume SLA timer
9. CEO can mark files complete or assign to anyone

WORK REQUEST SYSTEM
1. User creates work request with location
2. Submit before images and videos
3. Agent reviews and assigns
4. Agent uploads after images/videos
5. Supervisor approves or rejects
6. CEO/COO final approval
7. Mark as completed

ROLES IN SYSTEM
- System Admin (role 1): Full access
- Super Admin (role 2): Full access
- Agents (role 3): Create and manage work requests
- Agents (role 4): Image upload and management
- CEO (role 5): Senior approvals, flexible file management
- COO (role 6): Operational oversight
- CE (role 7): Chief Engineer
- Dashboard Admin: System management

SECURITY FEATURES
- Input validation and sanitization
- SQL injection prevention
- Role-based permissions
- Secure file uploads
- Session management
- Audit logging of all actions
- Password encryption
- CSRF protection

API ENDPOINTS
- /api/users - User management
- /api/work-requests - Work request CRUD
- /api/images - Image upload and management
- /api/videos - Video upload and management
- /api/efiling - E-filing operations
- /api/auth - Authentication
- /api/uploads - File serving
- Custom endpoints for each module

FEATURES BY MODULE

DASHBOARD
- User management
- Role management
- Work request overview
- Analytics and reports
- Image and video management
- Complaint handling

CEO PORTAL
- File review and approval
- Flexible file assignment
- Complete files without full workflow
- Analytics dashboard
- Request approvals
- Profile management

COO PORTAL
- Operational oversight
- Request approvals
- Analytics
- Profile management

CE PORTAL
- Engineering approvals
- Work request management
- Profile management

AGENT PORTAL
- Create work requests
- Upload before/after media
- View assigned requests
- Location-based requests

E-FILING SYSTEM
- File creation and editing
- Workflow management
- Stage-based progression
- SLA tracking
- Digital signatures
- Document approval
- File search and filters
- Notifications

NOTIFICATIONS
- Real-time notifications
- Action-based alerts
- Email notifications
- Priority levels
- Read/unread status

ANALYTICS
- Dashboard statistics
- Work request analytics
- User activity tracking
- SLA reports
- Chart visualizations

FILE MANAGEMENT
- Secure file uploads
- Image optimization
- Video processing
- File versioning
- Download permissions
- Auto-cleanup of old files

DATABASE STRUCTURE
Main tables include users, work_requests, images, videos, efiling_files, efiling_file_workflows, efiling_workflow_stages, efiling_users, efiling_roles, efiling_departments, notifications, file_movements, signatures, and many more.

The system handles thousands of files and users simultaneously with proper indexing and query optimization.

