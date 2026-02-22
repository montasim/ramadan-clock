/**
 * useProgress Hook
 * Client-side hook for consuming Server-Sent Events (SSE) progress updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ProgressOperation } from '@/lib/progress/progress-store';

interface UseProgressOptions {
  enabled?: boolean;
  onError?: (error: Error) => void;
}

interface UseProgressReturn {
  progress: ProgressOperation | null;
  error: string | null;
  isConnected: boolean;
  isComplete: boolean;
  isFailed: boolean;
}

/**
 * Hook for tracking operation progress via SSE
 * @param operationId - The ID of the operation to track
 * @param options - Configuration options
 * @returns Progress state and connection status
 */
export function useProgress(
  operationId: string | null,
  options: UseProgressOptions = {}
): UseProgressReturn {
  const { enabled = true, onError } = options;
  
  const [progress, setProgress] = useState<ProgressOperation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  const connect = useCallback(() => {
    if (!operationId || !enabled) {
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Clear any pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    try {
      const eventSource = new EventSource(`/api/progress/${operationId}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
        retryCountRef.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as ProgressOperation;
          setProgress(data);

          // Close connection if operation is complete
          if (data.status === 'completed' || data.status === 'failed') {
            eventSource.close();
            setIsConnected(false);
          }
        } catch (parseError) {
          console.error('Failed to parse progress event:', parseError);
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE connection error:', err);
        setIsConnected(false);

        // Retry logic
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          const delay = RETRY_DELAY * retryCountRef.current;
          
          retryTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setError('Connection failed. Please refresh the page.');
          if (onError) {
            onError(new Error('SSE connection failed'));
          }
        }
      };

      // Listen for close event
      eventSource.addEventListener('close', () => {
        eventSource.close();
        setIsConnected(false);
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to progress stream';
      setError(errorMessage);
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    }
  }, [operationId, enabled, onError]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Connect when operationId changes
  useEffect(() => {
    if (operationId && enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [operationId, enabled, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    progress,
    error,
    isConnected,
    isComplete: progress?.status === 'completed',
    isFailed: progress?.status === 'failed',
  };
}

/**
 * Hook for creating a new operation and tracking its progress
 * @param type - The type of operation ('fetch' or 'upload')
 * @param total - The total number of items to process
 * @returns Object with operationId and progress tracking
 */
export function useCreateProgress(type: 'fetch' | 'upload', total: number) {
  const [operationId, setOperationId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const createOperation = useCallback(async () => {
    setIsCreating(true);
    setCreateError(null);

    try {
      const response = await fetch('/api/progress/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, total }),
      });

      if (!response.ok) {
        throw new Error('Failed to create operation');
      }

      const data = await response.json();
      setOperationId(data.id);
      return data.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create operation';
      setCreateError(errorMessage);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [type, total]);

  const reset = useCallback(() => {
    setOperationId(null);
    setCreateError(null);
  }, []);

  return {
    operationId,
    isCreating,
    createError,
    createOperation,
    reset,
  };
}
