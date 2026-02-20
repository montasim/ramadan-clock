/**
 * PDF API Endpoint
 * GET /api/pdf - Generate PDF schedules
 */

import { NextRequest, NextResponse } from 'next/server';
import moment from 'moment';
import { prisma } from '@/lib/db';
// @ts-ignore
import { jsPDF } from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import {
  withErrorHandler,
  withRateLimit,
  error,
} from '@/lib/api';
import { pdfQuerySchema } from '@/lib/validations/api-schemas';
import { logger } from '@/lib/logger';
import { createHash } from 'crypto';
import { getClientIp, getUserAgent, setSecurityHeaders } from '@/lib/api/security-headers';

/**
 * Generate ETag for schedule data
 */
function generateETag(schedule: any[]): string {
  const scheduleString = JSON.stringify(schedule);
  return createHash('md5').update(scheduleString).digest('hex');
}

/**
 * Validate user agent to prevent bot abuse
 */
function validateUserAgent(userAgent: string): boolean {
  if (!userAgent || userAgent === 'unknown') {
    return false;
  }

  // Block common bot patterns
  const blockedPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /perl/i,
  ];

  // Check if user agent matches blocked patterns
  for (const pattern of blockedPatterns) {
    if (pattern.test(userAgent)) {
      return false;
    }
  }

  return true;
}

/**
 * Validate referer to prevent CSRF and unauthorized access
 */
function validateReferer(referer: string | null, host: string | null): boolean {
  if (!referer) {
    // Allow requests without referer (direct links)
    return true;
  }

  try {
    const refererUrl = new URL(referer);
    const refererHost = refererUrl.hostname;

    // Allow same-origin requests
    if (!host) {
      return true;
    }

    // Check if referer matches current host
    return refererHost === host || refererHost.endsWith(`.${host}`);
  } catch {
    // Invalid referer URL, allow the request
    return true;
  }
}

/**
 * Generate PDF for schedule
 * 
 * @param request - Next.js request object
 * @returns NextResponse with PDF data
 * 
 * @example
 * // GET /api/pdf?location=Dhaka&type=today
 * // Response: PDF file
 * 
 * @throws {ValidationError} When query parameters are invalid
 * @throws {RateLimitError} When rate limit is exceeded
 * @throws {ForbiddenError} When user agent is invalid or referer is blocked
 * 
 * Rate limit: 3 requests per minute per IP
 * Requires: No authentication (public endpoint)
 * 
 * Abuse prevention:
 * - IP-based rate limiting (3 requests/minute)
 * - User-Agent validation (blocks bots/scrapers)
 * - Referer validation (prevents CSRF)
 * - Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
 * - Request logging for monitoring
 */
async function generatePdfHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Abuse prevention: Get client information
    const clientIp = getClientIp(request);
    const userAgent = getUserAgent(request);
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');

    // Abuse prevention: Validate user agent
    if (!validateUserAgent(userAgent)) {
      logger.warn('PDF download blocked: Invalid user agent', {
        ip: clientIp,
        userAgent,
      });
      return error(
        403,
        'ForbiddenError',
        'Invalid user agent. Please use a web browser to download PDFs.',
        { ip: clientIp }
      );
    }

    // Abuse prevention: Validate referer
    if (!validateReferer(referer, host)) {
      logger.warn('PDF download blocked: Invalid referer', {
        ip: clientIp,
        referer,
        host,
      });
      return error(
        403,
        'ForbiddenError',
        'Invalid referer. Please access PDFs from the website.',
        { ip: clientIp }
      );
    }

    // Abuse prevention: Log request for monitoring
    logger.info('PDF download request', {
      ip: clientIp,
      userAgent: userAgent.substring(0, 100), // Truncate for logging
      referer: referer ? referer.substring(0, 100) : 'none',
    });

    // Parse query parameters
    const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const { location, type } = pdfQuerySchema.parse(queryParams);

    const actualLocation = location === 'all' ? null : location;

    // Fetch data
    let schedule: any[];
    let titleSuffix = '';

    if (type === 'today') {
      const today = moment().format('YYYY-MM-DD');
      const where: any = { date: today };
      if (actualLocation) {
        where.location = actualLocation;
      }
      schedule = await prisma.timeEntry.findMany({
        where,
        orderBy: { date: 'asc' },
      });
      titleSuffix = `- ${moment().format('MMMM D, YYYY')}`;
    } else {
      const where: any = {};
      if (actualLocation) {
        where.location = actualLocation;
      }
      schedule = await prisma.timeEntry.findMany({
        where,
        orderBy: { date: 'asc' },
      });
      titleSuffix = `- Full Schedule`;
    }

    if (schedule.length === 0) {
      return error(
        404,
        'ScheduleNotFound',
        `No schedule found for the specified criteria`,
        { location: actualLocation, type }
      );
    }

    // Check for conditional request (If-None-Match)
    const etag = generateETag(schedule);
    const ifNoneMatch = request.headers.get('if-none-match');
    
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('🌙 Ramadan Clock', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Sehri & Iftar Schedule ${titleSuffix}`, pageWidth / 2, 25, { align: 'center' });

    // Location
    if (actualLocation) {
      doc.setFontSize(12);
      doc.text(`Location: ${actualLocation}`, pageWidth / 2, 35, { align: 'center' });
    }

    // Prepare table data
    const tableData = schedule.map((entry: any) => [
      moment(entry.date).format('ddd, MMM D, YYYY'),
      entry.sehri,
      entry.iftar,
      entry.location || '-',
    ]);

    // Generate table
    autoTable(doc, {
      head: [['Date', 'Sehri', 'Iftar', 'Location']],
      body: tableData,
      startY: actualLocation ? 42 : 35,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: actualLocation ? 42 : 35 },
      didDrawPage: (data: any) => {
        // Footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Generated on ${moment().format()}`,
          pageWidth / 2,
          data.settings.margin!.top! + (data.pageNumber * 280) - 10,
          { align: 'center' }
        );
        doc.text(
          `Page ${data.pageNumber}`,
          pageWidth - 15,
          data.settings.margin!.top! + (data.pageNumber * 280) - 10,
          { align: 'right' }
        );
      },
    });

    // Generate filename
    const locationPart = actualLocation
      ? `-${actualLocation.toLowerCase().replace(/\s+/g, '-')}`
      : '';
    const year = moment().year();
    const filename = `sehri-iftar${locationPart}-${year}.pdf`;

    // Return PDF as response
    const pdfBuffer = doc.output('arraybuffer');
    const response = new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800',
        'ETag': etag,
      },
    });

    // Add security headers to prevent abuse
    setSecurityHeaders(response);

    logger.info('PDF generated successfully', {
      location: actualLocation,
      type,
      entriesCount: schedule.length,
    });

    return response;
  } catch (err) {
    logger.error('PDF generation error', {}, err as Error);

    if (err instanceof Error) {
      return error(
        500,
        'PdfGenerationError',
        'Failed to generate PDF',
        { message: err.message }
      );
    }

    return error(
      500,
      'PdfGenerationError',
      'Failed to generate PDF'
    );
  }
}

/**
 * GET handler with middleware
 */
export const GET = withErrorHandler(
  withRateLimit(
    generatePdfHandler,
    { limit: 3, windowMs: 60 * 1000 }
  )
);

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, { status: 204 });
}
