/**
 * API Route: Create Progress Operation
 * Creates a new progress operation and returns its ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { progressStore } from '@/lib/progress/progress-store';

/**
 * POST /api/progress/create
 * Create a new progress operation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, total, initialStatus } = body;

    if (!type || !total) {
      return NextResponse.json(
        { error: 'Missing required fields: type and total' },
        { status: 400 }
      );
    }

    if (type !== 'fetch' && type !== 'upload') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "fetch" or "upload"' },
        { status: 400 }
      );
    }

    if (typeof total !== 'number' || total <= 0) {
      return NextResponse.json(
        { error: 'Total must be a positive number' },
        { status: 400 }
      );
    }

    const operationId = progressStore.create(type, total, initialStatus);
    const operation = progressStore.get(operationId);

    return NextResponse.json({
      id: operationId,
      operation,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating progress operation:', error);
    return NextResponse.json(
      { error: 'Failed to create progress operation' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
