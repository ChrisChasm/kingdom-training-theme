# Kingdom Training Theme - Frontend

A modern React application built with Vite, TypeScript, and Tailwind CSS, consuming content from a headless WordPress CMS.

## Features

- ⚡ **Vite** - Fast build tool and dev server
- ⚛️ **React 18** with TypeScript
- 🎨 **Tailwind CSS** for styling
- 🧭 **React Router** for client-side routing
- 📱 **Responsive Design** - Mobile-first approach
- 🔄 **Dynamic Data Fetching** - Real-time content from WordPress REST API
- 📦 **Custom Post Types** - Strategy Courses, Articles, Tools

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A WordPress installation with the theme activated
- WordPress REST API accessible

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment variables (optional):**

Create a `.env` file in the root of the frontend directory:

```env
VITE_WORDPRESS_API_URL=http://localhost:8888/wp-json
```

This is only needed for development. When served from WordPress, the app automatically uses relative paths.

3. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

Build and copy to WordPress theme:

```bash
npm run build:theme
```

This will:
1. Build the React app with Vite
2. Copy the build output to the theme's `dist` directory

The WordPress theme will serve the static files directly.

## Project Structure

```
frontend/
├── src/
│   ├── pages/                    # React Router pages
│   │   ├── HomePage.tsx          # Homepage
│   │   ├── ArticlesPage.tsx      # Articles listing
│   │   ├── ArticleDetailPage.tsx # Single article
│   │   ├── StrategyCoursesPage.tsx
│   │   ├── StrategyCourseDetailPage.tsx
│   │   ├── ToolsPage.tsx
│   │   ├── ToolDetailPage.tsx
│   │   ├── AboutPage.tsx
│   │   └── NotFoundPage.tsx      # 404 page
│   ├── components/               # React components
│   │   ├── Header.tsx            # Main navigation
│   │   ├── Footer.tsx            # Site footer
│   │   ├── Hero.tsx              # Hero section
│   │   ├── PageHeader.tsx        # Page headers
│   │   ├── ContentCard.tsx        # Content card component
│   │   └── Loading.tsx            # Loading spinner
│   ├── lib/                      # Utilities and helpers
│   │   ├── wordpress.ts          # WordPress API functions
│   │   └── utils.ts               # Helper functions
│   ├── styles/                    # Global styles
│   │   └── globals.css            # Tailwind and custom CSS
│   ├── App.tsx                    # Main app component with routing
│   └── main.tsx                   # Application entry point
├── public/                        # Static assets
├── scripts/                       # Build scripts
│   └── copy-to-theme.js          # Copy build to theme
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
└── vite.config.ts                # Vite configuration
```

## WordPress Integration

### API Endpoints Used

The application consumes the following WordPress REST API endpoints:

- **Strategy Courses**: `/wp/v2/strategy-courses`
- **Articles**: `/wp/v2/articles`
- **Tools**: `/wp/v2/tools`
- **Site Info**: `/gaal/v1/site-info`
- **Menus**: `/gaal/v1/menus/{location}`

### Custom Fields

The WordPress theme adds these custom fields to API responses:

- `featured_image_url` - Direct URL to featured image
- `author_info` - Author name, avatar, and bio

### Client-Side Routing

The app uses React Router for client-side routing. The WordPress theme's `functions.php` handles routing by:
- Serving static assets (JS, CSS, images) directly
- Serving `index.html` for all routes to enable client-side routing

## Styling

### Tailwind CSS Configuration

The project uses a custom Tailwind configuration based on Kingdom Training brand colors:

- **Primary Blue**: `#4169e1` - Main brand color
- **Secondary Gold**: `#FFD700` - Accent color
- **Gray**: `#2F3E46` - Text and backgrounds

### Custom CSS Classes

Utility classes are defined in `src/styles/globals.css`:

- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.card` - Card component style
- `.container-custom` - Centered container with padding

## Pages

### Home (`/`)
- Hero section with mission statement
- Featured strategy courses, articles, and tools
- Call to action sections

### Strategy Courses (`/strategy-courses`)
- Grid of all strategy courses
- Individual course pages at `/strategy-courses/:slug`

### Articles (`/articles`)
- Grid of all articles
- Individual article pages at `/articles/:slug`

### Tools (`/tools`)
- Grid of all tools
- Individual tool pages at `/tools/:slug`

### About (`/about`)
- Mission and vision
- How we work
- Biblical foundation

## Development

### Adding New Pages

Create a new file in `src/pages/`:

```typescript
import { Link } from 'react-router-dom';

export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
      <Link to="/">Back to Home</Link>
    </div>
  );
}
```

Then add the route in `src/App.tsx`:

```typescript
<Route path="/new-page" element={<NewPage />} />
```

### Adding New Components

Create a new file in `src/components/`:

```typescript
export default function NewComponent() {
  return <div>New Component</div>;
}
```

### Fetching WordPress Data

Use the utility functions in `src/lib/wordpress.ts`:

```typescript
import { useEffect, useState } from 'react';
import { getArticles } from '@/lib/wordpress';

export default function MyComponent() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getArticles({ per_page: 10 });
      setArticles(data);
    }
    fetchData();
  }, []);

  return <div>{/* render articles */}</div>;
}
```

## Deployment

### Building for WordPress Theme

1. Run the build command:

```bash
npm run build:theme
```

2. The build output will be copied to `../dist/` (theme's dist directory)

3. The WordPress theme automatically serves these files

### Development Workflow

1. Make changes to React components
2. Run `npm run dev` to test locally
3. When ready, run `npm run build:theme` to build and copy to theme
4. Refresh WordPress site to see changes

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_WORDPRESS_API_URL` | WordPress REST API base URL (dev only) | `http://localhost:8888/wp-json` |

Note: When served from WordPress, the app automatically uses relative paths (`/wp-json`), so environment variables are only needed for local development.

## Performance

The application uses:

- **Code Splitting** - Automatic code splitting with Vite
- **Tree Shaking** - Unused code eliminated in production
- **Client-Side Routing** - Fast navigation without page reloads
- **Dynamic Data Fetching** - Always fresh content from WordPress

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure your WordPress theme has CORS headers enabled in `functions.php`.

### API Connection Errors

1. Verify WordPress REST API is accessible
2. Test the API endpoint in your browser: `/wp-json`
3. Check WordPress is accessible
4. Ensure SSL certificate is valid (if using HTTPS)

### Build Errors

1. Clear the `dist` directory: `rm -rf dist`
2. Delete `node_modules`: `rm -rf node_modules`
3. Reinstall dependencies: `npm install`
4. Rebuild: `npm run build`

### Routing Issues

If routes don't work when served from WordPress:
1. Check that `functions.php` has the `kingdom_training_serve_frontend()` function
2. Verify the `dist` directory exists in the theme
3. Ensure WordPress permalinks are configured

## Contributing

This is a ministry project focused on the great commission. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of Kingdom Training's mission to equip disciple makers.

## Mission

*"Of the sons of Issachar, men who understood the times, with knowledge of what Israel should do."* - 1 Chronicles 12:32

We exist to train disciple makers to use media strategically for Disciple Making Movements.
