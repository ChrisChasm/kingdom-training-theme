# Watch Mode Setup for MAMP Development

This guide explains how to set up automatic rebuilding and file copying for development with MAMP.

## Quick Start

1. **Start MAMP** and ensure your WordPress site is running

2. **Start the watch mode** in the `frontend` directory:

```bash
cd frontend
npm run watch
```

This will:
- Watch for file changes in `src/`
- Automatically rebuild when you save files
- Copy the build output to your theme's `dist/` directory
- Your MAMP WordPress site will serve the updated files automatically

3. **Make changes** to your React components in `src/`

4. **Refresh your browser** - changes should appear automatically!

## How It Works

The `watch` script runs two processes simultaneously:

1. **BUILD** (blue output): Runs `vite build --watch` which watches your source files and rebuilds on changes
2. **COPY** (green output): Watches the `dist/` directory and automatically copies files to the theme directory when builds complete

## Stopping Watch Mode

Press `Ctrl+C` in the terminal to stop both processes.

## Development Workflow

1. Start MAMP
2. Run `npm run watch` in the `frontend` directory
3. Edit files in `src/`
4. Save files → automatic rebuild → automatic copy → refresh browser
5. See your changes live in MAMP!

## Troubleshooting

### Changes not appearing?

1. Check that the watch process is running (you should see BUILD and COPY outputs)
2. Verify MAMP is running and WordPress is accessible
3. Check browser console for errors
4. Try a hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### Build errors?

- Check the BUILD output (blue) for TypeScript or build errors
- Run `npm run type-check` to check for TypeScript errors separately

### Copy not working?

- Check the COPY output (green) for errors
- Verify the theme's `dist/` directory exists and is writable
- Check file permissions

## Alternative: Manual Build

If you prefer to build manually:

```bash
npm run build:theme
```

This builds once and copies to the theme directory.

## Notes

- Watch mode skips TypeScript type checking for faster rebuilds
- For production builds, use `npm run build:theme` which includes type checking
- The watch script debounces file changes (waits 200ms) to avoid excessive copying

