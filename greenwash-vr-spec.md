# Greenwash — VR Backroom Spec (No Code)

**Purpose**  
Build a WebXR VR “endless backroom” with a monochrome green, clinical vibe. Light appears to come from ceiling panels. The player cannot find an exit until they pass a “repeat-after-me” gate.

**Non-Negotiables**
- **Palette:** brand green `#008F46` bias; **all UI/text** = `#008F46` or **white only**.
- **Font:** PPNeueMontreal for all HUD/2D text.
- **Performance:** 72–90 FPS on Meta Quest (Quest Browser/Chromium); provide a smooth **non-VR fallback** (WASD + mouse-look).
- **Spec contains no code. Implement behavior exactly.**

## Stack Target
- Three.js with **React Three Fiber** (`@react-three/fiber`) and **`@react-three/xr`**.
- Post-processing allowed for **selective bloom on panels only**.

## Devices & Fallback
- Primary: Meta Quest (Oculus Browser).
- Desktop Chromium w/ WebXR: supported.
- iOS Safari: immersive-vr unavailable → **fallback** mode (WASD + mouse-look).

## Visual Look & Palette
- Match the uploaded reference photo: columns, drop ceiling, glowing panels, matte materials, liminal mood.
- Global feel: **soft, even illumination** with a **green bias**, very light green fog, **no harsh speculars**.

## Room Layout
- **Play area:** ~18 m × 12 m; **ceiling:** 2.7 m.
- **Columns:** 0.6 m × 0.6 m on a **3 m grid** to create corridors and long sightlines.
- **Openings only** (no doors/windows). Baseboard/trim ~0.08 m.
- **Ceiling:** 0.6 m tiles with **emissive rectangular panels** (~1.2 m × 0.6 m) approximately every two tiles.

## Ceiling Panel Glow (Selective Bloom)
- Panels are the **apparent light source**: pale green-white **emissive** (not neon).
- **Selective bloom** applies to **panels only**; walls/floor must not bloom.
- Tone mapping: filmic; adjust **emissive intensity** before global exposure to prevent clipping.
- Bloom feel: soft halo, subtle–moderate strength, medium radius.

## Endless Backroom (Loop Method)
**Use Floating-Origin / Tile Recycler (no teleports):**
- Maintain a **3×3 grid** of **6 m × 6 m tiles** centered on the player.
- When crossing a tile boundary, **recycle** the opposite row/column so the player stays near world origin.
- Lighting + fog must hide recycling—**no visible pops or seams**.
- All assets (audio, colliders, panels) remain attached to their tiles.

## Locomotion & Comfort
- VR controllers: **teleport or smooth stick** (head-forward), calm speed.
- Physics colliders stop wall penetration; openings always lead to more space.
- Maintain comfort: no flicker, no rapid light changes.

## Audio
- Low HVAC hum loop + subtle fluorescent buzz; occasional distant thumps (very subtle).
- No directional cues implying an exit.
- Mic permission is **requested later** by the HUD gate (see below).

## Head-Locked HUD (Compliance Recital)
- HUD is **head-locked** (anchored to camera), ~**1.6 m** from eyes, ~**−6°** below eye line; **never closer than 1.2 m**.
- Layout (PPNeueMontreal; green/white only):
  - Small title: **COMPLIANCE RECITAL**
  - Main line: **“Uniform green is policy. Compliance is a public good. I affirm my role in Greenwash.”**
  - Controls row: **[Record / Hold]** pill, small level meter, attempt counter.
- Style: **light/silver glass** (tint like `#d9d9d9`, translucent, blur/saturation). HUD text = green; control affordances can be white on glass.

## Repeat-After-Me Gate (Roulette)
- On first entry, set **`targetAttempts` = random integer 1–100** (persist to session/localStorage).
- **Press-and-hold Record** starts mic capture (or fallback timer if mic denied).
- Count an attempt only if **hold/record ≥ 2.0 s**.
- Feedback after each attempt:
  - Not reached: brief banner **“NONCOMPLIANT — BEGIN AGAIN.”**
  - When **attempts ≥ targetAttempts**: show **“EXIT AUTHORIZED”** (~2 s) and enable Exit.

## Exit Behavior
- Exit is disabled until **authorized**.
- On trigger: **fade to black ≤ 500 ms**, then exit VR / return to desktop UI.
- Keep unlocked state for the session; optional reset on site leave.

## Performance Constraints
- Instance/merge repeating meshes (ceiling tiles, panels, columns).
- Keep total triangles **< ~500k**; keep bloom selective; fog lightweight.
- Maintain 72–90 FPS; no hitches on tile recycling.

## Acceptance Checklist
- Corridors feel **endless**; recycling is **imperceptible**.
- Ceiling panels clearly read as **light sources** with soft green glow; walls/floor don’t bloom.
- Matte, green-family materials; light green fog adds depth like the reference.
- VR locomotion comfortable; performance within target.
- HUD stable and readable; attempts register ≥ 2.0 s holds.
- Exit unlocks on the session’s random 1–100 attempts; fade out works.
- All UI/text strictly **#008F46 or white**; font is **PPNeueMontreal**.

## Implementation Order
1) Base room + materials + performance pass.  
2) Endless loop via Floating-Origin Tile Recycler.  
3) Panel glow + selective bloom + tone mapping.  
4) Locomotion + colliders + fog/comfort.  
5) Head-locked HUD scaffold.  
6) Repeat-After-Me gate (roulette).  
7) Exit behavior + fade.  
8) Final QA against Acceptance Checklist.
