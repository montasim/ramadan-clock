/**
 * ProgressBar Component
 * A reusable progress bar component for displaying operation progress
 */

import { cn } from "@/lib/utils";

export interface ProgressData {
  current: number;
  total: number;
  percentage: number;
  batch: number;
  totalBatches: number;
  status: 'initializing' | 'validating' | 'uploading' | 'fetching' | 'processing' | 'retrying' | 'completed' | 'failed';
  currentDistrict?: string;
}

interface ProgressBarProps {
  progress: ProgressData | null;
  statusMessages?: {
    initializing?: string;
    uploading?: string;
    fetching?: string;
    processing?: string;
    retrying?: string;
    completed?: string;
    failed?: string;
  };
  showBatchInfo?: boolean;
  showCurrentDistrict?: boolean;
  className?: string;
}

export function ProgressBar({
  progress,
  statusMessages,
  showBatchInfo = true,
  showCurrentDistrict = false,
  className,
}: ProgressBarProps) {
  if (!progress) return null;

  const defaultMessages = {
    initializing: 'Initializing...',
    validating: 'Validating entries...',
    uploading: 'Uploading entries...',
    fetching: 'Fetching data...',
    processing: 'Processing entries...',
    retrying: 'Retrying failed entries...',
    completed: 'Complete!',
    failed: 'Failed',
  };

  const messages = { ...defaultMessages, ...statusMessages };

  const getBarColor = () => {
    switch (progress.status) {
      case 'retrying':
      case 'processing':
        return 'bg-amber-500';
      case 'failed':
        return 'bg-red-500';
      case 'completed':
        return 'bg-emerald-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className={cn("mt-4 space-y-2", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {messages[progress.status]}
        </span>
        <span className="font-medium">{progress.percentage}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", getBarColor())}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {progress.current} / {progress.total} entries
        </span>
        {showBatchInfo && (
          <span>
            Batch {progress.batch} of {progress.totalBatches}
          </span>
        )}
      </div>
      {showCurrentDistrict && progress.currentDistrict && (
        <div className="text-xs text-muted-foreground text-center">
          Processing: {progress.currentDistrict}
        </div>
      )}
    </div>
  );
}
