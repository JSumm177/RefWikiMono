# RefWikiMono Testing Guides

Welcome to the RefWikiMono documentation space.

## Monorepo Context

RefWikiMono is a full-stack monorepo featuring a Java backend, React frontend, and React Native mobile app.

**Note on dependencies:** The project uses hoisted `node_modules` at the root of the project to reduce duplication and provide a single source of truth for library versions. Because of this, certain platform-specific configurations (such as Android's `settings.gradle` and iOS's `Podfile`) have been adjusted to reference paths at `../../node_modules`.

## Testing

This section provides various guides for testing the web and mobile applications within the RefWikiMono ecosystem.

- [Manual Test Steps](MANUAL_LOGIN_TEST_STEPS.md)
- [Mobile Manual Test Steps](MOBILE_MANUAL_LOGIN_TEST_STEPS.md)
- [Data Pipeline Test Steps](MANUAL_PIPELINE_TEST_STEPS.md)
- [API Endpoints](API_ENDPOINTS.md)

Check the **Table of Contents** on the left to navigate through the testing documentation.
