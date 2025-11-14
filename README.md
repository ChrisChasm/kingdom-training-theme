# Gospel Ambition AI Lab - Headless WordPress Theme

A modern headless WordPress theme built with Next.js, React, and Tailwind CSS, designed for the Gospel Ambition AI Lab.

## Overview

This theme uses WordPress as a headless CMS, serving content via the REST API to a Next.js frontend. It's optimized for displaying Strategy Courses, Articles, and Tools focused on practical AI applications for discipleship and outreach in the majority world.

## Project Structure

```
kingdom-training-theme/
├── style.css              # Theme information
├── functions.php          # WordPress functionality & REST API customization
├── index.php             # Fallback template (for WordPress requirement)
├── header.php            # HTML head
├── footer.php            # HTML footer
├── README.md             # This file
└── frontend/             # Next.js application
    ├── src/
    │   ├── app/          # Next.js 13+ app router
    │   ├── components/   # React components
    │   ├── lib/          # Utilities and API functions
    │   └── styles/       # Global styles
    ├── public/           # Static assets
    └── package.json      # Node dependencies
```

## WordPress Setup

### Installation

1. Upload this theme to your WordPress `wp-content/themes/` directory
2. Activate the theme in WordPress admin
3. Go to **Settings → Permalinks** and set to "Post name"
4. Go to **Appearance → Menus** and create a Primary menu with links to:
   - Strategy Courses
   - Articles
   - Tools

### Custom Post Types

The theme registers three custom post types:

- **Strategy Courses** (`strategy_course`) - `/wp-json/wp/v2/strategy-courses`
- **Articles** (`article`) - `/wp-json/wp/v2/articles`
- **Tools** (`tool`) - `/wp-json/wp/v2/tools`

All custom post types support:
- Title, content, excerpt
- Featured images
- Custom fields
- Categories and tags
- REST API access

### Custom API Endpoints

- **Site Info**: `/wp-json/gaal/v1/site-info`
- **Menus**: `/wp-json/gaal/v1/menus/{location}` (e.g., `/wp-json/gaal/v1/menus/primary`)

### REST API Enhancements

The theme adds the following fields to REST API responses:
- `featured_image_url` - Direct URL to featured image
- `author_info` - Author name, avatar, and bio

## Frontend Setup

### Prerequisites

- Node.js 18+ and npm
- WordPress installation with this theme activated

### Installation

```bash
cd frontend
npm install
```

### Configuration

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the frontend.

### Production Build

```bash
npm run build
npm start
```

## Content Strategy

This theme is designed for the Gospel Ambition AI Lab, which focuses on:

- Practical applications of AI tools for discipleship and outreach
- Serving the majority world where gospel witness is least
- Gathering thought leaders and innovating AI implementations
- Distributing tools to gospel workers worldwide

### Content Types

1. **Strategy Courses** - In-depth training and courses on AI for missions
2. **Articles** - Blog posts, insights, and updates
3. **Tools** - Practical AI tools and resources

## Design System

The theme follows the Kingdom Training brand aesthetic:

### Colors
- Primary: Royal Blue (#2563eb)
- Secondary: Gold/Amber (#f59e0b)
- Accent: Teal (#14b8a6)
- Text: Dark Gray (#1f2937)

### Typography
- Headings: Inter (sans-serif)
- Body: Inter (sans-serif)

## Development Guidelines

### Adding Custom Fields

To add custom fields to the REST API, edit `functions.php`:

```php
register_rest_field(
    array('strategy_course', 'article', 'tool'),
    'your_field_name',
    array(
        'get_callback' => function($object) {
            return get_post_meta($object['id'], 'your_field_name', true);
        },
        'schema' => array(
            'description' => 'Your field description',
            'type' => 'string',
        ),
    )
);
```

### Creating New Components

Components are located in `frontend/src/components/`. Use TypeScript and Tailwind CSS for consistency.

### API Integration

Use the utility functions in `frontend/src/lib/wordpress.ts` for all WordPress API calls.

## Deployment

### WordPress
- Deploy to any standard WordPress hosting (WP Engine, Kinsta, etc.)
- Ensure REST API is accessible from your frontend domain

### Frontend
- Deploy to Vercel, Netlify, or any Node.js hosting
- Set environment variables in your hosting platform
- Configure CORS if WordPress and frontend are on different domains

## Support

For questions or issues:
- Documentation: See inline comments in code files
- WordPress REST API: https://developer.wordpress.org/rest-api/
- Next.js Documentation: https://nextjs.org/docs

## License

GNU General Public License v2 or later

## Mission

"Go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age." - Matthew 28:19-20

