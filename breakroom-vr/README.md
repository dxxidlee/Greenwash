# BreakRoom VR - Greenwash Compliance Experience

A simple HTML-based 3D compliance training environment built with Three.js.

## Features

- **Endless 3D Backroom**: Procedurally generated corridors with realistic lighting
- **Compliance Recital**: Interactive recording system with random target attempts
- **WASD Movement**: First-person navigation with mouse look
- **Flickering Atmosphere**: Dynamic ceiling panels and atmospheric effects
- **Exit Authorization**: Complete compliance recitals to unlock exit

## How to Run

```bash
# Start the server
npm start
# or
python3 -m http.server 3001 --directory public
```

Then visit: `http://localhost:3001`

## Controls

- **Click**: Start the experience
- **WASD**: Move around
- **Mouse**: Look around
- **ESC**: Toggle compliance HUD
- **Hold Record Button**: Record compliance recital (2+ seconds required)

## Technical Details

- Pure HTML/CSS/JavaScript
- Three.js for 3D rendering
- No build process required
- Static file serving only

## Vercel Deployment

This is configured as a static site for Vercel:

- **Framework**: Static HTML (no build process)
- **Output Directory**: `public/` or root `index.html`
- **Build Command**: None required
- **Install Command**: None required

## Integration

Links back to main homepage: `/` (relative path for deployment)
