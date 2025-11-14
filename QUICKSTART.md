# Quick Start Guide

Get up and running with the Gospel Ambition AI Lab theme in 5 minutes.

## WordPress Setup (2 minutes)

1. **Upload & Activate Theme**
   - Upload `kingdom-training-theme` folder to `wp-content/themes/`
   - Activate in **Appearance → Themes**

2. **Set Permalinks**
   - Go to **Settings → Permalinks**
   - Select "Post name"
   - Save

3. **Test API**
   - Visit: `https://your-site.com/wp-json/wp/v2/strategy-courses`
   - You should see JSON (even if empty)

## Frontend Setup (3 minutes)

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Visit** `http://localhost:3000`

## Create First Content

1. **Strategy Course**
   - Go to **Strategy Courses → Add New** in WordPress
   - Add title, content, featured image
   - Publish

2. **Article**
   - Go to **Articles → Add New**
   - Add title, content, featured image
   - Publish

3. **Tool**
   - Go to **Tools → Add New**
   - Add title, content, featured image
   - Publish

## Verify Everything Works

- ✅ Homepage shows featured content
- ✅ Strategy courses page displays courses
- ✅ Articles page shows articles
- ✅ Tools page lists tools
- ✅ Navigation works
- ✅ Images load

## Next Steps

- Read [SETUP.md](SETUP.md) for detailed configuration
- Customize colors in `frontend/tailwind.config.js`
- Add more content in WordPress
- Deploy to production (see README.md)

## Troubleshooting

**Can't see content?**
- Check WordPress API URL in `.env.local`
- Verify permalinks are set to "Post name"
- Test API URL in browser

**CORS errors?**
- Already configured in theme
- Check both sites use HTTPS (or both HTTP)

**Images not loading?**
- Add WordPress domain to `frontend/next.config.js` images domains

## Need Help?

See detailed documentation:
- [SETUP.md](SETUP.md) - Complete setup guide
- [README.md](README.md) - Theme overview
- [frontend/README.md](frontend/README.md) - Frontend docs

---

*"Go and make disciples of all nations..."* - Matthew 28:19-20

