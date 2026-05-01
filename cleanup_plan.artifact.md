# Implementation Plan: Mobile Native Cleanup & Simplification

Your current mobile setup relies on manual edits to `AppDelegate.swift`, `Podfile`, and `AndroidManifest.xml`. This makes the build fragile. I propose moving to **Expo Continuous Native Generation (CNG)**.

## The Strategy

1.  **Treat Native Folders as Artifacts**: We will configure Expo to generate the `ios` and `android` folders from `app.json`. This means we can delete them and regenerate them at any time to fix corruption.
2.  **Config Plugins**: We will use a local config plugin to handle the C++ standard stabilization and IP discovery automatically.

## Proposed Changes

### 1. Unified Configuration
Update `mobile/app.json` to include all native settings (Bundle ID, C++ standards, etc.).

### 2. Stabilization Plugin
Create `mobile/plugins/withStabilization.js` to:
- Automatically inject the `fmt` pod C++ fix.
- Handle Monorepo dependency resolution.
- Set the correct bundle URL based on your current network IP.

### 3. Simplify Start Script
Modify `start-dev.sh` to use `npx expo run:ios` and `npx expo run:android`, which are much more reliable in a monorepo than the standard React Native CLI.

---

## Benefits
- **No more hardcoded IPs**: The app will discover your computer on the network automatically.
- **Consistent Builds**: Every developer gets the same native environment from the same config.
- **Easy Recovery**: If the native build breaks, just delete the `ios` folder and run prebuild.

## Verification
- Run `cd mobile && npx expo prebuild` to generate clean folders.
- Run `./start-dev.sh` to launch.
