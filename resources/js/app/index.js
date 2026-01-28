import { initAuth } from "./auth.js";
import { initNavigation } from "./navigation.js";
import { initPWA } from "./pwa.js";

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initNavigation();
    initPWA();
});