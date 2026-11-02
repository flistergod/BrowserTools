import { createMockBackend } from "./mockBackend.js";
import { createBraveBackend } from "./braveBackend.js";

// Select the adapter according to the page's execution context.
// localhost stays a demo; an extension page always uses real APIs, never a silent mock fallback.
export const isRealBrowser = globalThis.location?.protocol === "chrome-extension:";
export const backend = isRealBrowser ? createBraveBackend() : createMockBackend();
