// App version configuration
// Bump APP_VERSION for each release, BUILD_NUMBER is auto-generated from timestamp
export const APP_VERSION = "1.0.0";
// __BUILD_NUMBER__ is replaced by Vite at build time (see vite.config.ts define)
// @ts-ignore - injected by Vite define
export const BUILD_NUMBER: string = __BUILD_NUMBER__;
export const VERSION_STRING = `v${APP_VERSION} (${BUILD_NUMBER})`;
