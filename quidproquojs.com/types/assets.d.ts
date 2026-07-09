// Ambient declarations for non-TS imports that the bundler handles but tsc must
// be told about. Currently only vendor CSS (e.g. @xyflow/react/dist/style.css).
declare module '*.css';
