# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is an Expo React Native weather application built with Expo SDK 53, React 19, and TypeScript. It uses Expo Router v5 for file-based navigation and supports iOS, Android, and Web platforms.

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Start development server
npm start
# or
npx expo start

# Platform-specific development
npm run android  # Run on Android emulator/device
npm run ios      # Run on iOS simulator/device
npm run web      # Run web version

# Code quality
npm run lint     # Run ESLint
```

### Project Management
```bash
npm run reset-project  # Interactive script to reset project (moves current app/ to app-example/)
```

## Architecture & Structure

### Navigation Architecture
- **Expo Router v5** with file-based routing
- Main app structure in `app/` directory
- Tab navigation defined in `app/(tabs)/`
- Root layout: `app/_layout.tsx`
- Navigation structure follows file system conventions

### Component Architecture
1. **Themed Components** (`components/`):
   - `ThemedText` and `ThemedView`: Components with automatic theme support
   - All themed components use `useThemeColor()` hook

2. **UI Components** (`components/ui/`):
   - `IconSymbol`: Cross-platform icon system using SF Symbols
   - `TabBarBackground`: Platform-specific tab bar styling
   - `HapticTab`: Tabs with haptic feedback support

3. **Interactive Components**:
   - `ParallaxScrollView`: Scrolling with parallax header effects
   - `Collapsible`: Expandable/collapsible content sections

### Theming System
- Light/dark mode support via `constants/Colors.ts`
- `useColorScheme()` hook for theme detection
- `useThemeColor()` hook for component theming
- Theme colors defined per mode in Colors constant

### TypeScript Configuration
- Strict mode enabled
- Path alias: `@/*` maps to project root
- Experimental typed routes for Expo Router
- Extends `expo/tsconfig.base`

## Key Technical Details

### Platform-Specific Features
- **iOS**: Blur effects on tab bar, haptic feedback
- **Android**: Edge-to-edge layout, adaptive icons
- **Web**: Static output generation, Metro bundler

### State Management
- No global state management library currently implemented
- Component-level state with React hooks

### Asset Management
- Fonts loaded from `assets/fonts/` (SpaceMono)
- Images in `assets/images/` with density variants (@2x, @3x)
- Expo Image for optimized image handling

## Development Guidelines

### Adding New Screens
1. Create new file in `app/(tabs)/` for tab screens
2. Create in `app/` root for modal or stack screens
3. Follow existing file naming conventions (lowercase)

### Creating Components
1. Place reusable components in `components/`
2. Use `ThemedView` and `ThemedText` for theme support
3. Create typed props interfaces for all components

### Working with Navigation
- Use `expo-router` hooks: `useRouter()`, `useLocalSearchParams()`
- Define routes in file system structure
- Use `Link` component or `router.push()` for navigation

## Expo (React Native) Best Practices

### Performance Optimization
1. **Image Optimization**:
   - Use `expo-image` instead of React Native's Image component for better performance
   - Provide multiple resolutions (@1x, @2x, @3x) for image assets
   - Use WebP format for Android and HEIC for iOS when possible
   - Implement lazy loading for images in lists

2. **List Performance**:
   - Use `FlashList` from @shopify/flash-list for large lists instead of FlatList
   - Implement `getItemLayout` when row heights are fixed
   - Use `keyExtractor` with stable, unique keys
   - Avoid anonymous functions in renderItem

3. **Memory Management**:
   - Clean up subscriptions and timers in useEffect cleanup
   - Use `useMemo` and `useCallback` for expensive computations
   - Avoid storing large objects in state unnecessarily

### Expo-Specific Best Practices
1. **API Keys and Secrets**:
   - Use `expo-secure-store` for sensitive data storage
   - Environment variables via `expo-constants` for API endpoints
   - Never commit `.env` files with secrets

2. **Permissions**:
   - Request permissions only when needed (lazy permission requests)
   - Provide clear explanations before permission requests
   - Handle permission denial gracefully with fallbacks

3. **Updates and Deployment**:
   - Use EAS Update for over-the-air updates
   - Implement update error handling and rollback strategies
   - Test updates thoroughly in staging channel first

### Cross-Platform Development
1. **Platform-Specific Code**:
   - Use `Platform.select()` for small differences
   - Create `.ios.tsx` and `.android.tsx` files for larger differences
   - Test on both platforms regularly during development

2. **Responsive Design**:
   - Use `useWindowDimensions()` hook for responsive layouts
   - Implement `SafeAreaView` or `useSafeAreaInsets()` for notches/status bars
   - Test on various screen sizes and orientations

3. **Native Features**:
   - Always check if feature is available before using (`if (Device.isDevice)`)
   - Provide web/simulator fallbacks for device-only features
   - Use Expo SDK modules over third-party packages when available

### State and Data Management
1. **API Calls**:
   - Use React Query (TanStack Query) or SWR for server state
   - Implement proper error boundaries
   - Show loading states and handle offline scenarios

2. **Forms and Validation**:
   - Use react-hook-form for complex forms
   - Implement client-side validation before API calls
   - Provide immediate feedback for user inputs

3. **Navigation State**:
   - Keep navigation state minimal
   - Use route params for passing small data
   - Use global state or context for shared data across screens

### Testing and Quality
1. **Type Safety**:
   - Define strict TypeScript types for all props and state
   - Use typed navigation with Expo Router's experimental types
   - Avoid using `any` type

2. **Error Handling**:
   - Implement error boundaries for component crashes
   - Use Sentry or similar for production error tracking
   - Provide user-friendly error messages

3. **Accessibility**:
   - Add `accessibilityLabel` and `accessibilityHint` to interactive elements
   - Test with screen readers (VoiceOver/TalkBack)
   - Ensure sufficient color contrast ratios

### Development Workflow
1. **Debugging**:
   - Use React Native Debugger or Flipper for debugging
   - Implement `__DEV__` checks for development-only code
   - Use `console.warn` for development warnings

2. **Code Organization**:
   - Group related files by feature, not by file type
   - Keep components small and focused (single responsibility)
   - Extract business logic into custom hooks

3. **Assets and Bundle Size**:
   - Optimize bundle size with Metro's tree shaking
   - Use dynamic imports for large libraries
   - Monitor bundle size with `npx expo export`