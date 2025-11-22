# AI Game Development Master Guide

This guide establishes the standard for AI-assisted game development, synthesizing best practices from professional game development philosophies (based on Masahiro Sakurai's "Creating Games").

## 1. Core Philosophy (The "Soul" of the Game)

### Risk & Return
- **Definition:** Game mechanics are built on the balance of Risk vs. Return.
- **Application:**
    - High rewards must require high risks (e.g., getting close to enemies to deal more damage).
    - Avoid "flat" difficulty. Create peaks and valleys in tension.
    - **Prompting AI:** "Analyze this mechanic: Does the player take a risk to get this reward? If not, how can we add risk?"

### Stress & Relief
- **Definition:** Fun comes from the release of stress.
- **Application:**
    - Intentionally create stressful situations (enemies, time limits, puzzles) and provide satisfying ways to resolve them.
    - "Slowness is a Sin": Eliminate unnecessary waiting. Fast retries, skippable cutscenes, snappy UI.

### "First 3 Minutes"
- **Definition:** A game must convey its fun within the first 3 minutes.
- **Application:**
    - Start with the climax or a strong hook.
    - Avoid long tutorials. Teach through play.

## 2. Technical Standards (The "Skeleton")

### Parameter Management
- **Rule:** **Separate Code and Data.**
- **Implementation:**
    - **NEVER** hardcode values (speed, damage, probabilities) in logic scripts.
    - Use external files (JSON, const config objects) or dedicated "Parameter Managers".
    - **Naming:** Use clear, searchable names (e.g., `PLAYER_JUMP_FORCE`, `ENEMY_SPAWN_RATE`).
    - **Grouping:** Group parameters by entity or function (e.g., `PlayerStats`, `LevelSettings`).

### Debug Features
- **Rule:** Build tools to cheat.
- **Implementation:**
    - **Debug Mode:** Always include a flag (e.g., `DEBUG_MODE = true`) to enable cheat keys.
    - **Essential Features:**
        - **Invincibility:** For testing mechanics without dying.
        - **Time Scale:** Slow motion (for checking animations/hitboxes) and Fast forward.
        - **Teleport:** Move instantly to key locations.
        - **Info Display:** Show hitboxes, state names, variable values on screen.

### Robustness
- **Rule:** Assume the environment is hostile (especially mobile).
- **Implementation:**
    - **Mobile First:** Handle orientation changes, touch events vs. click events.
    - **Frame Independence:** Use `deltaTime` for all movement and timers.
    - **Safety:** Null checks for DOM elements. Fallback values for missing assets.

### 2.1. Technical Pitfalls & Solutions
- **Audio Autoplay Policies**:
    - **Problem:** Browsers (especially iOS/Chrome) block audio contexts created before user interaction.
    - **Solution:** **Lazy Initialization**. Do not create `new AudioContext()` globally. Create it only inside the first `click`, `touchstart`, or `keydown` event listener.
- **CSS Animation Reliability**:
    - **Problem:** Simply removing and re-adding a class often fails to restart a CSS animation due to browser optimization.
    - **Solution:** **Force Reflow**. Access `element.offsetWidth` between removing and adding the class to force the browser to recalculate layout.
    - **Specificity:** Ensure animation classes have high specificity (e.g., `#container.shake`) to prevent being overridden by media queries or other rules.
- **Input Consistency**:
    - **Rule:** **Drag = Click**. If clicking a wrong item triggers a sound/shake, dragging a wrong item must trigger the EXACT same feedback. Do not fork logic; use shared handler functions.

## 3. UI/UX Standards (The "Face")

### Responsiveness & Feedback
- **Rule:** Every input must have an immediate reaction.
- **Implementation:**
    - **Audio/Visual Feedback:** Button presses should have sound and visual change (scale, color).
    - **Hit Stop:** Freeze frames slightly on impact to give "weight".
    - **Screen Shake:** Use for impacts, but allow it to be disabled.

### Accessibility & Kindness
- **Rule:** Let the player play how they want.
- **Implementation:**
    - **Skippable:** ALL cutscenes and events must be skippable and pausable.
    - **Config:** Key config is mandatory. Sound volume (BGM/SE/Voice) separation.
    - **Text:** Readable font sizes. High contrast.

### Clarity vs. Style
- **Rule:** Prioritize clarity, but use style to sell the world.
- **Implementation:**
    - **Icons:** Use size to indicate importance (bigger = more important).
    - **Color Coding:** Use consistent colors for modes or types (e.g., Red = Attack, Blue = Defense).
    - **Help:** Every menu item should have a one-line help text.

## 4. Creative Standards (The "Atmosphere")

### Sound
- **Rule:** Sound is 50% of the impact.
- **Implementation:**
    - **Priority:** Impact sounds (hits, kills) > BGM > Ambient.
    - **Variety:** Randomize pitch slightly for repetitive sounds (footsteps, shots) to avoid fatigue.
    - **Environment:** Never have true silence. Use subtle ambient noise to create presence.

### Effects (VFX)
- **Rule:** Don't just show it, *sell* it.
- **Implementation:**
    - **Stages:** Flash (start) -> Main Effect (body) -> Smoke/Residue (end).
    - **Visibility:** Effects must not obscure the character or gameplay.
# AI Game Development Master Guide

This guide establishes the standard for AI-assisted game development, synthesizing best practices from professional game development philosophies (based on Masahiro Sakurai's "Creating Games").

## 1. Core Philosophy (The "Soul" of the Game)

### Risk & Return
- **Definition:** Game mechanics are built on the balance of Risk vs. Return.
- **Application:**
    - High rewards must require high risks (e.g., getting close to enemies to deal more damage).
    - Avoid "flat" difficulty. Create peaks and valleys in tension.
    - **Prompting AI:** "Analyze this mechanic: Does the player take a risk to get this reward? If not, how can we add risk?"

### Stress & Relief
- **Definition:** Fun comes from the release of stress.
- **Application:**
    - Intentionally create stressful situations (enemies, time limits, puzzles) and provide satisfying ways to resolve them.
    - "Slowness is a Sin": Eliminate unnecessary waiting. Fast retries, skippable cutscenes, snappy UI.

### "First 3 Minutes"
- **Definition:** A game must convey its fun within the first 3 minutes.
- **Application:**
    - Start with the climax or a strong hook.
    - Avoid long tutorials. Teach through play.

## 2. Technical Standards (The "Skeleton")

### Parameter Management
- **Rule:** **Separate Code and Data.**
- **Implementation:**
    - **NEVER** hardcode values (speed, damage, probabilities) in logic scripts.
    - Use external files (JSON, const config objects) or dedicated "Parameter Managers".
    - **Naming:** Use clear, searchable names (e.g., `PLAYER_JUMP_FORCE`, `ENEMY_SPAWN_RATE`).
    - **Grouping:** Group parameters by entity or function (e.g., `PlayerStats`, `LevelSettings`).

### Debug Features
- **Rule:** Build tools to cheat.
- **Implementation:**
    - **Debug Mode:** Always include a flag (e.g., `DEBUG_MODE = true`) to enable cheat keys.
    - **Essential Features:**
        - **Invincibility:** For testing mechanics without dying.
        - **Time Scale:** Slow motion (for checking animations/hitboxes) and Fast forward.
        - **Teleport:** Move instantly to key locations.
        - **Info Display:** Show hitboxes, state names, variable values on screen.

### Robustness
- **Rule:** Assume the environment is hostile (especially mobile).
- **Implementation:**
    - **Mobile First:** Handle orientation changes, touch events vs. click events.
    - **Frame Independence:** Use `deltaTime` for all movement and timers.
    - **Safety:** Null checks for DOM elements. Fallback values for missing assets.

## 3. UI/UX Standards (The "Face")

### Responsiveness & Feedback
- **Rule:** Every input must have an immediate reaction.
- **Implementation:**
    - **Audio/Visual Feedback:** Button presses should have sound and visual change (scale, color).
    - **Hit Stop:** Freeze frames slightly on impact to give "weight".
    - **Screen Shake:** Use for impacts, but allow it to be disabled.

### Accessibility & Kindness
- **Rule:** Let the player play how they want.
- **Implementation:**
    - **Skippable:** ALL cutscenes and events must be skippable and pausable.
    - **Config:** Key config is mandatory. Sound volume (BGM/SE/Voice) separation.
    - **Text:** Readable font sizes. High contrast.

### Clarity vs. Style
- **Rule:** Prioritize clarity, but use style to sell the world.
- **Implementation:**
    - **Icons:** Use size to indicate importance (bigger = more important).
    - **Color Coding:** Use consistent colors for modes or types (e.g., Red = Attack, Blue = Defense).
    - **Help:** Every menu item should have a one-line help text.

## 4. Creative Standards (The "Atmosphere")

### Sound
- **Rule:** Sound is 50% of the impact.
- **Implementation:**
    - **Priority:** Impact sounds (hits, kills) > BGM > Ambient.
    - **Variety:** Randomize pitch slightly for repetitive sounds (footsteps, shots) to avoid fatigue.
    - **Environment:** Never have true silence. Use subtle ambient noise to create presence.

### Effects (VFX)
- **Rule:** Don't just show it, *sell* it.
- **Implementation:**
    - **Stages:** Flash (start) -> Main Effect (body) -> Smoke/Residue (end).
    - **Visibility:** Effects must not obscure the character or gameplay.
    - **Scale:** Ensure effects match the scale of the action (big hit = big boom).

## 5. Process Standards

### Version Control
- **Rule:** One Game = One Repository.
- **Commit Messages:** Be specific (e.g., "Fix: Player jump height").
- **Tags:** Use semantic versioning (v1.0.0) for releases.

### Task Management
- **Rule:** Everything is a ticket (or a task item).
- **Tracking:** Use `task.md` to track progress granularly.

## 5. Quality Assurance Standards (The Gatekeeper)
> "Trust, but verify."

To prevent simple errors (like syntax bugs) from reaching production, strict QA gates must be enforced.

### 5.1. Automated Checks (The Robot)
- **Linting**: Never commit code with syntax errors. Use IDE linters.
- **Console Cleanliness**: The browser console must be free of errors (red) and warnings (yellow) at launch.

### 5.2. Visual Verification (The Human)
- **Responsiveness**: Always check:
    - Mobile Portrait (iPhone SE size)
    - Mobile Landscape
    - Desktop Fullscreen
- **Hidden Elements**: Ensure `display: none` elements don't accidentally block clicks or cause overflow.

### 5.3. Critical Path Testing
- **Completion**: Can the game be finished from start to end?
- **Reset**: Does the "Retry" button actually reset ALL state (timers, scores, flags)?

---

## 6. Documentation Standards (The History)
> "A project without history is doomed to repeat its mistakes."

### 6.1. Change Log (CHANGELOG.md)
- **Mandatory**: Every project MUST have a `CHANGELOG.md` in the root.
- **Format**: Follow "Keep a Changelog" style.
    - **[Added]**: New features.
    - **[Changed]**: Changes in existing functionality.
    - **[Deprecated]**: Features to be removed.
    - **[Removed]**: Removed features.
    - **[Fixed]**: Bug fixes.
- **Timing**: Update this file *before* committing a major change or release.

### 6.2. Readme (README.md)
- **Deployment**: Clear instructions on how to build/deploy.
- **How to Play**: Simple instructions for the end user.
