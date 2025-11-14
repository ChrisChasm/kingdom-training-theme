# Building and Deploying the Kingdom.Training Theme

This theme integrates Next.js React frontend directly into the WordPress theme, so the frontend is served from WordPress rather than as a separate application.

## Architecture

- **WordPress**: Serves as the CMS and REST API backend
- **Next.js**: Built as static files and served from the theme's `/dist` directory
- **Integration**: WordPress `functions.php` routes all frontend requests to serve the Next.js static files

## Development Workflow

### Option 1: Development with Next.js Dev Server (Recommended for Development)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```env
   NEXT_PUBLIC_WORDPRESS_API_URL=http://your-wordpress-site.com/wp-json
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000` to see your changes

### Option 2: Build and Serve from WordPress Theme

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Build and copy to theme:
   ```bash
   npm run build:theme
   ```

   This command:
   - Builds Next.js as static files (`next build`)
   - Copies the build output to the theme's `/dist` directory

3. The frontend is now served from your WordPress site at the WordPress URL

## Production Deployment

### Step 1: Build the Frontend

```bash
cd frontend
npm run build:theme
```

This creates a `/dist` directory in the theme root with all static files.

### Step 2: Deploy the Theme

Upload the entire theme directory to your WordPress installation:
- `/wp-content/themes/kingdom-training-theme/`

Make sure the `/dist` directory is included in your deployment.

### Step 3: Activate the Theme

1. Go to WordPress Admin → Appearance → Themes
2. Activate "Kingdom.Training - Headless Theme"
3. Visit your site - the Next.js frontend should be served automatically

## File Structure After Build

```
kingdom-training-theme/
├── dist/                    # Next.js static build output (generated)
│   ├── index.html
│   ├── _next/
│   │   ├── static/
│   │   └── ...
│   └── ...
├── frontend/               # Next.js source code
│   ├── src/
│   ├── package.json
│   └── ...
├── functions.php           # WordPress functions (serves /dist)
├── index.php              # Fallback template
└── style.css              # Theme info
```

## How It Works

1. When a visitor requests a page on your WordPress site
2. WordPress checks if the request is for admin, REST API, etc. (if so, normal WordPress handling)
3. Otherwise, `functions.php` intercepts the request via `template_redirect` hook
4. It looks for the corresponding file in `/dist` directory
5. If found, serves the Next.js static file
6. If not found, falls back to `index.php` template

## Troubleshooting

### Frontend Not Showing

1. **Check if `/dist` directory exists**: The build must be run first
2. **Check file permissions**: WordPress needs read access to `/dist` directory
3. **Clear WordPress cache**: If using caching plugins
4. **Check WordPress permalinks**: Settings → Permalinks → Save (this flushes rewrite rules)

### API Errors

The frontend automatically uses `/wp-json` when served from WordPress (relative path). If you see API errors:
- Check that WordPress REST API is accessible
- Verify CORS is enabled (already configured in `functions.php`)
- Check browser console for specific error messages

### Assets Not Loading

If CSS/JS/images aren't loading:
- Check that the `_next/static/` directory exists in `/dist`
- Verify file permissions
- Check browser console for 404 errors

## Updating the Frontend

After making changes to the React/Next.js code:

1. **Development**: Use `npm run dev` in the frontend directory
2. **Production**: Run `npm run build:theme` and redeploy the theme

## Notes

- The `/dist` directory should be included in version control if you want to deploy pre-built files
- Alternatively, build on the server after deployment
- The frontend uses static export, so all pages are pre-rendered at build time
- API calls are made client-side after the page loads

