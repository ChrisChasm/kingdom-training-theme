<?php
/**
 * Main template file for Kingdom.Training theme
 * 
 * This file serves as a fallback. The actual frontend is served by Next.js
 * static files from the /dist directory via the template_redirect hook in functions.php
 */

// This should rarely be reached if the frontend is properly built
// It serves as a fallback if the Next.js build is not available

get_header();
?>

<div style="max-width: 800px; margin: 50px auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
    <h1 style="color: #1A237E;">Kingdom.Training</h1>
    <p>The Next.js frontend should be served automatically. If you're seeing this page, the frontend may not be built yet.</p>
    
    <h2>Build the Frontend</h2>
    <p>To build and deploy the Next.js frontend to this theme:</p>
    <ol>
        <li>Navigate to the <code>/frontend</code> directory</li>
        <li>Run <code>npm run build:theme</code></li>
        <li>This will build Next.js and copy the files to the theme's <code>/dist</code> directory</li>
    </ol>
    
    <h2>Development</h2>
    <p>For development, you can run the Next.js dev server separately:</p>
    <ol>
        <li>Navigate to the <code>/frontend</code> directory</li>
        <li>Run <code>npm run dev</code></li>
        <li>Visit <code>http://localhost:3000</code></li>
    </ol>
    
    <h2>API Endpoints</h2>
    <ul>
        <li>Strategy Courses: <code><?php echo esc_url(rest_url('wp/v2/strategy-courses')); ?></code></li>
        <li>Articles: <code><?php echo esc_url(rest_url('wp/v2/articles')); ?></code></li>
        <li>Tools: <code><?php echo esc_url(rest_url('wp/v2/tools')); ?></code></li>
        <li>Site Info: <code><?php echo esc_url(rest_url('gaal/v1/site-info')); ?></code></li>
        <li>Primary Menu: <code><?php echo esc_url(rest_url('gaal/v1/menus/primary')); ?></code></li>
    </ul>
</div>

<?php
get_footer();

