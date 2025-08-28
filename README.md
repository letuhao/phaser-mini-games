# Mini Games Engine Skeleton (Phaser + Vite + NestJS)
Tag: #MiniGamesEngine

This is a monorepo skeleton for reusable mini-games (Lucky Wheel, Lootbox) with:
- **Frontend**: Vite + Phaser (TypeScript)
- **Backend**: NestJS REST API (TypeScript) — authoritative prize logic
- **Shared**: `@minigames/shared-logic` for common RNG, weighted pick, types
- **Themes**: `@minigames/themes` (JSON/TS) for environment + prize configs

## Quick Start
```bash
# Node 18+ recommended
npm i

# Install all workspace deps
npm run bootstrap

# Start backend (http://localhost:3000)
npm run dev:be

# Start frontend (http://localhost:5173)
npm run dev:fe
```

## Workspace layout
```
apps/
  game-frontend/   # Vite + Phaser app (Lucky Wheel skeleton)
  game-backend/    # NestJS API (spin endpoints)
packages/
  shared-game-logic/  # Shared RNG, weighted picker, types, spin helpers
  themes/             # Theme/config package (e.g., levis-r3)
```

## Notes
- Frontend calls `POST /api/spin` to get an authoritative outcome; then animates to the returned angle.
- Ratios are expressed in **permille** (‰) in configs; backend normalizes automatically.
- Theme/environment config supports seasonal effects & brand assets (placeholders included).
