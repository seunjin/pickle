// This file is a stub for the 'ws' module.
// Chrome Extensions do not support the 'ws' module (Node.js WebSocket).
// We use this stub to trick the bundler (Vite) into resolving 'ws' to this empty file
// instead of leaving 'import ws from "ws"' in the final bundle or failing.
// Supabase JS client will use native WebSocket in the browser environment anyway.

export default {};
