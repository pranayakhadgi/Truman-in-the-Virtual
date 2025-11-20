# Setting Environment Variables in Vercel

## Method 1: Via Vercel Dashboard (Recommended)

### Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Sign in to your account

2. **Select Your Project**
   - Click on your project: `Truman-in-the-Virtual`
   - Or go to: https://vercel.com/dashboard

3. **Navigate to Settings**
   - Click on the **Settings** tab in the project dashboard
   - Look for **Environment Variables** in the left sidebar
   - Click on **Environment Variables**

4. **Add Environment Variables**
   - Click the **Add New** button
   - Enter the following variables one by one:

   **Variable 1: MONGODB_URI**
   - **Key**: `MONGODB_URI`
   - **Value**: Your MongoDB Atlas connection string
     - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/truman-virtual-tour?retryWrites=true&w=majority`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

   **Variable 2: NODE_ENV**
   - **Key**: `NODE_ENV`
   - **Value**: `production`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

5. **Redeploy**
   - After adding variables, go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger automatic redeployment

## Method 2: Via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variable for production
vercel env add MONGODB_URI production
# When prompted, paste your MongoDB connection string

# Add environment variable for preview
vercel env add MONGODB_URI preview
# Paste the same connection string

# Add environment variable for development
vercel env add MONGODB_URI development
# Paste the same connection string

# Add NODE_ENV
vercel env add NODE_ENV production
# Enter: production

vercel env add NODE_ENV preview
# Enter: production

vercel env add NODE_ENV development
# Enter: development

# Redeploy to apply changes
vercel --prod
```

## Getting Your MongoDB Connection String

1. **Go to MongoDB Atlas**
   - Visit https://www.mongodb.com/cloud/atlas
   - Sign in to your account

2. **Get Connection String**
   - Click **Database** → **Connect**
   - Choose **Connect your application**
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with `truman-virtual-tour` (or your database name)

3. **Example Format**
   ```
   mongodb+srv://username:yourpassword@cluster0.xxxxx.mongodb.net/truman-virtual-tour?retryWrites=true&w=majority
   ```

## Verifying Environment Variables

### Check in Vercel Dashboard
1. Go to **Settings** → **Environment Variables**
2. Verify both variables are listed:
   - `MONGODB_URI`
   - `NODE_ENV`

### Test in Deployment
1. Go to **Deployments** → Latest deployment
2. Click **Functions** tab
3. Click on any function
4. Check **Logs** to see if database connection works
5. Or visit: `https://your-project.vercel.app/api/health`
   - Should return: `{"status":"OK","database":"Connected"}`

## Troubleshooting

### Environment Variables Not Working
- **Issue**: Variables not accessible in code
- **Solution**: 
  - Ensure variables are added to the correct environment (Production/Preview/Development)
  - Redeploy after adding variables
  - Check variable names match exactly (case-sensitive)

### Database Connection Fails
- **Issue**: API returns database connection error
- **Solution**:
  - Verify `MONGODB_URI` is correct
  - Check MongoDB Atlas network access (must allow `0.0.0.0/0`)
  - Verify database user credentials
  - Check Vercel function logs for specific error

### Variables Not Updating
- **Issue**: Changes not reflected after redeploy
- **Solution**:
  - Wait a few minutes for deployment to complete
  - Clear browser cache
  - Check deployment logs for errors
  - Verify variables are saved in Vercel dashboard

## Security Notes

- Never commit `.env` files to Git
- Environment variables in Vercel are encrypted at rest
- Use different MongoDB credentials for production vs development
- Restrict MongoDB Atlas network access when possible
- Rotate credentials periodically

## Quick Reference

**Required Variables:**
- `MONGODB_URI` - MongoDB Atlas connection string
- `NODE_ENV` - Set to `production` for production deployments

**Where to Add:**
- Vercel Dashboard → Project → Settings → Environment Variables

**After Adding:**
- Redeploy the project to apply changes

