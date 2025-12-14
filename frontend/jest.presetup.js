/**
 * Jest pre-setup file - runs BEFORE react-native and expo setup files.
 *
 * This file provides comprehensive mocks for React Native 0.81.5 + jest-expo 52 compatibility.
 * It replaces the default jest-expo/src/preset/setup.js which has issues with newer RN versions.
 */

// Setup globals that React Native expects
if (typeof window !== 'object') {
  globalThis.window = globalThis;
  globalThis.window.navigator = {};
}

// Setup React DevTools global hook (used by React Navigation)
if (typeof globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
  globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    isDisabled: true,
    renderers: {
      values: () => [],
    },
    on() {},
    off() {},
  };
  globalThis.window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
}

// Mock the NativeModules with all required modules
jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => ({
  UIManager: {
    getViewManagerConfig: jest.fn(() => ({})),
    getConstantsForViewManager: jest.fn(() => ({})),
    hasViewManagerConfig: jest.fn(() => false),
    setLayoutAnimationEnabledExperimental: jest.fn(),
    createView: jest.fn(),
    updateView: jest.fn(),
    dispatchViewManagerCommand: jest.fn(),
    manageChildren: jest.fn(),
    measure: jest.fn(),
    measureInWindow: jest.fn(),
    measureLayout: jest.fn(),
    focus: jest.fn(),
    blur: jest.fn(),
  },
  NativeUnimoduleProxy: {
    modulesConstants: {
      ExponentConstants: {
        experienceUrl: 'exp://192.168.1.200:8081',
      },
    },
    viewManagersMetadata: {},
  },
  PlatformConstants: {
    forceTouchAvailable: false,
    interfaceIdiom: 'phone',
    isTesting: true,
    osVersion: '17.0',
    reactNativeVersion: { major: 0, minor: 81, patch: 5 },
    systemName: 'iOS',
  },
  RNGestureHandlerModule: {
    attachGestureHandler: jest.fn(),
    createGestureHandler: jest.fn(),
    dropGestureHandler: jest.fn(),
    updateGestureHandler: jest.fn(),
    flushOperations: jest.fn(),
    State: {},
    Directions: {},
  },
  StatusBarManager: {
    HEIGHT: 42,
    setStyle: jest.fn(),
    setHidden: jest.fn(),
    setNetworkActivityIndicatorVisible: jest.fn(),
    getHeight: jest.fn((callback) => callback({ height: 42 })),
  },
  DevSettings: {
    addMenuItem: jest.fn(),
    reload: jest.fn(),
  },
  ImageLoader: {
    getSize: jest.fn((uri, success) => process.nextTick(() => success(320, 240))),
    prefetchImage: jest.fn(),
  },
  ImageViewManager: {
    getSize: jest.fn((uri, success) => process.nextTick(() => success(320, 240))),
    prefetchImage: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
  },
  LinkingManager: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
  },
  Networking: {
    sendRequest: jest.fn(),
    abortRequest: jest.fn(),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },
  SettingsManager: {
    getConstants: jest.fn(() => ({})),
    settings: {},
  },
  NativeAnimatedModule: {
    createAnimatedNode: jest.fn(),
    startListeningToAnimatedNodeValue: jest.fn(),
    stopListeningToAnimatedNodeValue: jest.fn(),
    connectAnimatedNodes: jest.fn(),
    disconnectAnimatedNodes: jest.fn(),
    startAnimatingNode: jest.fn(),
    stopAnimation: jest.fn(),
    setAnimatedNodeValue: jest.fn(),
    setAnimatedNodeOffset: jest.fn(),
    flattenAnimatedNodeOffset: jest.fn(),
    extractAnimatedNodeOffset: jest.fn(),
    connectAnimatedNodeToView: jest.fn(),
    disconnectAnimatedNodeFromView: jest.fn(),
    dropAnimatedNode: jest.fn(),
    addAnimatedEventToView: jest.fn(),
    removeAnimatedEventFromView: jest.fn(),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },
  ExpoUpdates: {
    reload: jest.fn(),
  },
  ExpoConstants: {
    executionEnvironment: 'standalone',
  },
  Appearance: {
    getColorScheme: jest.fn(() => 'light'),
    addChangeListener: jest.fn(),
    removeChangeListener: jest.fn(),
  },
  Clipboard: {
    getString: jest.fn(() => Promise.resolve('')),
    setString: jest.fn(),
  },
  AsyncStorage: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
  },
  AlertManager: {
    alertWithArgs: jest.fn(),
  },
  Timing: {
    createTimer: jest.fn(),
    deleteTimer: jest.fn(),
  },
  BlobModule: {
    BLOB_URI_SCHEME: 'content',
    BLOB_URI_HOST: null,
    addNetworkingHandler: jest.fn(),
    addWebSocketHandler: jest.fn(),
    removeWebSocketHandler: jest.fn(),
    sendOverSocket: jest.fn(),
    createFromParts: jest.fn(),
    release: jest.fn(),
  },
  WebSocketModule: {
    connect: jest.fn(),
    send: jest.fn(),
    sendBinary: jest.fn(),
    ping: jest.fn(),
    close: jest.fn(),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },
  SourceCode: {
    scriptURL: 'http://localhost:8081/index.bundle',
  },
  I18nManager: {
    isRTL: false,
    localeIdentifier: 'en_US',
    allowRTL: jest.fn(),
    forceRTL: jest.fn(),
  },
  AccessibilityInfo: {
    isAccessibilityServiceEnabled: jest.fn(() => Promise.resolve(false)),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    announceForAccessibility: jest.fn(),
    fetch: jest.fn(() => Promise.resolve(false)),
    isBoldTextEnabled: jest.fn(() => Promise.resolve(false)),
    isGrayscaleEnabled: jest.fn(() => Promise.resolve(false)),
    isInvertColorsEnabled: jest.fn(() => Promise.resolve(false)),
    isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
    isReduceTransparencyEnabled: jest.fn(() => Promise.resolve(false)),
    isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
  },
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  downloadAsync: jest.fn(() => Promise.resolve({ md5: 'md5', uri: 'uri' })),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, md5: 'md5', uri: 'uri' })),
  readAsStringAsync: jest.fn(() => Promise.resolve('')),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  moveAsync: jest.fn(() => Promise.resolve()),
  copyAsync: jest.fn(() => Promise.resolve()),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  readDirectoryAsync: jest.fn(() => Promise.resolve([])),
  documentDirectory: 'file:///mock-document-directory/',
  cacheDirectory: 'file:///mock-cache-directory/',
  bundleDirectory: 'file:///mock-bundle-directory/',
}));

// Mock expo-asset
jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({
      downloadAsync: jest.fn(() => Promise.resolve()),
      localUri: 'file:///mock-asset',
      uri: 'file:///mock-asset',
    })),
    loadAsync: jest.fn(() => Promise.resolve()),
  },
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
  isLoading: jest.fn(() => false),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    appOwnership: 'standalone',
    expoVersion: '54.0.0',
    installationId: 'test-installation-id',
    manifest: {},
    name: 'estatefox',
    experienceUrl: 'exp://192.168.1.200:8081',
    debugMode: false,
    deviceName: 'Test Device',
    isDevice: false,
    platform: { ios: { model: 'iPhone' } },
    sessionId: 'test-session-id',
    statusBarHeight: 42,
    systemFonts: [],
    executionEnvironment: 'storeClient',
  },
  ExecutionEnvironment: {
    Standalone: 'standalone',
    StoreClient: 'storeClient',
    Bare: 'bare',
  },
}));

