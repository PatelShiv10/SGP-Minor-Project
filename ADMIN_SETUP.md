# Admin Setup Guide

## Creating an Admin User

To access the admin dashboard, you need to create an admin user in the database. Follow these steps:

### 1. Run the Admin Creation Script

In the backend directory, run:

```bash
npm run create-admin
```

This will create an admin user with the following credentials:
- **Email**: admin@lawmate.com
- **Password**: admin123

### 2. Login as Admin

1. Go to the login page
2. Select the "Admin" tab
3. Enter the credentials:
   - Email: admin@lawmate.com
   - Password: admin123
4. Click "Sign In as Admin"

### 3. Access Admin Dashboard

After successful login, you'll be redirected to the admin dashboard where you can:
- View and manage lawyer registrations
- Approve/reject lawyer applications
- View feedback and manage the platform

## Troubleshooting

If you get "Failed to fetch lawyers" error:

1. Make sure the backend server is running
2. Ensure you're logged in as an admin user
3. Check that the admin user was created successfully
4. Verify your JWT token is valid

## Security Notes

- Change the default admin password after first login
- The admin user is automatically verified and approved
- Only users with admin role can access the admin dashboard 