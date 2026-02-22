# Cache Troubleshooting Guide

## Problem: UI Changes Not Appearing Until PC Restart

If you're experiencing issues where UI changes don't appear on localhost until you restart your PC, this is likely due to caching issues. This guide will help you resolve this problem.

## Root Cause

The issue is caused by multiple layers of caching:
1. **Next.js Build Cache** (`.next` folder) - Stores compiled JavaScript and assets
2. **Webpack Cache** - Caches build artifacts for faster rebuilds
3. **Browser Cache** - Caches static assets (CSS, JS, images)
4. **Node Modules Cache** - Caches dependencies and build artifacts

## Quick Solutions

### Solution 1: Use the Clean Development Command (Recommended)

Instead of using `npm run dev`, use the clean development command:

```bash
npm run dev:clean
```

This command clears the Next.js build cache before starting the development server.

### Solution 2: Clear All Caches

For a comprehensive cache clear, use the cache clearing script:

```bash
npm run clean:all
```

This script clears:
- Next.js build cache (`.next` folder)
- Node modules cache
- TypeScript cache
- ESLint cache
- Editor swap files
- Log files

### Solution 3: Manual Cache Clearing

If you prefer manual control, you can clear caches individually:

```bash
# Clear Next.js build cache
rm -rf .next

# Clear node modules cache
rm -rf node_modules/.cache

# Clear TypeScript cache
rm -f tsconfig.tsbuildinfo

# Clear ESLint cache
rm -f .eslintcache
```

## Browser Cache Clearing

After clearing the server-side caches, you may also need to clear your browser cache:

### Hard Refresh (Most Common)

- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

### Disable Browser Cache (Development Only)

For development, you can disable browser caching:

**Chrome/Edge:**
1. Open DevTools (`F12` or `Cmd+Option+I`)
2. Go to the **Network** tab
3. Check **Disable cache**
4. Keep DevTools open while developing

**Firefox:**
1. Open DevTools (`F12` or `Cmd+Option+I`)
2. Go to the **Settings** (gear icon)
3. Check **Disable HTTP Cache**
4. Keep DevTools open while developing

## Configuration Changes Made

We've updated the project configuration to prevent caching issues in development:

### 1. Updated [`next.config.ts`](next.config.ts)

- **Disabled webpack caching** in development mode
- **Added aggressive cache-busting headers** for development
- **Disabled image optimization** in development for faster builds

### 2. Added Cache Clearing Script

Created [`scripts/clear-cache.sh`](scripts/clear-cache.sh) - a comprehensive script that clears all caches.

### 3. Updated Package Scripts

Added new npm scripts:
- `npm run clean:all` - Clears all caches
- `npm run dev:clean` - Starts dev server with clean build

## Best Practices for Development

### Always Use Clean Development

```bash
# Instead of:
npm run dev

# Use:
npm run dev:clean
```

### Clear Caches Regularly

If you notice changes not appearing:
1. Stop the development server (`Ctrl + C`)
2. Clear caches: `npm run clean:all`
3. Restart the server: `npm run dev:clean`
4. Hard refresh your browser

### Watch for Specific File Types

Some file types may require additional attention:
- **CSS files**: Changes should appear immediately with hot reload
- **Component files**: May require a browser refresh
- **Configuration files**: Always require server restart
- **Environment variables**: Always require server restart

## Troubleshooting Steps

If UI changes still don't appear:

1. **Clear all caches**
   ```bash
   npm run clean:all
   ```

2. **Restart the development server**
   ```bash
   npm run dev:clean
   ```

3. **Hard refresh your browser**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

4. **Clear browser cache manually**
   - Chrome: Settings > Privacy and security > Clear browsing data
   - Firefox: Settings > Privacy & Security > Cookies and Site Data > Clear Data

5. **Check for running processes**
   ```bash
   # Kill any running Next.js processes
   pkill -f "next dev"
   ```

6. **Try incognito/private mode**
   - Open your app in incognito mode to rule out browser extensions

## Prevention Tips

### 1. Use the Right Command Always

Make it a habit to use `npm run dev:clean` instead of `npm run dev`.

### 2. Keep DevTools Open

Keep browser DevTools open with cache disabled during development.

### 3. Regular Cache Clearing

Clear caches at least once a day or after making significant changes.

### 4. Monitor Build Output

Watch the terminal output for any cache-related warnings or errors.

## Additional Resources

- [Next.js Caching Documentation](https://nextjs.org/docs/app/building-your-application/caching)
- [Webpack Caching Guide](https://webpack.js.org/guides/caching/)
- [Browser Caching Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)

## Still Having Issues?

If you've tried all the above and still experience caching issues:

1. Check the [`next.config.ts`](next.config.ts) file for any custom caching rules
2. Review the [`lib/cache/cache-manager.ts`](lib/cache/cache-manager.ts) for application-level caching
3. Check browser console for any cache-related errors
4. Try a different browser to isolate the issue
5. Consider creating a new browser profile for development

## Summary

The key to resolving caching issues is:
1. **Use `npm run dev:clean`** instead of `npm run dev`
2. **Clear all caches** with `npm run clean:all` when needed
3. **Hard refresh** your browser after clearing caches
4. **Keep DevTools open** with cache disabled during development

Following these practices will ensure your UI changes appear immediately without needing to restart your PC.
