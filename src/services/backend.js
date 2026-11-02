import { createMockBackend } from "./mockBackend.js";
import { createBraveBackend } from "./braveBackend.js";

// Single integration point: replace this adapter with the Brave adapter later.
// localhost stays a demo; an extension page always uses real APIs, never a silent mock fallback.
export const isRealBrowser = globalThis.location?.protocol === "chrome-extension:";
export const backend = isRealBrowser ? createBraveBackend() : createMockBackend();
