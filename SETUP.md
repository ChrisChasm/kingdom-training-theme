# Gospel Ambition AI Lab Theme - Setup Guide

Complete setup instructions for the headless WordPress theme with Next.js frontend.

## Overview

This is a headless WordPress setup where:
- **WordPress** serves as the backend CMS (content management)
- **Next.js** serves as the frontend (what users see)
- They communicate via the WordPress REST API

## Prerequisites

- WordPress 6.0 or higher
- PHP 7.4 or higher
- Node.js 18 or higher
- npm or yarn package manager

## Part 1: WordPress Setup

### 1. Install the WordPress Theme

1. Upload the entire `kingdom-training-theme` folder to your WordPress installation's `wp-content/themes/` directory

2. Activate the theme in WordPress Admin:
   - Go to **Appearance → Themes**
   - Find "Gospel Ambition AI Lab - Headless Theme"
   - Click "Activate"

### 2. Configure WordPress Settings

#### Permalinks
1. Go to **Settings → Permalinks**
2. Select **"Post name"**
3. Click "Save Changes"

This is critical for the REST API to work properly.

#### Create Navigation Menu
1. Go to **Appearance → Menus**
2. Create a new menu called "Primary Menu"
3. Add these pages to the menu:
   - Strategy Courses
   - Articles
   - Tools
   - About
4. Assign the menu to the "Primary Menu" location
5. Save the menu

### 3. Test the WordPress REST API

Open your browser and visit these URLs (replace `your-site.com` with your WordPress URL):

```
https://your-site.com/wp-json/wp/v2/strategy-courses
https://your-site.com/wp-json/wp/v2/articles
https://your-site.com/wp-json/wp/v2/tools
https://your-site.com/wp-json/gaal/v1/site-info
```

You should see JSON responses. If you get errors, check:
- Permalinks are set to "Post name"
- The theme is activated
- Your server allows REST API requests

### 4. Create Sample Content

Create some sample content to test with:

#### Strategy Course
1. Go to **Strategy Courses → Add New**
2. Enter a title and content
3. Add a featured image (recommended)
4. Publish

#### Article
1. Go to **Articles → Add New**
2. Enter a title and content
3. Add a featured image (recommended)
4. Publish

#### Tool
1. Go to **Tools → Add New**
2. Enter a title and content
3. Add a featured image (recommended)
4. Publish

## Part 2: Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- Next.js
- React
- Tailwind CSS
- TypeScript
- Other dependencies

### 3. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# WordPress REST API URL (include /wp-json)
NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json

# Site Configuration
NEXT_PUBLIC_SITE_NAME=Gospel Ambition AI Lab
NEXT_PUBLIC_SITE_URL=https://your-frontend-site.com
```

**Important Notes:**
- Replace `your-wordpress-site.com` with your WordPress domain
- Include `/wp-json` at the end of the WordPress API URL
- If WordPress is on localhost, use: `http://localhost:8888/wp-json` (adjust port as needed)

### 4. Run Development Server

```bash
npm run dev
```

The frontend will start at `http://localhost:3000`

Open your browser and visit:
- Homepage: `http://localhost:3000`
- Strategy Courses: `http://localhost:3000/strategy-courses`
- Articles: `http://localhost:3000/articles`
- Tools: `http://localhost:3000/tools`
- About: `http://localhost:3000/about`

### 5. Test the Integration

1. Visit the homepage - you should see content from WordPress
2. Click on a strategy course, article, or tool
3. Verify images are loading
4. Check that navigation works

## Part 3: Customization

### Update Brand Colors

Edit `frontend/tailwind.config.js` to change colors:

```javascript
colors: {
  primary: {
    600: '#YOUR_PRIMARY_COLOR',
  },
  secondary: {
    500: '#YOUR_SECONDARY_COLOR',
  },
  // ... etc
}
```

### Add Custom Post Type Fields

To add custom fields in WordPress:

1. Install Advanced Custom Fields (ACF) plugin
2. Create field groups for your custom post types
3. Register fields in the REST API by editing `functions.php`

Example:

```php
register_rest_field(
    'strategy_course',
    'custom_field',
    array(
        'get_callback' => function($object) {
            return get_post_meta($object['id'], 'custom_field', true);
        },
    )
);
```

### Modify Components

All React components are in `frontend/src/components/`. Edit them to customize:

- `Header.tsx` - Navigation and logo
- `Footer.tsx` - Footer content
- `Hero.tsx` - Homepage hero section
- `ContentCard.tsx` - Card design for posts

## Part 4: Deployment

### WordPress Deployment

Deploy WordPress to any hosting provider:
- WP Engine
- Kinsta
- SiteGround
- Cloudways
- Bluehost

Make sure the REST API is accessible from your frontend domain.

### Frontend Deployment

#### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Set root directory to `frontend`
6. Add environment variables
7. Deploy

#### Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Set base directory to `frontend`
6. Set build command: `npm run build`
7. Set publish directory: `.next`
8. Add environment variables
9. Deploy

#### Self-Hosting

Build the application:

```bash
cd frontend
npm run build
npm start
```

Run on a server with Node.js using PM2 or similar process manager.

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. The theme already includes CORS headers in `functions.php`
2. Verify your WordPress site is accessible
3. Check that both sites use HTTPS (or both use HTTP)
4. Consider using a CORS plugin if needed

### Images Not Loading

1. Verify featured images are set in WordPress
2. Check the `next.config.js` domains list
3. Add your WordPress domain to the allowed domains:

```javascript
images: {
  domains: ['your-wordpress-domain.com'],
}
```

### API Connection Failed

1. Test the API URL in your browser
2. Verify `.env.local` has the correct URL
3. Check WordPress is online and accessible
4. Ensure permalinks are set to "Post name"

### Build Errors

Clear cache and rebuild:

```bash
rm -rf .next node_modules
npm install
npm run build
```

## Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use HTTPS** for production
3. **Keep WordPress updated**
4. **Use strong passwords**
5. **Install a security plugin** (Wordfence, Sucuri, etc.)
6. **Backup regularly**

## Performance Tips

1. **Use a CDN** for static assets
2. **Enable caching** in WordPress
3. **Optimize images** before uploading
4. **Use a caching plugin** (WP Rocket, W3 Total Cache)
5. **Enable ISR** in Next.js (already configured)

## Content Management Workflow

1. Content creators work in WordPress admin
2. They create/edit strategy courses, articles, and tools
3. Content is automatically available via REST API
4. Frontend fetches and displays the content
5. ISR updates the frontend every hour (configurable)

## Support Resources

- WordPress REST API: https://developer.wordpress.org/rest-api/
- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- React: https://react.dev

## Next Steps

1. ✅ Set up WordPress and activate theme
2. ✅ Create sample content
3. ✅ Install frontend dependencies
4. ✅ Configure environment variables
5. ✅ Test locally
6. 🔲 Customize design and colors
7. 🔲 Add more content
8. 🔲 Deploy to production
9. 🔲 Share the gospel!

## Mission

Remember: This tool exists to serve the great commission. Every line of code, every feature, every design decision should ultimately help gospel workers share Jesus better.

*"Go and make disciples of all nations..."* - Matthew 28:19-20

