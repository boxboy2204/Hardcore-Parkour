# Hardcore Parkour - Build Roadmap

## Current target (Vertical Slice v0.1)
- Playable auto-runner loop
- 0.2s "PARKOUR!" landing input window
- Three character stat profiles (Michael, Dwight, Andy)
- Obstacles, stumble penalties, style multiplier, performance review score
- Basic world themes that can scale into full levels

## Milestones
1. Core Runner (Now)
- Auto-run, jump, gravity, collisions
- Landing timing mechanic and speed boost
- Currency + style scoring loop

2. Meta Shell
- Conference Room level select (Polaroid board)
- Break Room shop lock/unlock state (Pam key quest gating)
- Annex wardrobe with Dundie unlock checks

3. World Content
- Bullpen / Warehouse / Streets / NYC / Final Pursuit layouts
- Level hazards + scripted events
- Secret warp conditions

4. Missions & Bosses
- Find Pam stealth mission
- Scranton Strangler chase boss
- End concert + finale cutscene

5. Polish
- Loading animation loop and quotes
- PC boss key (F12 behavior substitute)
- Audio pass, SFX pass, accessibility and balancing

## Recommended next coding order
1. Refactor into scene/state modules
2. Add real level data files
3. Build mission scripting system
4. Add save data (unlocks, currencies, achievements)
