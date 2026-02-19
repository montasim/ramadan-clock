/**
 * Environment Configuration Validation
 * Validates all required environment variables at application startup
 */

import { z } from 'zod/v4';

/**
 * Environment variable schema
 * All required environment variables must be defined
 */
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').default('http://localhost:3000'),
  
  // Admin
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email'),
  ADMIN_PASSWORD: z.string().min(6, 'ADMIN_PASSWORD must be at least 6 characters'),
});

/**
 * Environment variable type
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Throws an error if any required variable is missing or invalid
 * @returns Validated environment variables
 */
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue) => {
        const path = issue.path.join('.');
        return `${path}: ${issue.message}`;
      }).join('\n  - ');
      
      throw new Error(
        `Missing or invalid environment variables:\n  - ${missingVars}\n\n` +
        `Please check your .env.local file and ensure all required variables are set.`
      );
    }
    throw error;
  }
}

/**
 * Validated environment variables
 * Import this instead of using process.env directly
 */
export const env = validateEnv();

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

/**
 * Check if running in test mode
 */
export function isTest(): boolean {
  return env.NODE_ENV === 'test';
}

/**
 * Get database URL
 */
export function getDatabaseUrl(): string {
  return env.DATABASE_URL;
}

/**
 * Get NextAuth secret
 */
export function getNextAuthSecret(): string {
  return env.NEXTAUTH_SECRET;
}

/**
 * Get NextAuth URL
 */
export function getNextAuthUrl(): string {
  return env.NEXTAUTH_URL;
}

/**
 * Get admin credentials (for seed script only)
 * @warning Never expose these in production code
 */
export function getAdminCredentials() {
  return {
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
  };
}
