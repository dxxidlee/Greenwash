# Greenwash PRD

## Overview
- **Concept**: Futuristic dystopian desktop UI (year 2037).  
- **Main Color**: #008F46  
- **Tech Stack**: React (Next.js), Tailwind, Three.js, WebRTC  

## Core Features
### Home Page
- Circle of 7 rotating video icons  
- Hover → enlarge, pause, blur others, show subtitle (glass style)  
- Scroll → speeds rotation  
- UI:
  - Top Left: Worker face → project info pop-up  
  - Top Right: Live clock + “SEP XX 2037”  
  - Bottom Center: NYC seal + Greenwash logo  

### Subpages (All Pop-ups)
1. **Ministry of Love (VR Room)**  
   - Three.js green backroom  
   - WASD navigation  
   - Wall text → record repeating audio (1–100 times, randomized)  
   - Warning if exiting early  
   - Implementation spec: See greenwash-vr-spec.md for build-level requirements (endless backroom, panel glow, WebXR locomotion, head-locked HUD, “repeat-after-me” exit gate)

2. **Compliance Manual**  
   - Glass-style text, blurred background  

3. **Scanner**  
   - Camera feed (front/back)  
   - Detects green compliance (#008F46 ± tolerance)  
   - Shows % match + compliance text  

4. **Request Terminal**  
   - Split screen: permits vs violations  
   - Resize panes  
   - Submit + view past logs  

5. **Files**  
   - Finder-style grid  
   - Click → enlarge preview  

6. **Notes/Journal**  
   - Upload photo + text log  
   - View past logs  

7. **Quiz**  
   - 5–10 multiple choice  
   - Fail → redirect to Ministry of Love  

## Technical Notes
- Use **prebuilt frameworks**:  
  - Three.js starter templates  
  - React camera components  
  - Tailwind glassmorphism utilities  
- Mobile responsive but desktop optimized  
- All pop-ups reusable components  

## Stretch Goals
- Multiplayer VR  
- AI voice compliance checker  
- Cloud storage for logs + quizzes  
