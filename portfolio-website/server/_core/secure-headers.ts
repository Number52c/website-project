/**
 * Secure Headers Middleware
 * 
 * Adds security headers to all HTTP responses.
 * Helps protect against common web vulnerabilities.
 */

import type { Response } from 'express';

export interface SecureHeadersConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  enableFrameOptions: boolean;
  enableContentTypeOptions: boolean;
  enableReferrerPolicy: boolean;
  enablePermissionsPolicy: boolean;
}

const DEFAULT_CONFIG: SecureHeadersConfig = {
  enableCSP: true,
  enableHSTS: true,
  enableFrameOptions: true,
  enableContentTypeOptions: true,
  enableReferrerPolicy: true,
  enablePermissionsPolicy: true,
};

/**
 * Apply secure headers to response
 */
export function applySecureHeaders(
  res: Response,
  config: Partial<SecureHeadersConfig> = {}
): void {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Content Security Policy
  if (finalConfig.enableCSP) {
    const isDev = process.env.NODE_ENV === 'development';
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net", // Allow inline for React
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https:",
      // In development, allow framing for preview pane; in production, deny all framing
      ...(isDev ? [] : ["frame-ancestors 'none'"]),
    ];
    res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  }

  // Strict Transport Security
  if (finalConfig.enableHSTS) {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // X-Frame-Options
  if (finalConfig.enableFrameOptions) {
    // Allow framing in development for preview pane, deny in production
    const isDev = process.env.NODE_ENV === 'development';
    res.setHeader('X-Frame-Options', isDev ? 'SAMEORIGIN' : 'DENY');
  }

  // X-Content-Type-Options
  if (finalConfig.enableContentTypeOptions) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }

  // Referrer-Policy
  if (finalConfig.enableReferrerPolicy) {
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  // Permissions-Policy (formerly Feature-Policy)
  if (finalConfig.enablePermissionsPolicy) {
    res.setHeader(
      'Permissions-Policy',
      [
        'geolocation=()',
        'microphone=()',
        'camera=()',
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'gyroscope=()',
        'accelerometer=()',
      ].join(', ')
    );
  }

  // Additional security headers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
}

/**
 * Express middleware for secure headers
 */
export function secureHeadersMiddleware(
  config: Partial<SecureHeadersConfig> = {}
) {
  return (req: any, res: Response, next: any) => {
    applySecureHeaders(res, config);
    next();
  };
}

/**
 * Get CSP header value for specific context
 */
export function getCSPHeader(context: 'development' | 'production'): string {
  if (context === 'development') {
    // More permissive in development
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      "style-src 'self' 'unsafe-inline' https:",
      "font-src 'self' https:",
      "img-src 'self' data: https:",
      "connect-src 'self' https: ws: wss:",
    ].join('; ');
  }

  // Strict in production
  return [
    "default-src 'self'",
    "script-src 'self' https://cdn.jsdelivr.net",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
  ].join('; ');
}
