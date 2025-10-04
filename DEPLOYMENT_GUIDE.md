# Deployment Guide for Greenwash VR Experience

## Issue Resolution
The problem was that Vercel was serving cached/outdated versions of the breakroom-vr files. Here's what was fixed:

### 1. **File Synchronization**
- Removed old `public/breakroom-vr` directory
- Copied latest `breakroom-vr` files to `public/` directory
- Updated Next.js config to use static export

### 2. **Cache Busting**
- Added cache-busting parameter to breakroom redirect
- Updated vercel.json with proper cache headers
- Added explicit rewrite rules for breakroom-vr

### 3. **Build Configuration**
- Added `output: 'export'` to next.config.js
- Added `trailingSlash: true` for proper routing
- Created deploy script in package.json

## Files Updated

### `/src/app/breakroom/page.tsx`
```tsx
useEffect(() => {
  // Redirect to the local breakroom-vr index.html with cache busting
  const timestamp = Date.now();
  window.location.href = `/breakroom-vr/index.html?v=${timestamp}`;
}, []);
```

### `/vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/breakroom-vr",
      "destination": "/breakroom-vr/index.html"
    },
    {
      "source": "/breakroom-vr/index.html",
      "destination": "/breakroom-vr/index.html"
    },
    {
      "source": "/breakroom-vr/:path*",
      "destination": "/breakroom-vr/:path*"
    }
  ],
  "headers": [
    {
      "source": "/breakroom-vr/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

### `/next.config.js`
```javascript
const nextConfig = {
  images: {
    unoptimized: true
  },
  experimental: {
    externalDir: true
  },
  output: 'export',
  trailingSlash: true,
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/breakroom-vr/**', '**/huescan-camera/**']
    }
    return config
  }
}
```

## Deployment Steps

1. **Run the deploy script:**
   ```bash
   npm run deploy
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Verify the deployment:**
   - Visit your Vercel URL
   - Click on BreakRoom video
   - Should now load the updated VR experience with:
     - PPNeueMontreal font
     - gw-glass styling
     - Proper glass effects
     - Updated UI elements

## What's Fixed

✅ **Font**: Now uses PPNeueMontreal instead of Space Grotesk  
✅ **Styling**: All UI elements use gw-glass classes  
✅ **Cache Issues**: Cache-busting prevents old versions  
✅ **Routing**: Proper Vercel configuration for static files  
✅ **Build**: Static export ensures all files are included  

The VR experience should now load the latest version with all the styling updates when you click BreakRoom on the homepage in Vercel.
