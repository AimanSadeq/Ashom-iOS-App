# Supabase Backend Integration Guide

This guide explains how to set up and configure Supabase as the backend database for the VIFM GCC Financial Analysis Platform.

## Overview

The application now supports **dual database modes**:
1. **Supabase (PostgreSQL)** - Cloud-hosted database with authentication (recommended for production)
2. **SQLite** - Local fallback database (automatic if Supabase is not configured)

The `SupabaseService` layer automatically detects which database to use and handles the switching transparently.

## Prerequisites

- Node.js 16+ installed
- A Supabase account (free tier available at [supabase.com](https://supabase.com))
- Git (for cloning the repository)

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the project details:
   - **Name**: VIFM GCC Analysis (or any name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your users (e.g., Middle East, Europe)
   - **Pricing Plan**: Free tier is sufficient for development
4. Click "Create new project"
5. Wait 2-3 minutes for the project to be provisioned

## Step 2: Get Your Supabase Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in the sidebar)
2. Navigate to **API** section
3. Copy the following values:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

⚠️ **IMPORTANT**: Keep your `service_role` key secret! Never commit it to version control or share it publicly.

## Step 3: Configure Environment Variables

1. Open the `.env` file in the project root
2. Replace the placeholder values with your actual Supabase credentials:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-key...
```

3. Save the file

## Step 4: Create Database Schema

1. Go to your Supabase project dashboard
2. Click on the **SQL Editor** in the sidebar
3. Click "New Query"
4. Open the `server/supabase_schema.sql` file from this project
5. Copy the entire contents of the SQL file
6. Paste it into the Supabase SQL Editor
7. Click "Run" to execute the schema

This will create:
- 7 tables (companies, financial_metrics, annual_reports, comparisons, watchlist, portfolios, user_preferences)
- Indexes for performance optimization
- Row Level Security (RLS) policies for data protection
- Triggers for automatic timestamp updates

## Step 5: Populate Database with Sample Data

You have two options:

### Option A: Use the Seed Script (Recommended)

The seed script will automatically detect if Supabase is configured and populate the appropriate database.

```bash
npm run seed-db
```

### Option B: Manual Data Import

1. Export data from your existing SQLite database (if you have one)
2. Use Supabase's CSV import feature or SQL INSERT statements
3. Ensure all foreign key relationships are maintained

## Step 6: Verify the Setup

1. Restart your server:
```bash
npm start
```

2. Look for this message in the console:
```
✅ Using Supabase database
```

If you see `✅ Using SQLite database (fallback)`, check your `.env` file for typos.

3. Test the API endpoints:

**Health Check:**
```bash
curl http://localhost:3000/api/health
```

**Companies Endpoint:**
```bash
curl http://localhost:3000/api/companies
```

**Authentication - Demo Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@vifm.com","password":"demo123"}'
```

## Step 7: Enable User Authentication

### Create Your First User

**Option 1: Demo Account (Already Configured)**
- Email: `demo@vifm.com`
- Password: `demo123`
- This is a hardcoded fallback in the auth route

**Option 2: Create Real Users via API**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password",
    "full_name": "John Doe"
  }'
```

**Option 3: Create Users via Supabase Dashboard**
1. Go to **Authentication** > **Users** in Supabase dashboard
2. Click "Add User"
3. Fill in email and password
4. User will receive a confirmation email

## Architecture Overview

### Database Switching Logic

```javascript
// server/supabaseService.js
class SupabaseService {
    constructor() {
        this.useSupabase = isSupabaseEnabled();
        console.log(this.useSupabase
            ? '✅ Using Supabase database'
            : '✅ Using SQLite database (fallback)');
    }
}
```

### Available API Endpoints

**Authentication:**
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current user (requires Bearer token)
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/update-password` - Update password

**Companies:**
- `GET /api/companies` - List all companies (supports filters: country, sector, search)
- `GET /api/companies/:id` - Get company details with financial data
- `GET /api/companies/stats/coverage` - Get statistics by country/sector

**Other Endpoints:**
- `GET /api/reports` - Annual reports
- `POST /api/comparisons` - Create comparisons
- `GET /api/screener` - Company screener
- `GET /api/analytics` - Analytics data

## Row Level Security (RLS) Policies

The database is secured with RLS policies:

### Public Data (Read-Only):
- Companies
- Financial Metrics
- Annual Reports

### User-Specific Data (Read/Write):
- Watchlist
- Portfolios
- Comparisons
- User Preferences

Users can only access their own watchlists, portfolios, and comparisons. This is enforced at the database level.

## Testing the Integration

### Test Authentication Flow

1. **Signup:**
```javascript
const response = await fetch('http://localhost:3000/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    full_name: 'Test User'
  })
});
const data = await response.json();
const token = data.session.access_token;
```

2. **Make Authenticated Request:**
```javascript
const response = await fetch('http://localhost:3000/api/auth/user', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const user = await response.json();
```

### Test Company Data Retrieval

```bash
# Get all Saudi companies
curl http://localhost:3000/api/companies?country=Saudi+Arabia

# Search for companies
curl http://localhost:3000/api/companies?search=ARAMCO

# Get specific company
curl http://localhost:3000/api/companies/1
```

## Troubleshooting

### Issue: "Using SQLite database (fallback)"

**Causes:**
- `.env` file not loaded properly
- Supabase credentials are incorrect or still using placeholders
- Network connectivity issues

**Solutions:**
1. Verify `.env` file exists in project root
2. Check that credentials are correct (no spaces, quotes, or line breaks)
3. Restart the server after changing `.env`
4. Run `node -e "require('dotenv').config(); console.log(process.env.SUPABASE_URL)"` to test

### Issue: API Returns 503 "Supabase authentication is not configured"

**Cause:** Server is using SQLite mode but endpoint requires authentication

**Solution:** Configure Supabase credentials properly or use demo account

### Issue: "Failed to fetch companies" Error

**Causes:**
- Database schema not created
- Tables are empty
- RLS policies blocking access

**Solutions:**
1. Run the schema SQL in Supabase SQL Editor
2. Run `npm run seed-db` to populate data
3. Verify RLS policies in Supabase dashboard under **Authentication** > **Policies**

### Issue: CORS Errors in Browser

**Solution:** The server is configured with `CORS_ORIGIN=*` by default. For production, set specific origins:

```bash
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
```

### Issue: Connection Timeout

**Causes:**
- Firewall blocking Supabase
- Invalid Project URL

**Solution:** Test connection directly:
```bash
curl https://your-project-id.supabase.co/rest/v1/
```

## Migration from SQLite to Supabase

If you have existing SQLite data you want to migrate:

1. **Export SQLite data:**
```bash
sqlite3 vifm.db .dump > data_backup.sql
```

2. **Convert to PostgreSQL format** (SQLite and PostgreSQL have slight syntax differences)
   - Replace `INTEGER PRIMARY KEY` with `SERIAL PRIMARY KEY` or `UUID`
   - Replace `AUTOINCREMENT` with `SERIAL`
   - Update date/time formats if needed

3. **Import to Supabase:**
   - Use Supabase SQL Editor to run converted SQL
   - Or use CSV export/import via Supabase dashboard

4. **Verify data:**
```bash
curl http://localhost:3000/api/companies/stats/coverage
```

## Production Deployment Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use strong, unique passwords for all users
- [ ] Enable email confirmation in Supabase Auth settings
- [ ] Configure proper CORS origins (not `*`)
- [ ] Enable Supabase database backups
- [ ] Set up monitoring and error logging
- [ ] Review and audit RLS policies
- [ ] Enable rate limiting on API endpoints
- [ ] Use HTTPS for all connections
- [ ] Remove demo account credentials from production

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## Support

If you encounter issues:

1. Check server logs for error messages
2. Verify Supabase project status at [status.supabase.com](https://status.supabase.com)
3. Review this documentation
4. Check Supabase dashboard logs under **Logs** > **Database**

## Next Steps

After successful setup:

1. Customize RLS policies for your specific use case
2. Add more authentication providers (Google, GitHub, etc.) via Supabase Auth settings
3. Set up email templates for password reset and email verification
4. Configure database backups and monitoring
5. Implement frontend authentication UI components
6. Add user profile management features

---

**Last Updated:** 2025-01-12
**Version:** 1.0.0
