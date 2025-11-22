# Change Log
All notable changes to the "Civil Law Puzzle" project will be documented in this file.

## [v2.0.0] - 2025-11-23
### Added
- **Risk & Return**:
    - Penalty: -5 seconds for wrong match.
    - Reward: +3 seconds for correct match.
    - Combo System: Score multiplier (x1.2, x1.5, x2.0) for fast matches.
- **Visual Effects**:
    - Particle explosion on match.
    - Screen shake on error.
- **Audio**:
    - Web Audio API system for SE (Select, Match, Error, Clear).
- **Debug Features**:
    - Cheat keys (T: Time, W: Win, I: Invincible).
- **PWA Support**:
    - `manifest.json` for "Add to Home Screen".
    - Mobile meta tags.

### Changed
- **Refactoring**:
    - Separated game parameters into `CONFIG` object.
    - Removed magic numbers from logic.
- **UI**:
    - Improved mobile responsiveness.
    - Fixed CSS syntax errors in media queries.

## [v1.0.0] - 2025-11-21
### Added
- Initial release of "Civil Law Puzzle".
- Basic drag & drop and click matching mechanics.
- 3 Levels with increasing difficulty.
- Timer and Score system.
