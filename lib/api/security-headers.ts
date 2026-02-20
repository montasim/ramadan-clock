/**
 * Security Headers
 * Security headers for API responses
 */

import { NextResponse } from 'next/server';

/**
 * Set security headers on a response
 */
export function setSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict browser features
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );

  // Content Security Policy
  // Adjust based on your application's needs
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  // Strict-Transport-Security (only for HTTPS)
  // Uncomment in production with HTTPS
  // response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
}

/**
 * CORS options
 */
export interface CorsOptions {
  origin: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Default CORS options
 */
export const defaultCorsOptions: CorsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Set CORS headers on a response
 */
export function setCorsHeaders(
  response: NextResponse,
  options: CorsOptions = defaultCorsOptions
): NextResponse {
  const origin = Array.isArray(options.origin)
    ? options.origin.join(', ')
    : options.origin;

  response.headers.set('Access-Control-Allow-Origin', origin);

  if (options.methods) {
    response.headers.set('Access-Control-Allow-Methods', options.methods.join(', '));
  }

  if (options.allowedHeaders) {
    response.headers.set('Access-Control-Allow-Headers', options.allowedHeaders.join(', '));
  }

  if (options.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  if (options.maxAge) {
    response.headers.set('Access-Control-Max-Age', options.maxAge.toString());
  }

  return response;
}

/**
 * Handle CORS preflight request
 */
export function handleCorsPreflight(
  request: Request,
  options: CorsOptions = defaultCorsOptions
): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response, options);
}

/**
 * Create a response with both security and CORS headers
 */
export function createSecureResponse(
  data: any,
  status: number = 200,
  corsOptions?: CorsOptions
): NextResponse {
  const response = NextResponse.json(data, { status });
  setSecurityHeaders(response);
  if (corsOptions) {
    setCorsHeaders(response, corsOptions);
  }
  return response;
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return 'unknown';
}

/**
 * Get user agent from request headers
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

/**
 * Validate and sanitize URL to prevent open redirect
 */
export function sanitizeUrl(url: string, allowedDomains: string[]): boolean {
  try {
    const parsedUrl = new URL(url);
    return allowedDomains.some((domain) => parsedUrl.hostname === domain);
  } catch {
    return false;
  }
}
