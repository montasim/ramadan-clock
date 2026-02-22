/**
 * Progress Store
 * In-memory store for tracking operation progress using Server-Sent Events (SSE)
 */

export type OperationType = 'fetch' | 'upload';

export type OperationStatus = 'initializing' | 'processing' | 'validating' | 'uploading' | 'fetching' | 'retrying' | 'completed' | 'failed';

export interface ProgressOperation {
  id: string;
  type: OperationType;
  status: OperationStatus;
  current: number;
  total: number;
  percentage: number;
  batch: number;
  totalBatches: number;
  message?: string;
  error?: string;
  currentDistrict?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressUpdate {
  current?: number;
  status?: OperationStatus;
  message?: string;
  error?: string;
  currentDistrict?: string;
}

type ProgressCallback = (operation: ProgressOperation) => void;

class ProgressStore {
  private operations: Map<string, ProgressOperation> = new Map();
  private listeners: Map<string, Set<ProgressCallback>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up old operations every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Create a new progress operation
   */
  create(type: OperationType, total: number, initialStatus: OperationStatus = 'initializing'): string {
    const id = this.generateId();
    const now = new Date();

    const operation: ProgressOperation = {
      id,
      type,
      status: initialStatus,
      current: 0,
      total,
      percentage: 0,
      batch: 0,
      totalBatches: Math.ceil(total / 50),
      createdAt: now,
      updatedAt: now,
    };

    this.operations.set(id, operation);
    this.notifyListeners(id, operation);

    return id;
  }

  /**
   * Get an operation by ID
   */
  get(id: string): ProgressOperation | undefined {
    return this.operations.get(id);
  }

  /**
   * Update an operation's progress
   */
  update(id: string, updates: ProgressUpdate): ProgressOperation | undefined {
    const operation = this.operations.get(id);
    if (!operation) {
      return undefined;
    }

    // Apply updates
    if (updates.current !== undefined) {
      operation.current = updates.current;
      operation.percentage = Math.round((updates.current / operation.total) * 100);
      operation.batch = Math.floor(updates.current / 50) + 1;
    }
    if (updates.status !== undefined) {
      operation.status = updates.status;
    }
    if (updates.message !== undefined) {
      operation.message = updates.message;
    }
    if (updates.error !== undefined) {
      operation.error = updates.error;
    }
    if (updates.currentDistrict !== undefined) {
      operation.currentDistrict = updates.currentDistrict;
    }

    operation.updatedAt = new Date();
    this.notifyListeners(id, operation);

    return operation;
  }

  /**
   * Mark an operation as completed
   */
  complete(id: string, message?: string): ProgressOperation | undefined {
    return this.update(id, {
      current: this.operations.get(id)?.total || 0,
      status: 'completed',
      message,
    });
  }

  /**
   * Mark an operation as failed
   */
  fail(id: string, error: string): ProgressOperation | undefined {
    return this.update(id, {
      status: 'failed',
      error,
    });
  }

  /**
   * Subscribe to progress updates for an operation
   */
  subscribe(id: string, callback: ProgressCallback): () => void {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, new Set());
    }

    this.listeners.get(id)!.add(callback);

    // Send current state immediately
    const operation = this.operations.get(id);
    if (operation) {
      callback(operation);
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(id);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(id);
        }
      }
    };
  }

  /**
   * Remove old operations (older than 1 hour)
   */
  private cleanup(): void {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    for (const [id, operation] of this.operations.entries()) {
      if (operation.updatedAt < oneHourAgo) {
        this.operations.delete(id);
        this.listeners.delete(id);
      }
    }
  }

  /**
   * Notify all listeners for an operation
   */
  private notifyListeners(id: string, operation: ProgressOperation): void {
    const listeners = this.listeners.get(id);
    if (listeners) {
      for (const callback of listeners) {
        try {
          callback(operation);
        } catch (error) {
          console.error(`Error in progress callback for operation ${id}:`, error);
        }
      }
    }
  }

  /**
   * Generate a unique operation ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get all active operations
   */
  getAll(): ProgressOperation[] {
    return Array.from(this.operations.values());
  }

  /**
   * Get operations by type
   */
  getByType(type: OperationType): ProgressOperation[] {
    return this.getAll().filter(op => op.type === type);
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.operations.clear();
    this.listeners.clear();
  }
}

// Export singleton instance
export const progressStore = new ProgressStore();

// Ensure cleanup on process exit
if (typeof process !== 'undefined' && process.on) {
  process.on('exit', () => progressStore.destroy());
  process.on('SIGINT', () => progressStore.destroy());
  process.on('SIGTERM', () => progressStore.destroy());
}
