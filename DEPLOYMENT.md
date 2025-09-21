# Deployment Instructions

## Production Deployment with Standalone Build

This project uses Next.js with `output: 'standalone'` configuration. Follow these steps for deployment:

### 1. Build the Application
```bash
npm run build
```

### 2. Start the Production Server
**DO NOT use `npm start` or `next start`**

Instead, use:
```bash
node .next/standalone/server.js
```

### 3. Required Directories
Ensure these directories exist on the production server:
- `uploads/agents/`
- `uploads/socialmediaagent/`
- `uploads/before-content/image/`
- `uploads/before-content/video/`
- `uploads/images/`
- `uploads/videos/`

### 4. Environment Variables
Make sure these environment variables are set:
- `NEXTAUTH_URL` - Your production URL
- `NEXTAUTH_SECRET` - A secure secret for NextAuth
- `JWT_SECRET` - A secure secret for JWT tokens
- Database connection variables

### 5. PM2 Configuration
If using PM2, update your ecosystem file to use:
```javascript
{
  "name": "wmp",
  "script": ".next/standalone/server.js",
  "cwd": "/path/to/your/app",
  "env": {
    "NODE_ENV": "production",
    "PORT": 3000
  }
}
```

### 6. File Permissions
Ensure the uploads directory has proper write permissions:
```bash
chmod -R 755 uploads/
```

## Common Issues

### Images Not Loading
- Check if uploads directory exists and has proper permissions
- Verify that the API route `/api/uploads/[...path]` is working
- Test image URLs directly: `http://yoursite.com/api/uploads/agents/image.jpg`

### Database Connection Issues
- Verify database connection parameters
- Check if the database server is accessible from the production server
- Ensure all required database tables exist

### CE Users Creation Fails
- Check if complaint_types table exists and has data
- Verify that the ce_users, ce_user_departments tables exist
- Check database permissions for INSERT operations
