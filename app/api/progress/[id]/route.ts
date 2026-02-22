/**
 * API Route: Progress Stream (SSE)
 * Server-Sent Events endpoint for streaming operation progress
 */

import { NextRequest } from 'next/server';
import { progressStore, type ProgressOperation } from '@/lib/progress/progress-store';

/**
 * GET /api/progress/[id]
 * Stream progress updates for an operation using Server-Sent Events
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: operationId } = await params;
  const operation = progressStore.get(operationId);

  // Check if operation exists
  if (!operation) {
    return new Response(
      JSON.stringify({ error: 'Operation not found' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const encoder = new TextEncoder();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial state
      sendEvent(controller, 'progress', operation);

      // Subscribe to progress updates
      const unsubscribe = progressStore.subscribe(operationId, (updatedOperation) => {
        sendEvent(controller, 'progress', updatedOperation);

        // Close stream if operation is completed or failed
        if (updatedOperation.status === 'completed' || updatedOperation.status === 'failed') {
          // Send final event and close
          setTimeout(() => {
            try {
              sendEvent(controller, 'close', {});
              controller.close();
            } catch (error) {
              // Stream already closed
            }
          }, 100); // Small delay to ensure final event is sent
        }
      });

      // Cleanup on stream close
      request.signal.addEventListener('abort', () => {
        unsubscribe();
        try {
          controller.close();
        } catch (error) {
          // Stream already closed
        }
      });
    },
    cancel() {
      // Cleanup when stream is cancelled
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

/**
 * Send an SSE event
 */
function sendEvent(
  controller: ReadableStreamDefaultController,
  type: string,
  data: ProgressOperation | Record<string, unknown>
): void {
  try {
    const eventData = JSON.stringify(data);
    const message = `event: ${type}\ndata: ${eventData}\n\n`;
    controller.enqueue(new TextEncoder().encode(message));
  } catch (error) {
    console.error('Error sending SSE event:', error);
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
