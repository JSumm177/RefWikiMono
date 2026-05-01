# Development Environment Stabilization - Final Walkthrough

I have resolved the "Unable to resolve module ./.expo/.virtual-metro-entry" errors seen in your screenshot. This was caused by stale Metro cache following the migration to Expo Continuous Native Generation (CNG).

## Latest Fixes

### 1. Metro Entry Point Resolution
*   **Fix**: Updated `mobile/metro.config.js` to correctly handle Expo's virtual entry points while maintaining monorepo support.
*   **Cache Clear**: Added the `--clear` flag to `npx expo start` in [start-dev.sh](file:///Users/jsumm/Documents/GitHub/RefWikiMono/start-dev.sh) to ensure virtual files are regenerated correctly every time.

### 2. iOS Bundle URL
*   **Fix**: Hardcoded the Metro bundle URL in `AppDelegate.swift` to use your host IP (`192.168.0.40`). This ensures the simulator always finds the bundler regardless of internal networking issues.

### 3. Entry Point Alignment
*   **Fix**: Updated `mobile/index.js` to use `registerRootComponent` from the `expo` package, which is the standard for modern Expo apps.

---

## Recovery Steps

If you still see the red error screen on your emulators, please perform a "Hard Reset":

1.  **Stop everything**: Press `Ctrl+C` in your terminal.
2.  **Clear Native Folders**:
    ```bash
    cd mobile
    npx expo prebuild --clean
    ```
3.  **Restart with Clear Cache**:
    ```bash
    cd ..
    ./start-dev.sh
    ```

---

### Final Verification
- [x] **Backend**: Running on http://localhost:8080
- [x] **Frontend**: Running on http://localhost:5173
- [x] **Metro**: Responding at http://localhost:8081 (Verified 200 OK for virtual entry)
- [x] **Android**: UI Loaded
- [x] **iOS**: UI Loaded
