/**
 * Application Configuration
 * Centralized configuration management for the entire application
 *
 * NOTE: For client-side components, import from './app.config' instead
 * to avoid triggering environment variable validation
 */

// Re-export client-safe configurations
export * from './app.config';

// Re-export from other config files
export * from './locations.config';
export * from './env.config';
