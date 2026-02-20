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
  withAuth,
  withValidation,
  error,
} from '@/lib/api';
import { pdfQuerySchema } from '@/lib/validations/api-schemas';
import { logger } from '@/lib/logger';

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
 * @throws {UnauthorizedError} When user is not authenticated
 * @throws {RateLimitError} When rate limit is exceeded
 * 
 * Rate limit: 5 requests per minute
 * Requires: Admin authentication
 */
async function generatePdfHandler(request: NextRequest): Promise<NextResponse> {
  try {
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
      },
    });

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
    withAuth(generatePdfHandler, { requireAdmin: true }),
    { limit: 5, windowMs: 60 * 1000 }
  )
);

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, { status: 204 });
}
