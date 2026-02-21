// App version configuration
// Bump APP_VERSION for each release, BUILD_NUMBER is auto-generated from timestamp
export const APP_VERSION = "1.0.0";
export const BUILD_NUMBER = __BUILD_NUMBER__;
export const VERSION_STRING = `v${APP_VERSION} (${BUILD_NUMBER})`;

// TypeScript declaration for the Vite define constant
declare const __BUILD_NUMBER__: string;
